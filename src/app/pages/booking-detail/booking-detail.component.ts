import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location, registerLocaleData } from '@angular/common';
import { Observable, EMPTY } from 'rxjs'; // Importar EMPTY
import { switchMap, catchError } from 'rxjs/operators';
import localeEs from '@angular/common/locales/es';

// IMPORTS ACTUALIZADOS
import { BookingService } from '../../services/booking.service';
import { BookingResponseDTO } from '../../models/booking.models';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-detail.component.html', // Renombrar la plantilla
  styleUrls: ['./booking-detail.component.scss'], // Renombrar los estilos
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class BookingDetailComponent implements OnInit {
  booking$: Observable<BookingResponseDTO> | undefined;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService, // Inyectar el servicio correcto
    private location: Location
  ) {}

  ngOnInit(): void {
    this.booking$ = this.route.paramMap.pipe(
      switchMap(params => {
        // CAMBIO: El parámetro de la ruta ahora es 'bookingUuid'
        const uuid = params.get('bookingUuid');
        if (uuid) {
          this.isLoading = true;
          this.errorMessage = '';
          return this.bookingService.getBookingByUuid(uuid); // Llamar al método correcto
        } else {
          this.errorMessage = 'No se encontró el UUID del booking.';
          this.isLoading = false;
          return EMPTY; // Usar EMPTY para un observable que nunca emite
        }
      }),
      catchError(err => {
        this.errorMessage = 'No se pudo cargar el booking. Es posible que no exista o no tengas permiso para verlo.';
        this.isLoading = false;
        console.error(err);
        return EMPTY;
      })
    );

    // La suscripción para manejar estados puede ser eliminada si el catchError ya los maneja
    this.booking$.subscribe(() => this.isLoading = false);
  }

  goBack(): void {
    this.location.back();
  }
}