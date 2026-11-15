import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  username = 'admin';
  password = '123456';
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  login(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: ({ access_token, user }) => {
        this.authService.saveToken(access_token);
        const username = (user as { username?: string } | null)?.username ?? this.username;
        void Swal.fire({
          icon: 'success',
          title: `¡Bienvenido, ${username}!`,
          text: 'Has iniciado sesión correctamente.',
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => this.router.navigateByUrl('/dashboard'));
      },
      error: () => {
        this.errorMessage = 'Credenciales inválidas. Intenta de nuevo.';
        this.isLoading = false;
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo iniciar sesión',
          text: this.errorMessage,
          confirmButtonText: 'Entendido'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
