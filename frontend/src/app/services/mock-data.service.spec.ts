import { firstValueFrom } from 'rxjs';
import { EntradaBitacora } from '../models/entrada.model';
import { MockDataService } from './mock-data.service';

describe('MockDataService catalogs and product lines', () => {
  const storageKeys = [
    'bitacora.mock.entries',
    'bitacora.mock.suppliers',
    'bitacora.mock.products'
  ];
  let service: MockDataService;

  beforeEach(() => {
    storageKeys.forEach((key) => localStorage.removeItem(key));
    service = new MockDataService();
  });

  afterEach(() => storageKeys.forEach((key) => localStorage.removeItem(key)));

  it('creates catalog options and persists multiple products with independent quantities', async () => {
    const suppliers = await firstValueFrom(service.getSuppliers(true));
    const products = await firstValueFrom(service.getProducts(true));
    expect(suppliers.length).toBeGreaterThan(0);
    expect(products.length).toBeGreaterThan(1);

    await expectAsync(firstValueFrom(service.createSupplier('900.123.456-7', suppliers[0].razonSocial)))
      .toBeRejected();

    const newSupplier = await firstValueFrom(
      service.createSupplier('901.234.567-8', 'Proveedor temporal')
    );
    expect(newSupplier.nit).toBe('901.234.567-8');
    expect(newSupplier.razonSocial).toBe('Proveedor temporal');

    const createdProduct = await firstValueFrom(service.createProduct('Producto temporal'));
    await firstValueFrom(service.updateProduct(createdProduct.id, { activo: false }));
    expect((await firstValueFrom(service.getProducts(true))).some((item) => item.id === createdProduct.id))
      .toBeFalse();

    const entry: EntradaBitacora = {
      fecha: '2026-03-01',
      hora: '09:00',
      proveedor: newSupplier.razonSocial,
      proveedorNit: newSupplier.nit,
      productos: [
        { producto: products[0].nombre, cantidad: 12 },
        { producto: products[1].nombre, cantidad: 3 }
      ],
      cantidad: 0
    };
    const createdEntry = await firstValueFrom(service.createEntrada(entry));

    expect(createdEntry.proveedorNit).toBe(newSupplier.nit);
    expect(createdEntry.productos).toEqual(entry.productos);
    expect(createdEntry.cantidad).toBe(15);

    const restored = new MockDataService();
    const persistedEntry = await firstValueFrom(restored.getEntrada(createdEntry.id!));
    expect(persistedEntry.productos).toEqual(entry.productos);
    expect(persistedEntry.cantidad).toBe(15);
  });

  it('migrates existing name-only suppliers to legal-name records', async () => {
    localStorage.setItem('bitacora.mock.suppliers', JSON.stringify([
      { id: 20, nombre: 'Proveedor anterior', activo: true }
    ]));
    const migratedService = new MockDataService();
    const suppliers = await firstValueFrom(migratedService.getSuppliers());

    expect(suppliers).toContain(jasmine.objectContaining({
      id: 20,
      nit: '',
      razonSocial: 'Proveedor anterior'
    }));
  });
});
