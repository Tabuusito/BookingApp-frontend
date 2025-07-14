import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule, Location } from '@angular/common'; 
import { Router } from '@angular/router';

import { OfferedService } from '../../models/offered-service.models';
import { CreateReservationRequest } from '../../models/reservation.models';
import { OfferedServiceService } from '../../services/offered-service.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-reservation-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-create.component.html',
  styleUrls: ['./reservation-create.component.scss'],
})
export class ReservationCreateComponent implements OnInit {
  reservationForm!: FormGroup;
  availableServices: OfferedService[] = [];
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private offeredServiceService: OfferedServiceService,
    private reservationService: ReservationService,
    private router: Router,
    private location: Location // Inyecta Location
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServices();
  }

  private initForm(): void {
    this.reservationForm = this.fb.group({
      serviceId: [null, Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      notes: [''],
    });
  }

  private loadServices(): void {
    this.offeredServiceService.getActiveServices().subscribe({
      next: (services) => {
        this.availableServices = services;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los servicios. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error(err);
      },
    });
  }
  
  // Getter para un acceso más fácil a los controles del formulario en la plantilla
  get f() { return this.reservationForm.controls; }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    // Ya no necesitamos el successMessage aquí porque la redirección será inmediata

    const formValue = this.reservationForm.value;
    const startTime = new Date(`${formValue.date}T${formValue.time}`);
    const selectedService = this.availableServices.find(s => s.serviceId === formValue.serviceId);
    
    if (!selectedService) {
        this.errorMessage = 'Servicio seleccionado no válido.';
        this.isSubmitting = false;
        return;
    }
    const endTime = new Date(startTime.getTime() + selectedService.defaultDurationSeconds * 1000);

    const request: CreateReservationRequest = {
      serviceId: formValue.serviceId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes: formValue.notes,
    };

    // --- CAMBIO CLAVE AQUÍ ---
    this.reservationService.createReservation(request).subscribe({
      // El método createReservation devuelve la nueva reserva creada (ReservationResponseDTO)
      next: (newReservation) => {
        // Redirigir inmediatamente a la página de detalles de la nueva reserva
        this.router.navigate(['/reservations/detail', newReservation.reservationId]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocurrió un error al crear la reserva.';
        this.isSubmitting = false;
        console.error(err);
      },
    });
  }

  goBack(): void {
    this.location.back(); // Navega a la página anterior
  }
}