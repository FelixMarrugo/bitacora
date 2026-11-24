import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventorySupply } from './inventory-supply.entity';
import { decimalNumberTransformer } from './decimal.transformer';

@Entity('inventory_supply_lines')
export class InventorySupplyLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  inventoryId: number;

  @ManyToOne(() => Inventory, (inventory) => inventory.supplyLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column({ type: 'int' })
  supplyId: number;

  @ManyToOne(() => InventorySupply, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplyId' })
  supply: InventorySupply;

  @Column({ type: 'varchar', length: 200 })
  supplyName: string;

  @Column({ type: 'varchar', length: 30 })
  unit: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 3,
    transformer: decimalNumberTransformer
  })
  quantity: number;
}
