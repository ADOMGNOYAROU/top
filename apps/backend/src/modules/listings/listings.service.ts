import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const STATUS_MAP: Record<string, string> = { ACTIVE: 'ACTIVE', DISABLED: 'DESACTIVE', SUSPENDED: 'SUSPENDU' };

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  private map(l: any) {
    return {
      id: l.id,
      bienId: l.propertyId,
      bien: l.property ? {
        titre: l.property.address,
        type: l.property.type,
        ville: l.property.city,
        loyer: l.property.monthlyRent,
        surface: l.property.surfaceArea,
        photos: (l.property.photos ?? []).map((p: any) => p.storagePath),
      } : null,
      slug: l.slug,
      statut: STATUS_MAP[l.status] ?? l.status,
      datePublication: l.publishedAt,
      contacts: l.contacts ?? [],
      dateCreation: l.createdAt,
    };
  }

  async findAll(userId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { publishedByUserId: userId },
      include: { property: { include: { photos: true } }, contacts: true },
      orderBy: { createdAt: 'desc' },
    });
    return listings.map((l) => this.map(l));
  }

  async findOne(id: string, userId: string) {
    const l = await this.prisma.listing.findFirst({
      where: { id, publishedByUserId: userId },
      include: { property: { include: { photos: true } }, contacts: true },
    });
    if (!l) throw new NotFoundException('Annonce introuvable');
    return this.map(l);
  }

  async create(userId: string, dto: any) {
    const slug = `annonce-${dto.bienId}-${Date.now()}`;
    const l = await this.prisma.listing.create({
      data: { propertyId: dto.bienId, publishedByUserId: userId, slug, status: 'ACTIVE' },
      include: { property: { include: { photos: true } }, contacts: true },
    });
    return this.map(l);
  }

  async update(id: string, userId: string, dto: any) {
    const existing = await this.prisma.listing.findFirst({ where: { id, publishedByUserId: userId } });
    if (!existing) throw new NotFoundException('Annonce introuvable');
    const data: any = {};
    if (dto.statut === 'DESACTIVE') data.status = 'DISABLED';
    else if (dto.statut === 'ACTIVE') data.status = 'ACTIVE';
    const l = await this.prisma.listing.update({
      where: { id }, data,
      include: { property: { include: { photos: true } }, contacts: true },
    });
    return this.map(l);
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.listing.findFirst({ where: { id, publishedByUserId: userId } });
    if (!existing) throw new NotFoundException('Annonce introuvable');
    await this.prisma.listing.delete({ where: { id } });
  }
}
