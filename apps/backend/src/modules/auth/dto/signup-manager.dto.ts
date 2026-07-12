import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupManagerDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  // Politique de mot de passe déléguée à Supabase Auth (minimum 6
  // caractères par défaut) — pas de règle locale supplémentaire.
  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;
}
