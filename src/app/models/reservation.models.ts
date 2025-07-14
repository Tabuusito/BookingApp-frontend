export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';


export interface ReservationResponseDTO {
  reservationId: number;
  ownerId: number;
  ownerUsername: string;
  serviceId: number;
  serviceName: string;
  startTime: string; // Formato ISO 8601, ej: "2024-05-21T10:00:00Z"
  endTime: string;   // Formato ISO 8601, ej: "2024-05-21T11:00:00Z"
  status: ReservationStatus;
  price: number;
  notes: string | null; // Puede ser nulo si no hay notas
  createdAt: string; // Formato ISO 8601
  updatedAt: string; // Formato ISO 8601
}

export interface CreateReservationRequest {
  // ownerId será añadido por el backend a partir del token JWT
  serviceId: number;
  startTime: string; // Formato ISO
  endTime: string;   // Formato ISO
  notes?: string;    // Opcional
}