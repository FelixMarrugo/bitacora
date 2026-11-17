import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';
import { Product } from './product.entity';
import { Supplier } from './supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Product])],
  controllers: [CatalogsController],
  providers: [CatalogsService]
})
export class CatalogsModule {}
