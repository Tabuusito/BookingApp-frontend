import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location, registerLocaleData } from '@angular/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import localeEs from '@angular/common/locales/es';

import { ReservationService } from '../../services/reservation.service';
import { ReservationResponseDTO } from '../../models/reservation.models';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]
})
export class ReservationDetailComponent implements OnInit {
  reservation$: Observable<ReservationResponseDTO> | undefined;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Usamos el observable de la ruta para obtener el ID.
    // switchMap cancela la petición anterior si el ID cambia (útil en SPA).
    this.reservation$ = this.route.paramMap.pipe(
      switchMap(params => {
        const uuid = params.get('reservationUuid');
        if (uuid) {
          this.isLoading = true;
          this.errorMessage = '';
          return this.reservationService.getReservationByUuid(uuid);
        } else {
          this.errorMessage = 'No se encontró el UUID de la reserva.';
          this.isLoading = false;
          return new Observable<ReservationResponseDTO>(); // Devuelve un observable vacío si no hay ID
        }
      })
    );

    // Nos suscribimos para manejar los estados de carga y error.
    this.reservation$.subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        this.errorMessage = 'No se pudo cargar la reserva. Es posible que no exista o no tengas permiso para verla.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}