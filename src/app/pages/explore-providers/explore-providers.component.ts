import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, catchError, startWith } from 'rxjs/operators';
import { DiscoveryService } from '../../services/discovery.service';
import { UserResponseDTO } from '../../models/user.models';

@Component({
  selector: 'app-explore-providers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './explore-providers.component.html',
  styleUrls: ['./explore-providers.component.scss']
})
export class ExploreProvidersComponent {
  searchControl = new FormControl('');
  providers$: Observable<UserResponseDTO[]>;
  isLoading = false;
  error = '';

  constructor(private discoveryService: DiscoveryService, private router: Router) {
    this.providers$ = this.searchControl.valueChanges.pipe(
      startWith(''), // Para hacer una búsqueda inicial al cargar
      debounceTime(300), // Espera 300ms después de que el usuario deja de escribir
      switchMap(query => {
        this.isLoading = true;
        this.error = '';
        return this.discoveryService.findProviders(query || '').pipe(
          catchError(err => {
            this.error = 'No se pudieron cargar los proveedores.';
            console.error(err);
            return of([]); // Devuelve un array vacío en caso de error
          })
        );
      })
    );
    // Suscripción para manejar el estado de carga
    this.providers$.subscribe(() => this.isLoading = false);
  }
  
  viewProviderProfile(providerUuid: string): void {
    this.router.navigate(['/providers', providerUuid]);
  }
}