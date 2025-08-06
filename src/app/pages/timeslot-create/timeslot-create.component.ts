import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Modelos y Servicios necesarios
import { OfferedService } from '../../models/offered-service.models';
import { CreateTimeSlotRequest } from '../../models/timeslot.models';
import { OfferedServiceService } from '../../services/offered-service.service';
import { TimeSlotService } from '../../services/timeslot.service';
import { FormErrorService } from '../../services/form-error.service';

// Validador custom para asegurar que la hora de fin sea posterior a la de inicio
export const endTimeAfterStartTimeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;
  const startTime = formGroup.get('startTime')?.value;
  const endTime = formGroup.get('endTime')?.value;

  if (startTime && endTime && startTime >= endTime) {
    // Si la hora de fin no es posterior, devolvemos un error en el control 'endTime'
    return { endTimeNotAfterStart: true };
  }
  
  return null;
};

@Component({
  selector: 'app-timeslot-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './timeslot-create.component.html',
  styleUrls: ['./timeslot-create.component.scss']
})
export class TimeSlotCreateComponent implements OnInit {
  timeSlotForm!: FormGroup;
  providerServices: OfferedService[] = []; // Servicios del proveedor para elegir
  
  isLoadingServices = true;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private offeredServiceService: OfferedServiceService,
    private timeSlotService: TimeSlotService,
    private router: Router,
    private location: Location,
    public formErrorService: FormErrorService // Hacemos público para usarlo en el template
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProviderServices();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.timeSlotForm = this.fb.group({
      serviceUuid: [null, [Validators.required]],
      date: [today, [Validators.required]],
      // Usamos un sub-grupo para validar las horas juntas
      timeGroup: this.fb.group({
        startTime: ['', [Validators.required]],
        endTime: ['', [Validators.required]]
      }, { validators: endTimeAfterStartTimeValidator }),
      capacity: [null, [Validators.min(1)]], // Opcional, hereda del servicio si es nulo
      price: [null, [Validators.min(0)]],    // Opcional, hereda del servicio si es nulo
    });
  }

  private loadProviderServices(): void {
    this.isLoadingServices = true;
    // Obtenemos solo los servicios activos del proveedor
    this.offeredServiceService.getActiveServices().subscribe({
      next: (services) => {
        this.providerServices = services;
        this.isLoadingServices = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar tus servicios. Asegúrate de tener al menos un servicio activo.';
        this.isLoadingServices = false;
        console.error(err);
      },
    });
  }

  // Getter para un acceso más fácil a los controles
  get f() { return this.timeSlotForm.controls; }
  get timeGroup() { return this.timeSlotForm.get('timeGroup') as FormGroup; }

  onSubmit(): void {
    if (this.timeSlotForm.invalid) {
      this.timeSlotForm.markAllAsTouched();
      this.timeGroup.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.timeSlotForm.value;
    const timeGroupValue = this.timeGroup.value;

    // Combinamos fecha y hora para crear Instants en formato ISO
    const startTimeISO = new Date(`${formValue.date}T${timeGroupValue.startTime}`).toISOString();
    const endTimeISO = new Date(`${formValue.date}T${timeGroupValue.endTime}`).toISOString();

    const request: CreateTimeSlotRequest = {
      serviceUuid: formValue.serviceUuid,
      startTime: startTimeISO,
      endTime: endTimeISO,
      // Solo enviamos capacidad y precio si el usuario los ha introducido
      capacity: formValue.capacity || undefined,
      price: formValue.price || undefined,
    };

    this.timeSlotService.createTimeSlot(request).subscribe({
      next: () => {
        alert('¡Horario creado con éxito!');
        // Idealmente, redirigir a una vista de calendario del proveedor
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        // Usamos el servicio de errores para manejar errores de validación del backend
        this.errorMessage = this.formErrorService.handleServerValidationErrors(err, this.timeSlotForm);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}