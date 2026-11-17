import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateCatalogItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/\S/)
  nombre: string;
}

export class UpdateCatalogItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/\S/)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
