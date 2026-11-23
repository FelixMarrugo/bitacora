import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('entries')
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 200 })
  proveedor: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  proveedorNit?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  producto?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value)
    }
  })
  cantidad: number;

  @Column({ type: 'json', nullable: true })
  productos?: { producto: string; cantidad: number }[];

  @Column({ type: 'time' })
  hora: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  ordenCompra?: string;

  @Column({ type: 'boolean', default: false })
  yaIngresadoErp: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
