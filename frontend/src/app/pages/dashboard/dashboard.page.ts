import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EntradaBitacora, EntradaProducto } from '../../models/entrada.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  summary = {
    entradas: 0,
    proveedor: 'Sin registros',
    pendientes: 0,
    enErp: 0
  };

  entries: EntradaBitacora[] = [];
  filteredEntries: EntradaBitacora[] = [];
  entrySearch = '';
  erpFilter: 'all' | 'entered' | 'pending' = 'all';
  dateFrom = '';
  dateTo = '';
  isLoadingSummary = true;
  isLoadingEntries = true;
  filterMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const currentMonth = this.getCurrentMonthRange();
    this.dateFrom = currentMonth.from;
    this.dateTo = currentMonth.to;
  }

  ionViewWillEnter(): void {
    this.loadDashboard();
    this.loadEntries();
  }

  get visibleEntries(): EntradaBitacora[] {
    const searchTerm = this.entrySearch.trim().toLocaleLowerCase();

    return this.filteredEntries.filter((entry) => {
      const matchesSearch = `${entry.proveedor} ${entry.proveedorNit ?? ''} ${this.productSummary(entry)} ${entry.ordenCompra ?? ''}`
        .toLocaleLowerCase()
        .includes(searchTerm);
      const matchesErp = this.erpFilter === 'all'
        || entry.yaIngresadoErp === (this.erpFilter === 'entered');
      return matchesSearch && matchesErp;
    });
  }

  productSummary(entry: EntradaBitacora): string {
    return this.productLines(entry)
      .map((item) => `${item.producto} (${item.cantidad})`)
      .join(', ');
  }

  productLines(entry: EntradaBitacora): EntradaProducto[] {
    if (entry.productos?.length) {
      return entry.productos;
    }
    return entry.producto
      ? [{ producto: entry.producto, cantidad: Number(entry.cantidad ?? 0) }]
      : [];
  }

  totalQuantity(entry: EntradaBitacora): number {
    return this.productLines(entry)
      .reduce((total, item) => total + Number(item.cantidad), 0);
  }

  private getCurrentMonthRange(): { from: string; to: string } {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      from: this.toLocalDate(firstDay),
      to: this.toLocalDate(lastDay)
    };
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadDashboard(): void {
    this.isLoadingSummary = true;
    this.apiService.getDashboard().subscribe({
      next: (res: any) => {
        this.isLoadingSummary = false;
        this.summary = {
          entradas: res.totalEntradas ?? 0,
          proveedor: res.proveedorMasActivo ?? 'Sin registros',
          pendientes: res.pendientes ?? 0,
          enErp: res.enErp ?? 0
        };
      },
      error: () => {
        this.isLoadingSummary = false;
        this.summary = {
          entradas: 0,
          proveedor: 'Sin registros',
          pendientes: 0,
          enErp: 0
        };
      }
    });
  }

  loadEntries(): void {
    this.isLoadingEntries = true;
    this.apiService.getEntradas().subscribe({
      next: (entries) => {
        this.isLoadingEntries = false;
        this.entries = [...entries].sort((a, b) => b.fecha.localeCompare(a.fecha));
        this.filterEntries();
      },
      error: () => {
        this.isLoadingEntries = false;
        this.entries = [];
        this.filteredEntries = [];
        this.filterMessage = 'No se pudieron cargar las entradas. Revisa tu conexión e intenta nuevamente.';
      }
    });
  }

  applyFilter(): void {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      this.filterMessage = 'La fecha inicial no puede ser posterior a la fecha final.';
      return;
    }
    this.filterMessage = '';
    this.filterEntries();
  }

  resetFilter(): void {
    const currentMonth = this.getCurrentMonthRange();
    this.dateFrom = currentMonth.from;
    this.dateTo = currentMonth.to;
    this.filterMessage = '';
    this.entrySearch = '';
    this.erpFilter = 'all';
    this.filterEntries();
  }

  private filterEntries(): void {
    const from = this.dateFrom || this.getCurrentMonthRange().from;
    const to = this.dateTo || this.getCurrentMonthRange().to;

    this.filteredEntries = this.entries.filter((entry) => {
      const itemDate = entry.fecha ?? '';
      return itemDate >= from && itemDate <= to;
    });
  }

  openCreateForm(): void {
    this.router.navigateByUrl('/bitacora');
  }

  openEditForm(entry: EntradaBitacora): void {
    if (!entry.id) {
      return;
    }

    void Swal.fire({
      icon: 'question',
      title: 'Editar entrada',
      text: `¿Deseas editar la orden ${entry.ordenCompra || `#${entry.id}`}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/editar', entry.id]);
      }
    });
  }

  deleteEntry(id: number): void {
    if (!id) {
      return;
    }

    void Swal.fire({
      icon: 'warning',
      title: '¿Eliminar entrada?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.apiService.deleteEntrada(id).subscribe({
        next: () => {
          this.loadDashboard();
          this.loadEntries();
          void Swal.fire({
            icon: 'success',
            title: 'Entrada eliminada',
            text: 'La entrada se eliminó correctamente.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false
          });
        },
        error: () => {
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: 'Ocurrió un error al eliminar la entrada.',
            confirmButtonText: 'Entendido'
          });
        }
      });
    });
  }
}
