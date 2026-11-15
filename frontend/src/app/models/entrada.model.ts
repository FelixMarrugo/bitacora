export interface EntradaBitacora {
  id?: number;
  fecha: string;
  proveedor: string;
  producto?: string;
  cantidad: number;
  hora: string;
  ordenCompra?: string;
  yaIngresadoErp?: boolean;
  observaciones?: string;
}
