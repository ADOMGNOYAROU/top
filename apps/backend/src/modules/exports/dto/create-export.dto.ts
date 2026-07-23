import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateExportDto {
  @IsIn(['biens', 'locataires', 'paiements', 'contrats', 'rapports'])
  type!: string;

  @IsIn(['pdf', 'excel', 'csv'])
  format!: string;

  @IsOptional()
  @IsString()
  dateDebut?: string;

  @IsOptional()
  @IsString()
  dateFin?: string;
}
