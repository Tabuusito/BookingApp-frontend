import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  constructor() { }

  /**
   * Obtiene un mensaje de error legible para un control de formulario específico.
   * Centraliza la lógica de mensajes de error para toda la aplicación.
   * @param form El FormGroup que contiene el control.
   * @param controlName El nombre del control (ej. 'name', 'capacity').
   * @returns Un string con el mensaje de error o null si no hay error que mostrar.
   */
  public getErrorMessage(form: FormGroup, controlName: string): string | null {
    const control = form.get(controlName);

    // No mostrar error si el control es nulo, es válido o no ha sido "tocado"
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return null;
    }

    const errors = control.errors;
    if (errors) {
      if (errors['required']) {
        return 'Este campo es requerido.';
      }
      if (errors['minlength']) {
        const requiredLength = errors['minlength'].requiredLength;
        return `Debe tener al menos ${requiredLength} caracteres.`;
      }
      if (errors['min']) {
        const minValue = errors['min'].min;
        return `El valor debe ser como mínimo ${minValue}.`;
      }
       if (errors['max']) {
        const maxValue = errors['max'].max;
        return `El valor no debe superar ${maxValue}.`;
      }
      if (errors['email']) {
        return 'Por favor, introduce un email válido.';
      }
      // Validador custom que creamos en TimeSlotCreateComponent
      if (errors['endTimeNotAfterStart']) {
        return 'La hora de fin debe ser posterior a la de inicio.';
      }
      // Error inyectado desde el backend
      if (errors['serverError']) {
        return errors['serverError'];
      }
    }

    // Mensaje genérico si no se encuentra un error específico
    return 'El valor ingresado no es válido.';
  }

  /**
   * Procesa los errores de validación 400 del backend y los asigna
   * a los controles de formulario correspondientes.
   * @param error La respuesta HttpErrorResponse del servidor.
   * @param form El FormGroup a actualizar.
   * @returns Un mensaje de error genérico para mostrar al usuario.
   */
  public handleServerValidationErrors(error: HttpErrorResponse, form: FormGroup): string {
    if (error.status === 400 && error.error?.errors) {
      const validationErrors: { [key: string]: string } = error.error.errors;
      
      Object.keys(validationErrors).forEach(fieldKey => {
        const errorMessage = validationErrors[fieldKey];
        const formControl = form.get(this.mapApiFieldToForm(fieldKey));
        
        if (formControl) {
          formControl.setErrors({ serverError: errorMessage });
        }
      });

      return "Por favor, corrige los errores resaltados en el formulario.";
    }

    return error.error?.message || 'Ha ocurrido un error inesperado al procesar el formulario.';
  }
  
  // Mapea nombres de campos del backend a nombres de campos del formulario
  private mapApiFieldToForm(apiField: string): string {
    const map: { [key: string]: string } = {
      'defaultDurationSeconds': 'durationMinutes'
    };
    return map[apiField] || apiField;
  }
}