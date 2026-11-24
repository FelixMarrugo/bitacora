import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { LineaInsumoInventario, ReporteInventario } from '../../models/inventario.model';
import { ApiService } from '../../services/api.service';

interface ResumenInsumo {
  nombre: string;
  unidad: string;
  cantidad: number;
}

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './inventory-report.page.html'
})
export class InventoryReportPage implements OnInit {
  report: ReporteInventario | null = null;
  isLoading = true;
  statusMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute
  ) {}

  get supplyTotals(): ResumenInsumo[] {
    const totals = new Map<number, ResumenInsumo>();
    for (const line of this.report?.supplyLines ?? []) {
      const summary = totals.get(line.supplyId) ?? {
        nombre: line.supplyName ?? 'Insumo',
        unidad: line.unit ?? 'unidad',
        cantidad: 0
      };
      summary.cantidad += Number(line.quantity);
      totals.set(line.supplyId, summary);
    }
    return [...totals.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getInventoryReport(id).subscribe({
      next: (report) => {
        this.report = report;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.statusMessage = this.errorMessage(error);
        this.isLoading = false;
      }
    });
  }

  trackSupply(_: number, item: LineaInsumoInventario): number {
    return item.id ?? item.supplyId;
  }

  private errorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;
    if (Array.isArray(message)) {
      return message.join(' ');
    }
    return typeof message === 'string' ? message : 'No se pudo cargar el reporte del inventario.';
  }
}
