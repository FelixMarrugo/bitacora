import {
	IsBoolean,
	IsDateString,
	IsNumber,
	IsOptional,
	IsString
} from 'class-validator';

export class UpdateEntryDto {
	@IsOptional()
	@IsDateString()
	fecha?: string;

	@IsOptional()
	@IsString()
	proveedor?: string;

	@IsOptional()
	@IsString()
	producto?: string;

	@IsOptional()
	@IsNumber()
	cantidad?: number;

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
