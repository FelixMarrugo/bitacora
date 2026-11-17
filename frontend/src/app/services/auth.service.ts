import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppUser } from '../models/user.model';
import { MockUserService } from './mock-user.service';

interface AuthResponse {
  access_token: string;
  user: AppUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'bitacora_token';
  private readonly userStorageKey = 'bitacora_user';

  constructor(
    private readonly http: HttpClient,
    private readonly mockUserService: MockUserService
  ) {}

  login(payload: { username: string; password: string }) {
    if (environment.useMockData) {
      return this.mockUserService.authenticate(payload.username, payload.password).pipe(
        map((user) => ({ access_token: 'mock-development-token', user }))
      );
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload);
  }

  saveSession(token: string, user: AppUser): void {
    localStorage.setItem(this.storageKey, token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  getCurrentUser(): AppUser | null {
    const storedUser = localStorage.getItem(this.userStorageKey);
    return storedUser ? JSON.parse(storedUser) as AppUser : null;
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
