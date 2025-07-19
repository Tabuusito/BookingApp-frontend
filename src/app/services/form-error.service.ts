import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

// Ya no necesitamos la interfaz ValidationError

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  constructor() { }

  handleServerValidationErrors(error: HttpErrorResponse, form: FormGroup): string {
    if (error.status === 400 && error.error?.errors) {
      
      const validationErrors: { [key: string]: string } = error.error.errors;
      
      Object.keys(validationErrors).forEach(fieldKey => {
        
        // 'fieldKey' es el nombre del campo (ej. "name")
        // 'validationErrors[fieldKey]' es el mensaje de error (ej. "Debe tener...")
        const errorMessage = validationErrors[fieldKey];
        
        // Mapeamos el nombre del campo de la API al del formulario, si es necesario
        const formControl = form.get(this.mapApiFieldToForm(fieldKey));
        
        if (formControl) {
          // Asignamos el error al control del formulario
          formControl.setErrors({ serverError: errorMessage });
        }
      });

      return "Por favor, corrige los errores en el formulario.";
    }

    // Fallback para otros tipos de errores
    return error.error?.message || 'Ha ocurrido un error al procesar el formulario.';
  }

  // La función de mapeo se mantiene igual
  private mapApiFieldToForm(apiField: string): string {
    const map: { [key: string]: string } = {
      'defaultDurationSeconds': 'durationMinutes'
    };
    return map[apiField] || apiField;
  }
}