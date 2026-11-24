import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { forkJoin } from 'rxjs';
import { CatalogoItem, ProveedorCatalogoItem } from '../../models/entrada.model';
import {
  CategoriaRolloInventario,
  CATEGORIAS_ROLLO_INVENTARIO,
  InsumoInventario,
  RolloInventario
} from '../../models/inventario.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './catalogs.page.html'
})
export class CatalogsPage implements OnInit {
  suppliers: ProveedorCatalogoItem[] = [];
  products: CatalogoItem[] = [];
  rolls: RolloInventario[] = [];
  supplies: InsumoInventario[] = [];
  readonly rollCategories = CATEGORIAS_ROLLO_INVENTARIO;
  supplierNit = '';
  supplierRazonSocial = '';
  productName = '';
  rollName = '';
  rollWidthCm = '';
  rollCategory: CategoriaRolloInventario | '' = '';
  supplyName = '';
  supplyUnit = 'unidad';
  editingSupplierId: number | null = null;
  editingProductId: number | null = null;
  editingRollId: number | null = null;
  editingSupplyId: number | null = null;
  supplierEditNit = '';
  supplierEditRazonSocial = '';
  productEditName = '';
  rollEditName = '';
  rollEditWidthCm = '';
  rollEditCategory = CategoriaRolloInventario.PAN_MASA;
  supplyEditName = '';
  supplyEditUnit = '';
  isLoading = true;
  statusMessage = '';

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCatalogs();
  }

  loadCatalogs(): void {
    this.isLoading = true;
    forkJoin({
      suppliers: this.apiService.getSuppliers(),
      products: this.apiService.getProducts(),
      rolls: this.apiService.getInventoryRolls(false),
      supplies: this.apiService.getInventorySupplies(false)
    }).subscribe({
      next: ({ suppliers, products, rolls, supplies }) => {
        this.suppliers = suppliers;
        this.products = products;
        this.rolls = rolls;
        this.supplies = supplies;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.statusMessage = this.errorMessage(error);
        this.isLoading = false;
      }
    });
  }

  addSupplier(): void {
    const nit = this.supplierNit.trim();
    const razonSocial = this.supplierRazonSocial.trim();
    if (!nit || !razonSocial) {
      this.statusMessage = 'El NIT y la razón social son obligatorios.';
      return;
    }

    this.apiService.createSupplier(nit, razonSocial).subscribe({
      next: () => {
        this.supplierNit = '';
        this.supplierRazonSocial = '';
        this.statusMessage = 'Proveedor agregado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  addProduct(): void {
    const nombre = this.productName.trim();
    if (!nombre) {
      return;
    }

    this.apiService.createProduct(nombre).subscribe({
      next: () => {
        this.productName = '';
        this.statusMessage = 'Producto agregado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  beginSupplierEdit(item: ProveedorCatalogoItem): void {
    this.editingSupplierId = item.id;
    this.supplierEditNit = item.nit;
    this.supplierEditRazonSocial = item.razonSocial;
  }

  saveSupplierEdit(item: ProveedorCatalogoItem): void {
    const nit = this.supplierEditNit.trim();
    const razonSocial = this.supplierEditRazonSocial.trim();
    if (!nit || !razonSocial) {
      this.statusMessage = 'El NIT y la razón social son obligatorios.';
      return;
    }

    this.apiService.updateSupplier(item.id, { nit, razonSocial }).subscribe({
      next: () => {
        this.editingSupplierId = null;
        this.statusMessage = 'Proveedor actualizado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  toggleSupplier(item: ProveedorCatalogoItem): void {
    this.apiService.updateSupplier(item.id, { activo: !item.activo }).subscribe({
      next: () => {
        this.statusMessage = item.activo ? 'Proveedor desactivado.' : 'Proveedor activado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  beginProductEdit(item: CatalogoItem): void {
    this.editingProductId = item.id;
    this.productEditName = item.nombre;
  }

  saveProductEdit(item: CatalogoItem): void {
    const nombre = this.productEditName.trim();
    if (!nombre) {
      this.statusMessage = 'El nombre del producto es obligatorio.';
      return;
    }

    this.apiService.updateProduct(item.id, { nombre }).subscribe({
      next: () => {
        this.editingProductId = null;
        this.statusMessage = 'Producto actualizado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  toggleProduct(item: CatalogoItem): void {
    this.apiService.updateProduct(item.id, { activo: !item.activo }).subscribe({
      next: () => {
        this.statusMessage = item.activo ? 'Producto desactivado.' : 'Producto activado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  addRoll(): void {
    const nombre = this.rollName.trim();
    const anchoCm = Number(this.rollWidthCm);
    if (!nombre || !Number.isInteger(anchoCm) || anchoCm < 1 || anchoCm > 999) {
      this.statusMessage = 'Ingresa el nombre y una medida entera entre 1 y 999 cm.';
      return;
    }
    if (!this.rollCategory) {
      this.statusMessage = 'Selecciona una categoría para el rollo.';
      return;
    }

    this.apiService.createInventoryRoll(nombre, anchoCm, this.rollCategory).subscribe({
      next: () => {
        this.rollName = '';
        this.rollWidthCm = '';
        this.rollCategory = '';
        this.statusMessage = 'Rollo agregado al catálogo de inventario.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  beginRollEdit(item: RolloInventario): void {
    this.editingRollId = item.id;
    this.rollEditName = item.nombre;
    this.rollEditWidthCm = String(item.anchoCm);
    this.rollEditCategory = item.category;
  }

  saveRollEdit(item: RolloInventario): void {
    const nombre = this.rollEditName.trim();
    const anchoCm = Number(this.rollEditWidthCm);
    if (!nombre || !Number.isInteger(anchoCm) || anchoCm < 1 || anchoCm > 999) {
      this.statusMessage = 'Ingresa el nombre y una medida entera entre 1 y 999 cm.';
      return;
    }

    this.apiService.updateInventoryRoll(item.id, {
      nombre,
      anchoCm,
      category: this.rollEditCategory
    }).subscribe({
      next: () => {
        this.editingRollId = null;
        this.statusMessage = 'Rollo actualizado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  toggleRoll(item: RolloInventario): void {
    this.apiService.updateInventoryRoll(item.id, { activo: !item.activo }).subscribe({
      next: () => {
        this.statusMessage = item.activo ? 'Rollo desactivado.' : 'Rollo activado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  addSupply(): void {
    const nombre = this.supplyName.trim();
    const unidad = this.supplyUnit.trim();
    if (!nombre || !unidad) {
      this.statusMessage = 'El nombre y la unidad del insumo son obligatorios.';
      return;
    }

    this.apiService.createInventorySupply(nombre, unidad).subscribe({
      next: () => {
        this.supplyName = '';
        this.supplyUnit = 'unidad';
        this.statusMessage = 'Insumo agregado al catálogo de inventario.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  beginSupplyEdit(item: InsumoInventario): void {
    this.editingSupplyId = item.id;
    this.supplyEditName = item.nombre;
    this.supplyEditUnit = item.unidad;
  }

  saveSupplyEdit(item: InsumoInventario): void {
    const nombre = this.supplyEditName.trim();
    const unidad = this.supplyEditUnit.trim();
    if (!nombre || !unidad) {
      this.statusMessage = 'El nombre y la unidad del insumo son obligatorios.';
      return;
    }

    this.apiService.updateInventorySupply(item.id, { nombre, unidad }).subscribe({
      next: () => {
        this.editingSupplyId = null;
        this.statusMessage = 'Insumo actualizado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  toggleSupply(item: InsumoInventario): void {
    this.apiService.updateInventorySupply(item.id, { activo: !item.activo }).subscribe({
      next: () => {
        this.statusMessage = item.activo ? 'Insumo desactivado.' : 'Insumo activado.';
        this.loadCatalogs();
      },
      error: (error: HttpErrorResponse) => this.statusMessage = this.errorMessage(error)
    });
  }

  cancelSupplierEdit(): void {
    this.editingSupplierId = null;
  }

  cancelProductEdit(): void {
    this.editingProductId = null;
  }

  cancelRollEdit(): void {
    this.editingRollId = null;
  }

  cancelSupplyEdit(): void {
    this.editingSupplyId = null;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      if (Array.isArray(message)) {
        return message.join(' ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }
    return error instanceof Error && error.message
      ? error.message
      : 'No se pudo completar la operación del catálogo.';
  }
}
