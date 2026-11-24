import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { forkJoin } from 'rxjs';
import {
  CategoriaRolloInventario,
  CATEGORIAS_ROLLO_INVENTARIO,
  InsumoInventario,
  Inventario,
  InventarioRequest,
  LineaInsumoInventario,
  LineaRolloInventario,
  RolloInventario
} from '../../models/inventario.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  templateUrl: './inventory-form.page.html'
})
export class InventoryFormPage implements OnInit {
  inventoryId: number | null = null;
  fecha = this.today();
  readonly rollCategories = CATEGORIAS_ROLLO_INVENTARIO;
  rolls: RolloInventario[] = [];
  supplies: InsumoInventario[] = [];
  rollLines: LineaRolloInventario[] = [];
  supplyLines: LineaInsumoInventario[] = [];
  originalRollIds = new Set<number>();
  originalSupplyIds = new Set<number>();
  isLoading = true;
  isSubmitting = false;
  statusMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.inventoryId = id ? Number(id) : null;

    if (this.inventoryId) {
      forkJoin({
        rolls: this.apiService.getInventoryRolls(false),
        supplies: this.apiService.getInventorySupplies(false),
        inventory: this.apiService.getInventory(this.inventoryId)
      }).subscribe({
        next: ({ rolls, supplies, inventory }) => {
          this.setCatalogs(rolls, supplies);
          this.setInventory(inventory);
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => this.failLoading(error)
      });
      return;
    }

    forkJoin({
      rolls: this.apiService.getInventoryRolls(),
      supplies: this.apiService.getInventorySupplies()
    }).subscribe({
      next: ({ rolls, supplies }) => {
        this.setCatalogs(rolls, supplies);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => this.failLoading(error)
    });
  }

  get totalRollKg(): number {
    return this.rollLines.reduce((total, line) => total + this.lineTotalKg(line), 0);
  }

  addRollLine(category: CategoriaRolloInventario): void {
    const roll = this.rolls.find((item) => item.activo && item.category === category);
    if (!roll) {
      this.statusMessage = `Agrega o activa un producto de ${category} en Catálogos antes de continuar.`;
      return;
    }
    this.rollLines.push({
      rollId: roll.id,
      rollCategory: category,
      weightKg: 0,
      quantity: 1
    });
    this.statusMessage = '';
  }

  rollLinesFor(category: CategoriaRolloInventario): LineaRolloInventario[] {
    return this.rollLines.filter((line) => this.categoryForLine(line) === category);
  }

  hasActiveRolls(category: CategoriaRolloInventario): boolean {
    return this.rolls.some((roll) => roll.activo && roll.category === category);
  }

  totalRollKgFor(category: CategoriaRolloInventario): number {
    return this.rollLinesFor(category).reduce((total, line) => total + this.lineTotalKg(line), 0);
  }

  removeRollLine(line: LineaRolloInventario): void {
    const index = this.rollLines.indexOf(line);
    if (index >= 0) {
      this.rollLines.splice(index, 1);
    }
  }

  addSupplyLine(): void {
    const supply = this.supplies.find((item) => item.activo);
    if (!supply) {
      this.statusMessage = 'Agrega o activa un insumo en Catálogos antes de continuar.';
      return;
    }
    this.supplyLines.push({ supplyId: supply.id, quantity: 1 });
    this.statusMessage = '';
  }

  removeSupplyLine(index: number): void {
    this.supplyLines.splice(index, 1);
  }

  rollOptionsFor(
    line: LineaRolloInventario,
    category: CategoriaRolloInventario
  ): RolloInventario[] {
    return this.rolls.filter((item) =>
      (item.activo && item.category === category) || item.id === line.rollId
    );
  }

  onRollSelectionChange(line: LineaRolloInventario): void {
    const roll = this.rolls.find((item) => item.id === Number(line.rollId));
    if (roll) {
      line.rollCategory = roll.category;
    }
  }

  supplyOptionsFor(line: LineaInsumoInventario): InsumoInventario[] {
    return this.supplies.filter((item) => item.activo || item.id === line.supplyId);
  }

  lineTotalKg(line: LineaRolloInventario): number {
    return Number(line.weightKg || 0) * Number(line.quantity || 0);
  }

  submit(): void {
    this.statusMessage = '';
    if (!this.fecha) {
      this.statusMessage = 'Selecciona la fecha del inventario.';
      return;
    }
    if (this.rollLines.length === 0 && this.supplyLines.length === 0) {
      this.statusMessage = 'Agrega al menos un rollo o un insumo.';
      return;
    }
    if (this.rollLines.some((line) =>
      !this.isSelectableRoll(line.rollId) ||
      !this.isPositiveDecimal(line.weightKg) ||
      !Number.isInteger(Number(line.quantity)) ||
      Number(line.quantity) <= 0
    )) {
      this.statusMessage = 'Revisa los rollos: selecciona un tipo, ingresa peso positivo con hasta 3 decimales y una cantidad entera mayor que cero.';
      return;
    }
    if (this.supplyLines.some((line) =>
      !this.isSelectableSupply(line.supplyId) ||
      !this.isPositiveDecimal(line.quantity)
    )) {
      this.statusMessage = 'Revisa los insumos: selecciona un insumo e ingresa una cantidad positiva con hasta 3 decimales.';
      return;
    }

    const payload: InventarioRequest = {
      fecha: this.fecha,
      rollLines: this.rollLines.map(({ rollId, weightKg, quantity }) => ({
        rollId,
        weightKg: Number(weightKg),
        quantity: Number(quantity)
      })),
      supplyLines: this.supplyLines.map(({ supplyId, quantity }) => ({
        supplyId,
        quantity: Number(quantity)
      }))
    };

    this.isSubmitting = true;
    const request = this.inventoryId
      ? this.apiService.updateInventory(this.inventoryId, payload)
      : this.apiService.createInventory(payload);
    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigateByUrl('/inventario');
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.statusMessage = this.errorMessage(error);
      }
    });
  }

  private setCatalogs(rolls: RolloInventario[], supplies: InsumoInventario[]): void {
    this.rolls = rolls;
    this.supplies = supplies;
  }

  private setInventory(inventory: Inventario): void {
    this.fecha = inventory.fecha.slice(0, 10);
    this.rollLines = inventory.rollLines.map((line) => ({
      id: line.id,
      rollId: line.rollId,
      rollCategory: line.rollCategory ?? this.rolls.find((roll) => roll.id === line.rollId)?.category,
      weightKg: Number(line.weightKg),
      quantity: line.quantity
    }));
    this.supplyLines = inventory.supplyLines.map((line) => ({
      supplyId: line.supplyId,
      quantity: Number(line.quantity)
    }));
    this.originalRollIds = new Set(this.rollLines.map((line) => line.rollId));
    this.originalSupplyIds = new Set(this.supplyLines.map((line) => line.supplyId));
  }

  private categoryForLine(line: LineaRolloInventario): CategoriaRolloInventario {
    return line.rollCategory ??
      this.rolls.find((roll) => roll.id === line.rollId)?.category ??
      CategoriaRolloInventario.PAN_MASA;
  }

  private isSelectableRoll(id: number): boolean {
    const roll = this.rolls.find((item) => item.id === Number(id));
    return !!roll && (roll.activo || this.originalRollIds.has(roll.id));
  }

  private isSelectableSupply(id: number): boolean {
    const supply = this.supplies.find((item) => item.id === Number(id));
    return !!supply && (supply.activo || this.originalSupplyIds.has(supply.id));
  }

  private isPositiveDecimal(value: number): boolean {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) &&
      numericValue > 0 &&
      numericValue <= 999999999.999 &&
      Number(numericValue.toFixed(3)) === numericValue;
  }

  private failLoading(error: HttpErrorResponse): void {
    this.statusMessage = this.errorMessage(error);
    this.isLoading = false;
  }

  private errorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;
    if (Array.isArray(message)) {
      return message.join(' ');
    }
    return typeof message === 'string' ? message : 'No se pudo completar la operación del inventario.';
  }

  private today(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
}
