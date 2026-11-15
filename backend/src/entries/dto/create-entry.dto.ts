import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEntryDto {
  @IsDateString()
  fecha: string;

  @IsString()
  proveedor: string;

  @IsString()
  producto: string;

  @IsNumber()
  cantidad: number;

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
