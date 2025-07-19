import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OfferedServiceService } from '../../services/offered-service.service';
import { OfferedService } from '../../models/offered-service.models';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss']
})
export class ServiceManagementComponent implements OnInit {
  services: OfferedService[] = [];
  isLoading = true;

  constructor(private offeredServiceService: OfferedServiceService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.offeredServiceService.getMyServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los servicios', err);
        this.isLoading = false;
      }
    });
  }

  onStatusChange(service: OfferedService, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newStatus = input.checked;

    // Para evitar que el switch se quede "atascado" si la API falla,
    // revertimos el estado visualmente y solo lo actualizamos en el `next`.
    input.checked = !newStatus;

    this.offeredServiceService.updateServiceStatus(service.serviceUuid, newStatus).subscribe({
      next: (updatedService) => {
        // Encontramos el servicio en el array y lo actualizamos
        const index = this.services.findIndex(s => s.serviceUuid === updatedService.serviceUuid);
        if (index !== -1) {
          this.services[index] = updatedService;
        }
      },
      error: (err) => {
        console.error('Error al actualizar el estado del servicio', err);
        alert('No se pudo actualizar el estado del servicio.');
        // No es necesario revertir, ya lo hicimos al principio.
      }
    });
  }
}