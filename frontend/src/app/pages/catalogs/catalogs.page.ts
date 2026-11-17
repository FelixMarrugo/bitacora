import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { forkJoin } from 'rxjs';
import { CatalogoItem, ProveedorCatalogoItem } from '../../models/entrada.model';
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
  supplierNit = '';
  supplierRazonSocial = '';
  productName = '';
  editingSupplierId: number | null = null;
  editingProductId: number | null = null;
  supplierEditNit = '';
  supplierEditRazonSocial = '';
  productEditName = '';
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
      products: this.apiService.getProducts()
    }).subscribe({
      next: ({ suppliers, products }) => {
        this.suppliers = suppliers;
        this.products = products;
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

  cancelSupplierEdit(): void {
    this.editingSupplierId = null;
  }

  cancelProductEdit(): void {
    this.editingProductId = null;
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
