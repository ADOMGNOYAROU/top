import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 8000;

// Supabase free tier se met en veille automatiquement. On commence par un
// ping HTTP pour réveiller le projet, puis on retente la connexion Prisma
// jusqu'à MAX_RETRIES fois (80 s max) le temps que PostgreSQL soit disponible.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.wakeupSupabase();
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this['$connect']();
        if (attempt > 1) {
          console.log(`[Prisma] Connexion établie (tentative ${attempt})`);
        }
        return;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error;
        }
        console.warn(`[Prisma] Tentative ${attempt}/${MAX_RETRIES} échouée. Nouvel essai dans ${RETRY_DELAY_MS / 1000}s…`);
        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      }
    }
  }

  // Ping HTTP Supabase pour sortir le projet de veille avant la connexion PG
  private async wakeupSupabase(): Promise<void> {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_ANON_KEY'];
    if (!url || !key) return;
    try {
      const res = await fetch(`${url}/rest/v1/users?select=id&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8000),
      });
      console.log(`[Prisma] Ping Supabase → HTTP ${res.status}`);
    } catch {
      console.warn('[Prisma] Ping Supabase échoué (pas bloquant)');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this['$disconnect']();
  }
}
