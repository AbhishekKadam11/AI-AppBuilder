import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { error } from 'console';

@Injectable({
  providedIn: 'root' // Ensures a single, application-wide instance (singleton)
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  constructor() { }

  get<T>(path: string): Observable<T> {
    console.log("api url", this.apiUrl);
    return this.http.get<T>(`${this.apiUrl}/${path}`, {
      withCredentials: true,
      responseType: 'json'
    }).pipe(
      tap((response) => {
        console.log("testing", response);
      }, (error) => {
        console.log("testing ", error);
      })
    );
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${path}`, body);
  }

}
