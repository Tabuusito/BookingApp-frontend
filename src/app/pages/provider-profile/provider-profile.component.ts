import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, forkJoin } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { DiscoveryService } from '../../services/discovery.service';
import { OfferedService } from '../../models/offered-service.models';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.scss']
})
export class ProviderProfileComponent implements OnInit {
  providerUuid: string | null = null;
  // providerInfo$: Observable<UserResponseDTO>; // Podrías cargar esto también
  services$: Observable<OfferedService[]> | undefined;
  
  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.isLoadingSubject.asObservable();
  
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private discoveryService: DiscoveryService
  ) {}

  ngOnInit(): void {
    this.services$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.providerUuid = params.get('providerUuid');
        if (!this.providerUuid) {
          this.error = 'No se encontró el proveedor.';
          this.isLoadingSubject.next(false); // Detenemos la carga
          return EMPTY; // Usamos EMPTY para un observable que termina sin emitir
        }
        return this.discoveryService.getServicesByProvider(this.providerUuid);
      }),
      tap(() => {
        // La carga termina después de que los datos llegan
        this.isLoadingSubject.next(false); 
      }),
      catchError(err => {
        this.error = 'No se pudieron cargar los servicios de este proveedor.';
        this.isLoadingSubject.next(false); // La carga también termina en caso de error
        console.error(err);
        return EMPTY; // Devolvemos un observable vacío para que la cadena no se rompa
      })
    );
  }
  
  goToBooking(serviceUuid: string): void {
    // Navega al formulario de creación de booking, pasando el serviceUuid
    this.router.navigate(['/bookings/new'], { queryParams: { serviceUuid: serviceUuid } });
  }
}