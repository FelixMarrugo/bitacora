import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { EntriesService } from './entries.service';

@Controller('entries')
@UseGuards(JwtAuthGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  create(@Body() dto: CreateEntryDto) {
    return this.entriesService.create(dto);
  }

  @Get()
  findAll(@Query('month') month?: string) {
    return this.entriesService.findAll(month);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntryDto) {
    return this.entriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.entriesService.remove(id);
  }

  @Get('verify-po/:ordenCompra')
  verifyPurchaseOrder(@Param('ordenCompra') ordenCompra: string) {
    return this.entriesService.verifyPurchaseOrder(ordenCompra);
  }
}
