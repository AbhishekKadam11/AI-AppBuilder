import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // Inject the platform context
  private backendUrl = environment.apiUrl;

  public currentUser = signal<UserProfile | null>(null);
  public isAuthenticated = signal<boolean>(false);
  public isLoaded = signal<boolean>(false);

  checkSessionStatus(): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(`${this.backendUrl}/auth/user`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(!!user);
        this.isLoaded.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.isLoaded.set(true);
        return of(null);
      })
    );
  }

  login(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `${this.backendUrl}/auth/login`;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `${this.backendUrl}/auth/logout`;
    }
  }
}
