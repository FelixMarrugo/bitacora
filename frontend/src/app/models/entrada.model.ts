export interface EntradaProducto {
  producto: string;
  cantidad: number;
}

export interface EntradaBitacora {
  id?: number;
  fecha: string;
  proveedor: string;
  proveedorNit?: string | null;
  producto?: string | null;
  productos?: EntradaProducto[] | null;
  cantidad?: number | null;
  hora: string;
  ordenCompra?: string;
  yaIngresadoErp?: boolean;
  observaciones?: string;
}

export interface CatalogoItem {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface ProveedorCatalogoItem extends CatalogoItem {
  nit: string;
  razonSocial: string;
}
