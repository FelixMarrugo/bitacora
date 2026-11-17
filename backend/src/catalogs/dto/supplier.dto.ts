import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  @Matches(/\S/)
  nit: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/\S/)
  razonSocial: string;
}

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  @Matches(/\S/)
  nit?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/\S/)
  razonSocial?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
