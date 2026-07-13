import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribePushDto } from './dto/subscribe-push.dto';

export type PushPayload = { title: string; body: string; url: string };

const PUSH_TIMEOUT_MS = 10_000;

// Point d'entrée unique pour l'abonnement Web Push et l'envoi de notifications
// push — jamais d'appel direct à la lib `web-push` en dehors de ce service.
@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    webpush.setVapidDetails(
      config.getOrThrow<string>('VAPID_SUBJECT'),
      config.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      config.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
  }

  async subscribe(userId: string, dto: SubscribePushDto): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.pushSubscription.upsert({
        where: { endpoint: dto.endpoint },
        create: {
          userId,
          endpoint: dto.endpoint,
          p256dh: dto.keys.p256dh,
          auth: dto.keys.auth,
        },
        update: {
          userId,
          p256dh: dto.keys.p256dh,
          auth: dto.keys.auth,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { notificationConsent: 'ACCEPTED' },
      }),
    ]);
  }

  // Ne repasse le consentement à DECLINED que s'il ne reste plus aucun
  // abonnement actif — un utilisateur peut avoir plusieurs appareils, se
  // désabonner sur l'un ne doit pas couper le push sur les autres.
  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.pushSubscription.deleteMany({ where: { userId, endpoint } });
      const remaining = await tx.pushSubscription.count({ where: { userId } });
      if (remaining === 0) {
        await tx.user.update({
          where: { id: userId },
          data: { notificationConsent: 'DECLINED' },
        });
      }
    });
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
      take: 100,
    });

    const { default: pRetry, AbortError } = await import('p-retry');

    for (const sub of subscriptions) {
      try {
        await pRetry(
          async () => {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify(payload),
                { timeout: PUSH_TIMEOUT_MS },
              );
            } catch (error) {
              // 410/404 = abonnement mort, définitif — ne jamais retenter,
              // juste remonter l'erreur pour suppression par l'appelant
              if (
                error instanceof webpush.WebPushError &&
                (error.statusCode === 410 || error.statusCode === 404)
              ) {
                throw new AbortError(error);
              }
              throw error;
            }
          },
          { retries: 3, minTimeout: 1000, maxTimeout: 16000 },
        );
      } catch (error) {
        const statusCode = error instanceof webpush.WebPushError ? error.statusCode : undefined;
        if (statusCode === 410 || statusCode === 404) {
          await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          this.logger.error(`[push] sub=${sub.id}`, error);
        }
      }
    }
  }
}
