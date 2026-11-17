import { ProveedorCatalogoItem } from '../models/entrada.model';

export function filterSuppliers(
  suppliers: ProveedorCatalogoItem[],
  searchTerm: string
): ProveedorCatalogoItem[] {
  const search = normalizeText(searchTerm);
  if (!search) {
    return suppliers;
  }

  const nitSearch = normalizeNit(searchTerm);
  return suppliers.filter((supplier) =>
    normalizeText(supplier.razonSocial).includes(search) ||
    normalizeText(supplier.nit).includes(search) ||
    (nitSearch.length > 0 && normalizeNit(supplier.nit).includes(nitSearch))
  );
}

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

function normalizeNit(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
}
