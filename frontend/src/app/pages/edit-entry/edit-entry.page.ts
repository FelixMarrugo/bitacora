import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import Swal from 'sweetalert2';
import {
  CatalogoItem,
  EntradaBitacora,
  EntradaProducto,
  ProveedorCatalogoItem
} from '../../models/entrada.model';
import { ApiService } from '../../services/api.service';
import { filterSuppliers } from '../../utils/supplier-search';

@Component({
  selector: 'app-edit-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  templateUrl: './edit-entry.page.html'
})
export class EditEntryPage implements OnInit {
  entry: EntradaBitacora = {
    fecha: '',
    proveedor: '',
    proveedorNit: '',
    producto: '',
    productos: [],
    cantidad: 0,
    hora: '',
    ordenCompra: '',
    yaIngresadoErp: false,
    observaciones: ''
  };

  isLoading = true;
  isSaving = false;
  notFound = false;
  statusMessage = '';
  suppliers: ProveedorCatalogoItem[] = [];
  products: CatalogoItem[] = [];
  supplierSearch = '';

  get filteredSuppliers(): ProveedorCatalogoItem[] {
    return filterSuppliers(this.suppliers, this.supplierSearch);
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.isLoading = false;
      this.notFound = true;
      return;
    }

    this.apiService.getEntrada(id).subscribe({
      next: (entry) => {
        this.isLoading = false;
        if (!entry?.id) {
          this.notFound = true;
          return;
        }

        this.entry = {
          ...entry,
          productos: this.getProductLines(entry),
          producto: entry.producto ?? '',
          proveedorNit: entry.proveedorNit ?? '',
          cantidad: Number(entry.cantidad ?? 0),
          yaIngresadoErp: !!entry.yaIngresadoErp
        };
        this.ensureCurrentCatalogValues();
      },
      error: () => {
        this.isLoading = false;
        this.notFound = true;
      }
    });
  }

  private loadCatalogs(): void {
    this.apiService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.ensureCurrentCatalogValues();
      },
      error: () => this.statusMessage = 'No se pudieron cargar las opciones de proveedores.'
    });
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.ensureCurrentCatalogValues();
      },
      error: () => this.statusMessage = 'No se pudieron cargar las opciones de productos.'
    });
  }

  private getProductLines(entry: EntradaBitacora): EntradaProducto[] {
    if (entry.productos?.length) {
      return entry.productos.map((item) => ({ ...item, cantidad: Number(item.cantidad) }));
    }

    return entry.producto
      ? [{ producto: entry.producto, cantidad: Number(entry.cantidad ?? 0) }]
      : [];
  }

  private ensureCurrentCatalogValues(): void {
    const currentSupplier = this.suppliers.find((item) => item.razonSocial === this.entry.proveedor);
    if (currentSupplier && !this.entry.proveedorNit) {
      this.entry.proveedorNit = currentSupplier.nit;
    }
    if (this.entry.proveedor && !currentSupplier) {
      this.suppliers = [...this.suppliers, {
        id: 0,
        nombre: this.entry.proveedor,
        nit: this.entry.proveedorNit ?? '',
        razonSocial: this.entry.proveedor,
        activo: false
      }];
    }

    const additionalProducts = (this.entry.productos ?? [])
      .filter((line) => !this.products.some((item) => item.nombre === line.producto))
      .map((line) => ({ id: 0, nombre: line.producto, activo: false }));
    this.products = [...this.products, ...additionalProducts];
  }

  addProductLine(): void {
    this.entry.productos?.push({ producto: '', cantidad: 1 });
  }

  removeProductLine(index: number): void {
    this.entry.productos?.splice(index, 1);
  }

  isProductSelected(productName: string, currentIndex: number): boolean {
    return !!this.entry.productos?.some(
      (item, index) => index !== currentIndex && item.producto === productName
    );
  }

  selectSupplier(razonSocial: string): void {
    const supplier = this.suppliers.find((item) => item.razonSocial === razonSocial);
    this.entry.proveedor = razonSocial;
    this.entry.proveedorNit = supplier?.nit ?? '';
    this.supplierSearch = '';
  }

  onSupplierSearch(): void {
    this.entry.proveedor = '';
    this.entry.proveedorNit = '';
  }

  verifyOrder(): void {
    const orderNumber = this.entry.ordenCompra?.trim();
    if (!orderNumber) {
      this.statusMessage = 'Ingrese un número de orden de compra para validar.';
      return;
    }

    this.apiService.verifyPurchaseOrder(orderNumber).subscribe({
      next: (response: any) => {
        this.entry.yaIngresadoErp = !!response?.yaIngresadoErp;
        this.statusMessage = response?.message ?? 'Orden verificada.';
      },
      error: () => {
        this.statusMessage = 'No se pudo verificar la orden de compra.';
      }
    });
  }

  save(): void {
    if (!this.entry.id) {
      this.notFound = true;
      return;
    }

    const products = this.entry.productos ?? [];
    if (
      !this.entry.fecha ||
      !this.entry.proveedor.trim() ||
      !this.entry.hora ||
      products.length === 0 ||
      products.some((item) =>
        !item.producto.trim() ||
        !Number.isFinite(Number(item.cantidad)) ||
        !Number.isInteger(Number(item.cantidad)) ||
        Number(item.cantidad) <= 0
      ) ||
      new Set(products.map((item) => item.producto.toLocaleLowerCase())).size !== products.length
    ) {
      this.statusMessage = 'Complete fecha, proveedor, hora y al menos un producto con cantidad válida.';
      return;
    }

    this.isSaving = true;
    this.statusMessage = '';
    this.apiService.updateEntrada(this.entry.id, {
      fecha: this.entry.fecha,
      proveedor: this.entry.proveedor,
      proveedorNit: this.entry.proveedorNit,
      hora: this.entry.hora,
      ordenCompra: this.entry.ordenCompra,
      yaIngresadoErp: this.entry.yaIngresadoErp,
      observaciones: this.entry.observaciones,
      productos: products.map((item) => ({
        producto: item.producto,
        cantidad: Number(item.cantidad)
      }))
    }).subscribe({
      next: () => {
        this.isSaving = false;
        void Swal.fire({
          icon: 'success',
          title: 'Cambios actualizados',
          text: 'La entrada se actualizó correctamente.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => this.router.navigateByUrl('/dashboard'));
      },
      error: () => {
        this.isSaving = false;
        this.statusMessage = 'No se pudieron guardar los cambios.';
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar',
          text: this.statusMessage,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
