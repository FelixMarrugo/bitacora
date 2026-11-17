import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { AppUser, UserUpdatePayload, UserWritePayload } from '../models/user.model';

interface StoredUser extends AppUser {
  passwordHash: string;
}

@Injectable({ providedIn: 'root' })
export class MockUserService {
  private readonly storageKey = 'bitacora.mock.users';
  private initialization?: Promise<void>;

  getUsers(): Observable<AppUser[]> {
    return from(this.ensureInitialized().then(() => this.readUsers().map((user) => this.toPublicUser(user))));
  }

  getUser(id: number): Observable<AppUser> {
    return from(this.ensureInitialized().then(() => {
      const user = this.readUsers().find((item) => item.id === id);
      if (!user) {
        throw new Error('No se encontró el usuario.');
      }
      return this.toPublicUser(user);
    }));
  }

  authenticate(username: string, password: string): Observable<AppUser> {
    return from(this.ensureInitialized().then(async () => {
      const user = this.readUsers().find((item) => item.username.toLowerCase() === username.trim().toLowerCase());
      if (!user || !user.active || !await this.verifyPassword(password, user.passwordHash)) {
        throw new Error('Credenciales inválidas');
      }
      return this.toPublicUser(user);
    }));
  }

  createUser(payload: UserWritePayload): Observable<AppUser> {
    return from(this.ensureInitialized().then(async () => {
      const users = this.readUsers();
      this.ensureUniqueUsername(users, payload.username);
      const { password, ...userDetails } = payload;
      const user: StoredUser = {
        ...userDetails,
        id: Math.max(0, ...users.map((item) => item.id)) + 1,
        username: userDetails.username.trim(),
        passwordHash: await this.hashPassword(password),
        role: 'user'
      };
      users.push(user);
      this.saveUsers(users);
      return this.toPublicUser(user);
    }));
  }

  updateUser(id: number, payload: UserUpdatePayload): Observable<AppUser> {
    return from(this.ensureInitialized().then(async () => {
      const users = this.readUsers();
      const index = users.findIndex((item) => item.id === id);
      if (index < 0) {
        throw new Error('No se encontró el usuario.');
      }
      if (payload.username) {
        this.ensureUniqueUsername(users.filter((item) => item.id !== id), payload.username);
      }

      const { password, ...userChanges } = payload;
      const updated: StoredUser = {
        ...users[index],
        ...userChanges,
        ...(password ? { passwordHash: await this.hashPassword(password) } : {}),
        username: payload.username?.trim() ?? users[index].username,
        id
      };
      users[index] = updated;
      this.saveUsers(users);
      return this.toPublicUser(updated);
    }));
  }

  deleteUser(id: number): Observable<{ deleted: boolean; id: number }> {
    return from(this.ensureInitialized().then(() => {
      const users = this.readUsers();
      const remaining = users.filter((user) => user.id !== id);
      if (remaining.length === users.length) {
        throw new Error('No se encontró el usuario.');
      }
      this.saveUsers(remaining);
      return { deleted: true, id };
    }));
  }

  private ensureInitialized(): Promise<void> {
    this.initialization ??= this.initialize();
    return this.initialization;
  }

  private async initialize(): Promise<void> {
    if (localStorage.getItem(this.storageKey) !== null) {
      return;
    }

    const admin: StoredUser = {
      id: 1,
      firstName: 'Administrador',
      lastName: 'Sistema',
      username: 'admin',
      active: true,
      role: 'admin',
      passwordHash: await this.hashPassword('123456')
    };
    this.saveUsers([admin]);
  }

  private readUsers(): StoredUser[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) as StoredUser[] : [];
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  private ensureUniqueUsername(users: StoredUser[], username: string): void {
    if (users.some((user) => user.username.toLowerCase() === username.trim().toLowerCase())) {
      throw new Error('Ese nombre de usuario ya está registrado.');
    }
  }

  private toPublicUser({ passwordHash: _passwordHash, ...user }: StoredUser): AppUser {
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
      key,
      256
    );
    return `pbkdf2$120000$${this.toBase64(salt)}$${this.toBase64(new Uint8Array(bits))}`;
  }

  private async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    const [algorithm, iterations, encodedSalt, encodedHash] = passwordHash.split('$');
    if (algorithm !== 'pbkdf2' || !iterations || !encodedSalt || !encodedHash) {
      return false;
    }
    const salt = this.fromBase64(encodedSalt);
    const expected = this.fromBase64(encodedHash);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: Number(iterations), hash: 'SHA-256' },
      key,
      expected.length * 8
    ));
    return bits.every((value, index) => value === expected[index]);
  }

  private toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
  }

  private fromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }
}
