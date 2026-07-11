import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const STATUS_MAP: Record<string, string> = {
  PAID: 'PAYE', PARTIAL: 'PARTIEL', LATE: 'EN_RETARD',
  OVERDUE: 'IMPAYE', PENDING: 'EN_RETARD', PENDING_CONFIRMATION: 'EN_RETARD', REJECTED: 'IMPAYE',
};
const METHOD_MAP: Record<string, string> = {
  TMONEY: 'T_MONEY', FLOOZ: 'FLOOZ', CASH: 'ESPECES', BANK_TRANSFER: 'ESPECES',
};
const METHOD_MAP_IN: Record<string, string> = {
  T_MONEY: 'TMONEY', FLOOZ: 'FLOOZ', ESPECES: 'CASH',
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private map(p: any) {
    return {
      id: p.id,
      bienId: p.lease?.propertyId ?? '',
      locataireId: p.lease?.tenantUserId ?? '',
      locataire: p.lease?.tenant ? `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}` : '',
      bien: p.lease?.property?.address ?? '',
      montant: p.paidAmount,
      montantEcheance: p.scheduleEntry?.expectedAmount ?? p.paidAmount,
      datePaiement: p.paidAt ?? p.createdAt,
      dateEcheance: p.scheduleEntry?.dueDate ?? p.createdAt,
      statut: STATUS_MAP[p.status] ?? p.status,
      modePaiement: METHOD_MAP[p.paymentMethod ?? ''] ?? p.paymentMethod ?? 'ESPECES',
      numeroTransaction: p.transactionId,
      leaseId: p.leaseId,
      dateCreation: p.createdAt,
    };
  }

  async findAll(ownerId: string, filters: any = {}) {
    const where: any = { lease: { ownerId } };
    if (filters.statut) {
      const invMap: Record<string, string> = { PAYE: 'PAID', PARTIEL: 'PARTIAL', EN_RETARD: 'LATE', IMPAYE: 'OVERDUE' };
      where.status = invMap[filters.statut] ?? filters.statut;
    }
    if (filters.bienId) where.lease = { ...where.lease, propertyId: filters.bienId };
    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lease: { include: { tenant: true, property: true } },
        scheduleEntry: true,
      },
    });
    return payments.map((p) => this.map(p));
  }

  async findOne(id: string, ownerId: string) {
    const p = await this.prisma.payment.findFirst({
      where: { id, lease: { ownerId } },
      include: { lease: { include: { tenant: true, property: true } }, scheduleEntry: true },
    });
    if (!p) throw new NotFoundException('Paiement introuvable');
    return this.map(p);
  }

  async create(ownerId: string, dto: any) {
    // Trouver le bail actif sur le bien pour ce locataire
    const lease = await this.prisma.lease.findFirst({
      where: { ownerId, propertyId: dto.bienId, status: 'ACTIVE' },
      include: { scheduleEntries: { where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } }, orderBy: { dueDate: 'asc' }, take: 1 } },
    });
    if (!lease) throw new NotFoundException('Bail actif introuvable pour ce bien');

    const entry = lease.scheduleEntries[0];
    if (!entry) throw new NotFoundException('Aucune échéance en attente');

    const p = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          leaseId: lease.id,
          scheduleEntryId: entry.id,
          source: 'MANUAL_OWNER',
          status: 'PAID',
          paymentMethod: METHOD_MAP_IN[dto.modePaiement] as any ?? 'CASH',
          paidAmount: Number(dto.montant),
          paidAt: dto.datePaiement ? new Date(dto.datePaiement) : new Date(),
          note: dto.note,
          recordedByUserId: ownerId,
        },
        include: { lease: { include: { tenant: true, property: true } }, scheduleEntry: true },
      });
      await tx.paymentScheduleEntry.update({ where: { id: entry.id }, data: { status: 'PAID', paidAmount: Number(dto.montant) } });
      return payment;
    });
    return this.map(p);
  }

  async getImpayes(ownerId: string) {
    const entries = await this.prisma.paymentScheduleEntry.findMany({
      where: { lease: { ownerId }, status: 'OVERDUE' },
      orderBy: { dueDate: 'asc' },
      include: { lease: { include: { tenant: true, property: true } } },
    });
    return entries.map((e) => ({
      id: e.id,
      bienId: e.lease.propertyId,
      locataireId: e.lease.tenantUserId,
      locataire: `${e.lease.tenant.firstName} ${e.lease.tenant.lastName}`,
      bien: e.lease.property.address,
      montant: e.expectedAmount,
      dateEcheance: e.dueDate,
      statut: 'IMPAYE',
    }));
  }

  async getStatistiques(ownerId: string) {
    const [totalPaie, totalImpayes, totalEnRetard] = await Promise.all([
      this.prisma.payment.aggregate({ where: { lease: { ownerId }, status: 'PAID' }, _sum: { paidAmount: true }, _count: true }),
      this.prisma.paymentScheduleEntry.aggregate({ where: { lease: { ownerId }, status: 'OVERDUE' }, _sum: { expectedAmount: true }, _count: true }),
      this.prisma.paymentScheduleEntry.count({ where: { lease: { ownerId }, status: { in: ['PENDING', 'PARTIAL'] } } }),
    ]);
    return {
      totalPaiements: totalPaie._count,
      montantTotal: totalPaie._sum.paidAmount ?? 0,
      impayes: totalImpayes._count,
      montantImpayes: totalImpayes._sum.expectedAmount ?? 0,
      enAttente: totalEnRetard,
    };
  }
}
