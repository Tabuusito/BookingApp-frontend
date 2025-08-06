// Define los posibles estados de un TimeSlot (la oferta del proveedor)
export type TimeSlotStatus = 'AVAILABLE' | 'FULL' | 'CANCELLED';

// Interfaz para la respuesta de un TimeSlot (lo que recibimos del backend)
export interface TimeSlotResponseDTO {
  timeSlotUuid: string;
  serviceUuid: string;
  serviceName: string;
  providerUuid: string;

  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  
  price: number;
  status: TimeSlotStatus;
  
  capacity: number;
  availableSlots: number;
}

// Interfaz para crear un TimeSlot (lo que enviamos al backend)
export interface CreateTimeSlotRequest {
  serviceUuid: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  capacity?: number; // Opcional, si no se usa se toma el del servicio
  price?: number;    // Opcional, si no se usa se toma el del servicio
}