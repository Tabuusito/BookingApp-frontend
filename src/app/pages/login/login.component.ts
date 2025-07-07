import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service'
import { LoginRequest } from '../../auth/models/auth.models';

// Importaciones para standalone
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = ''; // <-- Cambiado de email a username
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onLogin(): void {
    this.errorMessage = '';
    const loginRequest: LoginRequest = {
      username: this.username,
      password: this.password
    };
    
    this.authService.login(loginRequest).subscribe({
      // La navegación ahora la gestiona el servicio en caso de éxito
      error: (err) => {
        this.errorMessage = err.message || 'Ocurrió un error. Inténtalo de nuevo.';
      }
    });
  }
}