// Define los posibles estados de un Booking (reserva del cliente)
export type BookingStatus = 'PENDING_PAYMENT' | 'AWAITING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED_BY_CLIENT' | 'CANCELLED_BY_PROVIDER' | 'COMPLETED' | 'NO_SHOW';

// Interfaz para la respuesta de un Booking (lo que recibimos del backend)
export interface BookingResponseDTO {
  bookingUuid: string;
  status: BookingStatus;
  
  // Información del cliente
  clientUuid: string;
  clientUsername: string;
  
  // Información del timeslot
  timeSlotUuid: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601

  // Información del servicio asociado
  serviceUuid: string;
  serviceName: string;
  
  pricePaid: number;
  notes: string | null;
  
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Interfaz para crear un Booking (lo que enviamos al backend)
export interface CreateBookingRequest {
  timeSlotUuid: string;
  notes?: string;
}