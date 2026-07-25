import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';

export interface DashboardKpi {
  totalBiens: number;
  biensOccupes: number;
  biensVacants: number;
  totalLocataires: number;
  revenusMensuels: number;
  revenusAnnuels: number;
  impayes: number;
  tauxOccupation: number;
}

export interface RevenuMensuel {
  mois: string;
  montant: number;
  paiements: number;
}

export interface DernierPaiement {
  id: string;
  locataire: string;
  bien: string;
  montant: number;
  date: Date | null;
  statut: string;
}

export interface DernierBien {
  id: string;
  neighborhood: string;
  type: string;
  city: string;
  monthlyRent: number;
  status: string;
  createdAt: Date;
}

export interface DashboardResponse {
  kpis: DashboardKpi;
  revenusMensuels: RevenuMensuel[];
  derniersBiens: DernierBien[];
  derniersPaiements: DernierPaiement[];
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // Deux requêtes Prisma en parallèle remplacent le N+1 frontend
  // (1 + N appels HTTP par bien). Résultat mis en cache 60 s par utilisateur
  // pour que les navigations successives ne touchent pas la DB.
  async getOwnerDashboard(user: AuthenticatedUser, annee: number): Promise<DashboardResponse> {
    return this.cache.wrap(`dashboard:${user.id}:${annee}`, 60_000, () =>
      this.fetchDashboard(user.id, annee),
    );
  }

  invalidate(userId: string): void {
    this.cache.delByPrefix(`dashboard:${userId}:`);
  }

  private async fetchDashboard(userId: string, annee: number): Promise<DashboardResponse> {

    const [properties, recentPayments] = await Promise.all([
      this.prisma.property.findMany({
        where: { ownerId: userId, archivedAt: null },
        select: {
          id: true,
          type: true,
          status: true,
          neighborhood: true,
          city: true,
          monthlyRent: true,
          monthlyCharges: true,
          createdAt: true,
          leases: {
            where: { status: 'ACTIVE' },
            select: {
              tenantUserId: true,
              monthlyRent: true,
              monthlyCharges: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.findMany({
        where: {
          status: { in: ['PAID', 'PARTIAL'] },
          lease: { ownerId: userId },
        },
        select: {
          id: true,
          paidAmount: true,
          paidAt: true,
          status: true,
          lease: {
            select: {
              property: { select: { neighborhood: true, city: true } },
              tenant: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalBiens = properties.length;
    const biensOccupes = properties.filter((p) => p.status === 'OCCUPIED').length;
    const biensVacants = properties.filter((p) => p.status === 'VACANT').length;
    const tauxOccupation = totalBiens > 0 ? Math.round((biensOccupes / totalBiens) * 100) : 0;

    const allActiveLeases = properties.flatMap((p) => p.leases);
    const seenTenants = new Set(allActiveLeases.map((l) => l.tenantUserId));
    const revenusMensuelsTotal = allActiveLeases.reduce(
      (s, l) => s + l.monthlyRent + l.monthlyCharges,
      0,
    );

    const revenuParMois: RevenuMensuel[] = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(Date.UTC(annee, i, 1));
      const monthEnd = new Date(Date.UTC(annee, i + 1, 0));
      const relevant = allActiveLeases.filter((l) => {
        const start = new Date(l.startDate);
        const end = l.endDate ? new Date(l.endDate) : null;
        return start <= monthEnd && (!end || end >= monthStart);
      });
      return {
        mois: `${annee}-${String(i + 1).padStart(2, '0')}`,
        montant: relevant.reduce((s, l) => s + l.monthlyRent + l.monthlyCharges, 0),
        paiements: relevant.length,
      };
    });

    const derniersBiens: DernierBien[] = properties.slice(0, 5).map((p) => ({
      id: p.id,
      neighborhood: p.neighborhood,
      type: p.type,
      city: p.city,
      monthlyRent: p.monthlyRent,
      status: p.status,
      createdAt: p.createdAt,
    }));

    const derniersPaiements: DernierPaiement[] = recentPayments.map((p) => ({
      id: p.id,
      locataire: `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}`,
      bien: `${p.lease.property.neighborhood}, ${p.lease.property.city}`,
      montant: p.paidAmount,
      date: p.paidAt,
      statut: p.status,
    }));

    return {
      kpis: {
        totalBiens,
        biensOccupes,
        biensVacants,
        totalLocataires: seenTenants.size,
        revenusMensuels: revenusMensuelsTotal,
        revenusAnnuels: revenusMensuelsTotal * 12,
        impayes: 0,
        tauxOccupation,
      },
      revenusMensuels: revenuParMois,
      derniersBiens,
      derniersPaiements,
    };
  }
}
