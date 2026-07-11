import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GestionnaireService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Mandats ───────────────────────────────────────────────────────

  async getMandats(managerId: string) {
    const mandates = await this.prisma.mandate.findMany({
      where: { managerId },
      include: { property: true, owner: true },
      orderBy: { createdAt: 'desc' },
    });
    return mandates.map((m) => ({
      id: m.id,
      bienId: m.propertyId,
      bien: m.property?.address ?? '',
      proprietaireId: m.ownerId,
      proprietaire: `${m.owner.firstName} ${m.owner.lastName}`,
      statut: m.status,
      typeFrais: m.feeType,
      valeurFrais: m.feeValue,
      dateDebut: m.startDate,
      dateFin: m.endDate,
      dateCreation: m.createdAt,
    }));
  }

  async createMandat(managerId: string, dto: any) {
    const m = await this.prisma.mandate.create({
      data: {
        propertyId: dto.bienId,
        ownerId: dto.proprietaireId,
        managerId,
        feeType: dto.typeFrais ?? 'PERCENTAGE',
        feeValue: Number(dto.valeurFrais) || 0,
        startDate: new Date(dto.dateDebut),
        endDate: dto.dateFin ? new Date(dto.dateFin) : null,
        status: 'PENDING',
      },
      include: { property: true, owner: true },
    });
    return {
      id: m.id, bienId: m.propertyId, bien: m.property?.address ?? '',
      proprietaireId: m.ownerId, proprietaire: `${m.owner.firstName} ${m.owner.lastName}`,
      statut: m.status, typefrais: m.feeType, valeurFrais: m.feeValue,
      dateDebut: m.startDate, dateFin: m.endDate,
    };
  }

  async renouvelerMandat(id: string, managerId: string, dto: any) {
    const m = await this.prisma.mandate.findFirst({ where: { id, managerId } });
    if (!m) throw new NotFoundException('Mandat introuvable');
    return this.prisma.mandate.update({
      where: { id },
      data: { endDate: dto.dateFin ? new Date(dto.dateFin) : null, status: 'ACTIVE' },
    });
  }

  // ── Profil gestionnaire ───────────────────────────────────────────

  async getProfil(managerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { managerProfile: true },
    });
    if (!user) throw new NotFoundException('Profil introuvable');
    return {
      id: user.id,
      nom: user.lastName,
      prenom: user.firstName,
      email: user.email,
      telephone: user.phone,
      zonesIntervention: user.managerProfile?.zonesOfIntervention ?? [],
      tarifs: user.managerProfile?.pricingNote ?? '',
      note: user.managerProfile?.ratingAverage ?? 0,
      nombreAvis: user.managerProfile?.ratingCount ?? 0,
    };
  }

  async updateProfil(managerId: string, dto: any) {
    await this.prisma.user.update({
      where: { id: managerId },
      data: {
        firstName: dto.prenom ?? undefined,
        lastName: dto.nom ?? undefined,
        phone: dto.telephone ?? undefined,
      },
    });
    if (dto.zonesIntervention || dto.tarifs) {
      await this.prisma.managerProfile.upsert({
        where: { userId: managerId },
        create: {
          userId: managerId,
          zonesOfIntervention: dto.zonesIntervention ?? [],
          pricingNote: dto.tarifs ?? null,
        },
        update: {
          zonesOfIntervention: dto.zonesIntervention ?? undefined,
          pricingNote: dto.tarifs ?? undefined,
        },
      });
    }
    return this.getProfil(managerId);
  }

  // ── Rapports / Exports (placeholder) ─────────────────────────────

  async getRapports(_managerId: string) {
    return [];
  }

  async getExports(_managerId: string) {
    return [];
  }
}
