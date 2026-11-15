import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'bitacora_token';

  constructor(private readonly http: HttpClient) {}

  login(payload: { username: string; password: string }) {
    if (environment.useMockData) {
      if (payload.username === 'admin' && payload.password === '123456') {
        return of({
          access_token: 'mock-development-token',
          user: { id: 1, username: payload.username, role: 'admin' }
        });
      }

      return throwError(() => new Error('Credenciales inválidas'));
    }

    return this.http.post<{ access_token: string; user: unknown }>(`${environment.apiUrl}/auth/login`, payload);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.storageKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
