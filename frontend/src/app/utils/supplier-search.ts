import { ProveedorCatalogoItem } from '../models/entrada.model';

export function filterSuppliersByName(
  suppliers: ProveedorCatalogoItem[],
  searchTerm: string
): ProveedorCatalogoItem[] {
  const search = normalizeText(searchTerm);
  if (!search) {
    return suppliers;
  }

  return suppliers.filter((supplier) => normalizeText(supplier.razonSocial).includes(search));
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
}
