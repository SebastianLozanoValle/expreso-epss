export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  images?: string[];
  capacity: {
    adults: number;
    children: number;
    babies: number;
  };
  amenities: string[];
  size: string; // ej: "10m²"
  view: string; // ej: "Vista a la ciudad"
  bedType: string; // ej: "1 cama individual"
  policies: {
    refundable: boolean;
    payLater: boolean;
    cancellationPolicy: string;
  };
  availability: {
    available: boolean;
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  rates: {
    soloUsuario: number;
    usuarioAcompañante: number;
    usuarioDosAcompañantes: number;
  };
  hotel: {
    id: string;
    name: string;
    location: string;
  };
}

export interface RoomsData {
  rooms: Room[];
  total: number;
  filters?: {
    priceRange?: {
      min: number;
      max: number;
    };
    capacity?: {
      adults: number;
      children: number;
    };
    amenities?: string[];
  };
}
