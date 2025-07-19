import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

// Podrías usar un servicio de notificaciones (Toastr, etc.) para mostrar los errores.
// Por ahora, usaremos alert() para simplicidad.

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente o de red.
        errorMessage = `Error de red: ${error.error.message}`;
      } else {
        // El backend devolvió un código de error.
        switch (error.status) {
          case 401: // No autorizado
            errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
            authService.logout(); // Desloguear al usuario
            break;
          case 403: // Prohibido
            errorMessage = 'No tienes permiso para realizar esta acción.';
            break;
          case 404: // No encontrado
            errorMessage = 'El recurso solicitado no se ha encontrado.';
            break;
          case 500: // Error interno del servidor
            errorMessage = 'Ha ocurrido un error en el servidor. Nuestro equipo ha sido notificado.';
            break;
          case 400: // Bad Request (Validación)
            // ESTE ES EL CASO ESPECIAL.
            // Lo dejamos pasar para que el componente lo maneje.
            // Simplemente relanzamos el error para que el `subscribe` del componente lo reciba.
            return throwError(() => error); 
          default:
            // Para otros errores 4xx, podemos usar el mensaje de la API si existe.
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
            break;
        }
      }
      
      // Para todos los errores excepto el 400, mostramos un alert y paramos el flujo.
      alert(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};