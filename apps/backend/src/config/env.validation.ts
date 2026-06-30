import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsInt,
  IsEmail,
  Min,
  Max,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  // Base de données
  @IsString()
  DATABASE_URL: string;

  // Supabase
  @IsUrl({ require_tld: false })
  SUPABASE_URL: string;

  @IsString()
  SUPABASE_ANON_KEY: string;

  @IsString()
  SUPABASE_SERVICE_ROLE_KEY: string;

  @IsString()
  SUPABASE_JWT_SECRET: string;

  // Resend
  @IsString()
  RESEND_API_KEY: string;

  @IsEmail()
  RESEND_FROM_EMAIL: string;

  @IsString()
  @IsOptional()
  RESEND_FROM_NAME?: string = 'DINAWA';

  // VAPID (Web Push)
  @IsString()
  VAPID_PUBLIC_KEY: string;

  @IsString()
  VAPID_PRIVATE_KEY: string;

  @IsString()
  VAPID_SUBJECT: string;

  // Cashpay (optionnel — non disponible en dev sans compte marchand)
  @IsUrl({ require_tld: false })
  @IsOptional()
  CASHPAY_API_URL?: string;

  @IsString()
  @IsOptional()
  CASHPAY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CASHPAY_WEBHOOK_SECRET?: string;

  // Sentry (optionnel — désactivé si absent)
  @IsUrl()
  @IsOptional()
  SENTRY_DSN?: string;

  // CORS
  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS?: string = 'http://localhost:4200';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => `  ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');

    throw new Error(
      `[Config] Variables d'environnement invalides — l'application ne peut pas démarrer:\n${messages}\n\nConsultez .env.example et docs/ENV.md`,
    );
  }

  return validatedConfig;
}
