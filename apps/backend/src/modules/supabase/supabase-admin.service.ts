import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient>;

@Injectable()
export class SupabaseAdminService {
  private readonly client: SupabaseClient;

  constructor(config: ConfigService) {
    this.client = createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  get auth(): SupabaseClient['auth'] {
    return this.client.auth;
  }

  // Accès complet au client — utilisé par StorageService pour l'API Storage
  get raw(): SupabaseClient {
    return this.client;
  }
}
