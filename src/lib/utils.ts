import type { AppNotification } from '../types'

export const formatRupiah = (value: number) =>
  'Rp' + Math.round(value).toLocaleString('id-ID')

export const formatDate = (iso: string) => {
  if (!iso) return '-'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateShort = (iso: string) => {
  if (!iso) return '-'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const todayISO = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export const timeAgo = (isoTime: string) => {
  const then = new Date(isoTime).getTime()
  const diff = Date.now() - then
  const minute = Math.floor(diff / 60000)
  if (minute < 1) return 'Baru saja'
  if (minute < 60) return `${minute} menit lalu`
  const hour = Math.floor(minute / 60)
  if (hour < 24) return `${hour} jam lalu`
  const day = Math.floor(hour / 24)
  return `${day} hari lalu`
}

export const roleLabel = (role: string) =>
  role === 'admin'
    ? 'Admin/Kasir'
    : role === 'courier'
      ? 'Kurir'
      : 'Pelanggan'

let counter = 0
export const uniqueId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}`

export const nextOrderId = (orders: { id: string }[]) => {
  const numbers = orders
    .map((o) => Number(o.id.replace('ORD-', '')))
    .filter((n) => !Number.isNaN(n))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `ORD-${String(next).padStart(3, '0')}`
}

export type { AppNotification }