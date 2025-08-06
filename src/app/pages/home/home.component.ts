import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import localeEs from '@angular/common/locales/es';

import { AuthService } from '../../auth/auth.service';
// NUEVOS IMPORTS
import { BookingService } from '../../services/booking.service';
import { BookingResponseDTO } from '../../models/booking.models';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class HomeComponent implements OnInit {
  // Observables para controlar la UI
  userName$: Observable<string | null>;
  isClient$: Observable<boolean>;
  isProvider$: Observable<boolean>;

  // Datos para la vista de cliente
  upcomingBookings: BookingResponseDTO[] = [];
  pastBookings: BookingResponseDTO[] = [];
  isLoading = false; // Se activa solo cuando es necesario

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) {
    // Inicializamos los observables directamente desde el servicio
    this.userName$ = this.authService.currentUser$;
    this.isClient$ = this.authService.isClient();
    this.isProvider$ = this.authService.isProvider();
  }

  ngOnInit(): void {
    // Cargamos los bookings del cliente si tiene ese rol
    this.loadClientBookings();
  }

  private loadClientBookings(): void {
    this.isClient$.pipe(
      take(1), // Solo necesitamos saber el rol una vez para decidir si cargar
      switchMap(isClient => {
        if (isClient) {
          this.isLoading = true;
          return this.bookingService.getMyBookings();
        }
        // Si no es cliente, devolvemos un observable vacío para que no haga nada
        return new Observable<BookingResponseDTO[]>(subscriber => subscriber.complete());
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          const now = new Date();
          this.upcomingBookings = data
            .filter(b => new Date(b.startTime) >= now && !b.status.startsWith('CANCELLED'))
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          
          this.pastBookings = data
            .filter(b => new Date(b.startTime) < now || b.status.startsWith('CANCELLED'))
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los bookings', err);
        this.isLoading = false;
      }
    });
  }

  cancelBooking(uuid: string): void {
    if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      this.bookingService.cancelMyBooking(uuid).subscribe({
        next: () => {
          alert('Reserva cancelada con éxito');
          this.loadClientBookings();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al cancelar la reserva');
          console.error(err);
        }
      });
    }
  }

  // --- Métodos de Navegación ---
  
  // Para Clientes
  goToBookingCreation(): void {
    // Esta ruta ahora llevará a un buscador de TimeSlots
    this.router.navigate(['/bookings/new']); 
  }

  goToCalendarView(): void {
    this.router.navigate(['/calendar']);
  }

  navigateToBookingDetails(bookingUuid: string): void {
    this.router.navigate(['/bookings/detail', bookingUuid]);
  }

  // Para Proveedores
  goToServiceManagement(): void {
    this.router.navigate(['/my-services']);
  }
  
  goToTimeSlotCreation(): void {
    this.router.navigate(['/provider/timeslots/new']);
  }

  logout(): void {
    this.authService.logout();
  }
}