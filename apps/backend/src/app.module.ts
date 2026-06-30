import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { validate } from './config/env.validation';
import { pinoConfig } from './config/logger.config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Validation des variables d'environnement au démarrage — crash immédiat si invalide
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),

    // Logging structuré avec redaction des champs sensibles
    LoggerModule.forRoot(pinoConfig),

    // Rate limiting global (sauf routes décorées @SkipThrottle)
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // Cron jobs (fuseau Africa/Lomé = UTC+0, pas de DST)
    ScheduleModule.forRoot(),

    // Événements internes découplés
    EventEmitterModule.forRoot({ wildcard: false }),

    // Prisma disponible globalement via @Global()
    PrismaModule,

    // Health checks Railway
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
