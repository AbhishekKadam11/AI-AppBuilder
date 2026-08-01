import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root' // Ensures a single, application-wide instance (singleton)
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() { }

  get<T>(path: string): Observable<T | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.get<T>(`${this.apiUrl}/${path}`, {
      withCredentials: true,
      responseType: 'json'
    });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${path}`, body);
  }

}
