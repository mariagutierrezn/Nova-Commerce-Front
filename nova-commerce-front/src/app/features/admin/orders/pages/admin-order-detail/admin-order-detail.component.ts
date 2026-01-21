import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminOrderFacade } from '../../admin-order.facade';
import type { AdminOrderState } from '../../admin-order.facade';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss'],
})
export class AdminOrderDetailComponent implements OnInit {
  private readonly facade = inject(AdminOrderFacade);
  private route = inject(ActivatedRoute);
  state$ = this.facade.state$;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.facade.loadOrderById(id);
  }

  updateStatus(status: 'CREATED' | 'PAID' | 'SHIPPED' | 'COMPLETED') {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.facade.updateOrderStatus(id, status);
  }
}
