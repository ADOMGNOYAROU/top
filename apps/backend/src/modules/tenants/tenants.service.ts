import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getStatut(userId: string, ownerId: string): Promise<string> {
    const overdue = await this.prisma.paymentScheduleEntry.count({
      where: { lease: { tenantUserId: userId, ownerId }, status: 'OVERDUE' },
    });
    if (overdue > 0) return 'EN_RETARD';
    const active = await this.prisma.lease.count({
      where: { tenantUserId: userId, ownerId, status: 'ACTIVE' },
    });
    return active > 0 ? 'ACTIF' : 'INACTIF';
  }

  private async mapTenant(user: any, ownerId: string) {
    const lease = await this.prisma.lease.findFirst({
      where: { tenantUserId: user.id, ownerId },
      orderBy: { createdAt: 'desc' },
    });
    const statut = await this.getStatut(user.id, ownerId);
    return {
      id: user.id,
      nom: user.lastName,
      prenoms: user.firstName,
      email: user.email,
      telephone: user.phone ?? '',
      adresse: { quartier: '', ville: '', adresseComplete: '' },
      pieceIdentite: { type: 'CNI', numero: '', dateExpiration: null },
      bienId: lease?.propertyId ?? '',
      dateDebutBail: lease?.startDate ?? user.createdAt,
      dateFinBail: lease?.endDate ?? null,
      caution: lease?.securityDeposit ?? 0,
      statut,
      dateCreation: user.createdAt,
    };
  }

  async findAll(ownerId: string, filters: any = {}) {
    const leaseWhere: any = { ownerId };
    if (filters.bienId) leaseWhere.propertyId = filters.bienId;

    const leases = await this.prisma.lease.findMany({
      where: leaseWhere,
      select: { tenantUserId: true },
      distinct: ['tenantUserId'],
    });
    const tenantIds = leases.map((l) => l.tenantUserId);

    const where: any = { id: { in: tenantIds }, role: 'TENANT' };
    if (filters.recherche) {
      where.OR = [
        { firstName: { contains: filters.recherche, mode: 'insensitive' } },
        { lastName: { contains: filters.recherche, mode: 'insensitive' } },
        { email: { contains: filters.recherche, mode: 'insensitive' } },
        { phone: { contains: filters.recherche } },
      ];
    }
    const users = await this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
    const mapped = await Promise.all(users.map((u) => this.mapTenant(u, ownerId)));

    if (filters.statut) return mapped.filter((t) => t.statut === filters.statut);
    return mapped;
  }

  async findOne(id: string, ownerId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'TENANT' } });
    if (!user) throw new NotFoundException('Locataire introuvable');
    return this.mapTenant(user, ownerId);
  }

  async create(ownerId: string, dto: any) {
    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          firstName: dto.prenoms ?? '',
          lastName: dto.nom ?? '',
          email: dto.email ?? null,
          phone: dto.telephone ?? null,
          role: 'TENANT',
        },
      });
      await tx.tenantProfile.create({ data: { userId: u.id, invitedByUserId: ownerId } });
      if (dto.bienId && dto.dateDebutBail) {
        const property = await tx.property.findFirst({ where: { id: dto.bienId, ownerId } });
        if (property) {
          const startDate = new Date(dto.dateDebutBail);
          const endDate = dto.dateFinBail ? new Date(dto.dateFinBail) : null;
          const lease = await tx.lease.create({
            data: {
              propertyId: dto.bienId,
              ownerId,
              tenantUserId: u.id,
              monthlyRent: property.monthlyRent,
              monthlyCharges: property.monthlyCharges,
              paymentFrequency: 'MONTHLY',
              startDate,
              endDate,
              securityDeposit: dto.caution ?? 0,
            },
          });
          await tx.property.update({ where: { id: dto.bienId }, data: { status: 'OCCUPIED' } });
          // Générer les échéances mensuelles (12 mois ou jusqu'à la fin du bail)
          const expectedAmount = property.monthlyRent + property.monthlyCharges;
          const entries = this.buildScheduleEntries(lease.id, startDate, endDate, expectedAmount);
          await tx.paymentScheduleEntry.createMany({ data: entries });
        }
      }
      return u;
    });
    return this.mapTenant(user, ownerId);
  }

  private buildScheduleEntries(leaseId: string, startDate: Date, endDate: Date | null, expectedAmount: number) {
    const entries: any[] = [];
    const maxMonths = 12;
    for (let i = 0; i < maxMonths; i++) {
      const periodStart = new Date(startDate);
      periodStart.setMonth(periodStart.getMonth() + i);
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      const dueDate = new Date(periodStart);
      // Stopper si on dépasse la fin de bail
      if (endDate && periodStart > endDate) break;
      entries.push({ leaseId, periodStart, periodEnd, dueDate, expectedAmount });
    }
    return entries;
  }

  async update(id: string, ownerId: string, dto: any) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'TENANT' } });
    if (!user) throw new NotFoundException('Locataire introuvable');
    const data: any = {};
    if (dto.prenoms)   data.firstName = dto.prenoms;
    if (dto.nom)       data.lastName = dto.nom;
    if (dto.email)     data.email = dto.email;
    if (dto.telephone) data.phone = dto.telephone;
    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.mapTenant(updated, ownerId);
  }

  async remove(id: string, ownerId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'TENANT' } });
    if (!user) throw new NotFoundException('Locataire introuvable');
    await this.prisma.user.delete({ where: { id } });
  }

  async getStatistiques(ownerId: string) {
    const all = await this.findAll(ownerId);
    return {
      total: all.length,
      actifs: all.filter((t) => t.statut === 'ACTIF').length,
      inactifs: all.filter((t) => t.statut === 'INACTIF').length,
      enRetard: all.filter((t) => t.statut === 'EN_RETARD').length,
    };
  }
}
