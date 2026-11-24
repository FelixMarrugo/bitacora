import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { InventoryRollCategory } from './inventory-roll-category.enum';

@Entity('inventory_roll_catalog')
@Unique(['nombre', 'anchoCm'])
export class InventoryRoll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'int' })
  anchoCm: number;

  @Column({
    type: 'enum',
    enum: InventoryRollCategory,
    default: InventoryRollCategory.PAN_MASA
  })
  category: InventoryRollCategory;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
