import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HasRoleDirective } from '../auth/directives/has-role.directive';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, HasRoleDirective, FormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  private router = inject(Router);
  
  searchTerm = '';

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/admin/products'], { 
        queryParams: { search: this.searchTerm.trim() }
      });
    }
  }
}
