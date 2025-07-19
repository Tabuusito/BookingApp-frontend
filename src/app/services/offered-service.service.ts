import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateOfferedServiceRequest, OfferedService, UpdateOfferedServiceRequest } from '../models/offered-service.models';

@Injectable({
  providedIn: 'root'
})
export class OfferedServiceService {
  // Cambiamos el endpoint a /api/me/services para las operaciones del usuario logueado
  private myServicesApiUrl = `${environment.apiUrl}/api/me/services`;
  private adminApiUrl = `${environment.apiUrl}/api/admin/services`;

  constructor(private http: HttpClient) { }

  // Obtiene los servicios del usuario logueado
  getMyServices(): Observable<OfferedService[]> {
    return this.http.get<OfferedService[]>(this.myServicesApiUrl, { params: { activeOnly: false } });
  }

  // Obtiene todos los servicios (usado para crear reservas)
  getActiveServices(): Observable<OfferedService[]> {
    return this.http.get<OfferedService[]>(this.myServicesApiUrl, { params: { activeOnly: true } });
  }

  // --- MÉTODO NUEVO PARA CREAR SERVICIO ---
  createService(request: CreateOfferedServiceRequest): Observable<OfferedService> {
    return this.http.post<OfferedService>(this.myServicesApiUrl, request);
  }

  getServiceByUuid(uuid: string): Observable<OfferedService> {
    // Según tu API, el endpoint para obtener un servicio por ID es /api/me/services/{id}
    return this.http.get<OfferedService>(`${this.myServicesApiUrl}/${uuid}`);
  }

  updateService(uuid: string, request: UpdateOfferedServiceRequest): Observable<OfferedService> {
    return this.http.put<OfferedService>(`${this.myServicesApiUrl}/${uuid}`, request);
  }
  
  // Opcional: un método específico para cambiar el estado es muy útil
  updateServiceStatus(uuid: string, isActive: boolean): Observable<OfferedService> {
    const request: UpdateOfferedServiceRequest = { isActive };
    return this.updateService(uuid, request);
  }
}