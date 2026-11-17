import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';

export class CreateEntryProductDto {
  @IsString()
  @MinLength(1)
  @Matches(/\S/)
  producto: string;

  @IsNumber()
  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class CreateEntryDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @MinLength(1)
  @Matches(/\S/)
  @MaxLength(200)
  proveedor: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  proveedorNit?: string;

  @IsOptional()
  @IsString()
  producto?: string;

  @IsOptional()
  @IsNumber()
  cantidad?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEntryProductDto)
  productos?: CreateEntryProductDto[];

  @IsString()
  hora: string;

  @IsOptional()
  @IsString()
  ordenCompra?: string;

  @IsOptional()
  @IsBoolean()
  yaIngresadoErp?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
