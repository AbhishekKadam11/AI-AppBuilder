import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NbSidebarModule, NbThemeModule, } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    importProvidersFrom(NbThemeModule.forRoot({ name: 'default' }), NbSidebarModule.forRoot(), NbEvaIconsModule),
    provideAnimations(),
    provideClientHydration(withEventReplay())
  ]
};
