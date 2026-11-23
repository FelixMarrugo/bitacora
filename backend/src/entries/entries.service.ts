import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const productos = dto.productos ? this.normalizeProducts(dto.productos) : undefined;
    const productNames = productos?.map((item) => item.producto);
    const totalQuantity = productos ? this.calculateTotalQuantity(productos) : undefined;
    const entity = this.entryRepository.create({
      ...dto,
      ...(productos && {
        productos,
        producto: productNames?.join(', ').slice(0, 200),
        cantidad: totalQuantity
      }),
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
    const productos = dto.productos ? this.normalizeProducts(dto.productos) : undefined;

    Object.assign(entry, dto, productos ? {
      productos,
      producto: productos.map((item) => item.producto).join(', ').slice(0, 200),
      cantidad: this.calculateTotalQuantity(productos)
    } : {}, {
      yaIngresadoErp: dto.yaIngresadoErp ?? entry.yaIngresadoErp
    });

    return this.entryRepository.save(entry);
  }

  private normalizeProducts(products: { producto: string; cantidad: number }[]) {
    const normalized = products.map((item) => ({
      producto: item.producto.trim(),
      cantidad: item.cantidad
    }));
    const names = normalized.map((item) => item.producto.toLocaleLowerCase());

    if (normalized.some((item) => !item.producto)) {
      throw new BadRequestException('El nombre del producto es obligatorio.');
    }
    if (new Set(names).size !== names.length) {
      throw new BadRequestException('No se puede repetir un producto en la misma entrada.');
    }

    return normalized;
  }

  private calculateTotalQuantity(products: { cantidad: number }[]): number {
    const total = Number(products.reduce((sum, item) => sum + item.cantidad, 0).toFixed(3));
    if (total > 999999999.999) {
      throw new BadRequestException('La cantidad total no puede superar 999999999.999.');
    }

    return total;
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
