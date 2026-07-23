import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListListingsQueryDto {
  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  prixMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  prixMax?: number;

  @IsOptional()
  @IsString()
  recherche?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
