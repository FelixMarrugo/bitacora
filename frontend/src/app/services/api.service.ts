import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CatalogoItem, EntradaBitacora, ProveedorCatalogoItem } from '../models/entrada.model';
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
}
