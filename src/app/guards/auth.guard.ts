import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (
  _route, // ActivatedRouteSnapshot - no lo usamos directamente aquí, pero está disponible
  _state  // RouterStateSnapshot - no lo usamos directamente aquí, pero está disponible
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1), // Tomar el primer valor emitido y completar
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true; // El usuario está logueado, permite el acceso a la ruta
      } else {
        // El usuario no está logueado, redirige a la página de login
        // Es mejor retornar un UrlTree para la redirección en los guardias funcionales
        return router.createUrlTree(['/login']);
      }
    })
  );
};