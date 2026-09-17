export interface CarpoolMatch {
  id: string;
  compatibilityScore: number;
  detourKm: number;
  status: string;
  request?: {
    id: string;
    origin: { label: string };
    destination: { label: string };
    departureTime: string;
  };
  matchedUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CarpoolRequestInput {
  origin: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
  departureTime: string;
  availableSeats: number;
  maxDetourKm: number;
}
