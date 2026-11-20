import { ProveedorCatalogoItem } from '../models/entrada.model';
import { filterSuppliersByName } from './supplier-search';

describe('filterSuppliersByName', () => {
  const suppliers: ProveedorCatalogoItem[] = [
    { id: 1, nombre: 'Distribuidora Andina', razonSocial: 'Distribuidora Andina', nit: '900.123.456-7', activo: true },
    { id: 2, nombre: 'Comercial del Norte', razonSocial: 'Comercial del Norte', nit: '800987654-3', activo: true }
  ];

  it('filters by legal name only', () => {
    expect(filterSuppliersByName(suppliers, 'comercial del')).toEqual([suppliers[1]]);
    expect(filterSuppliersByName(suppliers, '9001234567')).toEqual([]);
    expect(filterSuppliersByName(suppliers, '---')).toEqual([]);
  });
});
