import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCatalogItemDto, UpdateCatalogItemDto } from './dto/catalog-item.dto';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { Product } from './product.entity';
import { Supplier } from './supplier.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async findSuppliers(activeOnly: boolean) {
    const suppliers = await this.supplierRepository.find({
      where: activeOnly ? { activo: true } : {},
      order: { nombre: 'ASC' }
    });
    return suppliers.map((supplier) => ({
      ...supplier,
      nit: supplier.nit ?? '',
      razonSocial: supplier.razonSocial ?? supplier.nombre
    }));
  }

  findProducts(activeOnly: boolean) {
    return this.productRepository.find({
      where: activeOnly ? { activo: true } : {},
      order: { nombre: 'ASC' }
    });
  }

  async createSupplier(dto: CreateSupplierDto) {
    const nit = dto.nit.trim();
    const razonSocial = dto.razonSocial.trim();
    this.validateName(razonSocial);
    this.validateNit(nit);
    if (await this.findSupplierByNit(nit)) {
      throw new ConflictException('Ya existe un proveedor con ese NIT.');
    }
    if (await this.supplierRepository.findOne({ where: { nombre: razonSocial } })) {
      throw new ConflictException('Ya existe un proveedor con esa razón social.');
    }

    return this.supplierRepository.save(
      this.supplierRepository.create({ nombre: razonSocial, nit, razonSocial })
    );
  }

  async createProduct(dto: CreateCatalogItemDto) {
    const nombre = dto.nombre.trim();
    this.validateName(nombre);
    if (await this.productRepository.findOne({ where: { nombre } })) {
      throw new ConflictException('Ya existe un producto con ese nombre.');
    }

    return this.productRepository.save(this.productRepository.create({ nombre }));
  }

  async updateSupplier(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Proveedor ${id} no encontrado.`);
    }

    if (dto.nit !== undefined) {
      const nit = dto.nit.trim();
      this.validateNit(nit);
      if (await this.findSupplierByNit(nit, id)) {
        throw new ConflictException('Ya existe un proveedor con ese NIT.');
      }
      supplier.nit = nit;
    }

    if (dto.razonSocial !== undefined) {
      const razonSocial = dto.razonSocial.trim();
      this.validateName(razonSocial);
      const duplicate = await this.supplierRepository.findOne({ where: { nombre: razonSocial } });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Ya existe un proveedor con esa razón social.');
      }
      supplier.nombre = razonSocial;
      supplier.razonSocial = razonSocial;
    }
    if (dto.activo !== undefined) {
      supplier.activo = dto.activo;
    }

    return this.supplierRepository.save(supplier);
  }

  async updateProduct(id: number, dto: UpdateCatalogItemDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado.`);
    }

    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      this.validateName(nombre);
      const duplicate = await this.productRepository.findOne({ where: { nombre } });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Ya existe un producto con ese nombre.');
      }
      product.nombre = nombre;
    }
    if (dto.activo !== undefined) {
      product.activo = dto.activo;
    }

    return this.productRepository.save(product);
  }

  private validateNit(nit: string): void {
    if (!nit || !this.normalizeNit(nit)) {
      throw new BadRequestException('El NIT es obligatorio.');
    }
  }

  private async findSupplierByNit(nit: string, exceptId?: number): Promise<Supplier | undefined> {
    const normalizedNit = this.normalizeNit(nit);
    const suppliers = await this.supplierRepository.find();
    return suppliers.find((supplier) =>
      supplier.id !== exceptId &&
      !!supplier.nit &&
      this.normalizeNit(supplier.nit) === normalizedNit
    );
  }

  private normalizeNit(nit: string): string {
    return nit.toLocaleLowerCase().replace(/[\s.-]/g, '');
  }

  private validateName(nombre: string): void {
    if (!nombre) {
      throw new BadRequestException('El nombre es obligatorio.');
    }
  }
}
