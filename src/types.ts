export type Role = 'customer' | 'admin' | 'courier'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: Role
  password: string
  /** untuk kurir */
  vehicle?: string
}

export interface Service {
  id: string
  name: string
  pricePerKg: number
  description: string
  estimateDays: number
}

/** 5 tahap status laundry sesuai spesifikasi */
export const LAUNDRY_STEPS = [
  'Pesanan Dibuat',
  'Diproses',
  'Laundry Selesai',
  'Siap Diambil/Diantar',
  'Selesai',
] as const

export type LaundryStatus = (typeof LAUNDRY_STEPS)[number]
export type PaymentStatus = 'Belum Dibayar' | 'Sudah Dibayar'
export type DeliveryStatus =
  | 'Menunggu Kurir'
  | 'Kurir Ditugaskan'
  | 'Dalam Perjalanan'
  | 'Selesai'

/** 4 tahap status tiap tahap pengiriman */
export const DELIVERY_STEPS: DeliveryStatus[] = [
  'Menunggu Kurir',
  'Kurir Ditugaskan',
  'Dalam Perjalanan',
  'Selesai',
]

/**
 * Pengiriman dipecah menjadi 2 tahap:
 *  1. Penjemputan  -> kurir mengambil laundry dari pelanggan ke outlet
 *  2. Pengantaran -> kurir mengantar laundry dari outlet ke alamat pelanggan
 * Masing-masing tahap bisa dinonaktifkan bila pelanggan memilih ambil sendiri.
 */
export interface DeliveryLeg {
  enabled: boolean
  status: DeliveryStatus
}

export interface Delivery {
  pickup: DeliveryLeg
  delivery: DeliveryLeg
  courierId: string | null
  /** jadwal penjemputan */
  date: string
  time: string
  /** jadwal pengantaran */
  destDate: string
  destTime: string
  rescheduleCount: number
}

export type PaymentMethod = 'Virtual Account BCA' | 'QRIS' | 'E-Wallet'

export interface Cancellation {
  at: string
  reason: string
  by: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  serviceId: string
  weightKg: number
  pricePerKg: number
  total: number
  note: string
  orderDate: string
  laundryStatus: LaundryStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod | null
  paymentDate: string | null
  delivery: Delivery
  cancelled: Cancellation | null
}

export interface AppNotification {
  id: string
  /** "customer" | "courier" | "admin" atau id user spesifik */
  recipient: string
  title: string
  message: string
  time: string
  read: boolean
  kind: 'info' | 'success' | 'warning'
}