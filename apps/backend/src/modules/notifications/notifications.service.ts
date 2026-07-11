import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const notifs = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return notifs.map((n) => ({
      id: n.id,
      type: n.event,
      canal: n.channel,
      statut: n.status,
      payload: n.payload,
      dateEnvoi: n.createdAt,
      lue: false,
    }));
  }

  async getStats(userId: string) {
    const [total, errors] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, status: 'FAILED' } }),
    ]);
    return { total, erreurs: errors, nonLues: 0 };
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationConsent: true, reminderDaysBefore: true, overdueGraceDays: true },
    });
    return {
      consentement: user?.notificationConsent ?? 'NOT_ASKED',
      rappelJoursAvant: user?.reminderDaysBefore ?? 5,
      joursGrace: user?.overdueGraceDays ?? 3,
    };
  }

  async updatePreferences(userId: string, dto: any) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationConsent: dto.consentement ?? undefined,
        reminderDaysBefore: dto.rappelJoursAvant ?? undefined,
        overdueGraceDays: dto.joursGrace ?? undefined,
      },
    });
    return this.getPreferences(userId);
  }
}
