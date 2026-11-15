import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entry } from '../entries/entry.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Entry)
    private readonly entryRepository: Repository<Entry>
  ) {}

  async getSummary() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${new Date(
      year,
      month,
      0
    ).getDate()}`;

    const [totalEntradas, pendientes, enErp] = await Promise.all([
      this.entryRepository
        .createQueryBuilder('entry')
        .where('entry.fecha >= :monthStart', { monthStart })
        .andWhere('entry.fecha <= :monthEnd', { monthEnd })
        .getCount(),
      this.entryRepository
        .createQueryBuilder('entry')
        .where('entry.fecha >= :monthStart', { monthStart })
        .andWhere('entry.fecha <= :monthEnd', { monthEnd })
        .andWhere('entry.yaIngresadoErp = :erp', { erp: false })
        .getCount(),
      this.entryRepository
        .createQueryBuilder('entry')
        .where('entry.fecha >= :monthStart', { monthStart })
        .andWhere('entry.fecha <= :monthEnd', { monthEnd })
        .andWhere('entry.yaIngresadoErp = :erp', { erp: true })
        .getCount()
    ]);

    const record = await this.entryRepository
      .createQueryBuilder('entry')
      .select('entry.proveedor', 'proveedor')
      .addSelect('COUNT(entry.id)', 'total')
      .where('entry.fecha >= :monthStart', { monthStart })
      .andWhere('entry.fecha <= :monthEnd', { monthEnd })
      .groupBy('entry.proveedor')
      .orderBy('COUNT(entry.id)', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      totalEntradas,
      pendientes,
      enErp,
      proveedorMasActivo: record?.proveedor ?? 'Sin registros'
    };
  }
}
