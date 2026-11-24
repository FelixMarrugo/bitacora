import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryController } from './inventory.controller';
import { InventoryRollLine } from './inventory-roll-line.entity';
import { InventoryRoll } from './inventory-roll.entity';
import { InventoryService } from './inventory.service';
import { InventorySupplyLine } from './inventory-supply-line.entity';
import { InventorySupply } from './inventory-supply.entity';
import { Inventory } from './inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      InventoryRoll,
      InventoryRollLine,
      InventorySupply,
      InventorySupplyLine
    ])
  ],
  controllers: [InventoryController],
  providers: [InventoryService, JwtAuthGuard]
})
export class InventoryModule {}
