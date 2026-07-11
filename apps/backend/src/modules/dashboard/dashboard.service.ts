import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKPIs(ownerId: string) {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const debutAnnee = new Date(now.getFullYear(), 0, 1);

    const [
      totalBiens,
      biensOccupes,
      totalLocataires,
      revenusMensuels,
      revenusAnnuels,
      impayes,
    ] = await Promise.all([
      this.prisma.property.count({
        where: { ownerId, archivedAt: null },
      }),
      this.prisma.property.count({
        where: { ownerId, status: 'OCCUPIED', archivedAt: null },
      }),
      this.prisma.lease.count({
        where: { ownerId, status: 'ACTIVE' },
      }),
      this.prisma.payment.aggregate({
        where: {
          lease: { ownerId },
          status: 'PAID',
          paidAt: { gte: debutMois },
        },
        _sum: { paidAmount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          lease: { ownerId },
          status: 'PAID',
          paidAt: { gte: debutAnnee },
        },
        _sum: { paidAmount: true },
      }),
      this.prisma.paymentScheduleEntry.aggregate({
        where: {
          lease: { ownerId },
          status: 'OVERDUE',
        },
        _sum: { expectedAmount: true },
      }),
    ]);

    const biensVacants = totalBiens - biensOccupes;
    const tauxOccupation = totalBiens > 0 ? Math.round((biensOccupes / totalBiens) * 100) : 0;

    return {
      totalBiens,
      biensOccupes,
      biensVacants,
      totalLocataires,
      revenusMensuels: revenusMensuels._sum.paidAmount ?? 0,
      revenusAnnuels: revenusAnnuels._sum.paidAmount ?? 0,
      impayes: impayes._sum.expectedAmount ?? 0,
      tauxOccupation,
    };
  }

  async getRevenusMensuels(ownerId: string, annee: number) {
    const debut = new Date(annee, 0, 1);
    const fin = new Date(annee + 1, 0, 1);

    const paiements = await this.prisma.payment.findMany({
      where: {
        lease: { ownerId },
        status: 'PAID',
        paidAt: { gte: debut, lt: fin },
      },
      select: { paidAmount: true, paidAt: true },
    });

    const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const parMois = Array.from({ length: 12 }, (_, i) => ({
      mois: MOIS[i],
      montant: 0,
      paiements: 0,
    }));

    for (const p of paiements) {
      const m = new Date(p.paidAt!).getMonth();
      parMois[m].montant += p.paidAmount;
      parMois[m].paiements += 1;
    }

    return parMois;
  }

  async getAlertes(ownerId: string) {
    const maintenant = new Date();
    const dans30Jours = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [impayes, bientotExpires] = await Promise.all([
      this.prisma.paymentScheduleEntry.findMany({
        where: { lease: { ownerId }, status: 'OVERDUE' },
        take: 10,
        orderBy: { dueDate: 'asc' },
        include: { lease: { include: { tenant: true, property: true } } },
      }),
      this.prisma.lease.findMany({
        where: {
          ownerId,
          status: 'ACTIVE',
          endDate: { gte: maintenant, lte: dans30Jours },
        },
        take: 5,
        include: { tenant: true, property: true },
      }),
    ]);

    const alertes: any[] = [];

    for (const e of impayes) {
      alertes.push({
        id: `impaye-${e.id}`,
        type: 'impaye',
        titre: `Loyer impayé — ${e.lease.property.address}`,
        description: `${e.lease.tenant.firstName} ${e.lease.tenant.lastName} n'a pas réglé l'échéance du ${new Date(e.dueDate).toLocaleDateString('fr-FR')}.`,
        date: e.dueDate,
        priorite: 'haute',
        bienId: e.lease.propertyId,
        locataireId: e.lease.tenantUserId,
      });
    }

    for (const l of bientotExpires) {
      alertes.push({
        id: `expire-${l.id}`,
        type: 'bientot_expire',
        titre: `Bail bientôt expiré — ${l.property.address}`,
        description: `Le bail de ${l.tenant.firstName} ${l.tenant.lastName} expire le ${new Date(l.endDate!).toLocaleDateString('fr-FR')}.`,
        date: l.endDate,
        priorite: 'moyenne',
        bienId: l.propertyId,
        locataireId: l.tenantUserId,
      });
    }

    return alertes;
  }

  async getDerniersPaiements(ownerId: string, limit: number) {
    const paiements = await this.prisma.payment.findMany({
      where: { lease: { ownerId } },
      orderBy: { paidAt: 'desc' },
      take: limit,
      include: {
        lease: {
          include: { tenant: true, property: true },
        },
      },
    });

    return paiements.map((p) => ({
      id: p.id,
      locataire: `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}`,
      bien: p.lease.property.address,
      montant: p.paidAmount,
      date: p.paidAt ?? new Date(),
      statut: p.status,
    }));
  }

  async getDerniersBiens(ownerId: string, limit: number) {
    const biens = await this.prisma.property.findMany({
      where: { ownerId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return biens.map((b) => ({
      id: b.id,
      titre: b.address,
      type: b.type,
      ville: b.city,
      loyer: b.monthlyRent,
      statut: b.status,
      dateAjout: b.createdAt,
    }));
  }
}
