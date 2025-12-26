import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NbMenuModule, NbSidebarModule, NbThemeModule, NbToastrModule, NbWindowModule, } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { UserData } from './core/users';
import { UserService } from './services/users.service';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AQUAMARINE_THEME, GOLDEN_DARK_THEME } from '../themes/custom.theme';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'default' },
        [GOLDEN_DARK_THEME, AQUAMARINE_THEME],
      ),
      NbSidebarModule.forRoot(),
      NbWindowModule.forRoot(),
      NbMenuModule.forRoot(),
      NbToastrModule.forRoot(),
      NbEvaIconsModule,
    ),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    { provide: UserData, useClass: UserService },
    provideMonacoEditor({ baseUrl: '/assets/monaco/min/vs' }),
  ]
};
