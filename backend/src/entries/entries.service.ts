import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { Entry } from './entry.entity';

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepository: Repository<Entry>
  ) {}

  async create(dto: CreateEntryDto) {
    const entity = this.entryRepository.create({
      ...dto,
      yaIngresadoErp: dto.yaIngresadoErp ?? false
    });

    return this.entryRepository.save(entity);
  }

  async findAll(month?: string) {
    const query = this.entryRepository.createQueryBuilder('entry');

    if (month) {
      const [year, monthNumber] = month.split('-');
      if (year && monthNumber) {
        query.where('YEAR(entry.fecha) = :year', { year: Number(year) });
        query.andWhere('MONTH(entry.fecha) = :monthNumber', {
          monthNumber: Number(monthNumber)
        });
      }
    }

    return query
      .orderBy('entry.fecha', 'DESC')
      .addOrderBy('entry.hora', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    const entry = await this.entryRepository.findOne({ where: { id } });

    if (!entry) {
      throw new NotFoundException(`Entrada ${id} no encontrada`);
    }

    return entry;
  }

  async update(id: number, dto: UpdateEntryDto) {
    const entry = await this.findOne(id);

    Object.assign(entry, dto, {
      yaIngresadoErp: dto.yaIngresadoErp ?? entry.yaIngresadoErp
    });

    return this.entryRepository.save(entry);
  }

  async remove(id: number) {
    const entry = await this.findOne(id);
    await this.entryRepository.remove(entry);

    return { deleted: true, id };
  }

  async verifyPurchaseOrder(ordenCompra: string) {
    const isRegistered = !!(await this.entryRepository.findOne({
      where: { ordenCompra }
    }));

    return {
      valid: isRegistered,
      yaIngresadoErp: isRegistered,
      message: isRegistered
        ? 'La orden de compra ya se encuentra registrada en el sistema.'
        : 'La orden de compra no existe o aún no fue ingresada.'
    };
  }
}
