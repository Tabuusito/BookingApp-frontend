export interface OfferedService {
  serviceId: number;
  ownerId: number;
  name: string;
  description: string | null;
  pricePerReservation: number;
  active: boolean;
  defaultDurationSeconds: number;
}

export interface CreateOfferedServiceRequest {
  name: string;
  description?: string;
  defaultDurationSeconds: number;
  pricePerReservation: number;
  isActive: boolean;
}

export interface UpdateOfferedServiceRequest {
  name?: string;
  description?: string;
  defaultDurationSeconds?: number;
  pricePerReservation?: number;
  isActive?: boolean;
}