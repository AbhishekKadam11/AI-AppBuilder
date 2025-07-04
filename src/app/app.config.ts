import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NbThemeModule } from '@nebular/theme';
import { provideSocketIo, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:8001', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    importProvidersFrom(NbThemeModule.forRoot({ name: 'default' })),
    provideAnimations(),
    provideSocketIo(config),
    provideClientHydration(withEventReplay())
  ]
};
