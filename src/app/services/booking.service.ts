import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateBookingRequest, BookingResponseDTO } from '../models/booking.models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Endpoint de la API del usuario autenticado
  private myBookingsApiUrl = `${environment.apiUrl}/api/me/bookings`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los bookings del usuario autenticado.
   */
  getMyBookings(): Observable<BookingResponseDTO[]> {
    return this.http.get<BookingResponseDTO[]>(this.myBookingsApiUrl);
  }

  /**
   * Crea un nuevo booking para un TimeSlot.
   * @param request El objeto de petición de creación de booking.
   */
  createBooking(request: CreateBookingRequest): Observable<BookingResponseDTO> {
    return this.http.post<BookingResponseDTO>(this.myBookingsApiUrl, request);
  }

  /**
   * Cancela un booking específico del usuario.
   * @param uuid El UUID del booking a cancelar.
   */
  cancelMyBooking(uuid: string): Observable<BookingResponseDTO> {
    // La API de cancelación es un POST al endpoint específico
    return this.http.post<BookingResponseDTO>(`${this.myBookingsApiUrl}/${uuid}/cancel`, {});
  }

  /**
   * Obtiene los detalles de un booking específico por su UUID.
   * @param uuid El UUID del booking.
   */
  getBookingByUuid(uuid: string): Observable<BookingResponseDTO> {
    return this.http.get<BookingResponseDTO>(`${this.myBookingsApiUrl}/${uuid}`);
  }

}