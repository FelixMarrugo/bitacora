import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from '../entries/entry.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Entry])],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
