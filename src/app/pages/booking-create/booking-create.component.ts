import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// IMPORTS ACTUALIZADOS
import { OfferedService } from '../../models/offered-service.models';
import { TimeSlotResponseDTO } from '../../models/timeslot.models';
import { OfferedServiceService } from '../../services/offered-service.service';
import { TimeSlotService } from '../../services/timeslot.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-create.component.html', // Necesitarás una nueva plantilla
  styleUrls: ['./booking-create.component.scss'] // Necesitarás nuevos estilos
})
export class BookingCreateComponent implements OnInit {
  searchForm!: FormGroup;
  availableServices: OfferedService[] = [];
  availableTimeSlots: TimeSlotResponseDTO[] = [];
  
  isLoadingServices = true;
  isSearching = false;
  isSubmitting = false;

  selectedSlot: TimeSlotResponseDTO | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private offeredServiceService: OfferedServiceService,
    private timeSlotService: TimeSlotService,
    private bookingService: BookingService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServices();

    this.route.queryParamMap.subscribe(params => {
      const serviceUuid = params.get('serviceUuid');
      if (serviceUuid) {
        // Pre-selecciona el servicio en el formulario
        this.searchForm.get('serviceUuid')?.setValue(serviceUuid);
        // Opcional: puedes disparar la búsqueda de slots automáticamente
        this.onSearchSlots();
      }
    });
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato YYYY-MM-DD
    this.searchForm = this.fb.group({
      serviceUuid: [null, Validators.required],
      date: [today, Validators.required]
    });
  }

  private loadServices(): void {
    this.offeredServiceService.getActiveServices().subscribe({
      next: (services) => {
        this.availableServices = services;
        this.isLoadingServices = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los servicios.';
        this.isLoadingServices = false;
      }
    });
  }

  onSearchSlots(): void {
    if (this.searchForm.invalid) return;

    this.isSearching = true;
    this.availableTimeSlots = [];
    this.selectedSlot = null;
    this.errorMessage = '';

    const { serviceUuid, date } = this.searchForm.value;
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(date);
    to.setHours(23, 59, 59, 999);

    this.timeSlotService.findAvailableTimeSlots(serviceUuid, from.toISOString(), to.toISOString()).subscribe({
      next: (slots) => {
        this.availableTimeSlots = slots.filter(s => s.availableSlots > 0 && s.status === 'AVAILABLE');
        this.isSearching = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al buscar horarios disponibles.';
        this.isSearching = false;
      }
    });
  }

  selectSlot(slot: TimeSlotResponseDTO): void {
    this.selectedSlot = slot;
  }

  onConfirmBooking(): void {
    if (!this.selectedSlot) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.bookingService.createBooking({ timeSlotUuid: this.selectedSlot.timeSlotUuid }).subscribe({
      next: (newBooking) => {
        // Redirigir a la página de detalles del nuevo booking
        this.router.navigate(['/bookings/detail', newBooking.bookingUuid]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocurrió un error al crear la reserva.';
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}