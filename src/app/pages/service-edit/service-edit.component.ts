import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { OfferedServiceService } from '../../services/offered-service.service';
import { UpdateOfferedServiceRequest } from '../../models/offered-service.models';

@Component({
  selector: 'app-service-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-edit.component.html', // Reutiliza la plantilla o una muy similar
  styleUrls: ['../service-create/service-create.component.scss'] // Reutiliza los estilos
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
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServiceData();
  }

  private initForm(): void {
    // La estructura del formulario es idéntica a la de creación
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      durationMinutes: [30, [Validators.required, Validators.min(1)]],
      pricePerReservation: [0, [Validators.required, Validators.min(0)]],
      isActive: [true, Validators.required],
    });
  }

  private loadServiceData(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const uuid = params.get('serviceUuid');
        if (!uuid) {
          this.router.navigate(['/my-services']); // Redirige si no hay ID
          throw new Error('No service UUID provided');
        }
        this.serviceUuid = uuid;
        return this.offeredServiceService.getServiceByUuid(this.serviceUuid);
      })
    ).subscribe({
      next: (service) => {
        // Rellena el formulario con los datos del servicio
        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          durationMinutes: service.defaultDurationSeconds / 60,
          pricePerReservation: service.pricePerReservation,
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

  get f() { return this.serviceForm.controls; }

  onSubmit(): void {
    if (this.serviceForm.invalid || !this.serviceUuid) {
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
      isActive: formValue.isActive,
    };

    this.offeredServiceService.updateService(this.serviceUuid, request).subscribe({
      next: () => {
        alert('¡Servicio actualizado con éxito!');
        this.router.navigate(['/my-services']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocurrió un error al actualizar el servicio.';
        this.isSubmitting = false;
      }
    });
  }
  
  goBack(): void {
    this.location.back();
  }
}