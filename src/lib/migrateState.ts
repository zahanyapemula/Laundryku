import { DELIVERY_STEPS, LAUNDRY_STEPS } from '../types'
import type { AppNotification, DeliveryStatus, Order } from '../types'

/**
 * Data laundry pernah mengalami perubahan struktur (mis. pengiriman dulu satu
 * tahap `type/status`, kini dua tahap `pickup/delivery`). Data lama yang
 * tersimpan di localStorage tidak otomatis berubah, sehingga bisa membuat
 * halaman crash. Fungsi ini merapikan data apa pun yang dibaca dari storage
 * atau dari database sebelum dipakai aplikasi.
 */

const LEG_STATUSES = DELIVERY_STEPS as readonly string[]
const LAUNDRY_STATUSES = LAUNDRY_STEPS as readonly string[]

const pickStatus = (value: unknown, fallback: DeliveryStatus): DeliveryStatus =>
  typeof value === 'string' && LEG_STATUSES.includes(value)
    ? (value as DeliveryStatus)
    : fallback

const bool = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

const text = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback

const num = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

function normalizeDelivery(raw: unknown) {
  const d = (raw ?? {}) as Record<string, unknown>

  // Bentuk LAMA: { type: 'Pengantaran', status, courierId, date, time }
  if (!d.pickup || !d.delivery) {
    const legacyStatus = pickStatus(d.status, 'Menunggu Kurir')
    const legacyType = text(d.type, 'Penjemputan')
    return {
      pickup: { enabled: true, status: legacyStatus },
      delivery: {
        enabled: legacyType === 'Pengantaran',
        status: legacyStatus,
      },
      courierId: typeof d.courierId === 'string' ? d.courierId : null,
      date: text(d.date),
      time: text(d.time),
      destDate: text((d as Record<string, unknown>).destDate, text(d.date)),
      destTime: text((d as Record<string, unknown>).destTime, text(d.time)),
      rescheduleCount: num((d as Record<string, unknown>).rescheduleCount),
    }
  }

  const pickup = (d.pickup ?? {}) as Record<string, unknown>
  const delivery = (d.delivery ?? {}) as Record<string, unknown>
  return {
    pickup: {
      enabled: bool(pickup.enabled, true),
      status: pickStatus(pickup.status, 'Menunggu Kurir'),
    },
    delivery: {
      enabled: bool(delivery.enabled, true),
      status: pickStatus(delivery.status, 'Menunggu Kurir'),
    },
    courierId: typeof d.courierId === 'string' ? d.courierId : null,
    date: text(d.date),
    time: text(d.time),
    destDate: text(d.destDate, text(d.date)),
    destTime: text(d.destTime, text(d.time)),
    rescheduleCount: num(d.rescheduleCount),
  }
}

export function normalizeOrder(raw: unknown): Order {
  const o = (raw ?? {}) as Record<string, unknown>
  const cancelled = o.cancelled as Record<string, unknown> | null

  return {
    id: text(o.id),
    customerId: text(o.customerId, 'u-customer'),
    customerName: text(o.customerName),
    customerPhone: text(o.customerPhone),
    customerAddress: text(o.customerAddress),
    serviceId: text(o.serviceId, 'svc-cuci-kering'),
    weightKg: num(o.weightKg),
    pricePerKg: num(o.pricePerKg),
    total: num(o.total),
    note: text(o.note),
    orderDate: text(o.orderDate, new Date().toISOString().slice(0, 10)),
    laundryStatus:
      typeof o.laundryStatus === 'string' && LAUNDRY_STATUSES.includes(o.laundryStatus)
        ? (o.laundryStatus as Order['laundryStatus'])
        : 'Pesanan Dibuat',
    paymentStatus: o.paymentStatus === 'Sudah Dibayar' ? 'Sudah Dibayar' : 'Belum Dibayar',
    paymentMethod: (o.paymentMethod ?? null) as Order['paymentMethod'],
    paymentDate: (o.paymentDate ?? null) as string | null,
    delivery: normalizeDelivery(o.delivery),
    cancelled: cancelled ? { at: text(cancelled.at), reason: text(cancelled.reason), by: text(cancelled.by) } : null,
  }
}

export function normalizeNotification(raw: unknown): AppNotification {
  const n = (raw ?? {}) as Record<string, unknown>
  const kind = n.kind
  return {
    id: text(n.id, `ntf-${Math.random().toString(36).slice(2)}`),
    recipient: text(n.recipient),
    title: text(n.title),
    message: text(n.message),
    time: text(n.time, new Date().toISOString()),
    read: bool(n.read, false),
    kind: kind === 'success' || kind === 'warning' ? kind : 'info',
  }
}

/** Rapikan seluruh state sebelum dipakai. Data rusak dibuang, bukan membuat crash. */
export function normalizeState(raw: unknown, fallbackOrders: Order[]) {
  const s = (raw ?? {}) as Record<string, unknown>
  const orders = Array.isArray(s.orders)
    ? s.orders.map(normalizeOrder).filter((o) => o.id)
    : []
  const notifications = Array.isArray(s.notifications)
    ? s.notifications.map(normalizeNotification)
    : []
  const user =
    s.user && typeof s.user === 'object' && text((s.user as Record<string, unknown>).role)
      ? (s.user as Record<string, unknown>)
      : null

  return {
    user: user as never,
    orders: orders.length ? orders : fallbackOrders,
    notifications,
  }
}