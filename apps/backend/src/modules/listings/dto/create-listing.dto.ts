import { IsString, IsNotEmpty } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;
}
