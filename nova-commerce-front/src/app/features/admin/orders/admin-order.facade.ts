import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { AdminOrderService } from './admin-order.service';
import { AdminOrder, AdminOrderStatus } from './admin-order.model';

export interface AdminOrderState {
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  loading: boolean;
  statusFilter?: AdminOrderStatus | 'ALL';
}

@Injectable({ providedIn: 'root' })
export class AdminOrderFacade {
  private readonly service = inject(AdminOrderService);
  private _state$ = new BehaviorSubject<AdminOrderState>({
    orders: [],
    selectedOrder: null,
    loading: false,
    statusFilter: 'ALL',
  });

  state$ = this._state$.asObservable();
  orders$ = this._state$.asObservable().pipe(map(state => state.orders));
  selectedOrder$ = this._state$.asObservable().pipe(map(state => state.selectedOrder));

  private setState(partial: Partial<AdminOrderState>) {
    const current = this._state$.value;
    this._state$.next({ ...current, ...partial });
  }

  loadOrders(status?: AdminOrderStatus) {
    this.setState({ loading: true });
    this.service.list(status).subscribe({
      next: (orders) => this.setState({ orders, loading: false, statusFilter: status ?? 'ALL' }),
      error: () => this.setState({ loading: false }),
    });
  }

  loadOrderById(id: string) {
    this.setState({ loading: true });
    this.service.getById(id).subscribe({
      next: (selectedOrder) => this.setState({ selectedOrder, loading: false }),
      error: () => this.setState({ loading: false }),
    });
  }

  updateOrderStatus(id: string, status: AdminOrderStatus) {
    this.setState({ loading: true });
    this.service.updateStatus(id, status).subscribe({
      next: (order) => {
        const orders = this._state$.value.orders.map((o) => (o.id === order.id ? order : o));
        this.setState({ orders, selectedOrder: order, loading: false });
      },
      error: () => this.setState({ loading: false }),
    });
  }

  setStatusFilter(status: AdminOrderStatus | 'ALL') {
    this.setState({ statusFilter: status });
  }
}
