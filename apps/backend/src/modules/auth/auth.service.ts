import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseAdminService } from '../supabase/supabase-admin.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';

type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    ownerProfile: true;
    tenantProfile: true;
    managerProfile: true;
    adminProfile: true;
  };
}>;

export type AuthMeResponse = Omit<
  UserWithProfiles,
  'ownerProfile' | 'tenantProfile' | 'managerProfile' | 'adminProfile'
> & {
  profile:
    | UserWithProfiles['ownerProfile']
    | UserWithProfiles['tenantProfile']
    | UserWithProfiles['managerProfile']
    | UserWithProfiles['adminProfile'];
};

export interface RegisterDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  async register(token: string, dto: RegisterDto = {}): Promise<AuthMeResponse> {
    const { data, error } = await this.supabaseAdmin.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('Token invalide');

    const supabaseUser = data.user;
    const meta = supabaseUser.user_metadata ?? {};

    const firstName = dto.firstName ?? meta['first_name'] ?? 'Utilisateur';
    const lastName = dto.lastName ?? meta['last_name'] ?? '';
    const phone = dto.phone ?? meta['phone'] ?? null;
    const roleRaw: string = dto.role ?? meta['role'] ?? 'OWNER';
    const role: UserRole = ['OWNER', 'TENANT', 'MANAGER', 'ADMIN'].includes(roleRaw)
      ? (roleRaw as UserRole)
      : 'OWNER';

    const user = await this.prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? null,
        phone,
        firstName,
        lastName,
        role,
      },
      update: {},
      include: {
        ownerProfile: true,
        tenantProfile: true,
        managerProfile: true,
        adminProfile: true,
      },
    });

    const { ownerProfile, tenantProfile, managerProfile, adminProfile, ...base } = user;
    return {
      ...base,
      profile: ownerProfile ?? tenantProfile ?? managerProfile ?? adminProfile ?? null,
    };
  }

  async getMe(user: AuthenticatedUser): Promise<AuthMeResponse> {
    const { ownerProfile, tenantProfile, managerProfile, adminProfile, ...base } =
      await this.prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          ownerProfile: true,
          tenantProfile: true,
          managerProfile: true,
          adminProfile: true,
        },
      });

    return {
      ...base,
      profile: ownerProfile ?? tenantProfile ?? managerProfile ?? adminProfile ?? null,
    };
  }
}
