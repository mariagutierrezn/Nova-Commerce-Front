import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KeysPipe } from '../../../../shared/pipes/keys.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, KeysPipe, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  model = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  };

  loading = false;
  error: string | null = null;
  showPassword = false;
  confirmPassword = '';
  passwordsMismatch = false;
  confirmTouched = false;
  fieldErrors: Record<string, string[]> = {};

  submit() {
    this.error = null;
    this.fieldErrors = {};
    this.checkPasswords();

    // Validación cliente mínima
    const valid = this.validateModel();
    if (!valid) {
      return;
    }

    this.loading = true;
    console.log('register payload', this.model);
    this.authService.register(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Register error', err);
        // Backend puede enviar errores por campo o un message general
        if (err?.status === 400 && err?.error) {
          const body = err.error;
          if (typeof body === 'string') {
            this.error = body;
          } else if (body?.message) {
            this.error = body.message;
          }
          // si viene un objeto con errores por campo
          if (body?.errors && typeof body.errors === 'object') {
            this.fieldErrors = body.errors as Record<string, string[]>;
          }
        } else {
          this.error = err?.error?.message || 'Error al registrar usuario';
        }
      },
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  checkPasswords() {
    this.passwordsMismatch = this.confirmPassword.length > 0 && this.model.password !== this.confirmPassword;
  }

  validateModel(): boolean {
    const errors: Record<string, string[]> = {};
    if (!this.model.username || this.model.username.trim().length === 0) {
      errors['username'] = ['El usuario es obligatorio'];
    }
    if (!this.model.email || this.model.email.trim().length === 0) {
      errors['email'] = ['El email es obligatorio'];
    } else {
      const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!re.test(this.model.email)) {
        errors['email'] = errors['email'] || [];
        errors['email'].push('Email inválido');
      }
    }
    if (!this.model.firstName || this.model.firstName.trim().length === 0) {
      errors['firstName'] = ['El nombre es obligatorio'];
    }
    if (!this.model.lastName || this.model.lastName.trim().length === 0) {
      errors['lastName'] = ['El apellido es obligatorio'];
    }
    if (!this.model.password || this.model.password.length < 8) {
      errors['password'] = ['La contraseña debe tener al menos 8 caracteres'];
    }
    if (this.passwordsMismatch) {
      errors['confirmPassword'] = ['Las contraseñas no coinciden'];
    }

    this.fieldErrors = errors;
    // mostrar mensaje general si hay errores
    if (Object.keys(errors).length > 0) {
      this.error = 'Corrige los errores del formulario';
      return false;
    }
    return true;
  }
}
