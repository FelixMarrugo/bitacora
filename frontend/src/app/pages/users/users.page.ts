import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AppUser } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './users.page.html'
})
export class UsersPage {
  users: AppUser[] = [];
  isLoading = true;
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ionViewWillEnter(): void {
    this.loadUsers();
  }

  get filteredUsers(): AppUser[] {
    const searchTerm = this.searchTerm.trim().toLocaleLowerCase();

    return this.users.filter((user) => {
      const matchesSearch = `${user.firstName} ${user.lastName} ${user.username}`
        .toLocaleLowerCase()
        .includes(searchTerm);
      const matchesStatus = this.statusFilter === 'all'
        || user.active === (this.statusFilter === 'active');
      return matchesSearch && matchesStatus;
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        void Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar los usuarios',
          text: 'Intenta de nuevo en unos momentos.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  createUser(): void {
    void this.router.navigateByUrl('/usuarios/nuevo');
  }

  editUser(user: AppUser): void {
    void this.router.navigate(['/usuarios/editar', user.id]);
  }

  deleteUser(user: AppUser): void {
    void Swal.fire({
      icon: 'warning',
      title: '¿Eliminar usuario?',
      text: `Se eliminará la cuenta de ${user.firstName} ${user.lastName}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter((item) => item.id !== user.id);
          void Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false
          });
        },
        error: () => {
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: 'Intenta de nuevo en unos momentos.',
            confirmButtonText: 'Entendido'
          });
        }
      });
    });
  }
}
