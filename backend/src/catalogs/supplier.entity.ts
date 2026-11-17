import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  nit?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  razonSocial?: string | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
