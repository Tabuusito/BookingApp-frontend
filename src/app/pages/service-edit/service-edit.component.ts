import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { OfferedServiceService } from '../../services/offered-service.service';
import { UpdateOfferedServiceRequest } from '../../models/offered-service.models';
import { FormErrorService } from '../../services/form-error.service'; // Asegúrate de que está importado

@Component({
  selector: 'app-service-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-edit.component.html',
  styleUrls: ['../service-create/service-create.component.scss'] // Reutiliza los mismos estilos
})
export class ServiceEditComponent implements OnInit {
  serviceForm!: FormGroup;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  serviceUuid: string | null = null;

  constructor(
    private fb: FormBuilder,
    private offeredServiceService: OfferedServiceService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    // --- CAMBIO CLAVE: Hacer el servicio público para usarlo en el template ---
    public formErrorService: FormErrorService 
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServiceData();
  }

  private initForm(): void {
    // La estructura del formulario es idéntica a la de creación
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [''],
      durationMinutes: [30, [Validators.required, Validators.min(1)]],
      pricePerReservation: [0, [Validators.required, Validators.min(0)]],
      // --- AÑADIR capacity AL FORMULARIO ---
      capacity: [1, [Validators.required, Validators.min(1)]],
      isActive: [true, Validators.required],
    });
  }

  private loadServiceData(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const uuid = params.get('serviceUuid');
        if (!uuid) {
          this.router.navigate(['/my-services']);
          throw new Error('No service UUID provided');
        }
        this.serviceUuid = uuid;
        return this.offeredServiceService.getServiceByUuid(this.serviceUuid);
      })
    ).subscribe({
      next: (service) => {
        // Rellena el formulario con los datos del servicio, incluyendo la capacidad
        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          durationMinutes: service.defaultDurationSeconds / 60,
          pricePerReservation: service.pricePerReservation,
          capacity: service.capacity, // <-- RELLENAR capacity
          isActive: service.active
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el servicio para editar.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // --- ELIMINADO: La función getErrorMessage() ya no es necesaria aquí ---
  // public getErrorMessage(controlName: string): string | null { ... }

  onSubmit(): void {
    if (this.serviceForm.invalid || !this.serviceUuid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.serviceForm.value;
    const request: UpdateOfferedServiceRequest = {
      name: formValue.name,
      description: formValue.description,
      defaultDurationSeconds: formValue.durationMinutes * 60,
      pricePerReservation: formValue.pricePerReservation,
      capacity: formValue.capacity, // <-- AÑADIR capacity a la petición de actualización
      isActive: formValue.isActive,
    };

    this.offeredServiceService.updateService(this.serviceUuid, request).subscribe({
      next: () => {
        alert('¡Servicio actualizado con éxito!');
        this.router.navigate(['/my-services']);
      },
      error: (err: HttpErrorResponse) => {
        // Usamos el servicio centralizado para manejar el error
        this.errorMessage = this.formErrorService.handleServerValidationErrors(err, this.serviceForm);
        this.isSubmitting = false;
      }
    });
  }
  
  goBack(): void {
    this.location.back();
  }
}