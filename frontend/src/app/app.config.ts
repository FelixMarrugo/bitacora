import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { Animation, createAnimation, TransitionOptions } from '@ionic/core';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

function softPageTransition(_baseEl: HTMLElement, options?: TransitionOptions): Animation {
  const enteringElement = options?.enteringEl;
  if (!enteringElement) {
    return createAnimation();
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeOutDuration = reducedMotion ? 0 : 90;
  const fadeInDuration = reducedMotion ? 0 : 150;
  const animations: Animation[] = [];

  if (options?.leavingEl) {
    animations.push(
      createAnimation()
        .addElement(options.leavingEl)
        .duration(fadeOutDuration)
        .easing('ease-in')
        .fromTo('opacity', '1', '0')
    );
  }

  animations.push(
    createAnimation()
      .addElement(enteringElement)
      .duration(fadeInDuration)
      .delay(fadeOutDuration)
      .easing('ease-out')
      .fromTo('opacity', '0', '1')
  );

  return createAnimation()
    .addAnimation(animations)
    .duration(fadeOutDuration + fadeInDuration);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideIonicAngular({ animated: true, navAnimation: softPageTransition }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ]
};
