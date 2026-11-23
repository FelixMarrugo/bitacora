import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import Swal from 'sweetalert2';
import { ApiService } from '../../services/api.service';
import { CatalogoItem, EntradaBitacora, EntradaProducto, ProveedorCatalogoItem } from '../../models/entrada.model';
import { filterSuppliersByName } from '../../utils/supplier-search';
import { isValidQuantity } from '../../utils/quantity';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './bitacora.page.html'
})
export class BitacoraPage implements OnInit {
  entry: EntradaBitacora = {
    fecha: new Date().toISOString().slice(0, 10),
    proveedor: '',
    proveedorNit: '',
    producto: '',
    productos: [],
    cantidad: 0,
    hora: new Date().toLocaleTimeString('es-ES', { hour12: false }),
    ordenCompra: '',
    yaIngresadoErp: false,
    observaciones: ''
  };

  isSubmitting = false;
  isLoadingCatalogs = true;
  statusMessage = '';
  suppliers: ProveedorCatalogoItem[] = [];
  products: CatalogoItem[] = [];
  supplierSearch = '';
  supplierDropdownOpen = false;
  activeSupplierIndex = -1;

  get filteredSuppliers(): ProveedorCatalogoItem[] {
    return filterSuppliersByName(this.suppliers, this.supplierSearch);
  }

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.entry.hora = new Date().toLocaleTimeString('es-ES', { hour12: false });
    this.loadCatalogs();
  }

  private loadCatalogs(): void {
    this.apiService.getSuppliers(true).subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.finishCatalogLoading();
      },
      error: () => {
        this.statusMessage = 'No se pudieron cargar los proveedores. Intente nuevamente.';
        this.finishCatalogLoading();
      }
    });

    this.apiService.getProducts(true).subscribe({
      next: (products) => {
        this.products = products;
        this.finishCatalogLoading();
      },
      error: () => {
        this.statusMessage = 'No se pudieron cargar los productos. Intente nuevamente.';
        this.finishCatalogLoading();
      }
    });
  }

  private catalogLoads = 0;

  private finishCatalogLoading(): void {
    this.catalogLoads += 1;
    if (this.catalogLoads >= 2) {
      this.isLoadingCatalogs = false;
    }
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
    if (!supplier || !this.isSupplierSelectable(supplier)) {
      return;
    }

    this.entry.proveedor = razonSocial;
    this.entry.proveedorNit = supplier.nit ?? '';
    this.supplierSearch = razonSocial;
    this.closeSupplierDropdown();
  }

  onSupplierSearch(): void {
    if (this.entry.proveedor !== this.supplierSearch) {
      this.entry.proveedor = '';
      this.entry.proveedorNit = '';
    }
    this.supplierDropdownOpen = true;
    this.setFirstSelectableSupplier();
  }

  openSupplierDropdown(): void {
    if (this.entry.proveedor && this.supplierSearch === this.entry.proveedor) {
      this.supplierSearch = '';
    }
    this.supplierDropdownOpen = true;
    this.setFirstSelectableSupplier();
  }

  closeSupplierDropdown(): void {
    this.supplierDropdownOpen = false;
    this.activeSupplierIndex = -1;
    if (this.entry.proveedor) {
      this.supplierSearch = this.entry.proveedor;
    }
  }

  isSupplierSelectable(supplier: ProveedorCatalogoItem): boolean {
    return supplier.activo || supplier.razonSocial === this.entry.proveedor;
  }

  onSupplierKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.supplierDropdownOpen) {
      event.preventDefault();
      this.closeSupplierDropdown();
      return;
    }

    if (event.key === 'Enter' && this.supplierDropdownOpen) {
      event.preventDefault();
      const supplier = this.filteredSuppliers[this.activeSupplierIndex];
      if (supplier && this.isSupplierSelectable(supplier)) {
        this.selectSupplier(supplier.razonSocial);
      }
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();
    if (!this.supplierDropdownOpen) {
      this.openSupplierDropdown();
      return;
    }

    const selectableIndexes = this.filteredSuppliers
      .map((supplier, index) => this.isSupplierSelectable(supplier) ? index : -1)
      .filter((index) => index >= 0);
    if (selectableIndexes.length === 0) {
      this.activeSupplierIndex = -1;
      return;
    }

    const currentIndex = selectableIndexes.indexOf(this.activeSupplierIndex);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = currentIndex < 0
      ? (direction > 0 ? 0 : selectableIndexes.length - 1)
      : (currentIndex + direction + selectableIndexes.length) % selectableIndexes.length;
    this.activeSupplierIndex = selectableIndexes[nextIndex];
  }

  private setFirstSelectableSupplier(): void {
    this.activeSupplierIndex = this.filteredSuppliers.findIndex((supplier) =>
      this.isSupplierSelectable(supplier)
    );
  }

  verifyOrder(): void {
    if (!this.entry.ordenCompra) {
      this.statusMessage = 'Ingrese número de orden de compra para validar.';
      return;
    }

    this.apiService.verifyPurchaseOrder(this.entry.ordenCompra).subscribe({
      next: (response: any) => {
        this.entry.yaIngresadoErp = !!response?.yaIngresadoErp;
        this.statusMessage = response?.message ?? 'Orden verificada.';
      },
      error: () => {
        this.entry.yaIngresadoErp = false;
        this.statusMessage = 'No se encontró la orden de compra o está pendiente.';
      }
    });
  }

  submit(): void {
    const products = this.entry.productos ?? [];
    if (!this.entry.fecha || !this.entry.hora) {
      this.statusMessage = 'Complete la fecha y la hora de la entrada.';
      return;
    }
    if (!this.entry.proveedor.trim() || !this.suppliers.some((item) => item.razonSocial === this.entry.proveedor)) {
      this.statusMessage = 'Seleccione un proveedor del catálogo.';
      return;
    }
    if (
      products.length === 0 ||
      products.some((item) =>
        !this.products.some((product) => product.nombre === item.producto) ||
        !isValidQuantity(item.cantidad)
      ) ||
      new Set(products.map((item) => item.producto.toLocaleLowerCase())).size !== products.length
    ) {
      this.statusMessage = 'Agregue al menos un producto válido con su cantidad.';
      return;
    }

    this.isSubmitting = true;
    const payload: EntradaBitacora = {
      ...this.entry,
      productos: products.map((item: EntradaProducto) => ({
        producto: item.producto,
        cantidad: Number(item.cantidad)
      }))
    };

    this.apiService.createEntrada(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        void Swal.fire({
          icon: 'success',
          title: 'Orden registrada',
          text: 'La entrada de mercancía se guardó correctamente.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => this.router.navigateByUrl('/dashboard'));
      },
      error: () => {
        this.isSubmitting = false;
        this.statusMessage = 'No se pudo registrar la entrada de mercancía.';
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo guardar',
          text: this.statusMessage,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }
}
