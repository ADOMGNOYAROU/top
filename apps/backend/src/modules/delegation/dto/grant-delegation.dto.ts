import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GrantDelegationDto {
  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsEmail()
  managerEmail?: string;
}
