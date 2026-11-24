export enum CategoriaRolloInventario {
  PAN_MASA = 'Rollos Pan Masa',
  HOGAZA = 'Rollos Hogaza',
  GENERICOS = 'Rollos Genericos',
  TRANSPARENTES = 'Rollos Transparentes'
}

export const CATEGORIAS_ROLLO_INVENTARIO = Object.values(CategoriaRolloInventario);

export interface RolloInventario {
  id: number;
  nombre: string;
  anchoCm: number;
  category: CategoriaRolloInventario;
  activo: boolean;
}

export interface InsumoInventario {
  id: number;
  nombre: string;
  unidad: string;
  activo: boolean;
}

export interface LineaRolloInventario {
  id?: number;
  inventoryId?: number;
  rollId: number;
  rollCategory?: CategoriaRolloInventario;
  rollName?: string;
  rollWidthCm?: number;
  weightKg: number;
  quantity: number;
}

export interface LineaInsumoInventario {
  id?: number;
  inventoryId?: number;
  supplyId: number;
  supplyName?: string;
  unit?: string;
  quantity: number;
}

export interface Inventario {
  id: number;
  fecha: string;
  createdByUserId: number;
  createdByUsername: string;
  createdAt: string;
  rollLines: LineaRolloInventario[];
  supplyLines: LineaInsumoInventario[];
}

export interface InventarioRequest {
  fecha: string;
  rollLines: LineaRolloInventario[];
  supplyLines: LineaInsumoInventario[];
}

export interface ResumenRolloInventario {
  rollId: number;
  category: CategoriaRolloInventario;
  nombre: string;
  anchoCm: number;
  details: { weightKg: number; quantity: number; totalKg: number }[];
  totalKg: number;
}

export interface CategoriaReporteInventario {
  category: CategoriaRolloInventario;
  rolls: ResumenRolloInventario[];
  totalKg: number;
}

export interface ReporteInventario extends Inventario {
  rollTotals: ResumenRolloInventario[];
  rollCategories: CategoriaReporteInventario[];
  totalRollKg: number;
}
