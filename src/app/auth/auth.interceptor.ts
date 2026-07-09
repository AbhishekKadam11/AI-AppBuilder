import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const backendUrl = environment.apiUrl;
  const platformId = inject(PLATFORM_ID); // Inject the platform context

  if (req.url.startsWith(backendUrl)) {
    req = req.clone({
      withCredentials: true
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // ONLY execute the redirect if code is running in the client browser
        if (isPlatformBrowser(platformId)) {
          window.location.href = `${backendUrl}/auth/login`;
        }
      }
      return throwError(() => error);
    })
  );
};
