import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import Swal from 'sweetalert2';
import { UserUpdatePayload, UserWritePayload } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './user-form.page.html'
})
export class UserFormPage implements OnInit {
  userId: number | null = null;
  firstName = '';
  lastName = '';
  username = '';
  password = '';
  active = true;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) {}

  get isEditing(): boolean {
    return this.userId !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === null) {
      return;
    }

    this.userId = Number(id);
    if (!Number.isInteger(this.userId) || this.userId <= 0) {
      void this.router.navigateByUrl('/usuarios');
      return;
    }

    this.isLoading = true;
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.username = user.username;
        this.active = user.active;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        void Swal.fire({
          icon: 'error',
          title: 'No se encontró el usuario',
          confirmButtonText: 'Volver'
        }).then(() => this.cancel());
      }
    });
  }

  save(): void {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.username.trim() || (!this.isEditing && !this.password)) {
      this.errorMessage = 'Completa todos los campos obligatorios.';
      return;
    }
    if (this.password && this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    if (this.userId === null) {
      const payload: UserWritePayload = {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        username: this.username.trim(),
        password: this.password,
        active: this.active
      };
      this.userService.createUser(payload).subscribe({
        next: () => this.finishSave('Usuario registrado'),
        error: (error: { error?: { message?: string | string[] }; message?: string }) => this.failSave(error)
      });
      return;
    }

    const payload: UserUpdatePayload = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      username: this.username.trim(),
      active: this.active,
      ...(this.password ? { password: this.password } : {})
    };
    this.userService.updateUser(this.userId, payload).subscribe({
      next: () => this.finishSave('Usuario actualizado'),
      error: (error: { error?: { message?: string | string[] }; message?: string }) => this.failSave(error)
    });
  }

  cancel(): void {
    void this.router.navigateByUrl('/usuarios');
  }

  private finishSave(title: string): void {
    this.isSaving = false;
    void Swal.fire({
      icon: 'success',
      title,
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    }).then(() => this.cancel());
  }

  private failSave(error: { error?: { message?: string | string[] }; message?: string }): void {
    this.isSaving = false;
    const message = error.error?.message;
    this.errorMessage = Array.isArray(message)
      ? message.join(' ')
      : message ?? error.message ?? 'Ocurrió un error al guardar el usuario.';
    void Swal.fire({
      icon: 'error',
      title: 'No se pudo guardar',
      text: this.errorMessage,
      confirmButtonText: 'Entendido'
    });
  }
}
