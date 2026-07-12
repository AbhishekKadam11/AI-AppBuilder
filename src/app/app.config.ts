import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, PLATFORM_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { NbMenuModule, NbSidebarModule, NbThemeModule, NbToastrModule, NbWindowModule, } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { UserData } from './core/users';
import { UserService } from './services/users.service';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AQUAMARINE_THEME, GOLDEN_DARK_THEME } from '../themes/custom.theme';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AuthService } from './auth/auth.service';
import { lastValueFrom } from 'rxjs';
import { authInterceptor } from './auth/auth.interceptor';

function initializeAuth(authService: AuthService, platformId: Object) {
  return () => {
    if (!isPlatformBrowser(platformId)) {
      return Promise.resolve();
    }

    return lastValueFrom(authService.checkSessionStatus()).catch(() => null);
  };
}

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
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    { provide: UserData, useClass: UserService },
    provideMonacoEditor({ baseUrl: '/assets/monaco/min/vs' }),
     provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService, PLATFORM_ID],
      multi: true
    }
  ]
};
