import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  CreateInventoryDto,
  CreateInventoryRollDto,
  CreateInventorySupplyDto,
  InventoryRollLineDto,
  InventorySupplyLineDto,
  UpdateInventoryDto,
  UpdateInventoryRollDto,
  UpdateInventorySupplyDto
} from './dto/inventory.dto';
import { InventoryRollLine } from './inventory-roll-line.entity';
import {
  INVENTORY_ROLL_CATEGORIES,
  InventoryRollCategory
} from './inventory-roll-category.enum';
import { InventoryRoll } from './inventory-roll.entity';
import { InventorySupplyLine } from './inventory-supply-line.entity';
import { InventorySupply } from './inventory-supply.entity';
import { Inventory } from './inventory.entity';

export interface InventoryActor {
  id: number;
  username: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryRoll)
    private readonly rollRepository: Repository<InventoryRoll>,
    @InjectRepository(InventorySupply)
    private readonly supplyRepository: Repository<InventorySupply>
  ) {}

  findRolls(activeOnly: boolean): Promise<InventoryRoll[]> {
    return this.rollRepository.find({
      where: activeOnly ? { activo: true } : {},
      order: { nombre: 'ASC', anchoCm: 'ASC' }
    });
  }

  async createRoll(dto: CreateInventoryRollDto): Promise<InventoryRoll> {
    const nombre = this.requireText(dto.nombre, 'El nombre del rollo es obligatorio.');
    const existing = await this.rollRepository.findOne({ where: { nombre, anchoCm: dto.anchoCm } });
    if (existing) {
      throw new ConflictException('Ya existe un rollo con ese nombre y medida.');
    }

    return this.rollRepository.save(this.rollRepository.create({
      nombre,
      anchoCm: dto.anchoCm,
      category: dto.category
    }));
  }

  async updateRoll(id: number, dto: UpdateInventoryRollDto): Promise<InventoryRoll> {
    const roll = await this.rollRepository.findOne({ where: { id } });
    if (!roll) {
      throw new NotFoundException(`Rollo ${id} no encontrado.`);
    }

    const nombre = dto.nombre === undefined
      ? roll.nombre
      : this.requireText(dto.nombre, 'El nombre del rollo es obligatorio.');
    const anchoCm = dto.anchoCm ?? roll.anchoCm;
    const duplicate = await this.rollRepository.findOne({ where: { nombre, anchoCm } });
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Ya existe un rollo con ese nombre y medida.');
    }

    roll.nombre = nombre;
    roll.anchoCm = anchoCm;
    if (dto.category !== undefined) {
      roll.category = dto.category;
    }
    if (dto.activo !== undefined) {
      roll.activo = dto.activo;
    }

    return this.rollRepository.save(roll);
  }

  findSupplies(activeOnly: boolean): Promise<InventorySupply[]> {
    return this.supplyRepository.find({
      where: activeOnly ? { activo: true } : {},
      order: { nombre: 'ASC' }
    });
  }

  async createSupply(dto: CreateInventorySupplyDto): Promise<InventorySupply> {
    const nombre = this.requireText(dto.nombre, 'El nombre del insumo es obligatorio.');
    const unidad = this.requireText(dto.unidad, 'La unidad del insumo es obligatoria.');
    if (await this.supplyRepository.findOne({ where: { nombre } })) {
      throw new ConflictException('Ya existe un insumo con ese nombre.');
    }

    return this.supplyRepository.save(this.supplyRepository.create({ nombre, unidad }));
  }

  async updateSupply(id: number, dto: UpdateInventorySupplyDto): Promise<InventorySupply> {
    const supply = await this.supplyRepository.findOne({ where: { id } });
    if (!supply) {
      throw new NotFoundException(`Insumo ${id} no encontrado.`);
    }

    if (dto.nombre !== undefined) {
      const nombre = this.requireText(dto.nombre, 'El nombre del insumo es obligatorio.');
      const duplicate = await this.supplyRepository.findOne({ where: { nombre } });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Ya existe un insumo con ese nombre.');
      }
      supply.nombre = nombre;
    }
    if (dto.unidad !== undefined) {
      supply.unidad = this.requireText(dto.unidad, 'La unidad del insumo es obligatoria.');
    }
    if (dto.activo !== undefined) {
      supply.activo = dto.activo;
    }

    return this.supplyRepository.save(supply);
  }

  findAll(from?: string, to?: string): Promise<Inventory[]> {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.rollLines', 'rollLine')
      .leftJoinAndSelect('inventory.supplyLines', 'supplyLine')
      .orderBy('inventory.fecha', 'DESC')
      .addOrderBy('inventory.id', 'DESC');

    if (from) {
      query.andWhere('inventory.fecha >= :from', { from });
    }
    if (to) {
      query.andWhere('inventory.fecha <= :to', { to });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: { rollLines: true, supplyLines: true }
    });
    if (!inventory) {
      throw new NotFoundException(`Inventario ${id} no encontrado.`);
    }

    return inventory;
  }

  async findReport(id: number) {
    const inventory = await this.findOne(id);
    const rollTotals = new Map<number, {
      rollId: number;
      category: InventoryRollCategory;
      nombre: string;
      anchoCm: number;
      details: { weightKg: number; quantity: number; totalKg: number }[];
      totalKg: number;
    }>();

    const catalogRolls = await this.rollRepository.find({
      order: { nombre: 'ASC', anchoCm: 'ASC' }
    });
    for (const roll of catalogRolls) {
      rollTotals.set(roll.id, {
        rollId: roll.id,
        category: roll.category,
        nombre: roll.nombre,
        anchoCm: roll.anchoCm,
        details: [],
        totalKg: 0
      });
    }

    for (const line of inventory.rollLines) {
      const lineTotal = this.roundToThree(line.weightKg * line.quantity);
      const summary = rollTotals.get(line.rollId) ?? {
        rollId: line.rollId,
        category: line.rollCategory,
        nombre: line.rollName,
        anchoCm: line.rollWidthCm,
        details: [],
        totalKg: 0
      };
      summary.category = line.rollCategory;
      summary.nombre = line.rollName;
      summary.anchoCm = line.rollWidthCm;
      summary.details.push({
        weightKg: line.weightKg,
        quantity: line.quantity,
        totalKg: lineTotal
      });
      summary.totalKg = this.roundToThree(summary.totalKg + lineTotal);
      rollTotals.set(line.rollId, summary);
    }

    return {
      ...inventory,
      rollCategories: INVENTORY_ROLL_CATEGORIES.map((category) => {
        const rolls = [...rollTotals.values()]
          .filter((roll) => roll.category === category)
          .sort((a, b) => a.nombre.localeCompare(b.nombre) || a.anchoCm - b.anchoCm);
        return {
          category,
          rolls,
          totalKg: this.roundToThree(rolls.reduce((total, item) => total + item.totalKg, 0))
        };
      }),
      rollTotals: [...rollTotals.values()].sort((a, b) =>
        INVENTORY_ROLL_CATEGORIES.indexOf(a.category) - INVENTORY_ROLL_CATEGORIES.indexOf(b.category) ||
        a.nombre.localeCompare(b.nombre) ||
        a.anchoCm - b.anchoCm
      ),
      totalRollKg: this.roundToThree(
        [...rollTotals.values()].reduce((total, item) => total + item.totalKg, 0)
      )
    };
  }

  async create(dto: CreateInventoryDto, actor: InventoryActor): Promise<Inventory> {
    const rollLines = dto.rollLines ?? [];
    const supplyLines = dto.supplyLines ?? [];
    this.requireInventoryLines(rollLines, supplyLines);

    const id = await this.dataSource.transaction(async (manager) => {
      const rolls = await this.loadRolls(manager.getRepository(InventoryRoll), rollLines, new Set());
      const supplies = await this.loadSupplies(manager.getRepository(InventorySupply), supplyLines, new Set());
      const inventory = await manager.getRepository(Inventory).save(
        manager.getRepository(Inventory).create({
          fecha: dto.fecha,
          createdByUserId: actor.id,
          createdByUsername: actor.username
        })
      );
      await this.saveRollLines(manager.getRepository(InventoryRollLine), inventory.id, rollLines, rolls);
      await this.saveSupplyLines(manager.getRepository(InventorySupplyLine), inventory.id, supplyLines, supplies);
      return inventory.id;
    });

    return this.findOne(id);
  }

  async update(id: number, dto: UpdateInventoryDto): Promise<Inventory> {
    await this.dataSource.transaction(async (manager) => {
      const inventoryRepository = manager.getRepository(Inventory);
      const inventory = await inventoryRepository.findOne({
        where: { id },
        relations: { rollLines: true, supplyLines: true }
      });
      if (!inventory) {
        throw new NotFoundException(`Inventario ${id} no encontrado.`);
      }

      const rollLines = dto.rollLines ?? inventory.rollLines.map((line) => ({
        rollId: line.rollId,
        weightKg: line.weightKg,
        quantity: line.quantity
      }));
      const supplyLines = dto.supplyLines ?? inventory.supplyLines.map((line) => ({
        supplyId: line.supplyId,
        quantity: line.quantity
      }));
      this.requireInventoryLines(rollLines, supplyLines);

      const existingRollIds = new Set(inventory.rollLines.map((line) => line.rollId));
      const existingSupplyIds = new Set(inventory.supplyLines.map((line) => line.supplyId));
      const rolls = await this.loadRolls(
        manager.getRepository(InventoryRoll),
        rollLines,
        existingRollIds
      );
      const supplies = await this.loadSupplies(
        manager.getRepository(InventorySupply),
        supplyLines,
        existingSupplyIds
      );

      if (dto.fecha !== undefined) {
        inventory.fecha = dto.fecha;
        await inventoryRepository.save(inventory);
      }
      if (dto.rollLines !== undefined) {
        const lineRepository = manager.getRepository(InventoryRollLine);
        await lineRepository.delete({ inventoryId: id });
        await this.saveRollLines(lineRepository, id, rollLines, rolls, inventory.rollLines);
      }
      if (dto.supplyLines !== undefined) {
        const lineRepository = manager.getRepository(InventorySupplyLine);
        await lineRepository.delete({ inventoryId: id });
        await this.saveSupplyLines(lineRepository, id, supplyLines, supplies, inventory.supplyLines);
      }
    });

    return this.findOne(id);
  }

  private async loadRolls(
    repository: Repository<InventoryRoll>,
    lines: InventoryRollLineDto[],
    allowedInactiveIds: Set<number>
  ): Promise<Map<number, InventoryRoll>> {
    const ids = [...new Set(lines.map((line) => line.rollId))];
    const items = ids.length ? await repository.find({ where: { id: In(ids) } }) : [];
    const byId = new Map(items.map((item) => [item.id, item]));
    if (items.length !== ids.length || items.some((item) =>
      !item.activo && !allowedInactiveIds.has(item.id)
    )) {
      throw new BadRequestException('Selecciona rollos activos del catálogo.');
    }
    return byId;
  }

  private async loadSupplies(
    repository: Repository<InventorySupply>,
    lines: InventorySupplyLineDto[],
    allowedInactiveIds: Set<number>
  ): Promise<Map<number, InventorySupply>> {
    const ids = [...new Set(lines.map((line) => line.supplyId))];
    const items = ids.length ? await repository.find({ where: { id: In(ids) } }) : [];
    const byId = new Map(items.map((item) => [item.id, item]));
    if (items.length !== ids.length || items.some((item) =>
      !item.activo && !allowedInactiveIds.has(item.id)
    )) {
      throw new BadRequestException('Selecciona insumos activos del catálogo.');
    }
    return byId;
  }

  private async saveRollLines(
    repository: Repository<InventoryRollLine>,
    inventoryId: number,
    lines: InventoryRollLineDto[],
    rolls: Map<number, InventoryRoll>,
    existingLines: InventoryRollLine[] = []
  ): Promise<void> {
    if (!lines.length) {
      return;
    }
    await repository.save(lines.map((line) => {
      const roll = rolls.get(line.rollId);
      if (!roll) {
        throw new BadRequestException('El rollo seleccionado no existe.');
      }
      const previous = existingLines.find((item) =>
        item.rollId === line.rollId &&
        Number(item.weightKg) === Number(line.weightKg) &&
        item.quantity === line.quantity
      );
      return repository.create({
        inventoryId,
        rollId: roll.id,
        rollName: previous?.rollName ?? roll.nombre,
        rollWidthCm: previous?.rollWidthCm ?? roll.anchoCm,
        rollCategory: previous?.rollCategory ?? roll.category,
        weightKg: line.weightKg,
        quantity: line.quantity
      });
    }));
  }

  private async saveSupplyLines(
    repository: Repository<InventorySupplyLine>,
    inventoryId: number,
    lines: InventorySupplyLineDto[],
    supplies: Map<number, InventorySupply>,
    existingLines: InventorySupplyLine[] = []
  ): Promise<void> {
    if (!lines.length) {
      return;
    }
    await repository.save(lines.map((line) => {
      const supply = supplies.get(line.supplyId);
      if (!supply) {
        throw new BadRequestException('El insumo seleccionado no existe.');
      }
      const previous = existingLines.find((item) =>
        item.supplyId === line.supplyId &&
        Number(item.quantity) === Number(line.quantity)
      );
      return repository.create({
        inventoryId,
        supplyId: supply.id,
        supplyName: previous?.supplyName ?? supply.nombre,
        unit: previous?.unit ?? supply.unidad,
        quantity: line.quantity
      });
    }));
  }

  private requireInventoryLines(
    rollLines: InventoryRollLineDto[],
    supplyLines: InventorySupplyLineDto[]
  ): void {
    if (!rollLines.length && !supplyLines.length) {
      throw new BadRequestException('Agrega al menos un rollo o un insumo al inventario.');
    }
  }

  private requireText(value: string, message: string): string {
    const text = value?.trim();
    if (!text) {
      throw new BadRequestException(message);
    }
    return text;
  }

  private roundToThree(value: number): number {
    return Number(value.toFixed(3));
  }
}
