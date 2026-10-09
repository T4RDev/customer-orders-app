# Customer & Order Management Web API & Angular Dashboard
> โครงงานพัฒนาระบบ Web API ข้อมูลลูกค้าและรายการสั่งซื้อ พร้อมระบบคำนวณพิกัดเชิงพื้นที่ (Geospatial Radius)

---

## 📋 ข้อมูลโครงงาน และ สิ่งที่ส่งมอบ (Deliverables)

1. **ไฟล์รายงาน PDF (`docs/Project_Customer_Orders_Report.pdf`)**:
   - ข้อมูลสมาชิกกลุ่มครบทุกคน
   - แบบจำลองฐานข้อมูล ER Diagram จาก https://erdplus.com/ (Crow's Foot Notation)
   - พจนานุกรมข้อมูล (Data Dictionary)
   - คู่มือการใช้งานทุกๆ เส้น API พร้อมตัวอย่าง Request / Response JSON และคำสั่ง cURL
2. **ไฟล์ Zip Source Code (`docs/Customer_Orders_Source.zip` / `Customer_Orders_Source.zip`)**:
   - โค้ดทั้งหมดของ Backend (NodeJS + Express + SQLite) และ Frontend (Angular)
   - **ตัดโฟลเดอร์ `node_modules` และ `.git` ออกเรียบร้อยตามข้อกำหนด**
3. **Interactive Swagger Documentation**:
   - เข้าใช้งานได้ทันทีที่: `http://localhost:3000/api/docs`

---

## 🛠️ เทคโนโลยีที่ใช้ในการพัฒนา (Tech Stack)

- **Backend**: **NodeJS v24 + TypeScript 5.x**, Express.js 4.x
- **Database**: SQLite (ผ่าน `better-sqlite3` ประสิทธิภาพสูง พร้อม Foreign Key CASCADE และ Indexes)
- **Geospatial Calculation**: Haversine Formula (คำนวณระยะทางความโค้งผิวโลกแม่นยำ)
- **Frontend**: **Angular 22 (TypeScript)** (Standalone Components, HttpClient, Forms, Google Fonts 'Prompt')
- **Map Visualization**: Leaflet.js / OpenStreetMap แสดงเรดาร์วงกลม 1 km และ 2 km
- **API Documentation**: Swagger UI (OpenAPI 3.0)

---

## 🗄️ 1. ER Diagram (https://erdplus.com/)

ไฟล์ต้นฉบับสำหรับนำเข้า (Import) บน ERDPlus: `docs/ERD/erdplus_diagram.json`  
ไฟล์ภาพเวกเตอร์ความละเอียดสูง: `docs/ERD/ER_DIAGRAM.svg`

### ความสัมพันธ์ระหว่างตาราง:
- **`Customer` (1) &mdash;&mdash;&lt; places &gt;&mdash;&mdash; `Order` (M)**
- ลูกค้า 1 คน สามารถมีคำสั่งซื้อได้ 0 หรือหลายรายการ (1:N)
- คำสั่งซื้อ 1 รายการ ต้องระบุลูกค้าผู้สั่ง 1 คนเสมอ (Mandatory 1)

---

## 🚀 2. สรุปเส้นทาง Web API (API Endpoints)

### 2.1 Web API สำหรับจัดการลูกค้า (Customer API)
| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| `GET` | `/api/customers` | **2.1** แสดงข้อมูลลูกค้าทุกคน พร้อมจำนวนออร์เดอร์ |
| `GET` | `/api/customers/:id` | **2.1** ดึงข้อมูลลูกค้าตาม ID พร้อมประวัติการสั่งซื้อ |
| `POST` | `/api/customers` | **2.1** เพิ่มลูกค้าใหม่ (`first_name`, `last_name`, `phone`, `latitude`, `longitude`) |
| `PUT` | `/api/customers/:id` | **2.1** แก้ไขข้อมูลลูกค้า |
| `DELETE` | `/api/customers/:id` | **2.1** ลบข้อมูลลูกค้า (CASCADE ลบออร์เดอร์ที่เกี่ยวข้อง) |
| `GET` | `/api/customers/search?q=สม` | **2.2** ค้นหาจากส่วนหนึ่งของชื่อ หรือ นามสกุล |
| `GET` | `/api/customers/nearby?lat=13.7460&lng=100.5348&radius=1` | **2.3** ค้นหาลูกค้าทั้งหมดในระยะ 1 กิโลเมตร จากพิกัดที่กำหนด |

### 2.2 Web API สำหรับจัดการรายการสั่งซื้อ (Order API)
| Method | Endpoint | รายละเอียด |
| :--- | :--- | :--- |
| `POST` | `/api/orders/seed?count=25` | **3.1** จำลองรายการสั่งซื้อ 20-30 รายการ ข้อมูลครบถ้วน |
| `GET` | `/api/orders` | **3.1** แสดงรายการสั่งซื้อทั้งหมด พร้อมข้อมูลลูกค้าที่สั่ง |
| `GET` | `/api/orders/:id` | **3.1** แสดงรายการสั่งซื้อตาม ID |
| `POST` | `/api/orders` | **3.1.3** เพิ่มคำสั่งซื้อใหม่ |
| `PUT` | `/api/orders/:id` | **3.1.3** แก้ไขรายละเอียดคำสั่งซื้อ |
| `PATCH` | `/api/orders/:id/box-count` | **3.1.3** แก้ไขเฉพาะจำนวนกล่องในแต่ละออร์เดอร์โดยตรง |
| `DELETE` | `/api/orders/:id` | **3.1.3** ลบรายการคำสั่งซื้อตาม ID |
| `DELETE` | `/api/orders/clear` | **3.2** ล้าง (ลบทั้งหมด) รายการสั่งซื้อที่จำลองทั้งหมด |
| `GET` | `/api/orders/nearby?lat=13.7460&lng=100.5348&radius=2` | **3.3** แสดงรายการสั่งซื้อทั้งหมดในระยะ 2 กิโลเมตร จากพิกัดที่กำหนด |

---

## 💻 วิธีการติดตั้งและรันระบบ (How to Run Locally)

### ขั้นตอนที่ 1: ติดตั้ง Dependencies และ Build TypeScript
```bash
# ติดตั้ง Backend และ Build TypeScript
cd backend
npm install
npm run build

# ติดตั้ง Frontend (หากต้องการ build หรือพัฒนาเพิ่มเติม)
cd ../frontend
npm install
npm run build
```

### ขั้นตอนที่ 2: เริ่มทำงานเซิร์ฟเวอร์
```bash
# รันโปรดักชันเซิร์ฟเวอร์
cd backend
npm start

# หรือรัน Development โหมด TypeScript Hot Reload:
npm run dev
```
เมื่อเริ่มทำงานแล้ว:
- **Web Application Dashboard**: เข้าที่ [http://localhost:3000](http://localhost:3000)
- **Interactive Swagger UI**: เข้าที่ [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

### ทดสอบการทำงานอัตโนมัติ (Automated Unit & Logic Verification):
```bash
cd backend
node test/test_api.js
```

---

## 🌐 4. การ Deploy บน Server ให้อาจารย์/TA ทดสอบจากอินเทอร์เน็ต

### ทางเลือกที่ 1: เปิด Public URL ทันทีผ่าน Tunnel (ไม่ต้องสมัคร / ไม่ต้อง Forward Port)
เมื่อเซิร์ฟเวอร์ทำงานอยู่ที่ Port 3000 ให้เปิดอีกหน้าต่าง Terminal แล้วรัน:
```bash
npx localtunnel --port 3000
```
ระบบจะสร้าง HTTPS Public URL เช่น `https://quick-tiger-42.loca.lt` ซึ่งอาจารย์และ TA สามารถเปิดทดสอบจากอุปกรณ์ใดก็ได้บนอินเทอร์เน็ตทันที

### ทางเลือกที่ 2: Deploy ผ่าน Render.com / Railway
โปรเจ็คต์มีไฟล์ `render.yaml` และ `Dockerfile` พร้อมใช้งาน:
1. Push โค้ดขึ้น GitHub
2. เชื่อมต่อกับ Render.com หรือ Railway
3. ระบบจะ Build Angular และรัน Express Server อัตโนมัติบนพอร์ตของคลาวด์

---

## 📦 โครงสร้างโฟลเดอร์ของโปรเจ็คต์ (Project Structure)
```
Customer_Orders/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── customerController.js
│   │   │   └── orderController.js
│   │   ├── db/
│   │   │   ├── database.js
│   │   │   ├── schema.sql
│   │   │   └── seedData.js
│   │   ├── routes/
│   │   │   ├── customerRoutes.js
│   │   │   └── orderRoutes.js
│   │   ├── utils/
│   │   │   └── distance.js       # Haversine formula
│   │   ├── swagger.js            # Swagger OpenAPI 3.0
│   │   └── server.js             # Express entry point
│   ├── test/
│   │   └── test_api.js           # Automated verification
│   └── package.json
├── frontend/                     # Angular 22 Fullstack App
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/
│   │   │   │   ├── customer.service.ts
│   │   │   │   └── order.service.ts
│   │   │   ├── app.ts
│   │   │   ├── app.html
│   │   │   └── app.css
│   │   ├── index.html
│   │   └── styles.css
│   ├── angular.json
│   └── package.json
├── docs/
│   ├── ERD/
│   │   ├── erdplus_diagram.json  # Import เข้า https://erdplus.com/ ได้ทันที
│   │   └── ER_DIAGRAM.svg        # รูปภาพ ER Diagram ความละเอียดสูง
│   ├── API_DOCUMENTATION.md      # คู่มือ API ฉบับเต็ม
│   ├── report.html               # เอกสารรายงานต้นฉบับ HTML
│   ├── Project_Customer_Orders_Report.pdf  # ไฟล์ PDF รายงานสำหรับส่ง Classroom
│   └── Customer_Orders_Source.zip          # ไฟล์ Zip Source Code สำหรับส่ง Classroom
├── scripts/
│   └── package_zip.ps1           # สคริปต์แพ็คไฟล์ Zip โดยตัด node_modules ออก
├── Dockerfile                    # Multi-stage production container
├── render.yaml                   # 1-click Cloud Blueprint
├── package.json                  # Root orchestration
└── README.md
```
