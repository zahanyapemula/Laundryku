import { Bike, Check, Circle, Clock, PackageCheck, Shirt, Store, Truck } from 'lucide-react'
import type { DeliveryStatus, LaundryStatus, Order, PaymentStatus } from '../types'
import { DELIVERY_STEPS, LAUNDRY_STEPS } from '../types'
import { Badge } from './ui'

/* --------------------------- Status badges -------------------------- */

export function LaundryBadge({ status }: { status: LaundryStatus }) {
  const tone =
    status === 'Selesai'
      ? 'green'
      : status === 'Laundry Selesai'
        ? 'blue'
        : status === 'Siap Diambil/Diantar'
          ? 'purple'
          : status === 'Diproses'
            ? 'amber'
            : 'slate'
  return <Badge tone={tone}>{status}</Badge>
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return status === 'Sudah Dibayar' ? (
    <Badge tone="green">Sudah Dibayar</Badge>
  ) : (
    <Badge tone="red">Belum Dibayar</Badge>
  )
}

export function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  const tone =
    status === 'Selesai'
      ? 'green'
      : status === 'Dalam Perjalanan'
        ? 'blue'
        : status === 'Kurir Ditugaskan'
          ? 'purple'
          : 'slate'
  return <Badge tone={tone}>{status}</Badge>
}

/** Badge ringkas status pesanan (dibatalkan / aktif). */
export function OrderStateBadge({ order }: { order: Order }) {
  if (order.cancelled) return <Badge tone="red">Dibatalkan</Badge>
  return null
}

/* ------------------------- Step / timeline -------------------------- */

const stepIcon = [Circle, Shirt, Check, PackageCheck, Check]

/** Timeline horizontal untuk halaman Status Laundry */
export function LaundryTimeline({ current }: { current: LaundryStatus }) {
  const currentIndex = LAUNDRY_STEPS.indexOf(current)
  return (
    <ol className="flex flex-col gap-0 md:flex-row md:justify-between">
      {LAUNDRY_STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const Icon = stepIcon[i] ?? Circle
        return (
          <li
            key={step}
            className="relative flex flex-1 items-start gap-3 pb-8 last:pb-0 md:flex-col md:items-center md:gap-2 md:pb-0 md:text-center"
          >
            {i < LAUNDRY_STEPS.length - 1 && (
              <span
                className={`absolute top-9 left-[19px] h-[calc(100%-2rem)] w-0.5 md:top-[19px] md:left-[calc(50%+20px)] md:h-0.5 md:w-[calc(100%-2.5rem)] ${
                  done ? 'bg-secondary' : 'bg-slate-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                done
                  ? 'border-secondary bg-secondary text-white'
                  : active
                    ? 'border-primary bg-primary text-white ring-4 ring-primary/20'
                    : 'border-slate-200 bg-white text-slate-300'
              }`}
            >
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p
                className={`text-sm font-bold ${
                  active
                    ? 'text-primary'
                    : done
                      ? 'text-secondary-dark'
                      : 'text-slate-400'
                }`}
              >
                {step}
              </p>
              <p className="text-xs text-slate-500">
                {done ? 'Selesai' : active ? 'Tahap saat ini' : 'Belum tiba'}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Timeline vertikal ringkas untuk halaman Detail Pesanan */
export function MiniTimeline({ current }: { current: LaundryStatus }) {
  const currentIndex = LAUNDRY_STEPS.indexOf(current)
  return (
    <ol className="space-y-4">
      {LAUNDRY_STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? 'border-secondary bg-secondary text-white'
                    : active
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 bg-white text-slate-300'
                }`}
              >
                {done ? <Check size={14} /> : active ? <Clock size={14} /> : <Circle size={10} />}
              </span>
              {i < LAUNDRY_STEPS.length - 1 && (
                <span className={`my-1 w-0.5 flex-1 ${done ? 'bg-secondary' : 'bg-slate-200'}`} />
              )}
            </div>
            <div className="pt-1">
              <p
                className={`text-sm font-semibold ${
                  active ? 'text-primary' : done ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step}
              </p>
              {active && <p className="text-xs text-primary">Tahap saat ini</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------- 2 tahap pengiriman ----------------------- */

export interface LegInfo {
  key: 'pickup' | 'delivery'
  title: string
  subtitle: string
  icon: typeof Bike
  status: DeliveryStatus
  enabled: boolean
  date: string
  time: string
}

export function getLegs(order: Order): LegInfo[] {
  return [
    {
      key: 'pickup',
      title: 'Tahap 1 — Penjemputan',
      subtitle: 'Kurir mengambil laundry dari Anda ke outlet',
      icon: Bike,
      status: order.delivery.pickup.status,
      enabled: order.delivery.pickup.enabled,
      date: order.delivery.date,
      time: order.delivery.time,
    },
    {
      key: 'delivery',
      title: 'Tahap 2 — Pengantaran',
      subtitle: 'Laundry diantar dari outlet ke alamat Anda',
      icon: Truck,
      status: order.delivery.delivery.status,
      enabled: order.delivery.delivery.enabled,
      date: order.delivery.destDate,
      time: order.delivery.destTime,
    },
  ]
}

/** Timeline vertikal untuk satu tahap pengiriman. */
export function LegTimeline({
  status,
  enabled,
  title,
  subtitle,
  icon: Icon,
}: Omit<LegInfo, 'status' | 'date' | 'time' | 'key'> & {
  status: DeliveryStatus
  enabled: boolean
}) {
  if (!enabled) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <Store size={18} className="mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <p className="text-xs text-slate-500">
            Tahap ini tidak dipilih — Anda mengambil laundry sendiri di outlet.
          </p>
        </div>
      </div>
    )
  }

  const currentIndex = DELIVERY_STEPS.indexOf(status)
  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <ol className="space-y-3">
        {DELIVERY_STEPS.map((step, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? 'border-secondary bg-secondary text-white'
                    : active
                      ? 'border-primary bg-primary text-white ring-4 ring-primary/15'
                      : 'border-slate-200 bg-white text-slate-300'
                }`}
              >
                {done ? (
                  <Check size={15} />
                ) : active ? (
                  <Icon size={15} />
                ) : (
                  <Circle size={9} />
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      active ? 'text-primary' : done ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </p>
                  {active && <DeliveryBadge status={step} />}
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      done ? 'bg-secondary' : active ? 'bg-primary' : 'bg-transparent'
                    }`}
                    style={{
                      width: `${((i + (done || active ? 1 : 0)) / DELIVERY_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Versi ringkas (untuk list/tabel). */
export function LegSummary({ order }: { order: Order }) {
  const legs = getLegs(order).filter((l) => l.enabled)
  if (legs.length === 0) {
    return <Badge tone="slate">Ambil di Outlet</Badge>
  }
  return (
    <div className="flex flex-col gap-1">
      {legs.map((l) => (
        <span key={l.key} className="flex items-center gap-1.5 text-xs">
          <l.icon size={12} className="text-slate-400" />
          <span className="font-semibold text-slate-600">
            {l.key === 'pickup' ? 'Jemput' : 'Antar'}:
          </span>
          <DeliveryBadge status={l.status} />
        </span>
      ))}
    </div>
  )
}