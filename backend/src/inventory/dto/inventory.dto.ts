import { Type } from 'class-transformer';
import { InventoryRollCategory } from '../inventory-roll-category.enum';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator';

export class InventoryRollLineDto {
  @IsInt()
  @IsPositive()
  rollId: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  @Max(999999999.999)
  weightKg: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class InventorySupplyLineDto {
  @IsInt()
  @IsPositive()
  supplyId: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  @Max(999999999.999)
  quantity: number;
}

export class CreateInventoryDto {
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryRollLineDto)
  rollLines?: InventoryRollLineDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventorySupplyLineDto)
  supplyLines?: InventorySupplyLineDto[];
}

export class UpdateInventoryDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryRollLineDto)
  rollLines?: InventoryRollLineDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventorySupplyLineDto)
  supplyLines?: InventorySupplyLineDto[];
}

export class CreateInventoryRollDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsInt()
  @Min(1)
  @Max(999)
  anchoCm: number;

  @IsEnum(InventoryRollCategory)
  category: InventoryRollCategory;
}

export class UpdateInventoryRollDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  anchoCm?: number;

  @IsOptional()
  @IsEnum(InventoryRollCategory)
  category?: InventoryRollCategory;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CreateInventorySupplyDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @MaxLength(30)
  unidad: string;
}

export class UpdateInventorySupplyDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  unidad?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
