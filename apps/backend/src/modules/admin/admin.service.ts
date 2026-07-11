import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getComptes(filters: any = {}) {
    const where: any = {};
    if (filters.role)   where.role = filters.role;
    if (filters.statut) where.accountStatus = filters.statut;
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { ownedProperties: true } } },
    });
    return users.map((u) => ({
      id: u.id,
      nom: u.lastName,
      prenom: u.firstName,
      email: u.email,
      telephone: u.phone,
      role: u.role,
      statut: u.accountStatus,
      dateInscription: u.createdAt,
      nombreBiens: u._count.ownedProperties,
    }));
  }

  async changerStatutCompte(id: string, dto: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { accountStatus: dto.statut ?? dto.accountStatus },
    });
    return { id: user.id, statut: user.accountStatus };
  }

  async getTransactions(filters: any = {}) {
    const where: any = {};
    if (filters.statut) where.status = filters.statut;
    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        lease: { include: { tenant: true, property: { include: { owner: true } } } },
      },
    });
    return payments.map((p) => ({
      id: p.id,
      reference: p.transactionId ?? `TXN-${p.id.slice(0, 8).toUpperCase()}`,
      montant: p.paidAmount,
      modePaiement: p.paymentMethod ?? 'CASH',
      statut: p.status,
      date: p.paidAt ?? p.createdAt,
      proprietaire: p.lease?.property?.owner
        ? `${p.lease.property.owner.firstName} ${p.lease.property.owner.lastName}` : '',
      locataire: p.lease?.tenant
        ? `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}` : '',
      bien: p.lease?.property?.address ?? '',
    }));
  }

  async getLitiges() {
    // Pas de modèle Litige dans Prisma — placeholder
    return [];
  }

  async resoudreLitige(_id: string, _dto: any) {
    return { message: 'Litiges non implémentés' };
  }

  async getStatistiques() {
    const [
      nombreUtilisateurs, nombreProprietaires, nombreLocataires,
      nombreGestionnaires, nombreBiens, nombreBiensOccupes,
      volumeMois, nombreLitiges,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'OWNER' } }),
      this.prisma.user.count({ where: { role: 'TENANT' } }),
      this.prisma.user.count({ where: { role: 'MANAGER' } }),
      this.prisma.property.count({ where: { archivedAt: null } }),
      this.prisma.property.count({ where: { status: 'OCCUPIED', archivedAt: null } }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _sum: { paidAmount: true },
      }),
      Promise.resolve(0),
    ]);
    return {
      nombreUtilisateurs,
      nombreProprietaires,
      nombreLocataires,
      nombreGestionnaires,
      nombreBiens,
      nombreBiensOccupes,
      tauxOccupation: nombreBiens > 0 ? Math.round((nombreBiensOccupes / nombreBiens) * 100 * 10) / 10 : 0,
      volumeTransactionsMois: volumeMois._sum.paidAmount ?? 0,
      commissionsMois: 0,
      nombreLitigesOuverts: nombreLitiges,
      croissanceUtilisateursMois: 0,
      repartitionVilles: [],
    };
  }
}
