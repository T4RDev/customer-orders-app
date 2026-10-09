import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  notes?: string;
  order_date: string;
  customer_name?: string;
  first_name?: string;
  last_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  distance_km?: number;
  distance_meters?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  deleted_count?: number;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? (window.location.port === '4200' ? 'http://localhost:3000/api/orders' : '/api/orders')
    : 'https://customer-orders-app.onrender.com/api/orders';

  getOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(this.baseUrl);
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/${id}`);
  }

  createOrder(order: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.baseUrl, order);
  }

  updateOrder(id: number, order: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/${id}`, order);
  }

  updateBoxCount(id: number, box_count: number): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.baseUrl}/${id}/box-count`, { box_count });
  }

  deleteOrder(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}`);
  }

  seedOrders(count: number = 25): Observable<ApiResponse<Order[]>> {
    return this.http.post<ApiResponse<Order[]>>(`${this.baseUrl}/seed`, null, {
      params: { count: count.toString() }
    });
  }

  clearOrders(): Observable<ApiResponse<{ message: string; deleted_count: number }>> {
    return this.http.delete<ApiResponse<{ message: string; deleted_count: number }>>(`${this.baseUrl}/clear`);
  }

  getNearbyOrders(lat: number, lng: number, radius: number = 2.0): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/nearby`, {
      params: {
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString()
      }
    });
  }
}
