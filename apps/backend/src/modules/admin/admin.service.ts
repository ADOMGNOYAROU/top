import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseAdminService } from '../supabase/supabase-admin.service';
import { CacheService } from '../../common/cache/cache.service';

const TTL_COMPTES = 30_000;   // 30 s
const TTL_STATS   = 60_000;   // 60 s

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseAdminService,
    private readonly cache: CacheService,
  ) {}

  async listComptes() {
    return this.cache.wrap('admin:comptes', TTL_COMPTES, () => this._fetchComptes());
  }

  private async _fetchComptes() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, role: true,
        accountStatus: true, createdAt: true,
        _count: { select: { ownedProperties: true } },
      },
    });

    return users.map((u) => ({
      id:              u.id,
      prenom:          u.firstName,
      nom:             u.lastName,
      email:           u.email ?? '',
      telephone:       u.phone ?? '',
      role:            this.mapRole(u.role),
      statut:          this.mapStatut(u.accountStatus),
      dateInscription: u.createdAt.toISOString().slice(0, 10),
      nombreBiens:     u._count.ownedProperties > 0 ? u._count.ownedProperties : undefined,
    }));
  }

  async changerStatut(id: string, statut: 'ACTIF' | 'SUSPENDU') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const accountStatus: AccountStatus =
      statut === 'ACTIF' ? AccountStatus.ACTIVE : AccountStatus.SUSPENDED_ADMIN;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { accountStatus },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, role: true,
        accountStatus: true, createdAt: true,
        _count: { select: { ownedProperties: true } },
      },
    });

    this.cache.del('admin:comptes');
    return {
      id:              updated.id,
      prenom:          updated.firstName,
      nom:             updated.lastName,
      email:           updated.email ?? '',
      telephone:       updated.phone ?? '',
      role:            this.mapRole(updated.role),
      statut:          this.mapStatut(updated.accountStatus),
      dateInscription: updated.createdAt.toISOString().slice(0, 10),
      nombreBiens:     updated._count.ownedProperties > 0 ? updated._count.ownedProperties : undefined,
    };
  }

  async supprimerCompte(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { supabaseId: true } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.supabaseId) {
      await this.supabase.auth.admin.deleteUser(user.supabaseId);
    }

    await this.prisma.user.delete({ where: { id } });
    this.cache.del('admin:comptes');
    this.cache.del('admin:stats');
  }

  async getStatistiques() {
    return this.cache.wrap('admin:stats', TTL_STATS, () => this._fetchStats());
  }

  private async _fetchStats() {
    const [parRole, biens, biensOccupes] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.property.count({ where: { status: { not: 'ARCHIVED' } } }),
      this.prisma.property.count({ where: { status: 'OCCUPIED' } }),
    ]);

    const counts = Object.fromEntries(parRole.map((r) => [r.role, r._count]));
    const total  = parRole.reduce((s, r) => s + r._count, 0);

    return {
      nombreUtilisateurs:        total,
      nombreProprietaires:       counts['OWNER']   ?? 0,
      nombreLocataires:          counts['TENANT']  ?? 0,
      nombreGestionnaires:       counts['MANAGER'] ?? 0,
      nombreBiens:               biens,
      nombreBiensOccupes:        biensOccupes,
      volumeTransactionsMois:    0,
      commissionsMois:           0,
      nombreLitigesOuverts:      0,
      tauxOccupation:            biens > 0 ? Math.round((biensOccupes / biens) * 1000) / 10 : 0,
      croissanceUtilisateursMois: 0,
      repartitionVilles:         [],
    };
  }

  private mapRole(role: UserRole): string {
    const map: Record<UserRole, string> = {
      OWNER: 'PROPRIETAIRE', TENANT: 'LOCATAIRE',
      MANAGER: 'GESTIONNAIRE', ADMIN: 'ADMINISTRATEUR',
    };
    return map[role];
  }

  private mapStatut(status: AccountStatus): string {
    if (status === AccountStatus.ACTIVE) return 'ACTIF';
    return 'SUSPENDU';
  }
}
