import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventoryRoll } from './inventory-roll.entity';
import { InventoryRollCategory } from './inventory-roll-category.enum';
import { decimalNumberTransformer } from './decimal.transformer';

@Entity('inventory_roll_lines')
export class InventoryRollLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  inventoryId: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.rollLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column({ type: 'int' })
  rollId: number;

  @ManyToOne(() => InventoryRoll, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rollId' })
  roll: InventoryRoll;

  @Column({ type: 'varchar', length: 200 })
  rollName: string;

  @Column({ type: 'int' })
  rollWidthCm: number;

  @Column({
    type: 'enum',
    enum: InventoryRollCategory,
    default: InventoryRollCategory.PAN_MASA
  })
  rollCategory: InventoryRollCategory;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: decimalNumberTransformer
  })
  weightKg: number;

  @Column({ type: 'int' })
  quantity: number;
}
