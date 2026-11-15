import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import Swal from 'sweetalert2';
import { EntradaBitacora } from '../../models/entrada.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-edit-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './edit-entry.page.html',
  styleUrls: ['./edit-entry.page.scss']
})
export class EditEntryPage implements OnInit {
  entry: EntradaBitacora = {
    fecha: '',
    proveedor: '',
    producto: '',
    cantidad: 0,
    hora: '',
    ordenCompra: '',
    yaIngresadoErp: false,
    observaciones: ''
  };

  isLoading = true;
  isSaving = false;
  notFound = false;
  statusMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.isLoading = false;
      this.notFound = true;
      return;
    }

    this.apiService.getEntrada(id).subscribe({
      next: (entry) => {
        this.isLoading = false;
        if (!entry?.id) {
          this.notFound = true;
          return;
        }

        this.entry = {
          ...entry,
          producto: entry.producto ?? '',
          cantidad: Number(entry.cantidad ?? 0),
          yaIngresadoErp: !!entry.yaIngresadoErp
        };
      },
      error: () => {
        this.isLoading = false;
        this.notFound = true;
      }
    });
  }

  verifyOrder(): void {
    const orderNumber = this.entry.ordenCompra?.trim();
    if (!orderNumber) {
      this.statusMessage = 'Ingrese un número de orden de compra para validar.';
      return;
    }

    this.apiService.verifyPurchaseOrder(orderNumber).subscribe({
      next: (response: any) => {
        this.entry.yaIngresadoErp = !!response?.yaIngresadoErp;
        this.statusMessage = response?.message ?? 'Orden verificada.';
      },
      error: () => {
        this.statusMessage = 'No se pudo verificar la orden de compra.';
      }
    });
  }

  save(): void {
    if (!this.entry.id) {
      this.notFound = true;
      return;
    }

    if (
      !this.entry.fecha ||
      !this.entry.proveedor.trim() ||
      !this.entry.producto?.trim() ||
      !this.entry.hora ||
      !Number.isFinite(Number(this.entry.cantidad)) ||
      Number(this.entry.cantidad) <= 0
    ) {
      this.statusMessage = 'Complete fecha, proveedor, producto, hora y una cantidad válida.';
      return;
    }

    this.isSaving = true;
    this.statusMessage = '';
    this.apiService.updateEntrada(this.entry.id, {
      ...this.entry,
      cantidad: Number(this.entry.cantidad)
    }).subscribe({
      next: () => {
        this.isSaving = false;
        void Swal.fire({
          icon: 'success',
          title: 'Cambios actualizados',
          text: 'La entrada se actualizó correctamente.',
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => this.router.navigateByUrl('/dashboard'));
      },
      error: () => {
        this.isSaving = false;
        this.statusMessage = 'No se pudieron guardar los cambios.';
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar',
          text: this.statusMessage,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
