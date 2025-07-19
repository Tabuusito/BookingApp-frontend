import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateReservationRequest, ReservationResponseDTO } from '../models/reservation.models';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/api/me/reservations`;

  constructor(private http: HttpClient) { }

  getMyReservations(): Observable<ReservationResponseDTO[]> {
    return this.http.get<ReservationResponseDTO[]>(this.apiUrl);
  }

  cancelMyReservation(uuid: string): Observable<ReservationResponseDTO> {
    return this.http.post<ReservationResponseDTO>(`${this.apiUrl}/${uuid}/cancel`, {});
  }

  createReservation(request: CreateReservationRequest): Observable<ReservationResponseDTO> {
    return this.http.post<ReservationResponseDTO>(this.apiUrl, request);
  }

  getReservationByUuid(uuid: string): Observable<ReservationResponseDTO> {
    return this.http.get<ReservationResponseDTO>(`${this.apiUrl}/${uuid}`);
  }
}