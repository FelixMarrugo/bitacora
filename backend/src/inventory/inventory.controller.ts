import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateInventoryDto,
  CreateInventoryRollDto,
  CreateInventorySupplyDto,
  UpdateInventoryDto,
  UpdateInventoryRollDto,
  UpdateInventorySupplyDto
} from './dto/inventory.dto';
import { InventoryActor, InventoryService } from './inventory.service';

type AuthenticatedRequest = Request & { user: InventoryActor };

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('catalog/rolls')
  findRolls(@Query('activeOnly') activeOnly?: string) {
    return this.inventoryService.findRolls(activeOnly !== 'false');
  }

  @Post('catalog/rolls')
  createRoll(@Body() dto: CreateInventoryRollDto) {
    return this.inventoryService.createRoll(dto);
  }

  @Patch('catalog/rolls/:id')
  updateRoll(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryRollDto
  ) {
    return this.inventoryService.updateRoll(id, dto);
  }

  @Get('catalog/supplies')
  findSupplies(@Query('activeOnly') activeOnly?: string) {
    return this.inventoryService.findSupplies(activeOnly !== 'false');
  }

  @Post('catalog/supplies')
  createSupply(@Body() dto: CreateInventorySupplyDto) {
    return this.inventoryService.createSupply(dto);
  }

  @Patch('catalog/supplies/:id')
  updateSupply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventorySupplyDto
  ) {
    return this.inventoryService.updateSupply(id, dto);
  }

  @Post()
  create(@Body() dto: CreateInventoryDto, @Req() request: AuthenticatedRequest) {
    return this.inventoryService.create(dto, request.user);
  }

  @Get()
  findAll(@Query('from') from?: string, @Query('to') to?: string) {
    return this.inventoryService.findAll(from, to);
  }

  @Get(':id/report')
  findReport(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findReport(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInventoryDto
  ) {
    return this.inventoryService.update(id, dto);
  }
}
