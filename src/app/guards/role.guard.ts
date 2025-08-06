import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

// Este es un "factory" para crear guardias de roles específicos
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (): Observable<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.userRoles$.pipe(
      take(1),
      map(userRoles => {
        // Comprueba si el usuario tiene al menos uno de los roles permitidos
        const hasPermission = allowedRoles.some(allowedRole => userRoles.includes(`ROLE_${allowedRole}`));
        
        if (hasPermission) {
          return true; // Permite el acceso
        } else {
          // Si no tiene permiso, redirige a la página principal
          console.warn(`Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`);
          return router.createUrlTree(['/home']);
        }
      })
    );
  };
}