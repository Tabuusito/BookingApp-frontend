import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { RegisterRequest } from '../../auth/models/auth.models';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Importaciones para standalone
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  username = ''; 
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['registered']) {
        this.successMessage = '¡Registro exitoso! Por favor, inicia sesión.';
      }
    });
  }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const registerRequest: RegisterRequest = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(registerRequest).subscribe({
      // La navegación se gestiona en el servicio
      error: (err) => {
        this.errorMessage = err.error || 'No se pudo completar el registro. Inténtalo de nuevo.';
      }
    });
  }
}