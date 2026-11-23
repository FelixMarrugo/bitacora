import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
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

  @IsNumber({ maxDecimalPlaces: 3 })
  @Max(999999999.999)
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
  @IsNumber({ maxDecimalPlaces: 3 })
  @Max(999999999.999)
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
  @MaxLength(120)
  ordenCompra?: string;

  @IsOptional()
  @IsBoolean()
  yaIngresadoErp?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
