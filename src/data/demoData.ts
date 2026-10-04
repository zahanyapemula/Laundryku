import type { Order, Service, User } from '../types'

export const SERVICES: Service[] = [
  {
    id: 'svc-cuci-kering',
    name: 'Cuci Kering',
    pricePerKg: 10000,
    description: 'Pencucian dan pengeringan, tanpa setrika.',
    estimateDays: 3,
  },
  {
    id: 'svc-cuci-setrika',
    name: 'Cuci Setrika',
    pricePerKg: 12000,
    description: 'Pencucian, pengeringan, dan setrika rapi.',
    estimateDays: 2,
  },
  {
    id: 'svc-setrika',
    name: 'Setrika',
    pricePerKg: 8000,
    description: 'Setrika saja untuk pakaian yang sudah bersih.',
    estimateDays: 1,
  },
  {
    id: 'svc-express',
    name: 'Express',
    pricePerKg: 18000,
    description: 'Layanan kilat, selesai dalam 1x24 jam.',
    estimateDays: 1,
  },
]

export const serviceById = (id: string) =>
  SERVICES.find((s) => s.id === id) ?? SERVICES[0]

export const PAYMENT_METHODS = [
  'Virtual Account BCA',
  'QRIS',
  'E-Wallet',
] as const

export const DELIVERY_METHODS = ['Penjemputan', 'Pengantaran'] as const
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]

export const DEMO_USERS: User[] = [
  {
    id: 'u-customer',
    name: 'Andi',
    email: 'customer@laundry.com',
    phone: '081234567890',
    address: 'Jl. Ahmad Yani No. 12, Jakarta',
    role: 'customer',
    password: 'laundry123',
  },
  {
    id: 'u-admin',
    name: 'Rina Admin',
    email: 'admin@laundry.com',
    phone: '081200000001',
    address: 'Kantor LaundryKu, Jakarta',
    role: 'admin',
    password: 'laundry123',
  },
  {
    id: 'u-courier-budi',
    name: 'Budi',
    email: 'courier@laundry.com',
    phone: '081300000001',
    address: 'Jakarta Selatan',
    role: 'courier',
    password: 'laundry123',
    vehicle: 'Motor Honda Beat',
  },
  {
    id: 'u-courier-sari',
    name: 'Sari',
    email: 'sari@laundry.com',
    phone: '081300000002',
    address: 'Jakarta Timur',
    role: 'courier',
    password: 'laundry123',
    vehicle: 'Motor Yamaha Mio',
  },
  {
    id: 'u-courier-dimas',
    name: 'Dimas',
    email: 'dimas@laundry.com',
    phone: '081300000003',
    address: 'Jakarta Barat',
    role: 'courier',
    password: 'laundry123',
    vehicle: 'Sepeda Listrik',
  },
]

export const courierById = (id: string | null) =>
  DEMO_USERS.find((u) => u.id === id) ?? null

export const COURIERS = DEMO_USERS.filter((u) => u.role === 'courier')

/** Data demo utama — konsisten di semua role (Customer, Admin, Kurir). */
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'u-customer',
    customerName: 'Andi',
    customerPhone: '081234567890',
    customerAddress: 'Jl. Ahmad Yani No. 12, Jakarta',
    serviceId: 'svc-cuci-kering',
    weightKg: 5,
    pricePerKg: 10000,
    total: 50000,
    note: 'Tolong pisahkan kaos dan handek yang berwarna gelap.',
    orderDate: '2026-10-04',
    laundryStatus: 'Diproses',
    paymentStatus: 'Belum Dibayar',
    paymentMethod: null,
    paymentDate: null,
    delivery: {
      pickup: { enabled: true, status: 'Selesai' },
      delivery: { enabled: true, status: 'Kurir Ditugaskan' },
      courierId: 'u-courier-budi',
      date: '2026-10-04',
      time: '10:00',
      destDate: '2026-10-05',
      destTime: '10:00',
      rescheduleCount: 0,
    },
    cancelled: null,
  },
  {
    id: 'ORD-002',
    customerId: 'u-customer',
    customerName: 'Andi',
    customerPhone: '081234567890',
    customerAddress: 'Jl. Ahmad Yani No. 12, Jakarta',
    serviceId: 'svc-cuci-setrika',
    weightKg: 3,
    pricePerKg: 12000,
    total: 36000,
    note: 'Setrika thermal dan kemeja kerja.',
    orderDate: '2026-09-28',
    laundryStatus: 'Selesai',
    paymentStatus: 'Sudah Dibayar',
    paymentMethod: 'QRIS',
    paymentDate: '2026-09-28',
    delivery: {
      pickup: { enabled: true, status: 'Selesai' },
      delivery: { enabled: false, status: 'Selesai' },
      courierId: 'u-courier-sari',
      date: '2026-09-28',
      time: '14:00',
      destDate: '2026-09-28',
      destTime: '15:00',
      rescheduleCount: 0,
    },
    cancelled: null,
  },
  {
    id: 'ORD-003',
    customerId: 'u-customer',
    customerName: 'Andi',
    customerPhone: '081234567890',
    customerAddress: 'Jl. Ahmad Yani No. 12, Jakarta',
    serviceId: 'svc-express',
    weightKg: 2,
    pricePerKg: 18000,
    total: 36000,
    note: '',
    orderDate: '2026-10-03',
    laundryStatus: 'Pesanan Dibuat',
    paymentStatus: 'Belum Dibayar',
    paymentMethod: null,
    paymentDate: null,
    delivery: {
      pickup: { enabled: true, status: 'Menunggu Kurir' },
      delivery: { enabled: true, status: 'Menunggu Kurir' },
      courierId: null,
      date: '2026-10-05',
      time: '16:00',
      destDate: '2026-10-08',
      destTime: '16:00',
      rescheduleCount: 0,
    },
    cancelled: null,
  },
]