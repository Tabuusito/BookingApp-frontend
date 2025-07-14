import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { OfferedServiceService } from '../../services/offered-service.service';
import { CreateOfferedServiceRequest } from '../../models/offered-service.models';

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.scss']
})
export class ServiceCreateComponent implements OnInit {
  serviceForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  
  // Para manejar la redirección de vuelta
  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private offeredServiceService: OfferedServiceService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute // Para leer parámetros de la URL
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Comprueba si venimos del formulario de creación de reserva
    this.route.queryParamMap.subscribe(params => {
        this.returnUrl = params.get('returnTo');
    });
  }

  private initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      // Pedimos la duración en minutos al usuario para que sea más fácil
      durationMinutes: [30, [Validators.required, Validators.min(1)]],
      pricePerReservation: [0, [Validators.required, Validators.min(0)]],
      isActive: [true, Validators.required],
    });
  }

  get f() { return this.serviceForm.controls; }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.serviceForm.value;

    const request: CreateOfferedServiceRequest = {
      name: formValue.name,
      description: formValue.description,
      // Convertimos los minutos a segundos para la API
      defaultDurationSeconds: formValue.durationMinutes * 60,
      pricePerReservation: formValue.pricePerReservation,
      isActive: formValue.isActive,
    };

    this.offeredServiceService.createService(request).subscribe({
      next: (newService) => {
        alert('¡Servicio creado con éxito!');
        // Si hay una URL de retorno, vamos allí. Si no, a la página principal.
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          // Idealmente, aquí irías a una página de "gestión de servicios"
          this.router.navigate(['/home']); 
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocurrió un error al crear el servicio.';
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}