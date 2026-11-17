import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AppUser, UserUpdatePayload, UserWritePayload } from '../models/user.model';
import { MockUserService } from './mock-user.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly mockUserService: MockUserService
  ) {}

  getUsers() {
    if (environment.useMockData) {
      return this.mockUserService.getUsers();
    }
    return this.http.get<AppUser[]>(`${environment.apiUrl}/users`);
  }

  getUser(id: number) {
    if (environment.useMockData) {
      return this.mockUserService.getUser(id);
    }
    return this.http.get<AppUser>(`${environment.apiUrl}/users/${id}`);
  }

  createUser(payload: UserWritePayload) {
    if (environment.useMockData) {
      return this.mockUserService.createUser(payload);
    }
    return this.http.post<AppUser>(`${environment.apiUrl}/users`, payload);
  }

  updateUser(id: number, payload: UserUpdatePayload) {
    if (environment.useMockData) {
      return this.mockUserService.updateUser(id, payload);
    }
    return this.http.patch<AppUser>(`${environment.apiUrl}/users/${id}`, payload);
  }

  deleteUser(id: number) {
    if (environment.useMockData) {
      return this.mockUserService.deleteUser(id);
    }
    return this.http.delete<{ deleted: boolean; id: number }>(`${environment.apiUrl}/users/${id}`);
  }
}
