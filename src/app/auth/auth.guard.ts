import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoaded()) {
    if (authService.isAuthenticated()) return true;
    authService.login();
    return false;
  }

  return authService.checkSessionStatus().pipe(
    map((user) => {
      if (user) return true;
      authService.login();
      return false;
    })
  );

};
