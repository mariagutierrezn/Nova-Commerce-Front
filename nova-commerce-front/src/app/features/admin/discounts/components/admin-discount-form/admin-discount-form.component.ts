import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiscountRule, DiscountRuleRequest, DiscountService } from '../../services/discount.service';

@Component({
  selector: 'app-admin-discount-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Editar Regla' : 'Nueva Regla' }} de Descuento</h2>
          <button class="btn-close" (click)="onCancel()" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nombre de la Regla *</label>
              <input 
                id="name" 
                type="text" 
                formControlName="name" 
                class="form-control"
                placeholder="Ej: Descuento de Verano 2024"
              />
              <div class="error" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
                El nombre es requerido (mín. 3 caracteres)
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea 
                id="description" 
                formControlName="description" 
                class="form-control"
                rows="3"
                placeholder="Descripción de la regla de descuento"
              ></textarea>
            </div>
          </div>

          <div class="form-row form-row--2">
            <div class="form-group">
              <label for="strategy">Estrategia *</label>
              <select id="strategy" formControlName="strategy" class="form-control">
                <option value="">Seleccionar estrategia</option>
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED_AMOUNT">Monto Fijo</option>
                <option value="BUY_X_GET_Y">Compra X Lleva Y</option>
                <option value="BUNDLE">Paquete</option>
                <option value="LOYALTY">Lealtad</option>
                <option value="SEASON">Estacional</option>
                <option value="FIRST_PURCHASE">Primera Compra</option>
              </select>
              <div class="error" *ngIf="form.get('strategy')?.invalid && form.get('strategy')?.touched">
                La estrategia es requerida
              </div>
            </div>

            <div class="form-group">
              <label for="value">Valor (% o $) *</label>
              <input 
                id="value" 
                type="number" 
                formControlName="value" 
                class="form-control"
                placeholder="10"
                min="0"
                step="0.01"
              />
              <div class="error" *ngIf="form.get('value')?.invalid && form.get('value')?.touched">
                El valor debe ser mayor a 0
              </div>
            </div>
          </div>

          <div class="form-row form-row--2">
            <div class="form-group">
              <label for="minPurchase">Compra Mínima ($)</label>
              <input 
                id="minPurchase" 
                type="number" 
                formControlName="minPurchase" 
                class="form-control"
                placeholder="0"
                min="0"
              />
            </div>

            <div class="form-group">
              <label for="maxDiscount">Descuento Máximo ($)</label>
              <input 
                id="maxDiscount" 
                type="number" 
                formControlName="maxDiscount" 
                class="form-control"
                placeholder="Sin límite"
                min="0"
              />
            </div>
          </div>

          <div class="form-row form-row--2">
            <div class="form-group">
              <label for="startDate">Fecha Inicio *</label>
              <input 
                id="startDate" 
                type="datetime-local" 
                formControlName="startDate" 
                class="form-control"
              />
              <div class="error" *ngIf="form.get('startDate')?.invalid && form.get('startDate')?.touched">
                La fecha de inicio es requerida
              </div>
            </div>

            <div class="form-group">
              <label for="endDate">Fecha Fin</label>
              <input 
                id="endDate" 
                type="datetime-local" 
                formControlName="endDate" 
                class="form-control"
              />
            </div>
          </div>

          <div class="form-row form-row--2">
            <div class="form-group">
              <label for="maxUsage">Uso Máximo</label>
              <input 
                id="maxUsage" 
                type="number" 
                formControlName="maxUsage" 
                class="form-control"
                placeholder="Sin límite"
                min="1"
              />
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="active"
                />
                <span>Regla Activa</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn--secondary" (click)="onCancel()">
              Cancelar
            </button>
            <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving">
              {{ saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }} Regla
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }

    .modal-container {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #1f2937;
      }
    }

    .btn-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
        color: #111827;
      }
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      gap: 1rem;
      margin-bottom: 1rem;

      &--2 {
        grid-template-columns: 1fr 1fr;

        @media (max-width: 640px) {
          grid-template-columns: 1fr;
        }
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 600;
        color: #374151;
        font-size: 0.875rem;
      }
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      &:invalid {
        border-color: #ef4444;
      }
    }

    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      margin-top: 2rem;

      input[type="checkbox"] {
        width: 1.25rem;
        height: 1.25rem;
        cursor: pointer;
      }

      span {
        font-weight: 600;
        color: #374151;
      }
    }

    .error {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &--secondary {
        background: #f3f4f6;
        color: #374151;

        &:hover:not(:disabled) {
          background: #e5e7eb;
        }
      }

      &--primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
      }
    }
  `]
})
export class AdminDiscountFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly discountService = inject(DiscountService);

  @Input() rule?: DiscountRule;
  @Output() saved = new EventEmitter<DiscountRule>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  saving = false;

  get isEditMode(): boolean {
    return !!this.rule;
  }

  ngOnInit(): void {
    console.log('📝 Inicializando formulario de descuento. Modo:', this.isEditMode ? 'EDICIÓN' : 'CREACIÓN');
    if (this.rule) {
      console.log('📋 Datos de la regla a editar:', this.rule);
    }
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: [this.rule?.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [this.rule?.description || '', [Validators.maxLength(500)]],
      strategy: [this.rule?.strategy || '', [Validators.required]],
      value: [this.rule?.value || null, [Validators.required, Validators.min(0.01)]],
      minPurchase: [this.rule?.minPurchase || null, [Validators.min(0)]],
      maxDiscount: [this.rule?.maxDiscount || null, [Validators.min(0)]],
      startDate: [this.formatDateForInput(this.rule?.startDate), [Validators.required]],
      endDate: [this.formatDateForInput(this.rule?.endDate), []],
      maxUsage: [this.rule?.maxUsage || null, [Validators.min(1)]],
      active: [this.rule?.active ?? true]
    });
    console.log('✅ Formulario inicializado con valores:', this.form.value);
  }

  private formatDateForInput(date?: string): string {
    if (!date) return '';
    
    // Si es una fecha ISO, convertir a formato datetime-local
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    console.log('📤 Intentando enviar formulario...');
    
    if (this.form.invalid) {
      console.warn('⚠️ Formulario inválido. Marcando campos tocados.');
      console.log('❌ Errores del formulario:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.warn(`  ❌ Campo "${key}" inválido:`, control.errors);
        }
      });
      this.form.markAllAsTouched();
      return;
    }

    console.log('✅ Formulario válido. Preparando request...');
    this.saving = true;
    const formValue = this.form.value;

    // Convertir las fechas al formato ISO
    const request: DiscountRuleRequest = {
      ...formValue,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined
    };

    console.log('📦 Request preparado:', request);
    console.log('🔄 Operación:', this.isEditMode ? `UPDATE (ID: ${this.rule!.id})` : 'CREATE');

    const operation = this.isEditMode
      ? this.discountService.update(this.rule!.id, request)
      : this.discountService.create(request);

    operation.subscribe({
      next: (rule) => {
        console.log('✅ Regla guardada exitosamente:', rule);
        this.saving = false;
        this.saved.emit(rule);
      },
      error: (err) => {
        console.error('❌ Error saving discount rule:', err);
        console.error('📝 Detalles del error:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText,
          error: err.error
        });
        this.saving = false;
        alert(`Error al guardar la regla de descuento: ${err.status} ${err.statusText || err.message}`);
      }
    });
  }

  onCancel(): void {
    console.log('❌ Formulario cancelado por el usuario');
    this.cancelled.emit();
  }
}
