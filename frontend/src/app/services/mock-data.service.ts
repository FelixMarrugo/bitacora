import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CatalogoItem, EntradaBitacora, ProveedorCatalogoItem } from '../models/entrada.model';

type DashboardSummary = {
  totalEntradas: number;
  pendientes: number;
  enErp: number;
  proveedorMasActivo: string;
};

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly storageKey = 'bitacora.mock.entries';
  private readonly supplierStorageKey = 'bitacora.mock.suppliers';
  private readonly productStorageKey = 'bitacora.mock.products';
  private nextId = 1;
  private nextSupplierId = 1;
  private nextProductId = 1;

  constructor() {
    this.initializeEntries();
    this.initializeCatalogs();
  }

  getDashboard(): Observable<DashboardSummary> {
    const monthEntries = this.getEntries().filter((entry) => this.isInCurrentMonth(entry.fecha));
    const supplierCounts = new Map<string, number>();

    for (const entry of monthEntries) {
      supplierCounts.set(entry.proveedor, (supplierCounts.get(entry.proveedor) ?? 0) + 1);
    }

    const mostActiveSupplier = [...supplierCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sin registros';

    return of({
      totalEntradas: monthEntries.length,
      pendientes: monthEntries.filter((entry) => !entry.yaIngresadoErp).length,
      enErp: monthEntries.filter((entry) => !!entry.yaIngresadoErp).length,
      proveedorMasActivo: mostActiveSupplier
    });
  }

  getEntradas(): Observable<EntradaBitacora[]> {
    return of(this.getEntries());
  }

  getSuppliers(activeOnly = false): Observable<ProveedorCatalogoItem[]> {
    const suppliers = this.readSuppliers() ?? [];
    return of(suppliers.filter((item) => !activeOnly || item.activo));
  }

  getProducts(activeOnly = false): Observable<CatalogoItem[]> {
    const products = this.readCatalog(this.productStorageKey) ?? [];
    return of(products.filter((item) => !activeOnly || item.activo));
  }

  createSupplier(nit: string, razonSocial: string): Observable<ProveedorCatalogoItem> {
    const cleanNit = nit.trim();
    const cleanName = razonSocial.trim();
    const suppliers = this.readSuppliers() ?? [];
    if (!cleanNit || !this.normalizeNit(cleanNit) || !cleanName) {
      return throwError(() => new Error('El NIT y la razón social son obligatorios.'));
    }
    if (suppliers.some((item) =>
      this.normalizeNit(item.nit) === this.normalizeNit(cleanNit) ||
      item.razonSocial.toLocaleLowerCase() === cleanName.toLocaleLowerCase()
    )) {
      return throwError(() => new Error('Ya existe un proveedor con ese NIT o razón social.'));
    }

    const supplier: ProveedorCatalogoItem = {
      id: this.nextSupplierId++,
      nombre: cleanName,
      nit: cleanNit,
      razonSocial: cleanName,
      activo: true
    };
    suppliers.push(supplier);
    this.saveSuppliers(suppliers);
    return of({ ...supplier });
  }

  updateSupplier(
    id: number,
    changes: Partial<Pick<ProveedorCatalogoItem, 'nit' | 'razonSocial' | 'activo'>>
  ): Observable<ProveedorCatalogoItem> {
    const suppliers = this.readSuppliers() ?? [];
    const index = suppliers.findIndex((item) => item.id === id);
    if (index < 0) {
      return throwError(() => new Error('No se encontró el proveedor.'));
    }

    const nit = changes.nit?.trim();
    const razonSocial = changes.razonSocial?.trim();
    if ((changes.nit !== undefined && !nit) || (changes.razonSocial !== undefined && !razonSocial)) {
      return throwError(() => new Error('El NIT y la razón social son obligatorios.'));
    }
    if (suppliers.some((item) =>
      item.id !== id && (
        (!!nit && this.normalizeNit(item.nit) === this.normalizeNit(nit)) ||
        (!!razonSocial && item.razonSocial.toLocaleLowerCase() === razonSocial.toLocaleLowerCase())
      )
    )) {
      return throwError(() => new Error('Ya existe un proveedor con ese NIT o razón social.'));
    }

    suppliers[index] = {
      ...suppliers[index],
      ...(nit && { nit }),
      ...(razonSocial && { nombre: razonSocial, razonSocial }),
      ...(changes.activo !== undefined && { activo: changes.activo })
    };
    this.saveSuppliers(suppliers);
    return of({ ...suppliers[index] });
  }

  createProduct(nombre: string): Observable<CatalogoItem> {
    return this.createCatalogItem(this.productStorageKey, nombre);
  }

  updateProduct(
    id: number,
    changes: Partial<Pick<CatalogoItem, 'nombre' | 'activo'>>
  ): Observable<CatalogoItem> {
    return this.updateCatalogItem(this.productStorageKey, id, changes);
  }

  getEntrada(id: number): Observable<EntradaBitacora> {
    const entry = this.getEntries().find((item) => item.id === id);
    return of(entry ? this.copyEntry(entry) : ({} as EntradaBitacora));
  }

  createEntrada(payload: EntradaBitacora): Observable<EntradaBitacora> {
    const entries = this.getEntries();
    const created = this.normalizeEntry({ ...payload, id: this.nextId++ });
    entries.push(created);
    this.saveEntries(entries);
    return of(this.copyEntry(created));
  }

  updateEntrada(id: number, payload: Partial<EntradaBitacora>): Observable<EntradaBitacora> {
    const entries = this.getEntries();
    const index = entries.findIndex((entry) => entry.id === id);
    if (index < 0) {
      return of({} as EntradaBitacora);
    }

    entries[index] = this.normalizeEntry({ ...entries[index], ...payload, id });
    this.saveEntries(entries);
    return of(this.copyEntry(entries[index]));
  }

  deleteEntrada(id: number): Observable<{ deleted: boolean; id: number }> {
    const entries = this.getEntries();
    const remaining = entries.filter((entry) => entry.id !== id);
    const deleted = remaining.length !== entries.length;
    this.saveEntries(remaining);
    return of({ deleted, id });
  }

  verifyPurchaseOrder(ordenCompra: string): Observable<{ yaIngresadoErp: boolean; message: string }> {
    const matchedEntry = this.getEntries().find((entry) => entry.ordenCompra === ordenCompra);
    const yaIngresadoErp = !!matchedEntry?.yaIngresadoErp;

    return of({
      yaIngresadoErp,
      message: matchedEntry
        ? yaIngresadoErp ? 'La orden ya fue ingresada al ERP.' : 'La orden existe, pero está pendiente de ingreso al ERP.'
        : 'No se encontró la orden de compra.'
    });
  }

  private initializeEntries(): void {
    const storedEntries = this.readStoredEntries();
    if (storedEntries) {
      const entriesWithProducts = storedEntries.map((entry) => ({
        ...entry,
        producto: entry.producto || `Producto de prueba ${entry.id ?? ''}`.trim()
      }));
      this.saveEntries(entriesWithProducts);
      this.nextId = Math.max(0, ...storedEntries.map((entry) => entry.id ?? 0)) + 1;
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = (day: number, monthOffset = 0): string => {
      const value = new Date(year, month + monthOffset, day);
      return this.toLocalDate(value);
    };

    const sampleEntries: EntradaBitacora[] = [
      { id: 1, fecha: date(2), proveedor: 'Distribuidora Andina', producto: 'Arroz premium 25 kg', cantidad: 120, hora: '08:15', ordenCompra: 'OC-2026-001', yaIngresadoErp: true, observaciones: 'Recepción completa' },
      { id: 2, fecha: date(4), proveedor: 'Logística Central', producto: 'Aceite vegetal 5 L', cantidad: 75, hora: '09:40', ordenCompra: 'OC-2026-002', yaIngresadoErp: false, observaciones: 'Pendiente de validación' },
      { id: 3, fecha: date(7), proveedor: 'Distribuidora Andina', producto: 'Azúcar blanca 10 kg', cantidad: 210, hora: '10:20', ordenCompra: 'OC-2026-003', yaIngresadoErp: true, observaciones: '' },
      { id: 4, fecha: date(10), proveedor: 'Empaques del Norte', producto: 'Cajas corrugadas', cantidad: 48, hora: '11:05', ordenCompra: 'OC-2026-004', yaIngresadoErp: false, observaciones: 'Entrega parcial' },
      { id: 5, fecha: date(14), proveedor: 'Logística Central', producto: 'Harina de trigo 20 kg', cantidad: 96, hora: '13:30', ordenCompra: 'OC-2026-005', yaIngresadoErp: true, observaciones: '' },
      { id: 6, fecha: date(18), proveedor: 'Distribuidora Andina', producto: 'Leche UHT 1 L', cantidad: 135, hora: '15:10', ordenCompra: 'OC-2026-006', yaIngresadoErp: false, observaciones: 'Revisar lote' },
      { id: 7, fecha: date(20, -1), proveedor: 'Empaques del Norte', producto: 'Bolsas industriales', cantidad: 60, hora: '08:50', ordenCompra: 'OC-2026-007', yaIngresadoErp: true, observaciones: 'Registro de mes anterior' }
    ];

    this.nextId = sampleEntries.length + 1;
    this.saveEntries(sampleEntries);
  }

  private initializeCatalogs(): void {
    const entries = this.getEntries();
    const suppliers = this.readSuppliers()
      ?? this.uniqueNames(entries.map((entry) => entry.proveedor))
        .map((item) => ({ ...item, nit: '', razonSocial: item.nombre }));
    const products = this.readCatalog(this.productStorageKey, false)
      ?? this.uniqueNames(entries.flatMap((entry) =>
        entry.productos?.map((item) => item.producto) ?? (entry.producto ? [entry.producto] : [])
      ));

    this.saveSuppliers(suppliers);
    this.saveCatalog(this.productStorageKey, products);
    this.nextSupplierId = Math.max(0, ...suppliers.map((item) => item.id)) + 1;
    this.nextProductId = Math.max(0, ...products.map((item) => item.id)) + 1;
  }

  private uniqueNames(names: string[]): CatalogoItem[] {
    return [...new Set(names.map((name) => name.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .map((nombre, index) => ({ id: index + 1, nombre, activo: true }));
  }

  private createCatalogItem(storageKey: string, nombre: string): Observable<CatalogoItem> {
    const cleanName = nombre.trim();
    const items = this.readCatalog(storageKey) ?? [];
    if (!cleanName) {
      return throwError(() => new Error('El nombre es obligatorio.'));
    }
    if (items.some((item) => item.nombre.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) {
      return throwError(() => new Error('Ya existe un producto con ese nombre.'));
    }

    const item = {
      id: this.nextProductId++,
      nombre: cleanName,
      activo: true
    };
    items.push(item);
    this.saveCatalog(storageKey, items);
    return of({ ...item });
  }

  private updateCatalogItem(
    storageKey: string,
    id: number,
    changes: Partial<Pick<CatalogoItem, 'nombre' | 'activo'>>
  ): Observable<CatalogoItem> {
    const items = this.readCatalog(storageKey) ?? [];
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) {
      return throwError(() => new Error('No se encontró el elemento del catálogo.'));
    }

    const nombre = changes.nombre?.trim();
    if (changes.nombre !== undefined && !nombre) {
      return throwError(() => new Error('El nombre es obligatorio.'));
    }
    if (nombre && items.some((item) =>
      item.id !== id && item.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase()
    )) {
      return throwError(() => new Error('Ya existe un elemento con ese nombre.'));
    }

    items[index] = {
      ...items[index],
      ...(nombre && { nombre }),
      ...(changes.activo !== undefined && { activo: changes.activo })
    };
    this.saveCatalog(storageKey, items);
    return of({ ...items[index] });
  }

  private readCatalog(storageKey: string, useDefault = true): CatalogoItem[] | null {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored) as CatalogoItem[];
    }
    return useDefault ? [] : null;
  }

  private readSuppliers(): ProveedorCatalogoItem[] | null {
    const stored = localStorage.getItem(this.supplierStorageKey);
    if (!stored) {
      return null;
    }

    const items = JSON.parse(stored) as Array<Partial<ProveedorCatalogoItem> & {
      id: number;
      nombre: string;
      activo?: boolean;
    }>;
    return items.map((item) => {
      const razonSocial = item.razonSocial?.trim() || item.nombre;
      return {
        id: item.id,
        nombre: razonSocial,
        nit: item.nit?.trim() ?? '',
        razonSocial,
        activo: item.activo ?? true
      };
    });
  }

  private saveSuppliers(suppliers: ProveedorCatalogoItem[]): void {
    localStorage.setItem(this.supplierStorageKey, JSON.stringify(suppliers));
  }

  private normalizeNit(value: string): string {
    return value.toLocaleLowerCase().replace(/[\s.-]/g, '');
  }

  private saveCatalog(storageKey: string, items: CatalogoItem[]): void {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  private normalizeEntry(entry: EntradaBitacora): EntradaBitacora {
    if (!entry.productos?.length) {
      return { ...entry };
    }

    const productos = entry.productos.map((item) => ({ ...item }));
    return {
      ...entry,
      productos,
      producto: productos.map((item) => item.producto).join(', '),
      cantidad: productos.reduce((total, item) => total + Number(item.cantidad), 0)
    };
  }

  private copyEntry(entry: EntradaBitacora): EntradaBitacora {
    return {
      ...entry,
      productos: entry.productos?.map((item) => ({ ...item }))
    };
  }

  private getEntries(): EntradaBitacora[] {
    return this.readStoredEntries() ?? [];
  }

  private readStoredEntries(): EntradaBitacora[] | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) as EntradaBitacora[] : null;
    } catch {
      return null;
    }
  }

  private saveEntries(entries: EntradaBitacora[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }

  private isInCurrentMonth(date: string): boolean {
    const value = new Date(`${date}T00:00:00`);
    const now = new Date();
    return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
