import { Component, OnInit, OnDestroy, LOCALE_ID } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { ReservationResponseDTO } from '../../models/reservation.models';
import { Subscription } from 'rxjs';
import { CommonModule, registerLocaleData } from '@angular/common'; // <-- Necesario para los pipes
import { FormsModule } from '@angular/forms';
import localeEs from '@angular/common/locales/es';
import { Router, RouterLink } from '@angular/router';

registerLocaleData(localeEs, 'es'); // Registra el idioma español para los pipes

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }] // Establece español por defecto
})
export class HomeComponent implements OnInit, OnDestroy {
  userName: string | null = 'Usuario';
  upcomingReservations: ReservationResponseDTO[] = [];
  pastReservations: ReservationResponseDTO[] = [];
  isLoading = true;
  private userSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(name => {
      this.userName = name || 'Usuario';
    });
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        const now = new Date();
        // Filtrar y ordenar
        this.upcomingReservations = data
          .filter(res => new Date(res.startTime) >= now && res.status !== 'CANCELLED')
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        this.pastReservations = data
          .filter(res => new Date(res.startTime) < now || res.status === 'CANCELLED')
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar las reservas', err);
        this.isLoading = false;
      }
    });
  }

  cancelReservation(uuid: string): void {
    if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      this.reservationService.cancelMyReservation(uuid).subscribe({
        next: () => {
          alert('Reserva cancelada con éxito');
          this.loadReservations(); // Recargar la lista
        },
        error: (err) => {
          alert('Error al cancelar la reserva');
          console.error(err);
        }
      });
    }
  }

  goToCalendarView(): void {
    this.router.navigate(['/calendar']);
  }

  goToReservationCreation(): void {
    this.router.navigate(['/reservations/new']);
  }

  goToMyServices(): void {
    this.router.navigate(['/services'])
  }

  navigateToReservationDetails(reservationUuid: string): void {
    this.router.navigate(['/reservations/detail', reservationUuid])
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}