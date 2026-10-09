export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at?: string;
  total_orders?: number;
}

export interface CustomerWithDistance extends Customer {
  distance_km: number;
  distance_meters: number;
}

export interface CreateCustomerDTO {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface UpdateCustomerDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}
