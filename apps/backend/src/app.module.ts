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
import { SupabaseModule } from './modules/supabase/supabase.module';
import { StorageModule } from './modules/storage/storage.module';
import { EmailModule } from './modules/email/email.module';
import { PushModule } from './modules/push/push.module';
import { NotifyModule } from './modules/notify/notify.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ListingsModule } from './modules/listings/listings.module';
import { AdminModule } from './modules/admin/admin.module';
import { GestionnaireModule } from './modules/gestionnaire/gestionnaire.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProprietairesModule } from './modules/proprietaires/proprietaires.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

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

    // Client Supabase Admin disponible globalement via @Global()
    SupabaseModule,

    // Wrapper Supabase Storage disponible globalement via @Global()
    StorageModule,

    // EmailService (Resend) disponible globalement via @Global()
    EmailModule,

    // WebPushService + endpoints /api/push/* disponibles globalement via @Global()
    PushModule,

    // NotifyService.notifyUser() — point d'entrée unique notifications, disponible globalement
    NotifyModule,

    // Health checks Railway
    HealthModule,

    // Authentification et profil courant
    AuthModule,

    // KPIs, alertes, revenus du tableau de bord
    DashboardModule,

    // Modules métier
    PropertiesModule,
    TenantsModule,
    PaymentsModule,
    ListingsModule,
    AdminModule,
    GestionnaireModule,
    NotificationsModule,
    ProprietairesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Authentifie chaque requête (sauf @Public()) et injecte request.user
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    // Vérifie @Roles(...) après authentification
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
