import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from './dto/catalog-item.dto';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('suppliers')
  findSuppliers(@Query('active') active?: string) {
    return this.catalogsService.findSuppliers(active === 'true');
  }

  @Post('suppliers')
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.catalogsService.createSupplier(dto);
  }

  @Patch('suppliers/:id')
  updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return this.catalogsService.updateSupplier(id, dto);
  }

  @Get('products')
  findProducts(@Query('active') active?: string) {
    return this.catalogsService.findProducts(active === 'true');
  }

  @Post('products')
  createProduct(@Body() dto: CreateCatalogItemDto) {
    return this.catalogsService.createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCatalogItemDto) {
    return this.catalogsService.updateProduct(id, dto);
  }
}
