import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- Importar RouterLink
import localeEs from '@angular/common/locales/es';

// Librerías de angular-calendar
import { CalendarEvent, CalendarView, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // <-- Asumimos que usarás ng-bootstrap para modales

// Recursos locales
import { colors } from './colors';
import { ReservationService } from '../../services/reservation.service';
import { ReservationResponseDTO } from '../../models/reservation.models';

registerLocaleData(localeEs); // Registrar el idioma para los pipes del calendario

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  // La estrategia OnPush es recomendada para el calendario por rendimiento
  changeDetection: ChangeDetectionStrategy.OnPush, 
  imports: [
    CommonModule,
    RouterLink,
    CalendarModule 
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
})
export class CalendarViewComponent implements OnInit {

  // --- PROPIEDADES BÁSICAS DEL CALENDARIO ---
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView; // Expone el enum a la plantilla
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  isLoading = true;

  // --- PROPIEDADES PARA INTERACTIVIDAD ---
  
  // Para forzar la actualización del calendario
  refresh = new Subject<void>(); 

  // Para gestionar la vista de "día abierto" en la vista de mes
  activeDayIsOpen: boolean = false; 

  // Para el contenido del modal
  @ViewChild('modalContent', { static: true }) modalContent?: TemplateRef<any>;
  modalData?: {
    action: string;
    event: CalendarEvent;
  };
  
  constructor(
    private reservationService: ReservationService,
    private modal: NgbModal // <-- Inyectar el servicio de modales
  ) {}

  ngOnInit(): void {
    this.loadAndMapReservations();
  }

  // --- MÉTODOS DE OBTENCIÓN Y MAPEO DE DATOS ---

  loadAndMapReservations(): void {
    this.isLoading = true;
    this.reservationService.getMyReservations().subscribe(reservations => {
      this.events = reservations.map((res: ReservationResponseDTO): CalendarEvent => {
        let eventColor = colors['blue']; // Color por defecto
        if (res.status === 'CONFIRMED') eventColor = colors['green'];
        if (res.status === 'PENDING') eventColor = colors['yellow'];
        if (res.status === 'CANCELLED') eventColor = colors['red'];

        return {
          start: new Date(res.startTime),
          end: new Date(res.endTime),
          title: `${res.serviceName} (${res.ownerUsername})`, // Título más descriptivo
          color: { ...eventColor },
          allDay: false, // Las reservas suelen tener hora de inicio y fin
          resizable: {
            beforeStart: false, // Deshabilitar redimensionamiento por ahora
            afterEnd: false,
          },
          draggable: false, // Deshabilitar arrastrar y soltar por ahora
          meta: {
            reservation: res, // Guardamos el objeto original
          },
        };
      });
      this.isLoading = false;
      this.refresh.next(); // Notifica al calendario que los eventos han cambiado
    });
  }

  // --- MÉTODOS DE MANEJO DE EVENTOS DEL CALENDARIO ---

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (events.length === 0) {
      this.activeDayIsOpen = false;
      return;
    }
    // Si ya está abierto, lo cerramos. Si no, lo abrimos.
    this.activeDayIsOpen = !this.activeDayIsOpen;
    this.viewDate = date;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    if (this.modalContent) {
      this.modal.open(this.modalContent, { size: 'lg' });
    }
  }

  // Placeholder para futuras funcionalidades de arrastrar/redimensionar
  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    // Aquí iría la lógica para actualizar la reserva en el backend
    console.log('Evento movido o redimensionado', { event, newStart, newEnd });
  }
}