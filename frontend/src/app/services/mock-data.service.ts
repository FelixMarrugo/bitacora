import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EntradaBitacora } from '../models/entrada.model';

type DashboardSummary = {
  totalEntradas: number;
  pendientes: number;
  enErp: number;
  proveedorMasActivo: string;
};

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly storageKey = 'bitacora.mock.entries';
  private nextId = 1;

  constructor() {
    this.initializeEntries();
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

  getEntrada(id: number): Observable<EntradaBitacora> {
    const entry = this.getEntries().find((item) => item.id === id);
    return of(entry ? { ...entry } : ({} as EntradaBitacora));
  }

  createEntrada(payload: EntradaBitacora): Observable<EntradaBitacora> {
    const entries = this.getEntries();
    const created: EntradaBitacora = { ...payload, id: this.nextId++ };
    entries.push(created);
    this.saveEntries(entries);
    return of({ ...created });
  }

  updateEntrada(id: number, payload: Partial<EntradaBitacora>): Observable<EntradaBitacora> {
    const entries = this.getEntries();
    const index = entries.findIndex((entry) => entry.id === id);
    if (index < 0) {
      return of({} as EntradaBitacora);
    }

    entries[index] = { ...entries[index], ...payload, id };
    this.saveEntries(entries);
    return of({ ...entries[index] });
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
