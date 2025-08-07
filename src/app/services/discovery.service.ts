import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OfferedService } from '../models/offered-service.models';
import { UserResponseDTO } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class DiscoveryService {
  private providersApiUrl = `${environment.apiUrl}/api/providers`;

  constructor(private http: HttpClient) { }

  /**
   * Busca proveedores por un término de búsqueda.
   * @param query El nombre o parte del nombre del proveedor.
   */
  findProviders(query: string): Observable<UserResponseDTO[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<UserResponseDTO[]>(this.providersApiUrl, { params });
  }

  /**
   * Obtiene los servicios activos de un proveedor específico.
   * @param providerUuid El UUID del proveedor.
   */
  getServicesByProvider(providerUuid: string): Observable<OfferedService[]> {
    return this.http.get<OfferedService[]>(`${this.providersApiUrl}/${providerUuid}/services`);
  }
}