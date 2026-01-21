import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DiscountService, DiscountRule } from '../../services/discount.service';

/**
 * Estrategias de descuento disponibles en el sistema
 */
enum DiscountStrategy {
  LOYALTY = 'LOYALTY',                 // Descuento por lealtad
  SEASON = 'SEASON',                   // Descuento estacional
  PRODUCT_TYPE = 'PRODUCT_TYPE',       // Descuento por tipo de producto
  PERCENTAGE = 'PERCENTAGE',           // Descuento por porcentaje
  FIXED_AMOUNT = 'FIXED_AMOUNT',       // Descuento de monto fijo
  BUY_X_GET_Y = 'BUY_X_GET_Y',        // Compra X lleva Y
  BUNDLE = 'BUNDLE',                   // Descuento por paquete
  FIRST_PURCHASE = 'FIRST_PURCHASE'    // Descuento primera compra
}

@Component({
  selector: 'app-admin-discount-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page__header">
        <h1 class="admin-page__title">Reglas de Descuento (Strategy Pattern)</h1>
        <button class="btn btn--primary" (click)="createDiscount()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Regla
        </button>
      </div>

      <!-- Estrategias disponibles -->
      <div class="strategy-cards">
        <div class="strategy-card" *ngFor="let strategy of strategies">
          <div class="strategy-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          <h3 class="strategy-card__title">{{ strategy.name }}</h3>
          <p class="strategy-card__desc">{{ strategy.description }}</p>
          <span class="strategy-card__count">{{ strategy.count }} reglas activas</span>
        </div>
      </div>

      <!-- Reglas activas -->
      <div class="admin-card">
        <div class="admin-card__header">
          <h2 class="admin-card__title">Reglas Configuradas</h2>
          <div class="admin-card__filters">
            <select class="admin-select" [(ngModel)]="filterStrategy" (change)="filterDiscounts()">
              <option value="">Todas las estrategias</option>
              <option *ngFor="let s of getStrategyKeys()" [value]="s">{{ getStrategyName(s) }}</option>
            </select>
          </div>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Regla</th>
                <th>Estrategia</th>
                <th>Valor</th>
                <th>Compra Mínima</th>
                <th>Vigencia</th>
                <th>Uso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rule of filteredRules">
                <td>
                  <div class="rule-info">
                    <strong>{{ rule.name }}</strong>
                    <p class="text-muted">{{ rule.description }}</p>
                  </div>
                </td>
                <td>
                  <span class="strategy-badge" [attr.data-strategy]="rule.strategy">
                    {{ getStrategyName(rule.strategy) }}
                  </span>
                </td>
                <td>
                  <strong>{{ formatValue(rule) }}</strong>
                </td>
                <td>
                  <span *ngIf="rule.minPurchase">\${{ rule.minPurchase | number: '1.2-2' }}</span>
                  <span *ngIf="!rule.minPurchase" class="text-muted">Sin mínimo</span>
                </td>
                <td>
                  <div class="date-range">
                    <div>{{ rule.startDate | date: 'dd/MM/yyyy' }}</div>
                    <div *ngIf="rule.endDate" class="text-muted">→ {{ rule.endDate | date: 'dd/MM/yyyy' }}</div>
                    <div *ngIf="!rule.endDate" class="text-muted">→ Permanente</div>
                  </div>
                </td>
                <td>
                  <div class="usage-info">
                    <span>{{ rule.usageCount }}</span>
                    <span *ngIf="rule.maxUsage" class="text-muted">/ {{ rule.maxUsage }}</span>
                    <span *ngIf="!rule.maxUsage" class="text-muted">/ ∞</span>
                  </div>
                </td>
                <td>
                  <button 
                    class="toggle-btn" 
                    [class.toggle-btn--active]="rule.active"
                    (click)="toggleActive(rule)">
                    {{ rule.active ? 'Activo' : 'Inactivo' }}
                  </button>
                </td>
                <td>
                  <div class="admin-table__actions">
                    <button class="btn-icon" (click)="editRule(rule)" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button class="btn-icon btn-icon--danger" (click)="deleteRule(rule)" title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="admin-card__empty" *ngIf="filteredRules.length === 0">
          No hay reglas de descuento configuradas
        </p>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 2rem;
    }

    .admin-page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .admin-page__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--admin-text);
    }

    .strategy-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .strategy-card {
      background: var(--admin-card-bg);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: var(--admin-shadow);
      border: 2px solid var(--admin-border);
      transition: all 0.3s;
    }

    .strategy-card:hover {
      border-color: var(--admin-primary);
      transform: translateY(-2px);
    }

    .strategy-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--admin-primary), var(--admin-primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      color: white;
    }

    .strategy-card__title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--admin-text);
      margin-bottom: 0.5rem;
    }

    .strategy-card__desc {
      font-size: 0.9rem;
      color: var(--admin-text-muted);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .strategy-card__count {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--admin-primary-light);
      color: var(--admin-primary);
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .admin-card {
      background: var(--admin-card-bg);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--admin-shadow);
    }

    .admin-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .admin-card__title {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--admin-text);
    }

    .admin-select {
      padding: 0.75rem 1rem;
      border: 1px solid var(--admin-border);
      border-radius: 8px;
      background: var(--admin-input-bg);
      color: var(--admin-text);
      min-width: 200px;
    }

    .admin-table-wrapper {
      overflow-x: auto;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
    }

    .admin-table th {
      text-align: left;
      padding: 1rem;
      font-weight: 600;
      color: var(--admin-text-muted);
      border-bottom: 2px solid var(--admin-border);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .admin-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--admin-border);
      color: var(--admin-text);
    }

    .rule-info strong {
      display: block;
      margin-bottom: 0.25rem;
      color: var(--admin-text);
    }

    .rule-info .text-muted {
      font-size: 0.85rem;
      color: var(--admin-text-muted);
    }

    .strategy-badge {
      padding: 0.4rem 0.9rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .strategy-badge[data-strategy="PERCENTAGE"] {
      background: #3b82f633;
      color: #3b82f6;
    }

    .strategy-badge[data-strategy="FIXED_AMOUNT"] {
      background: #10b98133;
      color: #10b981;
    }

    .strategy-badge[data-strategy="BUY_X_GET_Y"] {
      background: #f59e0b33;
      color: #f59e0b;
    }

    .strategy-badge[data-strategy="BUNDLE"] {
      background: #8b5cf633;
      color: #8b5cf6;
    }

    .strategy-badge[data-strategy="SEASON"] {
      background: #ec489933;
      color: #ec4899;
    }

    .strategy-badge[data-strategy="FIRST_PURCHASE"] {
      background: #06b6d433;
      color: #06b6d4;
    }

    .strategy-badge[data-strategy="LOYALTY"] {
      background: #eab30833;
      color: #eab308;
    }

    .date-range, .usage-info {
      font-size: 0.9rem;
    }

    .text-muted {
      color: var(--admin-text-muted);
      font-size: 0.85rem;
    }

    .toggle-btn {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      border: none;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      background: #ef444433;
      color: #ef4444;
    }

    .toggle-btn--active {
      background: #10b98133;
      color: #10b981;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn--primary {
      background: var(--admin-primary);
      color: white;
    }

    .btn--primary:hover {
      background: var(--admin-primary-dark);
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--admin-text-muted);
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: var(--admin-hover);
      color: var(--admin-primary);
    }

    .btn-icon--danger:hover {
      color: #ef4444;
    }

    .admin-table__actions {
      display: flex;
      gap: 0.5rem;
    }

    .admin-card__empty {
      text-align: center;
      padding: 3rem;
      color: var(--admin-text-muted);
    }
  `]
})
export class AdminDiscountListComponent implements OnInit {
  private readonly discountService = inject(DiscountService);
  
  rules: DiscountRule[] = [];
  filteredRules: DiscountRule[] = [];
  filterStrategy = '';
  loading = false;
  error: string | null = null;

  strategies = [
    { name: 'Lealtad', description: 'Descuentos por nivel de cliente (Bronce, Plata, Oro, VIP)', count: 0, key: 'LOYALTY' },
    { name: 'Estacional', description: 'Descuentos por temporada (Verano, Invierno, etc.)', count: 0, key: 'SEASON' },
    { name: 'Tipo de Producto', description: 'Descuentos por categoría (Electrónicos, Ropa, Alimentos)', count: 0, key: 'PRODUCT_TYPE' },
    { name: 'Porcentaje', description: 'Descuento basado en porcentaje del total', count: 0, key: 'PERCENTAGE' },
    { name: 'Monto Fijo', description: 'Descuento de valor fijo en pesos', count: 0, key: 'FIXED_AMOUNT' },
    { name: 'Compra X Lleva Y', description: 'Promociones 2x1, 3x2, etc.', count: 0, key: 'BUY_X_GET_Y' },
    { name: 'Paquete', description: 'Descuento al comprar productos juntos', count: 0, key: 'BUNDLE' },
    { name: 'Primera Compra', description: 'Beneficio para nuevos clientes', count: 0, key: 'FIRST_PURCHASE' }
  ];

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.loading = true;
    this.error = null;
    
    this.discountService.getAll().subscribe({
      next: (rules) => {
        this.rules = rules.map(rule => ({
          ...rule,
          startDate: rule.startDate,
          endDate: rule.endDate
        }));
        this.updateStrategyCounts();
        this.filteredRules = [...this.rules];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading discount rules:', err);
        this.error = 'Error al cargar las reglas de descuento. Por favor, intente nuevamente.';
        this.loading = false;
        // Fallback a datos vacíos en caso de error
        this.rules = [];
        this.filteredRules = [];
      }
    });
  }

  updateStrategyCounts(): void {
    this.strategies.forEach(strategy => {
      strategy.count = this.rules.filter(r => r.strategy === strategy.key && r.active).length;
    });
  }

  filterDiscounts(): void {
    if (!this.filterStrategy) {
      this.filteredRules = [...this.rules];
    } else {
      this.filteredRules = this.rules.filter(r => r.strategy === this.filterStrategy);
    }
  }

  getStrategyKeys(): string[] {
    return Object.values(DiscountStrategy);
  }

  getStrategyName(strategy: string): string {
    const names: Record<string, string> = {
      [DiscountStrategy.PERCENTAGE]: 'Porcentaje',
      [DiscountStrategy.FIXED_AMOUNT]: 'Monto Fijo',
      [DiscountStrategy.BUY_X_GET_Y]: 'Compra X Lleva Y',
      [DiscountStrategy.BUNDLE]: 'Paquete',
      [DiscountStrategy.SEASON]: 'Estacional',
      [DiscountStrategy.FIRST_PURCHASE]: 'Primera Compra',
      [DiscountStrategy.LOYALTY]: 'Lealtad'
    };
    return names[strategy] || strategy;
  }

  formatValue(rule: DiscountRule): string {
    if (rule.strategy === DiscountStrategy.PERCENTAGE || 
        rule.strategy === DiscountStrategy.BUY_X_GET_Y ||
        rule.strategy === DiscountStrategy.BUNDLE ||
        rule.strategy === DiscountStrategy.SEASON ||
        rule.strategy === DiscountStrategy.FIRST_PURCHASE ||
        rule.strategy === DiscountStrategy.LOYALTY) {
      return `${rule.value}%`;
    } else {
      return `$${rule.value.toLocaleString()}`;
    }
  }

  toggleActive(rule: DiscountRule): void {
    const previousState = rule.active;
    rule.active = !rule.active;
    
    this.discountService.toggleStatus(rule.id).subscribe({
      next: () => {
        console.log('Rule status toggled:', rule.name, rule.active);
        this.updateStrategyCounts();
      },
      error: (err) => {
        console.error('Error toggling rule status:', err);
        rule.active = previousState; // Revertir en caso de error
        alert('Error al cambiar el estado de la regla. Por favor, intente nuevamente.');
      }
    });
  }

  createDiscount(): void {
    console.log('Crear nueva regla de descuento');
  }

  editRule(rule: DiscountRule): void {
    console.log('Editar regla:', rule.name);
  }

  deleteRule(rule: DiscountRule): void {
    if (confirm(`¿Está seguro de eliminar la regla "${rule.name}"?`)) {
      this.discountService.delete(rule.id).subscribe({
        next: () => {
          this.rules = this.rules.filter(r => r.id !== rule.id);
          this.filterDiscounts();
          this.updateStrategyCounts();
          console.log('Rule deleted:', rule.name);
        },
        error: (err) => {
          console.error('Error deleting rule:', err);
          alert('Error al eliminar la regla. Por favor, intente nuevamente.');
        }
      });
    }
  }
}
