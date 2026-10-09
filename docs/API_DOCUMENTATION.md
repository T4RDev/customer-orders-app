# คู่มือการใช้งาน Web API (API Documentation)
## ระบบจัดการข้อมูลลูกค้า และ รายการสั่งซื้อ (Customer & Orders API)

- **Base URL (Local)**: `http://localhost:3000/api`
- **Interactive Swagger UI**: `http://localhost:3000/api/docs`
- **Format**: JSON (`Content-Type: application/json`)

---

## สรุปภาพรวมของ API ทั้งหมด (API Endpoints Summary)

| กลุ่ม | Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| **ลูกค้า** | `GET` | `/api/customers` | 2.1 แสดงข้อมูลลูกค้าทุกคน |
| | `GET` | `/api/customers/:id` | 2.1 ดึงข้อมูลลูกค้าตาม ID พร้อมประวัติการสั่งซื้อ |
| | `POST` | `/api/customers` | 2.1 เพิ่มข้อมูลลูกค้าใหม่ |
| | `PUT` | `/api/customers/:id` | 2.1 แก้ไขข้อมูลลูกค้า |
| | `DELETE` | `/api/customers/:id` | 2.1 ลบข้อมูลลูกค้า |
| | `GET` | `/api/customers/search` | 2.2 ค้นหาจากส่วนหนึ่งของชื่อ หรือ นามสกุล |
| | `GET` | `/api/customers/nearby` | 2.3 ค้นหาลูกค้าทั้งหมดในระยะ 1 กิโลเมตร จากพิกัดที่กำหนด |
| **คำสั่งซื้อ** | `POST` | `/api/orders/seed` | 3.1 จำลองรายการสั่งซื้อ 20-30 รายการ |
| | `GET` | `/api/orders` | 3.1 แสดงรายการสั่งซื้อทั้งหมด พร้อมข้อมูลลูกค้า |
| | `GET` | `/api/orders/:id` | 3.1 แสดงรายการสั่งซื้อตาม ID |
| | `POST` | `/api/orders` | 3.1.3 เพิ่มรายการสั่งซื้อใหม่ |
| | `PUT` | `/api/orders/:id` | 3.1.3 แก้ไขรายการสั่งซื้อ |
| | `PATCH` | `/api/orders/:id/box-count` | 3.1.3 แก้ไขเฉพาะจำนวนกล่องในแต่ละออร์เดอร์ |
| | `DELETE` | `/api/orders/:id` | 3.1.3 ลบรายการสั่งซื้อ |
| | `DELETE` / `POST` | `/api/orders/clear` | 3.2 ล้าง (ลบทั้งหมด) รายการสั่งซื้อที่จำลองทั้งหมด |
| | `GET` | `/api/orders/nearby` | 3.3 แสดงรายการสั่งซื้อทั้งหมดในระยะ 2 กิโลเมตร จากพิกัดที่กำหนด |

---

## 1. Web API สำหรับจัดการลูกค้า (Customer API)

### 1.1 แสดงข้อมูลลูกค้าทุกคน (Get All Customers)
- **Method**: `GET`
- **Endpoint**: `/api/customers`
- **Response** (200 OK):
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "first_name": "สมชาย",
      "last_name": "ใจดี",
      "phone": "081-234-5678",
      "email": "somchai.jai@gmail.com",
      "address": "999/9 ถ.พระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330",
      "latitude": 13.7445,
      "longitude": 100.5312,
      "created_at": "2026-10-03 16:30:00",
      "total_orders": 3
    }
  ]
}
```

### 1.2 เพิ่มข้อมูลลูกค้า (Create Customer)
- **Method**: `POST`
- **Endpoint**: `/api/customers`
- **Request Body**:
```json
{
  "first_name": "ธนพล",
  "last_name": "ประเสริฐยิ่ง",
  "phone": "089-123-4567",
  "email": "thanapol@example.com",
  "address": "123 ถ.สุขุมวิท คลองเตย กทม.",
  "latitude": 13.7450,
  "longitude": 100.5330
}
```
- **Response** (201 Created):
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 16,
    "first_name": "ธนพล",
    "last_name": "ประเสริฐยิ่ง",
    "phone": "089-123-4567",
    "email": "thanapol@example.com",
    "address": "123 ถ.สุขุมวิท คลองเตย กทม.",
    "latitude": 13.745,
    "longitude": 100.533,
    "created_at": "2026-10-03 16:40:00"
  }
}
```

### 1.3 แก้ไขข้อมูลลูกค้า (Update Customer)
- **Method**: `PUT`
- **Endpoint**: `/api/customers/:id`
- **Request Body**:
```json
{
  "phone": "089-999-8888",
  "address": "ที่อยู่ใหม่ แขวงปทุมวัน กทม."
}
```
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": { ... }
}
```

### 1.4 ลบข้อมูลลูกค้า (Delete Customer)
- **Method**: `DELETE`
- **Endpoint**: `/api/customers/:id`
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer #1 (สมชาย ใจดี) deleted successfully."
}
```

### 1.5 ค้นหาจากส่วนหนึ่งของชื่อ หรือ นามสกุล (Search by Name)
- **Method**: `GET`
- **Endpoint**: `/api/customers/search?q=สม`
- **Query Parameters**:
  - `q`: คำค้นหาสำหรับค้นทั้งชื่อและนามสกุล (เช่น `สม`)
  - หรือ `firstName`: คำค้นหาชื่อ
  - หรือ `lastName`: คำค้นหานามสกุล
- **Response** (200 OK):
```json
{
  "success": true,
  "query": { "q": "สม" },
  "count": 3,
  "data": [
    { "id": 1, "first_name": "สมชาย", "last_name": "ใจดี", ... },
    { "id": 2, "first_name": "สมศรี", "last_name": "รักสงบ", ... },
    { "id": 14, "first_name": "เอกชัย", "last_name": "สมบูรณ์ผล", ... }
  ]
}
```

### 1.6 ค้นหาลูกค้าทั้งหมดในระยะ 1 กิโลเมตร จากพิกัดที่กำหนด (Nearby Customers)
- **Method**: `GET`
- **Endpoint**: `/api/customers/nearby?lat=13.7460&lng=100.5348&radius=1`
- **Query Parameters**:
  - `lat` *(required)*: ละติจูด เช่น 13.7460 (สยาม)
  - `lng` *(required)*: ลองจิจูด เช่น 100.5348 (สยาม)
  - `radius` *(optional)*: รัศมีกิโลเมตร (Default = 1.0 km)
- **Response** (200 OK):
```json
{
  "success": true,
  "center": { "latitude": 13.746, "longitude": 100.5348 },
  "radius_km": 1,
  "count": 5,
  "data": [
    {
      "id": 2,
      "first_name": "สมศรี",
      "last_name": "รักสงบ",
      "latitude": 13.7466,
      "longitude": 100.535,
      "distance_km": 0.07,
      "distance_meters": 70
    },
    {
      "id": 1,
      "first_name": "สมชาย",
      "last_name": "ใจดี",
      "latitude": 13.7445,
      "longitude": 100.5312,
      "distance_km": 0.423,
      "distance_meters": 423
    }
  ]
}
```

---

## 2. Web API สำหรับจัดการรายการสั่งซื้อ (Order API)

### 2.1 จำลองรายการสั่งซื้อ 20-30 รายการ (Seed Orders)
- **Method**: `POST`
- **Endpoint**: `/api/orders/seed?count=25`
- **Query Parameters**:
  - `count` *(optional)*: จำนวนออร์เดอร์ที่ต้องการจำลอง (เช่น 25 รายการ)
- **Response** (201 Created):
```json
{
  "success": true,
  "message": "Successfully simulated 25 orders.",
  "count": 25,
  "data": [
    {
      "id": 1,
      "order_code": "ORD-20261003-7841-01",
      "customer_id": 2,
      "customer_name": "สมศรี รักสงบ",
      "box_count": 18,
      "price_per_box": 150,
      "total_price": 2700,
      "delivery_latitude": 13.7471,
      "delivery_longitude": 100.5362,
      "status": "In Transit",
      "notes": "โทรแจ้งก่อนส่ง 15 นาที"
    }
  ]
}
```

### 2.2 แสดงรายการสั่งซื้อทั้งหมด (Get All Orders)
- **Method**: `GET`
- **Endpoint**: `/api/orders`
- **Response** (200 OK):
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": 1,
      "order_code": "ORD-20261003-7841-01",
      "customer_id": 2,
      "customer_name": "สมศรี รักสงบ",
      "customer_phone": "082-345-6789",
      "box_count": 18,
      "price_per_box": 150,
      "total_price": 2700,
      "delivery_latitude": 13.7471,
      "delivery_longitude": 100.5362,
      "status": "In Transit",
      "notes": "โทรแจ้งก่อนส่ง 15 นาที",
      "order_date": "2026-10-03 14:30:00"
    }
  ]
}
```

### 2.3 เพิ่มรายการสั่งซื้อใหม่ (Create Order)
- **Method**: `POST`
- **Endpoint**: `/api/orders`
- **Request Body**:
```json
{
  "customer_id": 1,
  "box_count": 8,
  "price_per_box": 150.0,
  "delivery_latitude": 13.7445,
  "delivery_longitude": 100.5312,
  "notes": "จัดส่งด่วนพิเศษ"
}
```

### 2.4 แก้ไขเฉพาะจำนวนกล่องในแต่ละออร์เดอร์ (Update Box Count)
- **Method**: `PATCH` หรือ `PUT`
- **Endpoint**: `/api/orders/:id/box-count`
- **Request Body**:
```json
{
  "box_count": 20
}
```
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Order #1 box count updated to 20",
  "data": {
    "id": 1,
    "order_code": "ORD-20261003-7841-01",
    "box_count": 20,
    "price_per_box": 150,
    "total_price": 3000,
    "status": "In Transit"
  }
}
```

### 2.5 ลบรายการสั่งซื้อ (Delete Single Order)
- **Method**: `DELETE`
- **Endpoint**: `/api/orders/:id`
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Order #1 (ORD-20261003-7841-01) deleted successfully."
}
```

### 2.6 ล้าง (ลบทั้งหมด) รายการสั่งซื้อที่จำลองทั้งหมด (Clear All Orders)
- **Method**: `DELETE` หรือ `POST`
- **Endpoint**: `/api/orders/clear`
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "All orders have been cleared successfully. (25 orders deleted)",
  "deleted_count": 25
}
```

### 2.7 แสดงรายการสั่งซื้อทั้งหมดในระยะ 2 กิโลเมตร จากพิกัดที่กำหนด (Nearby Orders)
- **Method**: `GET`
- **Endpoint**: `/api/orders/nearby?lat=13.7460&lng=100.5348&radius=2`
- **Query Parameters**:
  - `lat` *(required)*: ละติจูด เช่น 13.7460 (สยาม)
  - `lng` *(required)*: ลองจิจูด เช่น 100.5348 (สยาม)
  - `radius` *(optional)*: รัศมีกิโลเมตร (Default = 2.0 km)
- **Response** (200 OK):
```json
{
  "success": true,
  "center": { "latitude": 13.746, "longitude": 100.5348 },
  "radius_km": 2,
  "count": 14,
  "data": [
    {
      "id": 18,
      "order_code": "ORD-20260930-2580-18",
      "customer_id": 2,
      "customer_name": "สมศรี รักสงบ",
      "customer_phone": "082-345-6789",
      "box_count": 9,
      "total_price": 1350,
      "delivery_latitude": 13.7472,
      "delivery_longitude": 100.5358,
      "distance_km": 0.175,
      "distance_meters": 175
    }
  ]
}
```

---

## 3. สูตรคำนวณระยะทาง Haversine Formula (1 km & 2 km)

การคำนวณระยะทางทางภูมิศาสตร์บนผิวโลกทรงกลมใช้สูตร Haversine:
$$d = 2 R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- $R = 6,371\text{ km}$ (รัศมีเฉลี่ยของโลก)
- $\phi_1, \phi_2$ คือ ละติจูดของจุดที่ 1 และ 2 ในหน่วยเรเดียน
- $\Delta\lambda = \lambda_2 - \lambda_1$ คือ ผลต่างของลองจิจูดในหน่วยเรเดียน
