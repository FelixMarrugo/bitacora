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
	MaxLength,
	Matches,
	MinLength,
	ValidateNested
} from 'class-validator';

class UpdateEntryProductDto {
	@IsString()
	@MinLength(1)
	@Matches(/\S/)
	producto: string;

	@IsNumber()
	@IsInt()
	@IsPositive()
	cantidad: number;
}

export class UpdateEntryDto {
	@IsOptional()
	@IsDateString()
	fecha?: string;

	@IsOptional()
	@IsString()
	proveedor?: string;

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
	@Type(() => UpdateEntryProductDto)
	productos?: UpdateEntryProductDto[];

	@IsOptional()
	@IsString()
	hora?: string;

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
