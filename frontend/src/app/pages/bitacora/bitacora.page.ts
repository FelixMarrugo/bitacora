import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import Swal from 'sweetalert2';
import { ApiService } from '../../services/api.service';
import { EntradaBitacora } from '../../models/entrada.model';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './bitacora.page.html',
  styleUrls: ['./bitacora.page.scss']
})
export class BitacoraPage implements OnInit {
  entry: EntradaBitacora = {
    fecha: new Date().toISOString().slice(0, 10),
    proveedor: '',
    producto: '',
    cantidad: 0,
    hora: new Date().toLocaleTimeString('es-ES', { hour12: false }),
    ordenCompra: '',
    yaIngresadoErp: false,
    observaciones: ''
  };

  isSubmitting = false;
  statusMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.entry.hora = new Date().toLocaleTimeString('es-ES', { hour12: false });
  }

  verifyOrder(): void {
    if (!this.entry.ordenCompra) {
      this.statusMessage = 'Ingrese número de orden de compra para validar.';
      return;
    }

    this.apiService.verifyPurchaseOrder(this.entry.ordenCompra).subscribe({
      next: (response: any) => {
        this.entry.yaIngresadoErp = !!response?.yaIngresadoErp;
        this.statusMessage = response?.message ?? 'Orden verificada.';
      },
      error: () => {
        this.entry.yaIngresadoErp = false;
        this.statusMessage = 'No se encontró la orden de compra o está pendiente.';
      }
    });
  }

  submit(): void {
    if (!this.entry.producto?.trim()) {
      this.statusMessage = 'Ingrese el nombre del producto recibido.';
      return;
    }

    this.isSubmitting = true;

    this.apiService.createEntrada(this.entry).subscribe({
      next: () => {
        this.isSubmitting = false;
        void Swal.fire({
          icon: 'success',
          title: 'Orden registrada',
          text: 'La entrada de mercancía se guardó correctamente.',
          confirmButtonText: 'Volver al dashboard'
        }).then(() => this.router.navigateByUrl('/dashboard'));
      },
      error: () => {
        this.isSubmitting = false;
        this.statusMessage = 'No se pudo registrar la entrada de mercancía.';
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo guardar',
          text: this.statusMessage,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }
}
