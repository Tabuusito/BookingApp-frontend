export interface OfferedService {
  serviceId: number;
  ownerId: number;
  name: string;
  description: string | null;
  pricePerReservation: number;
  active: boolean;
  defaultDurationSeconds: number;
}