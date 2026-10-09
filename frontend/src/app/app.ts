import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer } from './services/customer.service';
import { OrderService, Order } from './services/order.service';

declare const L: any; // Leaflet global from CDN

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, AfterViewInit {
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService);

  backendUrl: string = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? (window.location.port === '4200' ? 'http://localhost:3000' : '')
    : 'https://customer-orders-app.onrender.com';

  // Active navigation tab
  activeTab: 'customers' | 'orders' | 'map' | 'erd' | 'deliverables' = 'customers';

  // Customers state (MSU Khamriang Center: 16.2458, 103.2508)
  customers: Customer[] = [];
  customerSearchQuery: string = '';
  customerLat: number = 16.2458;
  customerLng: number = 103.2508;
  customerRadius: number = 1.0; // Strictly 1 km
  isCustomerNearbyActive: boolean = false;
  selectedCustomer: Customer | null = null;
  customerModalOpen: boolean = false;
  customerModalMode: 'create' | 'edit' = 'create';
  customerForm: Partial<Customer> = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    latitude: 16.2458,
    longitude: 103.2508
  };

  // Orders state
  orders: Order[] = [];
  orderLat: number = 16.2458;
  orderLng: number = 103.2508;
  orderRadius: number = 2.0; // Strictly 2 km
  isOrderNearbyActive: boolean = false;
  selectedOrder: Order | null = null;
  orderModalOpen: boolean = false;
  orderModalMode: 'create' | 'edit' = 'create';
  boxCountModalOpen: boolean = false;
  boxCountEditValue: number = 1;
  orderForm: Partial<Order> = {
    customer_id: 1,
    box_count: 5,
    price_per_box: 150.0,
    delivery_latitude: 16.2458,
    delivery_longitude: 103.2508,
    status: 'Pending',
    notes: ''
  };

  // Loading & feedback
  isLoading: boolean = false;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null = null;
  private toastTimer: any = null;

  // Leaflet Map state
  private map: any = null;
  private mapMarkersLayer: any = null;
  private mapCircleLayer1km: any = null;
  private mapCircleLayer2km: any = null;

  // สมาชิกกลุ่ม (4 คน ตามที่กำหนด รหัสนิสิต / ชื่อ-นามสกุล ไม่มีหน้าที่)
  groupMembers = [
    { id: '67011212163', name: 'ทนงศักดิ์ ตรีศาตร์' },
    { id: '67011212071', name: 'อติรุจ พุทธิ' },
    { id: '67011212022', name: 'จาตุรงค์ อุส่าห์ดี' },
    { id: '67011212190', name: 'พิมผกา ศรีเสน' },
  ];

  // จุดอ้างอิงพิกัดใน มหาวิทยาลัยมหาสารคาม (มมส. ขามเรียง)
  presetLocations = [
    { name: 'มมส. ขามเรียง (จุดศูนย์กลาง)', lat: 16.2458, lng: 103.2508 },
    { name: 'คณะวิทยาการสารสนเทศ มมส.', lat: 16.2455, lng: 103.2512 },
    { name: 'ตลาดน้อย มมส.', lat: 16.2435, lng: 103.2498 },
    { name: 'อาคารบรมราชกุมารี', lat: 16.2468, lng: 103.2525 },
    { name: 'หน้าป้าย มมส. ขามเรียง', lat: 16.2420, lng: 103.2540 },
    { name: 'ตลาดคลองถมขามเรียง', lat: 16.2495, lng: 103.2462 },
    { name: 'หอพักท่าขอนยาง', lat: 16.2360, lng: 103.2610 },
  ];

  // Calculated Stats
  get totalRevenue(): number {
    return this.orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  }

  get totalBoxes(): number {
    return this.orders.reduce((sum, o) => sum + (o.box_count || 0), 0);
  }

  get nearbyCustomersCount(): number {
    return this.customers.filter(c => (c.distance_km || 0) <= 1.0).length;
  }

  get nearbyOrdersCount(): number {
    return this.orders.filter(o => (o.distance_km || 0) <= 2.0).length;
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadOrders();
  }

  ngAfterViewInit() {
    if (this.activeTab === 'map') {
      setTimeout(() => this.initMap(), 300);
    }
  }

  setTab(tab: 'customers' | 'orders' | 'map' | 'erd' | 'deliverables') {
    this.activeTab = tab;
    if (tab === 'map') {
      setTimeout(() => {
        this.initMap();
        this.updateMapLayers();
      }, 200);
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast = { message, type };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast = null;
    }, 4000);
  }

  // ==========================================
  // CUSTOMER OPERATIONS
  // ==========================================
  loadCustomers() {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (res) => {
        this.customers = res.data;
        this.isCustomerNearbyActive = false;
        this.isLoading = false;
        this.updateMapLayers();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('โหลดข้อมูลลูกค้าไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  searchCustomers() {
    const q = this.customerSearchQuery.trim();
    if (!q) {
      this.loadCustomers();
      return;
    }
    this.isLoading = true;
    this.customerService.searchCustomers(q).subscribe({
      next: (res) => {
        this.customers = res.data;
        this.isCustomerNearbyActive = false;
        this.isLoading = false;
        this.showToast(`ผลการค้นหา "${q}": พบ ${res.data.length} รายการ`, 'info');
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('ค้นหาไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  clearCustomerSearch() {
    this.customerSearchQuery = '';
    this.loadCustomers();
  }

  searchCustomersNearby() {
    this.isLoading = true;
    this.customerService.getNearbyCustomers(this.customerLat, this.customerLng, 1.0).subscribe({
      next: (res) => {
        this.customers = res.data;
        this.isCustomerNearbyActive = true;
        this.isLoading = false;
        this.showToast(`พบลูกค้าในระยะ 1 กม. รอบ มมส.: ${res.data.length} คน`, 'success');
        this.updateMapLayers();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('ค้นหาพิกัดไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  toggleCustomerNearbyFilter() {
    if (this.isCustomerNearbyActive) {
      this.loadCustomers();
    } else {
      this.searchCustomersNearby();
    }
  }

  applyCustomerPreset(preset: { lat: number; lng: number }) {
    this.customerLat = preset.lat;
    this.customerLng = preset.lng;
    this.searchCustomersNearby();
  }

  openCreateCustomerModal() {
    this.customerModalMode = 'create';
    this.customerForm = {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address: '',
      latitude: this.customerLat,
      longitude: this.customerLng
    };
    this.customerModalOpen = true;
  }

  openEditCustomerModal(c: Customer) {
    this.customerModalMode = 'edit';
    this.selectedCustomer = c;
    this.customerForm = {
      first_name: c.first_name,
      last_name: c.last_name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      latitude: c.latitude,
      longitude: c.longitude
    };
    this.customerModalOpen = true;
  }

  closeCustomerModal() {
    this.customerModalOpen = false;
    this.selectedCustomer = null;
  }

  saveCustomer() {
    if (!this.customerForm.first_name || !this.customerForm.last_name) {
      this.showToast('กรุณากรอกชื่อและนามสกุลลูกค้าให้ครบถ้วน', 'error');
      return;
    }

    this.isLoading = true;
    if (this.customerModalMode === 'create') {
      this.customerService.createCustomer(this.customerForm).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeCustomerModal();
          this.showToast('บันทึกข้อมูลลูกค้าใหม่สำเร็จ', 'success');
          this.loadCustomers();
        },
        error: (err) => {
          this.isLoading = false;
          this.showToast('บันทึกข้อมูลไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
        }
      });
    } else if (this.selectedCustomer) {
      this.customerService.updateCustomer(this.selectedCustomer.id, this.customerForm).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeCustomerModal();
          this.showToast('อัปเดตข้อมูลลูกค้าเรียบร้อย', 'success');
          this.loadCustomers();
        },
        error: (err) => {
          this.isLoading = false;
          this.showToast('อัปเดตไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
        }
      });
    }
  }

  deleteCustomer(c: Customer) {
    if (!confirm(`ยืนยันการลบลูกค้า "${c.first_name} ${c.last_name}" ออกจากระบบ?`)) {
      return;
    }
    this.isLoading = true;
    this.customerService.deleteCustomer(c.id).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast(res.message || 'ลบลูกค้าสำเร็จ', 'success');
        this.loadCustomers();
        this.loadOrders();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('ลบไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  // ==========================================
  // ORDER OPERATIONS
  // ==========================================
  loadOrders() {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.isOrderNearbyActive = false;
        this.isLoading = false;
        this.updateMapLayers();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('โหลดรายการสั่งซื้อไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  seedOrders(count: number = 25) {
    this.isLoading = true;
    this.orderService.seedOrders(count).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast(`สร้างชุดข้อมูลทดสอบคำสั่งซื้อ ${res.count} รายการ เรียบร้อย`, 'success');
        this.loadOrders();
        this.loadCustomers();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('จำลองข้อมูลไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  clearAllOrders() {
    if (!confirm('ยืนยันการล้างรายการคำสั่งซื้อทั้งหมด? (ข้อมูลลูกค้าจะไม่ถูกลบ)')) {
      return;
    }
    this.isLoading = true;
    this.orderService.clearOrders().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast(`ล้างข้อมูลคำสั่งซื้อทั้งหมดสำเร็จ (${res.deleted_count} รายการ)`, 'info');
        this.loadOrders();
        this.loadCustomers();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('ล้างรายการสั่งซื้อไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  searchOrdersNearby() {
    this.isLoading = true;
    this.orderService.getNearbyOrders(this.orderLat, this.orderLng, 2.0).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.isOrderNearbyActive = true;
        this.isLoading = false;
        this.showToast(`พบคำสั่งซื้อในระยะจัดส่ง 2 กม. รอบ มมส.: ${res.data.length} รายการ`, 'success');
        this.updateMapLayers();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('ค้นหาพิกัดคำสั่งซื้อไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  toggleOrderNearbyFilter() {
    if (this.isOrderNearbyActive) {
      this.loadOrders();
    } else {
      this.searchOrdersNearby();
    }
  }

  applyOrderPreset(preset: { lat: number; lng: number }) {
    this.orderLat = preset.lat;
    this.orderLng = preset.lng;
    this.searchOrdersNearby();
  }

  openCreateOrderModal() {
    if (this.customers.length === 0) {
      this.showToast('กรุณาเพิ่มลูกค้าหรือจำลองข้อมูลลูกค้าก่อนสร้างคำสั่งซื้อ', 'error');
      return;
    }
    this.orderModalMode = 'create';
    const defaultCust = this.customers[0];
    this.orderForm = {
      customer_id: defaultCust.id,
      box_count: 5,
      price_per_box: 150.0,
      delivery_latitude: defaultCust.latitude,
      delivery_longitude: defaultCust.longitude,
      status: 'Pending',
      notes: ''
    };
    this.orderModalOpen = true;
  }

  onOrderCustomerChange(customerId: number) {
    const cust = this.customers.find(c => c.id == customerId);
    if (cust) {
      this.orderForm.delivery_latitude = cust.latitude;
      this.orderForm.delivery_longitude = cust.longitude;
    }
  }

  openEditOrderModal(order: Order) {
    this.orderModalMode = 'edit';
    this.selectedOrder = order;
    this.orderForm = {
      customer_id: order.customer_id,
      box_count: order.box_count,
      price_per_box: order.price_per_box,
      delivery_latitude: order.delivery_latitude,
      delivery_longitude: order.delivery_longitude,
      status: order.status,
      notes: order.notes || ''
    };
    this.orderModalOpen = true;
  }

  closeOrderModal() {
    this.orderModalOpen = false;
    this.selectedOrder = null;
  }

  saveOrder() {
    if (!this.orderForm.box_count || this.orderForm.box_count < 1) {
      this.showToast('จำนวนกล่องต้องไม่ต่ำกว่า 1 กล่อง', 'error');
      return;
    }

    this.isLoading = true;
    if (this.orderModalMode === 'create') {
      this.orderService.createOrder(this.orderForm).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeOrderModal();
          this.showToast('สร้างคำสั่งซื้อใหม่เรียบร้อย', 'success');
          this.loadOrders();
        },
        error: (err) => {
          this.isLoading = false;
          this.showToast('สร้างคำสั่งซื้อไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
        }
      });
    } else if (this.selectedOrder) {
      this.orderService.updateOrder(this.selectedOrder.id, this.orderForm).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeOrderModal();
          this.showToast('อัปเดตคำสั่งซื้อเรียบร้อย', 'success');
          this.loadOrders();
        },
        error: (err) => {
          this.isLoading = false;
          this.showToast('อัปเดตไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
        }
      });
    }
  }

  openBoxCountModal(order: Order) {
    this.selectedOrder = order;
    this.boxCountEditValue = order.box_count;
    this.boxCountModalOpen = true;
  }

  closeBoxCountModal() {
    this.boxCountModalOpen = false;
    this.selectedOrder = null;
  }

  adjustBoxCount(delta: number) {
    const newVal = this.boxCountEditValue + delta;
    if (newVal >= 1) {
      this.boxCountEditValue = newVal;
    }
  }

  quickAdjustOrderBoxCount(order: Order, delta: number) {
    const newCount = order.box_count + delta;
    if (newCount < 1) return;

    this.orderService.updateBoxCount(order.id, newCount).subscribe({
      next: (res) => {
        order.box_count = res.data.box_count;
        order.total_price = res.data.total_price;
        this.showToast(`ปรับจำนวนกล่อง ${order.order_code} เป็น ${newCount} กล่อง สำเร็จ`, 'success');
      },
      error: (err) => {
        this.showToast('ปรับจำนวนกล่องไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  saveBoxCount() {
    if (!this.selectedOrder || this.boxCountEditValue < 1) {
      this.showToast('จำนวนกล่องต้องไม่ต่ำกว่า 1 กล่อง', 'error');
      return;
    }

    this.isLoading = true;
    this.orderService.updateBoxCount(this.selectedOrder.id, this.boxCountEditValue).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeBoxCountModal();
        this.showToast(`แก้ไขจำนวนกล่องเป็น ${this.boxCountEditValue} กล่อง เรียบร้อย`, 'success');
        this.loadOrders();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('แก้ไขจำนวนกล่องไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  deleteOrder(order: Order) {
    if (!confirm(`ยืนยันการลบคำสั่งซื้อ "${order.order_code}"?`)) {
      return;
    }
    this.isLoading = true;
    this.orderService.deleteOrder(order.id).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showToast(res.message || 'ลบคำสั่งซื้อสำเร็จ', 'success');
        this.loadOrders();
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('ลบไม่สำเร็จ: ' + (err.error?.error || err.message), 'error');
      }
    });
  }

  onCustomerLandmarkSelect(event: any) {
    const name = event.target.value;
    const found = this.presetLocations.find(p => p.name === name);
    if (found) {
      this.customerForm.latitude = found.lat;
      this.customerForm.longitude = found.lng;
    }
  }

  onOrderLandmarkSelect(event: any) {
    const name = event.target.value;
    const found = this.presetLocations.find(p => p.name === name);
    if (found) {
      this.orderForm.delivery_latitude = found.lat;
      this.orderForm.delivery_longitude = found.lng;
    }
  }

  // ==========================================
  // GOOGLE MAPS VISUALIZATION (Mahasarakham University)
  // ==========================================
  initMap() {
    if (typeof L === 'undefined') return;

    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    // Default center at Mahasarakham University (มมส. ขามเรียง)
    this.map = L.map('leaflet-map').setView([16.2458, 103.2508], 15);

    // Google Maps Streets Tile Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '© Google Maps'
    }).addTo(this.map);

    this.mapMarkersLayer = L.layerGroup().addTo(this.map);

    // Map click handler to pick location
    this.map.on('click', (e: any) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      this.customerLat = lat;
      this.customerLng = lng;
      this.orderLat = lat;
      this.orderLng = lng;
      this.updateMapLayers();
      this.showToast('อัปเดตจุดศูนย์กลางอ้างอิงเรียบร้อย', 'info');
    });

    this.updateMapLayers();
  }

  updateMapLayers() {
    if (!this.map || !this.mapMarkersLayer) return;

    this.mapMarkersLayer.clearLayers();

    // 1 km Circle (Green)
    if (this.mapCircleLayer1km) {
      this.map.removeLayer(this.mapCircleLayer1km);
    }
    this.mapCircleLayer1km = L.circle([this.customerLat, this.customerLng], {
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.12,
      radius: 1000, // 1 km
      weight: 2
    }).addTo(this.map).bindTooltip('รัศมี 1 กิโลเมตร (ลูกค้า)', { permanent: false });

    // 2 km Circle (Amber)
    if (this.mapCircleLayer2km) {
      this.map.removeLayer(this.mapCircleLayer2km);
    }
    this.mapCircleLayer2km = L.circle([this.orderLat, this.orderLng], {
      color: '#d97706',
      fillColor: '#f59e0b',
      fillOpacity: 0.08,
      radius: 2000, // 2 km
      weight: 2,
      dashArray: '6, 6'
    }).addTo(this.map).bindTooltip('รัศมี 2 กิโลเมตร (คำสั่งซื้อ)', { permanent: false });

    // Center point marker: Mahasarakham University
    const centerIcon = L.divIcon({
      className: 'custom-center-pin',
      html: '<div style="background:#dc2626; color:white; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="fa fa-university"></i></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([this.customerLat, this.customerLng], { icon: centerIcon })
      .addTo(this.mapMarkersLayer)
      .bindPopup(`
        <div style="font-family:'Prompt', sans-serif; text-align:center;">
          <b style="color:#dc2626; font-size:14px;">มหาวิทยาลัยมหาสารคาม (มมส.)</b><br>
          <span style="color:#64748b; font-size:12px;">จุดศูนย์กลางคำนวณระยะทาง</span><br>
          <div style="margin-top:6px; font-weight:600; color:#059669; font-size:12px;">รัศมีลูกค้า: 1 กม. | รัศมีจัดส่ง: 2 กม.</div>
        </div>
      `);

    // Plot Customers (Blue pins)
    this.customers.forEach(c => {
      const customerIcon = L.divIcon({
        className: 'customer-pin',
        html: `<div style="background:#2563eb; color:white; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.25);"><i class="fa fa-user"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([c.latitude, c.longitude], { icon: customerIcon })
        .addTo(this.mapMarkersLayer)
        .bindPopup(`
          <div style="font-family:'Prompt', sans-serif;">
            <b style="color:#2563eb; font-size:13px;">${c.first_name} ${c.last_name}</b><br>
            โทร: ${c.phone || '-'}<br>
            ที่อยู่: ${c.address || '-'}<br>
            <div style="margin-top:6px; background:#dcfce7; padding:3px 8px; border-radius:4px; color:#15803d; font-weight:600; font-size:12px;">
              ระยะทางจาก มมส.: ${c.distance_km || 0} กม.
            </div>
          </div>
        `);
    });

    // Plot Orders (Amber pins)
    this.orders.forEach(o => {
      const orderIcon = L.divIcon({
        className: 'order-pin',
        html: `<div style="background:#f59e0b; color:white; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.25);"><i class="fa fa-box"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([o.delivery_latitude, o.delivery_longitude], { icon: orderIcon })
        .addTo(this.mapMarkersLayer)
        .bindPopup(`
          <div style="font-family:'Prompt', sans-serif;">
            <b style="color:#d97706; font-size:13px;">${o.order_code}</b><br>
            ผู้สั่งซื้อ: <b>${o.customer_name || 'ลูกค้า #' + o.customer_id}</b><br>
            จำนวน: <b>${o.box_count} กล่อง</b> (฿${o.total_price})<br>
            สถานะ: ${o.status}<br>
            <div style="margin-top:6px; background:#fef3c7; padding:3px 8px; border-radius:4px; color:#b45309; font-weight:600; font-size:12px;">
              ระยะทางจัดส่ง: ${o.distance_km || 0} กม.
            </div>
          </div>
        `);
    });
  }
}
