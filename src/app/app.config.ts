import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NbMenuModule, NbSidebarModule, NbThemeModule, NbWindowModule, } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { UserData } from './core/users';
import { UserService } from './services/users.service';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'default' }),
      NbSidebarModule.forRoot(),
      NbWindowModule.forRoot(),
      NbMenuModule.forRoot(),
      NbEvaIconsModule,
    ),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    { provide: UserData, useClass: UserService },
     provideMonacoEditor({ baseUrl: '/assets/monaco/min/vs' }),
  ]
};
