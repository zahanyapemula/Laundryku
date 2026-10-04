import type { Order } from '../types'
import { COURIERS } from '../data/demoData'

/**
 * Klien API untuk backend PHP (opsional).
 * - Jika `api/index.php` aktif & database tersedia -> data disinkronkan ke MySQL.
 * - Jika tidak -> semua promise ditolak agar aplikasi jatuh ke localStorage.
 */

const ENDPOINT = '/api/index.php'
const TIMEOUT_MS = 2500

async function request<T>(params: Record<string, string>, init?: RequestInit): Promise<T> {
  const qs = new URLSearchParams(params).toString()
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${ENDPOINT}?${qs}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const json = (await res.json()) as { ok: boolean; data?: T; error?: string }
    if (!json.ok) throw new Error(json.error ?? 'API error')
    return json.data as T
  } finally {
    window.clearTimeout(timer)
  }
}

/** Lengkapi data pengiriman dengan informasi kurir agar tersimpan penuh di DB. */
function enrich(order: Order) {
  const kurir = COURIERS.find((c) => c.id === order.delivery.courierId)
  return {
    ...order,
    delivery: {
      ...order.delivery,
      courierName: kurir?.name ?? null,
      courierPhone: kurir?.phone ?? null,
      courierVehicle: kurir?.vehicle ?? null,
    },
  }
}

export const api = {
  /** Ambil seluruh pesanan dari database. Menolak bila backend tidak aktif. */
  async pullOrders(): Promise<Order[]> {
    return request<Order[]>({ action: 'list_orders' })
  },

  /** Kirim salinan state ke database (dipanggil debounced). */
  async pushOrders(orders: Order[]): Promise<{ saved: number }> {
    return request<{ saved: number }>(
      { action: 'sync_orders' },
      { method: 'POST', body: JSON.stringify({ orders: orders.map(enrich) }) },
    )
  },
}