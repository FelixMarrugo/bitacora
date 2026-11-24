import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import {
  CategoriaRolloInventario,
  CATEGORIAS_ROLLO_INVENTARIO,
  Inventario
} from '../../models/inventario.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
  templateUrl: './inventory.page.html'
})
export class InventoryPage implements OnInit {
  inventories: Inventario[] = [];
  readonly rollCategories = CATEGORIAS_ROLLO_INVENTARIO;
  from = '';
  to = '';
  isLoading = true;
  statusMessage = '';

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    if (this.from && this.to && this.from > this.to) {
      this.statusMessage = 'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }

    this.isLoading = true;
    this.statusMessage = '';
    this.apiService.getInventories(this.from || undefined, this.to || undefined).subscribe({
      next: (inventories) => {
        this.inventories = inventories;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.statusMessage = this.errorMessage(error);
        this.isLoading = false;
      }
    });
  }

  totalRollKg(inventory: Inventario): number {
    return inventory.rollLines.reduce(
      (total, line) => total + Number(line.weightKg) * Number(line.quantity),
      0
    );
  }

  totalRollKgForCategory(
    inventory: Inventario,
    category: CategoriaRolloInventario
  ): number {
    return inventory.rollLines
      .filter((line) => line.rollCategory === category)
      .reduce(
        (total, line) => total + Number(line.weightKg) * Number(line.quantity),
        0
      );
  }

  private errorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;
    if (Array.isArray(message)) {
      return message.join(' ');
    }
    return typeof message === 'string' ? message : 'No se pudieron cargar los inventarios.';
  }
}
