import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si la petición es a nuestra API y tenemos un token, lo añadimos
  if (token && req.url.includes(authService['apiUrl'])) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
    return next(cloned);
  }

  // Si no, la petición sigue su curso sin modificar
  return next(req);
};