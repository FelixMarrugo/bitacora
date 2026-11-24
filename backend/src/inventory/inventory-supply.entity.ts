import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('inventory_supply_catalog')
@Unique(['nombre'])
export class InventorySupply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 30, default: 'unidad' })
  unidad: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
