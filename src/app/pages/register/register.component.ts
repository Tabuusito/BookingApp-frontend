import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { RegisterRequest } from '../../auth/models/auth.models';
import { ActivatedRoute, RouterLink } from '@angular/router';

// --- NUEVOS IMPORTS para Formularios Reactivos ---
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  // --- IMPORTS ACTUALIZADOS ---
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  // Ya no necesitamos las propiedades individuales (username, email, password)
  registerForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  
  // Lista de roles disponibles para el registro público
  availableRoles = [
    { name: 'Cliente (para reservar servicios)', value: 'CLIENT', id: 'roleClient' },
    { name: 'Proveedor (para ofrecer mis servicios)', value: 'PROVIDER', id: 'roleProvider' }
  ];

  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute,
    private fb: FormBuilder // Inyectamos el FormBuilder
  ) {}

  ngOnInit(): void {
    // Inicializamos el formulario reactivo
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Usamos un FormArray para manejar los roles, con un validador que exige al menos una selección
      roles: this.fb.array([], [Validators.required])
    });

    this.route.queryParams.subscribe(params => {
      if (params['registered']) {
        this.successMessage = '¡Registro exitoso! Por favor, inicia sesión.';
      }
    });
  }

  // --- NUEVO MÉTODO para manejar el cambio en los checkboxes ---
  onRoleChange(event: Event): void {
    const rolesArray = this.registerForm.get('roles') as FormArray;
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      // Si se marca el checkbox, añadimos el valor al FormArray
      rolesArray.push(this.fb.control(checkbox.id === 'roleClient' ? 'CLIENT' : 'PROVIDER'));
    } else {
      // Si se desmarca, buscamos el índice del valor y lo eliminamos
      const index = rolesArray.controls.findIndex(x => x.value === (checkbox.id === 'roleClient' ? 'CLIENT' : 'PROVIDER'));
      if (index !== -1) {
        rolesArray.removeAt(index);
      }
    }
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      // Marcar todos los campos como "tocados" para mostrar los mensajes de error
      this.registerForm.markAllAsTouched();
      return;
    }
      
    this.errorMessage = '';
    this.successMessage = '';

    // El valor del formulario ya tiene la estructura correcta
    const registerRequest: RegisterRequest = this.registerForm.value;

    this.authService.register(registerRequest).subscribe({
      error: (err) => {
        // Asumiendo que el error del backend está en err.error
        this.errorMessage = err.error || 'No se pudo completar el registro. Inténtalo de nuevo.';
      }
    });
  }
}