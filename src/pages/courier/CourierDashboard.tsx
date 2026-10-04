import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Package,
  Phone,
  PlayCircle,
  Truck,
} from 'lucide-react'
import { useStore, type LegKey } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { serviceById } from '../../data/demoData'
import type { DeliveryStatus } from '../../types'
import { Button, Card, CardHeader, EmptyState, StatCard } from '../../components/ui'
import { DeliveryBadge } from '../../components/Status'

interface Task {
  orderId: string
  leg: LegKey
  label: string
  Icon: typeof Bike
  status: DeliveryStatus
}

const FILTERS: { id: DeliveryStatus | 'semua'; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'Kurir Ditugaskan', label: 'Ditugaskan' },
  { id: 'Dalam Perjalanan', label: 'Aktif' },
  { id: 'Selesai', label: 'Selesai' },
]

export default function CourierDashboard() {
  const { user, orders, startLeg } = useStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<DeliveryStatus | 'semua'>('semua')

  /** Setiap order menghasilkan 1-2 tugas: Penjemputan lalu Pengantaran. */
  const tasks = useMemo<Task[]>(() => {
    const out: Task[] = []
    orders
      .filter((o) => o.delivery.courierId === user?.id && !o.cancelled)
      .forEach((o) => {
        if (o.delivery.pickup.enabled) {
          out.push({
            orderId: o.id,
            leg: 'pickup',
            label: 'Penjemputan',
            Icon: Bike,
            status: o.delivery.pickup.status,
          })
        }
        if (o.delivery.delivery.enabled) {
          out.push({
            orderId: o.id,
            leg: 'delivery',
            label: 'Pengantaran',
            Icon: Truck,
            status: o.delivery.delivery.status,
          })
        }
      })
    return out
  }, [orders, user])

  const pending = tasks.filter(
    (t) => t.status === 'Menunggu Kurir' || t.status === 'Kurir Ditugaskan',
  ).length
  const aktif = tasks.filter((t) => t.status === 'Dalam Perjalanan').length
  const selesai = tasks.filter((t) => t.status === 'Selesai').length

  const filtered = useMemo(
    () => (filter === 'semua' ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter],
  )

  const orderOf = (id: string) => orders.find((o) => o.id === id)

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-start gap-4 border-0 bg-gradient-to-r from-primary to-primary-dark text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">Halo, {user?.name}! 👋</h2>
          <p className="mt-1 text-sm text-primary-light">
            Tugas penjemputan dan pengantaran laundry Anda, berurutan dalam 2 tahap.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/25">
          <Package size={18} />
          {tasks.length} tugas terdaftar
        </span>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tugas" value={tasks.length} icon={Package} tone="blue" />
        <StatCard label="Pending" value={pending} icon={Clock} tone="amber" hint="Menunggu dikerjakan" />
        <StatCard label="Aktif" value={aktif} icon={Truck} tone="purple" hint="Sedang berjalan" />
        <StatCard label="Selesai" value={selesai} icon={CheckCircle2} tone="green" hint="Telah diselesaikan" />
      </div>

      <Card>
        <CardHeader
          title="Daftar Tugas"
          subtitle="Tahap 1 penjemputan, tahap 2 pengantaran"
          icon={Filter}
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum ada tugas kurir"
          description={
            tasks.length === 0
              ? 'Admin belum menugaskan penjemputan atau pengantaran kepada Anda.'
              : 'Tidak ada tugas pada status ini. Pilih filter lain untuk melihat tugas Anda.'
          }
          action={
            tasks.length > 0 ? (
              <Button variant="outline" onClick={() => setFilter('semua')}>
                Lihat Semua Tugas
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((t) => {
            const o = orderOf(t.orderId)
            if (!o) return null
            const jadwal =
              t.leg === 'pickup'
                ? `${formatDate(o.delivery.date)}, ${o.delivery.time}`
                : `${formatDate(o.delivery.destDate)}, ${o.delivery.destTime}`
            return (
              <Card key={`${t.orderId}-${t.leg}`} className={t.leg === 'pickup' ? 'border-primary/40' : 'border-secondary/40'}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-lg font-extrabold text-primary">
                      {t.orderId}
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          t.leg === 'pickup'
                            ? 'bg-primary-light text-primary-dark'
                            : 'bg-secondary-light text-secondary-dark'
                        }`}
                      >
                        <t.Icon size={11} /> {t.label}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {serviceById(o.serviceId).name} • {o.weightKg} kg •{' '}
                      {formatRupiah(o.total)}
                    </p>
                  </div>
                  <DeliveryBadge status={t.status} />
                </div>

                <div className="space-y-2 rounded-lg bg-slate-50 p-3.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Customer</span>
                    <span className="font-bold text-slate-800">{o.customerName}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-slate-500">
                      {t.leg === 'pickup' ? 'Dari alamat' : 'Ke alamat'}
                    </span>
                    <span className="text-right font-semibold text-slate-800">
                      {o.customerAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Telepon</span>
                    <a
                      href={`tel:${o.customerPhone}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {o.customerPhone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Jadwal</span>
                    <span className="font-bold text-slate-800">{jadwal}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Tujuan</span>
                    <span className="font-bold text-slate-800">
                      {t.leg === 'pickup' ? 'Outlet LaundryKu' : o.customerName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  {t.status === 'Kurir Ditugaskan' && (
                    <Button
                      variant="secondary"
                      icon={PlayCircle}
                      onClick={() => startLeg(t.orderId, t.leg)}
                    >
                      Mulai Tugas
                    </Button>
                  )}
                  <Button
                    variant={t.status === 'Dalam Perjalanan' ? 'primary' : 'outline'}
                    icon={ArrowRight}
                    className="flex-1"
                    onClick={() => navigate(`/kurir/tugas/${t.orderId}/${t.leg}`)}
                  >
                    Lihat Tugas
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} /> Alamat lengkap tersedia di detail tugas
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={13} /> Hubungi pelanggan sebelum berangkat
          </span>
        </div>
      )}
    </div>
  )
}