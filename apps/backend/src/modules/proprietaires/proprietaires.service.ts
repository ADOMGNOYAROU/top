import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProprietairesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { role: 'OWNER', anonymizedAt: null },
      include: {
        ownerProfile: true,
        ownedProperties: { select: { id: true, city: true, neighborhood: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.mapUser(u));
  }

  async findOne(id: string) {
    const u = await this.prisma.user.findFirst({
      where: { id, role: 'OWNER', anonymizedAt: null },
      include: {
        ownerProfile: true,
        ownedProperties: { select: { id: true, city: true, neighborhood: true } },
      },
    });
    if (!u) throw new NotFoundException('Propriétaire introuvable');
    return this.mapUser(u);
  }

  async create(dto: any) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email ?? null,
        phone: dto.telephone ?? null,
        firstName: dto.prenoms,
        lastName: dto.nom,
        role: 'OWNER',
        ownerProfile: {
          create: { residenceCountry: dto.adresse?.ville ?? 'TG' },
        },
      },
      include: {
        ownerProfile: true,
        ownedProperties: { select: { id: true, city: true, neighborhood: true } },
      },
    });
    return this.mapUser(user);
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? undefined,
        phone: dto.telephone ?? undefined,
        firstName: dto.prenoms ?? undefined,
        lastName: dto.nom ?? undefined,
      },
      include: {
        ownerProfile: true,
        ownedProperties: { select: { id: true, city: true, neighborhood: true } },
      },
    });
    return this.mapUser(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { anonymizedAt: new Date() },
    });
  }

  private mapUser(u: any) {
    const ville = u.ownedProperties?.[0]?.city ?? u.ownerProfile?.residenceCountry ?? '';
    const quartier = u.ownedProperties?.[0]?.neighborhood ?? '';
    const statut = this.mapStatut(u.accountStatus);
    return {
      id: u.id,
      nom: u.lastName,
      prenoms: u.firstName,
      email: u.email ?? undefined,
      telephone: u.phone ?? '',
      adresse: { quartier, ville, adresseComplete: [quartier, ville].filter(Boolean).join(', ') || undefined },
      pieceIdentite: { type: 'CNI', numero: '', dateExpiration: undefined },
      statut,
      nbBiens: u.ownedProperties?.length ?? 0,
      dateCreation: u.createdAt,
    };
  }

  private mapStatut(s: string): string {
    if (s === 'SUSPENDED' || s === 'DELETED') return 'SUSPENDU';
    if (s === 'ACTIVE') return 'ACTIF';
    return 'INACTIF';
  }
}
