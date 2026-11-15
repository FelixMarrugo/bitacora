import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage)
  },
  {
    path: 'bitacora',
    loadComponent: () => import('./pages/bitacora/bitacora.page').then((m) => m.BitacoraPage)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./pages/edit-entry/edit-entry.page').then((m) => m.EditEntryPage)
  },
  { path: '**', redirectTo: 'login' }
];
