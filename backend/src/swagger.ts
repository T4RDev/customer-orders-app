import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

// ========================================================
// Reusable Component Schemas
// ========================================================
const customerSchema = {
  type: 'object',
  properties: {
    id:              { type: 'integer', example: 1 },
    first_name:      { type: 'string',  example: 'สมชาย' },
    last_name:       { type: 'string',  example: 'ใจดี' },
    phone:           { type: 'string',  example: '081-234-5678' },
    email:           { type: 'string',  example: 'somchai@gmail.com' },
    address:         { type: 'string',  example: '123 ม.4 ต.ขามเรียง อ.กันทรวิชัย มหาสารคาม' },
    latitude:        { type: 'number',  example: 16.2458 },
    longitude:       { type: 'number',  example: 103.2508 },
    total_orders:    { type: 'integer', example: 3 },
    distance_km:     { type: 'number',  example: 0.15 },
    distance_meters: { type: 'number',  example: 150 },
    created_at:      { type: 'string',  example: '2026-10-01T09:00:00.000Z' },
  },
};

const orderSchema = {
  type: 'object',
  properties: {
    id:                 { type: 'integer', example: 1 },
    order_code:         { type: 'string',  example: 'ORD-20261001-001' },
    customer_id:        { type: 'integer', example: 1 },
    customer_name:      { type: 'string',  example: 'สมชาย ใจดี' },
    customer_phone:     { type: 'string',  example: '081-234-5678' },
    customer_email:     { type: 'string',  example: 'somchai@gmail.com' },
    customer_address:   { type: 'string',  example: '123 ม.4 ต.ขามเรียง มหาสารคาม' },
    box_count:          { type: 'integer', example: 8 },
    price_per_box:      { type: 'number',  example: 150.0 },
    total_price:        { type: 'number',  example: 1200.0 },
    delivery_latitude:  { type: 'number',  example: 16.2455 },
    delivery_longitude: { type: 'number',  example: 103.2512 },
    status:             { type: 'string',  example: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
    notes:              { type: 'string',  example: 'โทรแจ้งล่วงหน้า 15 นาที' },
    order_date:         { type: 'string',  example: '2026-10-01T09:30:00.000Z' },
    distance_km:        { type: 'number',  example: 0.35 },
    distance_meters:    { type: 'number',  example: 350 },
  },
};

const listResponse = (itemSchema: object, description: string = 'ดึงข้อมูลสำเร็จ') => ({
  200: {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success:   { type: 'boolean', example: true },
            count:     { type: 'integer', example: 10 },
            center: {
              type: 'object',
              properties: {
                latitude:  { type: 'number', example: 16.2458 },
                longitude: { type: 'number', example: 103.2508 },
              },
            },
            data: { type: 'array', items: itemSchema },
          },
        },
      },
    },
  },
});

const singleResponse = (itemSchema: object, description: string = 'สำเร็จ') => ({
  200: {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'ดำเนินการสำเร็จ' },
            data:    itemSchema,
          },
        },
      },
    },
  },
});

// ========================================================
// OpenAPI 3.0 Document Definition
// ========================================================
export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Customer & Order Management Web API',
    version: '1.0.0',
    description: `
### ระบบ Web API จัดการข้อมูลลูกค้าและคำสั่งซื้อ (Node.js + TypeScript + SQLite)
พัฒนาเพื่อใช้ในงานโปรเจกต์รายวิชา รองรับการทำงานแบบ Full CRUD และการคำนวณระยะทางเชิงภูมิศาสตร์ (Geospatial Haversine Formula)

**คุณสมบัติหลักของระบบ:**
* **Customer Management:** เพิ่ม, แก้ไข, ลบ, แสดงรายชื่อลูกค้า, ค้นหาตามชื่อ/นามสกุล (Partial Match) และค้นหาลูกค้าในรัศมี 1 กม.
* **Order Management:** สร้างคำสั่งซื้อ, จำลองชุดข้อมูล 20-30 รายการ, ล้างข้อมูลทั้งหมด, ปรับจำนวนกล่องเฉพาะส่วน (PATCH), และค้นหารายการจัดส่งในรัศมี 2 กม.
* **Geospatial Engine:** ใช้จุดอ้างอิงศูนย์กลาง มหาวิทยาลัยมหาสารคาม (มมส. ขามเรียง) พิกัด \`lat: 16.2458, lng: 103.2508\` คำนวณระยะห่างเป็นกิโลเมตรและเมตรแบบ Real-time
    `,
    contact: {
      name: 'ทีมผู้พัฒนาโปรเจกต์',
    },
  },
  servers: [
    { url: '/api', description: 'Relative API Path (ใช้กับ Browser ปัจจุบัน)' },
    { url: 'http://localhost:3000/api', description: 'Local Development Server' },
  ],
  tags: [
    { name: 'Customers', description: 'API สำหรับจัดการข้อมูลลูกค้าและการค้นหาเชิงพื้นที่' },
    { name: 'Orders',    description: 'API สำหรับจัดการรายการสั่งซื้อ การจำลองข้อมูล และการคำนวณระยะจัดส่ง' },
  ],
  paths: {
    // ──────────────────────────── CUSTOMERS ────────────────────────────
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'แสดงข้อมูลลูกค้าทุกคน',
        description: 'ดึงรายชื่อลูกค้าทั้งหมดในระบบ พร้อมจำนวนคำสั่งซื้อสะสม (total_orders) และระยะทางคำนวณจาก มมส.',
        operationId: 'getAllCustomers',
        responses: {
          ...listResponse(customerSchema, 'ดึงรายชื่อลูกค้าทั้งหมดสำเร็จ'),
          500: { description: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
        },
      },
      post: {
        tags: ['Customers'],
        summary: 'เพิ่มข้อมูลลูกค้าใหม่',
        description: 'บันทึกข้อมูลลูกค้าใหม่ลงฐานข้อมูล ต้องระบุชื่อ, นามสกุล, และพิกัดละติจูด/ลองจิจูด',
        operationId: 'createCustomer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['first_name', 'last_name', 'latitude', 'longitude'],
                properties: {
                  first_name: { type: 'string', example: 'ธีรเดช' },
                  last_name:  { type: 'string', example: 'วงศ์สุวรรณ' },
                  phone:      { type: 'string', example: '089-765-4321' },
                  email:      { type: 'string', example: 'teeradech@gmail.com' },
                  address:    { type: 'string', example: '99 ม.1 ต.ขามเรียง อ.กันทรวิชัย จ.มหาสารคาม' },
                  latitude:   { type: 'number', example: 16.2452 },
                  longitude:  { type: 'number', example: 103.2515 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'สร้างข้อมูลลูกค้าสำเร็จ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string',  example: 'Customer created successfully' },
                    data:    customerSchema,
                  },
                },
              },
            },
          },
          400: { description: 'ข้อมูลที่ส่งมาไม่ถูกต้องหรือไม่ครบถ้วน' },
          500: { description: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
        },
      },
    },

    '/customers/search': {
      get: {
        tags: ['Customers'],
        summary: 'ค้นหาลูกค้าจากส่วนหนึ่งของชื่อ หรือ นามสกุล',
        description: 'ค้นหาแบบ Partial Match (LIKE %query%) สามารถใช้ param `q` ค้นหาทั้งชื่อและนามสกุล หรือแยกค้นหาเฉพาะชื่อ (`firstName`) หรือนามสกุล (`lastName`)',
        operationId: 'searchCustomers',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: false,
            description: 'คำค้นหาสำหรับเทียบทั้งชื่อและนามสกุล (เช่น "สม", "ใจ")',
            schema: { type: 'string', example: 'สม' },
          },
          {
            name: 'firstName',
            in: 'query',
            required: false,
            description: 'ระบุคำค้นหาเฉพาะชื่อ',
            schema: { type: 'string', example: 'สมชาย' },
          },
          {
            name: 'lastName',
            in: 'query',
            required: false,
            description: 'ระบุคำค้นหาเฉพาะนามสกุล',
            schema: { type: 'string', example: 'ใจดี' },
          },
        ],
        responses: {
          ...listResponse(customerSchema, 'ผลการค้นหาข้อมูลลูกค้า'),
          500: { description: 'เกิดข้อผิดพลาดในการค้นหา' },
        },
      },
    },

    '/customers/nearby': {
      get: {
        tags: ['Customers'],
        summary: 'ค้นหาลูกค้าทั้งหมดในระยะ 1 กิโลเมตร จากพิกัดที่กำหนด',
        description: 'คำนวณระยะห่างระหว่างจุดศูนย์กลางและพิกัดลูกค้าด้วยสูตร Haversine เรียงลำดับจากใกล้ไปไกล หากไม่ระบุพิกัดจะใช้จุดศูนย์กลาง มมส. ขามเรียง (16.2458, 103.2508) โดยอัตโนมัติ',
        operationId: 'getNearbyCustomers',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: false,
            description: 'ละติจูดศูนย์กลาง (ค่าเริ่มต้น: 16.2458 มมส. ขามเรียง)',
            schema: { type: 'number', example: 16.2458 },
          },
          {
            name: 'lng',
            in: 'query',
            required: false,
            description: 'ลองจิจูดศูนย์กลาง (ค่าเริ่มต้น: 103.2508 มมส. ขามเรียง)',
            schema: { type: 'number', example: 103.2508 },
          },
          {
            name: 'radius',
            in: 'query',
            required: false,
            description: 'รัศมีการค้นหาเป็นกิโลเมตร (ค่าเริ่มต้น: 1.0 km ตามเงื่อนไข)',
            schema: { type: 'number', example: 1.0 },
          },
        ],
        responses: {
          200: {
            description: 'พบรายชื่อลูกค้าในรัศมีที่กำหนด',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success:   { type: 'boolean', example: true },
                    center: {
                      type: 'object',
                      properties: {
                        latitude:  { type: 'number', example: 16.2458 },
                        longitude: { type: 'number', example: 103.2508 },
                      },
                    },
                    radius_km: { type: 'number',  example: 1.0 },
                    count:     { type: 'integer', example: 8 },
                    data:      { type: 'array', items: customerSchema },
                  },
                },
              },
            },
          },
          400: { description: 'พารามิเตอร์พิกัดหรือรัศมีไม่ถูกต้อง' },
        },
      },
    },

    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'ดึงข้อมูลลูกค้าตามรหัส ID พร้อมประวัติคำสั่งซื้อ',
        operationId: 'getCustomerById',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Customer ID', schema: { type: 'integer', example: 1 } },
        ],
        responses: {
          ...singleResponse(customerSchema, 'พบข้อมูลลูกค้า'),
          404: { description: 'ไม่พบข้อมูลลูกค้าตาม ID ที่ระบุ' },
        },
      },
      put: {
        tags: ['Customers'],
        summary: 'แก้ไขข้อมูลลูกค้า',
        description: 'อัปเดตข้อมูลรายละเอียดหรือพิกัดที่อยู่ของลูกค้าตาม ID',
        operationId: 'updateCustomer',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Customer ID', schema: { type: 'integer', example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  first_name: { type: 'string', example: 'สมชาย' },
                  last_name:  { type: 'string', example: 'ใจดี (แก้ไข)' },
                  phone:      { type: 'string', example: '081-234-5678' },
                  email:      { type: 'string', example: 'somchai_new@gmail.com' },
                  address:    { type: 'string', example: '123/45 ซอยขามเรียง มหาสารคาม' },
                  latitude:   { type: 'number', example: 16.2460 },
                  longitude:  { type: 'number', example: 103.2510 },
                },
              },
            },
          },
        },
        responses: {
          ...singleResponse(customerSchema, 'แก้ไขข้อมูลลูกค้าสำเร็จ'),
          400: { description: 'ข้อมูลไม่ถูกต้อง' },
          404: { description: 'ไม่พบลูกค้า' },
        },
      },
      delete: {
        tags: ['Customers'],
        summary: 'ลบข้อมูลลูกค้า',
        description: 'ลบข้อมูลลูกค้าและรายการสั่งซื้อที่เกี่ยวข้องทั้งหมดออกจากระบบ (Cascade Delete)',
        operationId: 'deleteCustomer',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Customer ID', schema: { type: 'integer', example: 1 } },
        ],
        responses: {
          200: {
            description: 'ลบข้อมูลลูกค้าสำเร็จ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string',  example: 'Customer #1 deleted successfully.' },
                  },
                },
              },
            },
          },
          404: { description: 'ไม่พบลูกค้า' },
        },
      },
    },

    // ──────────────────────────── ORDERS ────────────────────────────
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'แสดงรายการสั่งซื้อทั้งหมด',
        description: 'ดึงรายการคำสั่งซื้อทั้งหมดในระบบ พร้อม JOIN ข้อมูลลูกค้า (ชื่อ, เบอร์โทร, ที่อยู่) และคำนวณระยะจัดส่งจาก มมส.',
        operationId: 'getAllOrders',
        responses: {
          ...listResponse(orderSchema, 'ดึงรายการสั่งซื้อสำเร็จ'),
          500: { description: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'สร้างคำสั่งซื้อใหม่',
        description: 'เพิ่มรายการสั่งซื้อใหม่เข้าระบบ โดยคำนวณยอดรวม (total_price = box_count * price_per_box) โดยอัตโนมัติ',
        operationId: 'createOrder',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer_id', 'box_count'],
                properties: {
                  customer_id:        { type: 'integer', example: 1, description: 'รหัสลูกค้า' },
                  box_count:          { type: 'integer', example: 5, description: 'จำนวนกล่องที่สั่งซื้อ' },
                  price_per_box:      { type: 'number',  example: 150.0, description: 'ราคาต่อกล่อง (บาท)' },
                  delivery_latitude:  { type: 'number',  example: 16.2455, description: 'พิกัดจัดส่ง (ละติจูด)' },
                  delivery_longitude: { type: 'number',  example: 103.2512, description: 'พิกัดจัดส่ง (ลองจิจูด)' },
                  status:             { type: 'string',  example: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
                  notes:              { type: 'string',  example: 'ส่งที่โต๊ะ รปภ. หน้าอาคาร' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'สร้างคำสั่งซื้อสำเร็จ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string',  example: 'Order created successfully' },
                    data:    orderSchema,
                  },
                },
              },
            },
          },
          400: { description: 'ข้อมูลคำสั่งซื้อไม่ถูกต้อง' },
          404: { description: 'ไม่พบ customer_id ที่ระบุในระบบ' },
        },
      },
    },

    '/orders/seed': {
      post: {
        tags: ['Orders'],
        summary: 'จำลองรายการสั่งซื้อ 20-30 รายการ',
        description: 'สร้างชุดข้อมูลจำลองการสั่งซื้อ 20-30 รายการ พร้อมจับคู่ข้อมูลลูกค้าจริง และสุ่มพิกัดจัดส่งในพื้นที่รอบ มมส. ขามเรียง ใช้สำหรับทดสอบระบบ',
        operationId: 'seedOrders',
        parameters: [
          {
            name: 'count',
            in: 'query',
            required: false,
            description: 'จำนวนรายการที่ต้องการจำลอง (แนะนำ 20 - 30 รายการ)',
            schema: { type: 'integer', example: 25, minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          201: {
            description: 'จำลองข้อมูลคำสั่งซื้อสำเร็จ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string',  example: 'Successfully simulated 25 orders.' },
                    count:   { type: 'integer', example: 25 },
                    data:    { type: 'array', items: orderSchema },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/orders/clear': {
      delete: {
        tags: ['Orders'],
        summary: 'ล้างรายการสั่งซื้อทั้งหมด (Delete All Orders)',
        description: 'ลบรายการคำสั่งซื้อทั้งหมดในตาราง orders โดยไม่ส่งผลกระทบต่อข้อมูลลูกค้า',
        operationId: 'clearOrders',
        responses: {
          200: {
            description: 'ล้างข้อมูลคำสั่งซื้อสำเร็จ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success:       { type: 'boolean', example: true },
                    message:       { type: 'string',  example: 'All orders have been cleared successfully.' },
                    deleted_count: { type: 'integer', example: 25 },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'ล้างรายการสั่งซื้อทั้งหมด (POST Method Fallback)',
        description: 'ทางเลือกสำรองสำหรับเรียกเคลียร์คำสั่งซื้อผ่านเมธอด POST',
        operationId: 'clearOrdersPost',
        responses: {
          200: { description: 'ล้างข้อมูลสำเร็จ' },
        },
      },
    },

    '/orders/nearby': {
      get: {
        tags: ['Orders'],
        summary: 'แสดงรายการสั่งซื้อทั้งหมดในระยะ 2 กิโลเมตร จากพิกัดที่กำหนด',
        description: 'คำนวณระยะจัดส่งจากจุดศูนย์กลาง มมส. ขามเรียง (หรือพิกัดที่กำหนด) คืนเฉพาะคำสั่งซื้อที่มีระยะจัดส่งไม่เกิน 2 กิโลเมตร เรียงลำดับตามระยะทาง',
        operationId: 'getNearbyOrders',
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: false,
            description: 'ละติจูดศูนย์กลาง (ค่าเริ่มต้น: 16.2458 มมส. ขามเรียง)',
            schema: { type: 'number', example: 16.2458 },
          },
          {
            name: 'lng',
            in: 'query',
            required: false,
            description: 'ลองจิจูดศูนย์กลาง (ค่าเริ่มต้น: 103.2508 มมส. ขามเรียง)',
            schema: { type: 'number', example: 103.2508 },
          },
          {
            name: 'radius',
            in: 'query',
            required: false,
            description: 'รัศมีการค้นหาเป็นกิโลเมตร (ค่าเริ่มต้น: 2.0 km ตามเงื่อนไข)',
            schema: { type: 'number', example: 2.0 },
          },
        ],
        responses: {
          200: {
            description: 'พบรายการสั่งซื้อในรัศมีที่กำหนด',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success:   { type: 'boolean', example: true },
                    center: {
                      type: 'object',
                      properties: {
                        latitude:  { type: 'number', example: 16.2458 },
                        longitude: { type: 'number', example: 103.2508 },
                      },
                    },
                    radius_km: { type: 'number',  example: 2.0 },
                    count:     { type: 'integer', example: 18 },
                    data:      { type: 'array', items: orderSchema },
                  },
                },
              },
            },
          },
          400: { description: 'พารามิเตอร์ไม่ถูกต้อง' },
        },
      },
    },

    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'ดึงข้อมูลคำสั่งซื้อตามรหัส ID',
        operationId: 'getOrderById',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Order ID', schema: { type: 'integer', example: 1 } },
        ],
        responses: {
          ...singleResponse(orderSchema, 'พบข้อมูลคำสั่งซื้อ'),
          404: { description: 'ไม่พบคำสั่งซื้อ' },
        },
      },
      put: {
        tags: ['Orders'],
        summary: 'แก้ไขข้อมูลคำสั่งซื้อ',
        description: 'อัปเดตรายละเอียดคำสั่งซื้อ เช่น จำนวนกล่อง, ราคา, สถานะ, หรือหมายเหตุ',
        operationId: 'updateOrder',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Order ID', schema: { type: 'integer', example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  box_count:     { type: 'integer', example: 12 },
                  price_per_box: { type: 'number',  example: 150.0 },
                  status:        { type: 'string',  example: 'Delivered', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
                  notes:         { type: 'string',  example: 'ส่งมอบสินค้าเรียบร้อย' },
                },
              },
            },
          },
        },
        responses: {
          ...singleResponse(orderSchema, 'แก้ไขคำสั่งซื้อสำเร็จ'),
          400: { description: 'ข้อมูลไม่ถูกต้อง' },
          404: { description: 'ไม่พบคำสั่งซื้อ' },
        },
      },
      delete: {
        tags: ['Orders'],
        summary: 'ลบรายการสั่งซื้อ',
        operationId: 'deleteOrder',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Order ID', schema: { type: 'integer', example: 1 } },
        ],
        responses: {
          200: {
            description: 'ลบคำสั่งซื้อสำเร็จ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string',  example: 'Order #1 deleted successfully.' },
                  },
                },
              },
            },
          },
          404: { description: 'ไม่พบคำสั่งซื้อ' },
        },
      },
    },

    '/orders/{id}/box-count': {
      patch: {
        tags: ['Orders'],
        summary: 'แก้ไขจำนวนกล่องที่สั่งซื้อในแต่ละออร์เดอร์ (Dedicated Box Count Update)',
        description: 'แก้ไขเฉพาะฟิลด์ `box_count` โดยระบบจะคำนวณยอดรวม (`total_price`) ใหม่อัตโนมัติจากราคาต่อกล่องเดิม',
        operationId: 'updateBoxCount',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Order ID', schema: { type: 'integer', example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['box_count'],
                properties: {
                  box_count: { type: 'integer', example: 15, minimum: 1, description: 'จำนวนกล่องใหม่ (ต้อง >= 1)' },
                },
              },
            },
          },
        },
        responses: {
          ...singleResponse(orderSchema, 'อัปเดตจำนวนกล่องสำเร็จ'),
          400: { description: 'จำนวนกล่องต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป' },
          404: { description: 'ไม่พบคำสั่งซื้อ' },
        },
      },
    },
  },
};

// ========================================================
// Swagger Setup with Senior-Developer Clean Theme
// ========================================================
export function setupSwagger(app: Express): void {
  const customCss = `
    /* Topbar Header Style */
    .swagger-ui .topbar {
      background-color: #0f172a;
      border-bottom: 2px solid #334155;
      padding: 12px 0;
    }
    .swagger-ui .topbar .topbar-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .swagger-ui .topbar .topbar-wrapper::before {
      content: '⚡ API Explorer — Customer & Orders System';
      color: #38bdf8;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: -0.01em;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .swagger-ui .topbar .topbar-wrapper a {
      display: none;
    }

    /* Information Section */
    .swagger-ui .info {
      margin: 28px 0 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .swagger-ui .info .title {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
    }
    .swagger-ui .info .description {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }
    .swagger-ui .info .description code {
      background: #f1f5f9;
      color: #0284c7;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Method Badges */
    .swagger-ui .opblock.opblock-get    { border-color: #38bdf8; background: #f0f9ff; }
    .swagger-ui .opblock.opblock-get    .opblock-summary-method { background: #0284c7; font-weight: 700; border-radius: 6px; }
    
    .swagger-ui .opblock.opblock-post   { border-color: #34d399; background: #ecfdf5; }
    .swagger-ui .opblock.opblock-post   .opblock-summary-method { background: #059669; font-weight: 700; border-radius: 6px; }
    
    .swagger-ui .opblock.opblock-put    { border-color: #fbbf24; background: #fffbeb; }
    .swagger-ui .opblock.opblock-put    .opblock-summary-method { background: #d97706; font-weight: 700; border-radius: 6px; }
    
    .swagger-ui .opblock.opblock-patch  { border-color: #a78bfa; background: #f5f3ff; }
    .swagger-ui .opblock.opblock-patch  .opblock-summary-method { background: #7c3aed; font-weight: 700; border-radius: 6px; }
    
    .swagger-ui .opblock.opblock-delete { border-color: #f87171; background: #fef2f2; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #dc2626; font-weight: 700; border-radius: 6px; }

    /* Try It Out & Execute Buttons */
    .swagger-ui .btn.execute {
      background-color: #0284c7;
      border-color: #0284c7;
      color: #ffffff;
      font-weight: 600;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);
    }
    .swagger-ui .btn.execute:hover {
      background-color: #0369a1;
    }
    .swagger-ui .btn.try-out__btn {
      border-radius: 6px;
      font-weight: 600;
    }

    /* Response & Server Box */
    .swagger-ui .responses-inner {
      padding: 12px;
      border-radius: 8px;
    }
    .swagger-ui .servers > label select {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 12px;
      font-weight: 500;
    }
  `;

  const swaggerUiOptions = {
    customCss,
    customSiteTitle: 'Web API Documentation | Customer & Orders System',
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      filter: true,
    },
  };

  // Mount Swagger UI at /api/docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions) as any);

  // Raw OpenAPI JSON spec endpoint
  app.get('/api/swagger.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
}
