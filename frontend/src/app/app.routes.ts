import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage)
  },
  {
    path: 'bitacora',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/bitacora/bitacora.page').then((m) => m.BitacoraPage)
  },
  {
    path: 'editar/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/edit-entry/edit-entry.page').then((m) => m.EditEntryPage)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage)
  },
  {
    path: 'usuarios/nuevo',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-form/user-form.page').then((m) => m.UserFormPage)
  },
  {
    path: 'usuarios/editar/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-form/user-form.page').then((m) => m.UserFormPage)
  },
  {
    path: 'informes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/reports/reports.page').then((m) => m.ReportsPage)
  },
  {
    path: 'catalogos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/catalogs/catalogs.page').then((m) => m.CatalogsPage)
  },
  {
    path: 'inventario/nuevo',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inventory-form/inventory-form.page').then((m) => m.InventoryFormPage)
  },
  {
    path: 'inventario/editar/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inventory-form/inventory-form.page').then((m) => m.InventoryFormPage)
  },
  {
    path: 'inventario/:id/reporte',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inventory-report/inventory-report.page').then((m) => m.InventoryReportPage)
  },
  {
    path: 'inventario',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inventory/inventory.page').then((m) => m.InventoryPage)
  },
  { path: '**', redirectTo: 'login' }
];
