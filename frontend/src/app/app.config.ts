import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideIonicAngular({ animated: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ]
};
