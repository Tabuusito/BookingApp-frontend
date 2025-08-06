import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateTimeSlotRequest, TimeSlotResponseDTO } from '../models/timeslot.models';

@Injectable({
  providedIn: 'root'
})
export class TimeSlotService {
  private publicTimeSlotUrl = `${environment.apiUrl}/api/timeslots`;
  private providerTimeSlotUrl = `${environment.apiUrl}/api/me/provider/timeslots`;
  private adminTimeSlotUrl = `${environment.apiUrl}/api/admin/timeslots`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los TimeSlots disponibles para un servicio en un rango de fechas. (Endpoint Público)
   */
  findAvailableTimeSlots(serviceUuid: string, from: string, to: string): Observable<TimeSlotResponseDTO[]> {
    let params = new HttpParams()
      .set('serviceUuid', serviceUuid)
      .set('from', from)
      .set('to', to);

    // Endpoint público, no requiere autenticación
    return this.http.get<TimeSlotResponseDTO[]>(this.publicTimeSlotUrl, { params });
  }

  /**
   * Crea un nuevo TimeSlot (para el proveedor autenticado). (Endpoint Privado de Proveedor)
   */
  createTimeSlot(request: CreateTimeSlotRequest): Observable<TimeSlotResponseDTO> {
    return this.http.post<TimeSlotResponseDTO>(this.providerTimeSlotUrl, request);
  }

  /**
   * Obtiene los detalles de un TimeSlot específico (para el proveedor o admin).
   */
  getTimeSlotByUuid(uuid: string): Observable<TimeSlotResponseDTO> {
    // Usamos el endpoint de proveedor para las llamadas normales del dueño del servicio
    return this.http.get<TimeSlotResponseDTO>(`${this.providerTimeSlotUrl}/${uuid}`);
  }

  /**
   * Cancela un TimeSlot (para el proveedor autenticado).
   */
  cancelTimeSlot(uuid: string): Observable<TimeSlotResponseDTO> {
    return this.http.delete<TimeSlotResponseDTO>(`${this.providerTimeSlotUrl}/${uuid}`);
  }

  // --- Métodos para ADMIN ---
  public getTimeSlotByUuidAdmin(uuid: string): Observable<TimeSlotResponseDTO> {
    return this.http.get<TimeSlotResponseDTO>(`${this.adminTimeSlotUrl}/${uuid}`);
  }
}