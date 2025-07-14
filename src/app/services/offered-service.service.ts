import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OfferedService } from '../models/offered-service.models';

@Injectable({
  providedIn: 'root'
})
export class OfferedServiceService {
  private apiUrl = `${environment.apiUrl}/api/admin/services`;

  constructor(private http: HttpClient) { }

  // Obtenemos solo los servicios activos
  getActiveServices(): Observable<OfferedService[]> {
    return this.http.get<OfferedService[]>(this.apiUrl, { params: { activeOnly: true } });
  }
}