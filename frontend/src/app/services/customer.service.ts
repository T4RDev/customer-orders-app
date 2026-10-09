import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  total_orders?: number;
  distance_km?: number;
  distance_meters?: number;
  orders?: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private baseUrl = (typeof window !== 'undefined' && window.location.port === '4200')
    ? 'http://localhost:3000/api/customers'
    : '/api/customers';

  getCustomers(): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(this.baseUrl);
  }

  getCustomerById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`);
  }

  createCustomer(customer: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.baseUrl, customer);
  }

  updateCustomer(id: number, customer: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}`);
  }

  searchCustomers(q: string): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.baseUrl}/search`, {
      params: { q }
    });
  }

  getNearbyCustomers(lat: number, lng: number, radius: number = 1.0): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.baseUrl}/nearby`, {
      params: {
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString()
      }
    });
  }
}
