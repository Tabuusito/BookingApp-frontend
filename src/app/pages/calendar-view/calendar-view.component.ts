import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import localeEs from '@angular/common/locales/es';
import { Subject } from 'rxjs';

// Librerías de angular-calendar
import { CalendarEvent, CalendarView, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Recursos locales
import { colors } from './colors';
// --- IMPORTS ACTUALIZADOS ---
import { BookingService } from '../../services/booking.service';
import { BookingResponseDTO } from '../../models/booking.models';
import { AuthService } from '../../auth/auth.service';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, 
  imports: [
    CommonModule,
    RouterLink,
    CalendarModule 
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }] // Establecer español para los pipes
})
export class CalendarViewComponent implements OnInit {

  // --- PROPIEDADES BÁSICAS DEL CALENDARIO ---
  view: CalendarView = CalendarView.Week; // Empezamos en vista de semana, más útil
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  isLoading = true;

  // --- PROPIEDADES PARA INTERACTIVIDAD ---
  refresh = new Subject<void>(); 
  activeDayIsOpen: boolean = false; 

  @ViewChild('modalContent', { static: true }) modalContent?: TemplateRef<any>;
  modalData?: {
    action: string;
    event: CalendarEvent;
  };
  
  constructor(
    private bookingService: BookingService, // <-- CAMBIO: Inyectar BookingService
    private authService: AuthService, // Para saber si es cliente o proveedor
    private modal: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    // La carga de datos ahora depende del rol del usuario.
    // Por ahora, asumimos que el calendario muestra los bookings de un CLIENTE.
    // Si un proveedor viera su calendario, debería mostrar sus TimeSlots.
    this.authService.isClient().subscribe(isClient => {
      if (isClient) {
        this.loadClientBookings();
      } else {
        // Lógica futura para proveedores: this.loadProviderTimeSlots();
        this.isLoading = false;
      }
    });
  }

  // --- MÉTODOS DE OBTENCIÓN Y MAPEO DE DATOS ---

  loadClientBookings(): void {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({ // <-- CAMBIO: Llamar al nuevo servicio
      next: (bookings) => {
        this.events = bookings.map((booking: BookingResponseDTO): CalendarEvent => {
          let eventColor = colors['blue'];
          if (booking.status === 'CONFIRMED') eventColor = colors['green'];
          if (booking.status.startsWith('CANCELLED')) eventColor = colors['red'];
          if (booking.status === 'AWAITING_CONFIRMATION') eventColor = colors['yellow'];

          return {
            start: new Date(booking.startTime),
            end: new Date(booking.endTime),
            title: `${booking.serviceName}`, // Título simplificado, el cliente ya sabe que es suyo
            color: { ...eventColor },
            allDay: false,
            resizable: { beforeStart: false, afterEnd: false },
            draggable: false,
            // Guardamos el objeto booking original en la metadata del evento
            meta: {
              booking: booking,
            },
          };
        });
        this.isLoading = false;
        this.refresh.next();
      },
      error: (err) => {
        console.error("Error al cargar los bookings para el calendario", err);
        this.isLoading = false;
      }
    });
  }

  // --- MÉTODOS DE MANEJO DE EVENTOS DEL CALENDARIO (sin cambios estructurales) ---

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (this.view === CalendarView.Month) {
      if (events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = !this.activeDayIsOpen;
        this.viewDate = date;
      }
    } else if (this.view === CalendarView.Week) {
        this.viewDate = date;
        this.view = CalendarView.Day;
    }
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    // Redirigimos al detalle del booking al hacer clic en un evento
    if (event.meta?.booking?.bookingUuid) {
      this.router.navigate(['/bookings/detail', event.meta.booking.bookingUuid]);
    } else {
        // Fallback a un modal si no se puede redirigir
        this.modalData = { event, action };
        if (this.modalContent) {
          this.modal.open(this.modalContent, { size: 'lg' });
        }
    }
  }
}