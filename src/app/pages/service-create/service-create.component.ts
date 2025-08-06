import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { OfferedServiceService } from '../../services/offered-service.service';
import { CreateOfferedServiceRequest } from '../../models/offered-service.models';
import { FormErrorService } from '../../services/form-error.service'; // Asegúrate de importar el servicio

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
  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private offeredServiceService: OfferedServiceService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    // --- CAMBIO CLAVE: Hacer el servicio público ---
    public formErrorService: FormErrorService 
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.queryParamMap.subscribe(params => {
        this.returnUrl = params.get('returnTo');
    });
  }

  private initForm(): void {
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

  // --- ELIMINADO: La función getErrorMessage() ya no es necesaria aquí ---
  
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
      defaultDurationSeconds: formValue.durationMinutes * 60,
      pricePerReservation: formValue.pricePerReservation,
      capacity: formValue.capacity, // <-- AÑADIR capacity a la petición
      isActive: formValue.isActive,
    };

    this.offeredServiceService.createService(request).subscribe({
      next: (newService) => {
        alert('¡Servicio creado con éxito!');
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigate(['/my-services']); 
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.formErrorService.handleServerValidationErrors(err, this.serviceForm);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}