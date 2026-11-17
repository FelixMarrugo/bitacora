import { ProveedorCatalogoItem } from '../models/entrada.model';
import { filterSuppliers, filterSuppliersByName } from './supplier-search';

describe('filterSuppliers', () => {
  const suppliers: ProveedorCatalogoItem[] = [
    { id: 1, nombre: 'Distribuidora Andina', razonSocial: 'Distribuidora Andina', nit: '900.123.456-7', activo: true },
    { id: 2, nombre: 'Comercial del Norte', razonSocial: 'Comercial del Norte', nit: '800987654-3', activo: true }
  ];

  it('finds suppliers by NIT with or without punctuation and by legal name', () => {
    expect(filterSuppliers(suppliers, '9001234567')).toEqual([suppliers[0]]);
    expect(filterSuppliers(suppliers, 'comercial del')).toEqual([suppliers[1]]);
    expect(filterSuppliers(suppliers, '---')).toEqual([]);
  });

  it('filters by legal name only when searching from a new entry', () => {
    expect(filterSuppliersByName(suppliers, 'comercial del')).toEqual([suppliers[1]]);
    expect(filterSuppliersByName(suppliers, '9001234567')).toEqual([]);
  });
});
