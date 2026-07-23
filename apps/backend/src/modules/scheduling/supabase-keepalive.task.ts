import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

// Supabase free tier met le projet en veille après ~5 min d'inactivité.
// Ce ping toutes les 4 min maintient la connexion PostgreSQL active.
@Injectable()
export class SupabaseKeepaliveTask {
  private readonly logger = new Logger(SupabaseKeepaliveTask.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 */4 * * * *') // toutes les 4 minutes
  async run(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.warn('[supabase-keepalive] ping échoué — Supabase peut être en veille', error);
    }
  }
}
