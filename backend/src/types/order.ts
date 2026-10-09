export interface Order {
  id: number;
  order_code: string;
  customer_id: number;
  box_count: number;
  price_per_box: number;
  total_price: number;
  delivery_latitude: number;
  delivery_longitude: number;
  status: string;
  notes?: string | null;
  order_date: string;
  customer_name?: string;
  first_name?: string;
  last_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_latitude?: number;
  customer_longitude?: number;
}

export interface OrderWithDistance extends Order {
  distance_km: number;
  distance_meters: number;
}

export interface CreateOrderDTO {
  customer_id: number;
  box_count: number;
  price_per_box?: number;
  delivery_latitude?: number;
  delivery_longitude?: number;
  status?: string;
  notes?: string;
}

export interface UpdateOrderDTO {
  customer_id?: number;
  box_count?: number;
  price_per_box?: number;
  delivery_latitude?: number;
  delivery_longitude?: number;
  status?: string;
  notes?: string;
}
