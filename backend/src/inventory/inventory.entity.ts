import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { InventoryRollLine } from './inventory-roll-line.entity';
import { InventorySupplyLine } from './inventory-supply-line.entity';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int' })
  createdByUserId: number;

  @Column({ type: 'varchar', length: 100 })
  createdByUsername: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => InventoryRollLine, (line) => line.inventory)
  rollLines: InventoryRollLine[];

  @OneToMany(() => InventorySupplyLine, (line) => line.inventory)
  supplyLines: InventorySupplyLine[];
}
