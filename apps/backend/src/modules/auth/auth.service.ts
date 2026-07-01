import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
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

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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
