import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PropertyStatus, PropertyType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const STATUS_MAP: Record<string, string> = {
  OCCUPIED: 'OCCUPE', VACANT: 'VACANT', RENOVATION: 'EN_TRAVAUX', ARCHIVED: 'ARCHIVE',
};
const TYPE_MAP: Record<string, string> = {
  APARTMENT: 'APPARTEMENT', VILLA: 'VILLA', STUDIO: 'STUDIO', COMMERCIAL: 'LOCAL',
};
const STATUS_MAP_IN: Record<string, PropertyStatus> = {
  OCCUPE: 'OCCUPIED', VACANT: 'VACANT', EN_TRAVAUX: 'RENOVATION', ARCHIVE: 'ARCHIVED',
};
const TYPE_MAP_IN: Record<string, PropertyType> = {
  APPARTEMENT: 'APARTMENT', VILLA: 'VILLA', STUDIO: 'STUDIO', LOCAL: 'COMMERCIAL',
  BUREAU: 'COMMERCIAL', CHAMBRE: 'STUDIO',
};

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  private map(p: any) {
    return {
      id: p.id,
      proprietaireId: p.ownerId,
      titre: p.address,
      adresse: { quartier: p.neighborhood, ville: p.city, adresseComplete: p.address },
      typeBien: TYPE_MAP[p.type] ?? p.type,
      surface: p.surfaceArea,
      nbPieces: p.roomsCount ?? 0,
      loyer: p.monthlyRent,
      charges: p.monthlyCharges,
      statut: STATUS_MAP[p.status] ?? p.status,
      photos: (p.photos ?? []).map((ph: any) => ph.storagePath),
      dateCreation: p.createdAt,
      description: p.description,
    };
  }

  async findAll(ownerId: string, filters: any = {}) {
    const where: any = { ownerId, archivedAt: null };
    if (filters.statut) where.status = STATUS_MAP_IN[filters.statut] ?? filters.statut;
    if (filters.type)   where.type   = TYPE_MAP_IN[filters.type] ?? filters.type;
    if (filters.ville)  where.city   = filters.ville;
    if (filters.prixMin || filters.prixMax) {
      where.monthlyRent = {};
      if (filters.prixMin) where.monthlyRent.gte = Number(filters.prixMin);
      if (filters.prixMax) where.monthlyRent.lte = Number(filters.prixMax);
    }
    if (filters.recherche) {
      where.OR = [
        { address: { contains: filters.recherche, mode: 'insensitive' } },
        { neighborhood: { contains: filters.recherche, mode: 'insensitive' } },
        { city: { contains: filters.recherche, mode: 'insensitive' } },
      ];
    }
    const props = await this.prisma.property.findMany({
      where,
      include: { photos: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return props.map((p) => this.map(p));
  }

  async findOne(id: string, ownerId: string) {
    const p = await this.prisma.property.findFirst({ where: { id, ownerId }, include: { photos: true } });
    if (!p) throw new NotFoundException('Bien introuvable');
    return this.map(p);
  }

  async create(ownerId: string, dto: any) {
    // Le frontend envoie adresse: { quartier, ville, adresseComplete } — on supporte aussi les champs à plat
    const adresse = dto.adresse ?? {};
    const quartier = adresse.quartier ?? dto.quartier ?? '';
    const ville = adresse.ville ?? dto.ville ?? '';
    const adresseComplete = adresse.adresseComplete ?? dto.adresseComplete ?? `${quartier}, ${ville}`.replace(/^,\s*|,\s*$/g, '');
    const p = await this.prisma.property.create({
      data: {
        ownerId,
        type: TYPE_MAP_IN[dto.typeBien] ?? TYPE_MAP_IN[dto.type] ?? 'APARTMENT',
        address: adresseComplete,
        neighborhood: quartier,
        city: ville,
        surfaceArea: Number(dto.surface) || 0,
        roomsCount: dto.nbPieces ? Number(dto.nbPieces) : null,
        monthlyRent: Number(dto.loyer) || 0,
        monthlyCharges: Number(dto.charges) || 0,
        description: dto.description,
        status: STATUS_MAP_IN[dto.statut] ?? 'VACANT',
      },
      include: { photos: true },
    });
    return this.map(p);
  }

  async update(id: string, ownerId: string, dto: any) {
    const existing = await this.prisma.property.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException('Bien introuvable');
    const adresse = dto.adresse ?? {};
    const data: any = {};
    if (dto.typeBien || dto.type) data.type = TYPE_MAP_IN[dto.typeBien ?? dto.type] ?? existing.type;
    const quartier = adresse.quartier ?? dto.quartier;
    const ville    = adresse.ville    ?? dto.ville;
    const adresseComplete = adresse.adresseComplete ?? dto.adresseComplete;
    if (quartier)     data.neighborhood = quartier;
    if (ville)        data.city = ville;
    if (adresseComplete) data.address = adresseComplete;
    if (dto.surface !== undefined)   data.surfaceArea = Number(dto.surface);
    if (dto.nbPieces !== undefined)  data.roomsCount = Number(dto.nbPieces);
    if (dto.loyer !== undefined)     data.monthlyRent = Number(dto.loyer);
    if (dto.charges !== undefined)   data.monthlyCharges = Number(dto.charges);
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.statut)       data.status = STATUS_MAP_IN[dto.statut] ?? existing.status;
    const p = await this.prisma.property.update({ where: { id }, data, include: { photos: true } });
    return this.map(p);
  }

  async remove(id: string, ownerId: string) {
    const existing = await this.prisma.property.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException('Bien introuvable');
    await this.prisma.property.delete({ where: { id } });
  }

  async archive(id: string, ownerId: string) {
    const existing = await this.prisma.property.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException('Bien introuvable');
    const p = await this.prisma.property.update({
      where: { id }, data: { archivedAt: new Date(), status: 'ARCHIVED' }, include: { photos: true },
    });
    return this.map(p);
  }

  async updateStatus(id: string, ownerId: string, statut: string) {
    const existing = await this.prisma.property.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException('Bien introuvable');
    const p = await this.prisma.property.update({
      where: { id }, data: { status: STATUS_MAP_IN[statut] ?? (statut as PropertyStatus) }, include: { photos: true },
    });
    return this.map(p);
  }

  async getStatistiques(ownerId: string) {
    const [total, occupes, vacants, enTravaux, archives] = await Promise.all([
      this.prisma.property.count({ where: { ownerId, archivedAt: null } }),
      this.prisma.property.count({ where: { ownerId, status: 'OCCUPIED', archivedAt: null } }),
      this.prisma.property.count({ where: { ownerId, status: 'VACANT', archivedAt: null } }),
      this.prisma.property.count({ where: { ownerId, status: 'RENOVATION', archivedAt: null } }),
      this.prisma.property.count({ where: { ownerId, archivedAt: { not: null } } }),
    ]);
    return {
      total, occupes, vacants, enTravaux, archives,
      parStatut: { OCCUPE: occupes, VACANT: vacants, EN_TRAVAUX: enTravaux, ARCHIVE: archives },
    };
  }
}
