import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CatalogoItem, EntradaBitacora, ProveedorCatalogoItem } from '../models/entrada.model';
import {
  InsumoInventario,
  CategoriaRolloInventario,
  Inventario,
  InventarioRequest,
  ReporteInventario,
  RolloInventario
} from '../models/inventario.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly mockDataService: MockDataService
  ) {}

  getDashboard() {
    if (environment.useMockData) {
      return this.mockDataService.getDashboard();
    }
    return this.http.get(`${environment.apiUrl}/dashboard`);
  }

  getEntradas() {
    if (environment.useMockData) {
      return this.mockDataService.getEntradas();
    }
    return this.http.get<EntradaBitacora[]>(`${environment.apiUrl}/entries`);
  }

  getEntrada(id: number) {
    if (environment.useMockData) {
      return this.mockDataService.getEntrada(id);
    }
    return this.http.get<EntradaBitacora>(`${environment.apiUrl}/entries/${id}`);
  }

  createEntrada(payload: EntradaBitacora) {
    if (environment.useMockData) {
      return this.mockDataService.createEntrada(payload);
    }
    return this.http.post<EntradaBitacora>(`${environment.apiUrl}/entries`, payload);
  }

  updateEntrada(id: number, payload: Partial<EntradaBitacora>) {
    if (environment.useMockData) {
      return this.mockDataService.updateEntrada(id, payload);
    }
    return this.http.patch<EntradaBitacora>(`${environment.apiUrl}/entries/${id}`, payload);
  }

  deleteEntrada(id: number) {
    if (environment.useMockData) {
      return this.mockDataService.deleteEntrada(id);
    }
    return this.http.delete<{ deleted: boolean; id: number }>(`${environment.apiUrl}/entries/${id}`);
  }

  verifyPurchaseOrder(ordenCompra: string) {
    if (environment.useMockData) {
      return this.mockDataService.verifyPurchaseOrder(ordenCompra);
    }
    return this.http.get(`${environment.apiUrl}/entries/verify-po/${ordenCompra}`);
  }

  getSuppliers(activeOnly = false) {
    if (environment.useMockData) {
      return this.mockDataService.getSuppliers(activeOnly);
    }
    return this.http.get<ProveedorCatalogoItem[]>(
      `${environment.apiUrl}/catalogs/suppliers${activeOnly ? '?active=true' : ''}`
    );
  }

  getProducts(activeOnly = false) {
    if (environment.useMockData) {
      return this.mockDataService.getProducts(activeOnly);
    }
    return this.http.get<CatalogoItem[]>(
      `${environment.apiUrl}/catalogs/products${activeOnly ? '?active=true' : ''}`
    );
  }

  createSupplier(nit: string, razonSocial: string) {
    if (environment.useMockData) {
      return this.mockDataService.createSupplier(nit, razonSocial);
    }
    return this.http.post<ProveedorCatalogoItem>(`${environment.apiUrl}/catalogs/suppliers`, { nit, razonSocial });
  }

  updateSupplier(
    id: number,
    changes: Partial<Pick<ProveedorCatalogoItem, 'nit' | 'razonSocial' | 'activo'>>
  ) {
    if (environment.useMockData) {
      return this.mockDataService.updateSupplier(id, changes);
    }
    return this.http.patch<ProveedorCatalogoItem>(`${environment.apiUrl}/catalogs/suppliers/${id}`, changes);
  }

  createProduct(nombre: string) {
    if (environment.useMockData) {
      return this.mockDataService.createProduct(nombre);
    }
    return this.http.post<CatalogoItem>(`${environment.apiUrl}/catalogs/products`, { nombre });
  }

  updateProduct(id: number, changes: Partial<Pick<CatalogoItem, 'nombre' | 'activo'>>) {
    if (environment.useMockData) {
      return this.mockDataService.updateProduct(id, changes);
    }
    return this.http.patch<CatalogoItem>(`${environment.apiUrl}/catalogs/products/${id}`, changes);
  }

  getInventoryRolls(activeOnly = true) {
    const params = activeOnly ? undefined : new HttpParams().set('activeOnly', 'false');
    return this.http.get<RolloInventario[]>(`${environment.apiUrl}/inventory/catalog/rolls`, { params });
  }

  createInventoryRoll(nombre: string, anchoCm: number, category: CategoriaRolloInventario) {
    return this.http.post<RolloInventario>(
      `${environment.apiUrl}/inventory/catalog/rolls`,
      { nombre, anchoCm, category }
    );
  }

  updateInventoryRoll(
    id: number,
    changes: Partial<Pick<RolloInventario, 'nombre' | 'anchoCm' | 'category' | 'activo'>>
  ) {
    return this.http.patch<RolloInventario>(`${environment.apiUrl}/inventory/catalog/rolls/${id}`, changes);
  }

  getInventorySupplies(activeOnly = true) {
    const params = activeOnly ? undefined : new HttpParams().set('activeOnly', 'false');
    return this.http.get<InsumoInventario[]>(`${environment.apiUrl}/inventory/catalog/supplies`, { params });
  }

  createInventorySupply(nombre: string, unidad: string) {
    return this.http.post<InsumoInventario>(
      `${environment.apiUrl}/inventory/catalog/supplies`,
      { nombre, unidad }
    );
  }

  updateInventorySupply(
    id: number,
    changes: Partial<Pick<InsumoInventario, 'nombre' | 'unidad' | 'activo'>>
  ) {
    return this.http.patch<InsumoInventario>(
      `${environment.apiUrl}/inventory/catalog/supplies/${id}`,
      changes
    );
  }

  getInventories(from?: string, to?: string) {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    return this.http.get<Inventario[]>(`${environment.apiUrl}/inventory`, { params });
  }

  getInventory(id: number) {
    return this.http.get<Inventario>(`${environment.apiUrl}/inventory/${id}`);
  }

  createInventory(payload: InventarioRequest) {
    return this.http.post<Inventario>(`${environment.apiUrl}/inventory`, payload);
  }

  updateInventory(id: number, payload: Partial<InventarioRequest>) {
    return this.http.patch<Inventario>(`${environment.apiUrl}/inventory/${id}`, payload);
  }

  getInventoryReport(id: number) {
    return this.http.get<ReporteInventario>(`${environment.apiUrl}/inventory/${id}/report`);
  }
}
