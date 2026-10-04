import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  PackageSearch,
  Phone,
  PlayCircle,
  Shirt,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { useStore, type LegKey } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { courierById, serviceById } from '../../data/demoData'
import { Badge, Button, Card, CardHeader, EmptyState } from '../../components/ui'
import {
  LaundryBadge,
  LegTimeline,
  PaymentBadge,
} from '../../components/Status'
import MockMap from '../../components/MockMap'

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: typeof User
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon size={15} className="text-slate-400" />}
        {label}
      </span>
      <span className="text-right text-sm font-semibold break-words text-slate-800">
        {value}
      </span>
    </div>
  )
}

export default function CourierTaskDetail() {
  const { id, leg: legParam } = useParams()
  const { user, orders, startLeg, finishLeg } = useStore()
  const navigate = useNavigate()

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id])

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Tugas tidak ditemukan"
        description="Tugas yang Anda cari tidak tersedia."
        action={
          <Button icon={ArrowLeft} onClick={() => navigate('/kurir')}>
            Kembali ke Tugas Saya
          </Button>
        }
      />
    )
  }

  // Default ke tahap yang belum selesai.
  const fallbackLeg: LegKey =
    order.delivery.pickup.enabled && order.delivery.pickup.status !== 'Selesai'
      ? 'pickup'
      : 'delivery'
  const leg: LegKey =
    legParam === 'pickup' || legParam === 'delivery' ? legParam : fallbackLeg

  const enabled = order.delivery[leg].enabled
  const status = order.delivery[leg].status
  const layanan = serviceById(order.serviceId)
  const kurir = courierById(order.delivery.courierId)
  const isPickup = leg === 'pickup'

  const jadwal = isPickup
    ? `${formatDate(order.delivery.date)}, ${order.delivery.time} WIB`
    : `${formatDate(order.delivery.destDate)}, ${order.delivery.destTime} WIB`

  return (
    <div className="space-y-5">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/kurir')}>
        Kembali ke Tugas Saya
      </Button>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Order ID</p>
            <h2 className="text-2xl font-extrabold text-primary">{order.id}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Badge tone={isPickup ? 'blue' : 'green'}>
                {isPickup ? (
                  <>
                    <Bike size={12} /> Tahap 1 — Penjemputan
                  </>
                ) : (
                  <>
                    <Truck size={12} /> Tahap 2 — Pengantaran
                  </>
                )}
              </Badge>
              <span>
                {layanan.name} • {order.weightKg} kg
              </span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Badge
              tone={
                status === 'Selesai'
                  ? 'green'
                  : status === 'Dalam Perjalanan'
                    ? 'blue'
                    : status === 'Kurir Ditugaskan'
                      ? 'purple'
                      : 'slate'
              }
            >
              {status}
            </Badge>
            <p className="text-xs text-slate-500">
              {order.delivery.courierId === user?.id
                ? 'Tugas Anda'
                : `Ditugaskan ke ${kurir?.name ?? '-'}`}
            </p>
          </div>
        </div>

        {/* Ringkasan tahap lain */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(['pickup', 'delivery'] as const).map((k) => {
            if (!order.delivery[k].enabled) return null
            const active = k === leg
            const done = order.delivery[k].status === 'Selesai'
            return (
              <button
                key={k}
                onClick={() => navigate(`/kurir/tugas/${order.id}/${k}`)}
                className={`flex items-center justify-between gap-2 rounded-lg border-2 px-3.5 py-2.5 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary-light/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  {k === 'pickup' ? <Bike size={15} /> : <Truck size={15} />}
                  {k === 'pickup' ? 'Tahap 1 — Penjemputan' : 'Tahap 2 — Pengantaran'}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {done ? 'Selesai' : active ? 'Tugas aktif' : order.delivery[k].status}
                </span>
              </button>
            )
          })}
        </div>

        {/* Aksi tugas */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {!enabled ? (
            <div className="flex w-full items-center gap-3 rounded-lg bg-slate-100 px-4 py-3">
              <Store size={20} className="shrink-0 text-slate-500" />
              <p className="text-sm font-semibold text-slate-600">
                Tahap ini tidak digunakan untuk pesanan {order.id}.
              </p>
            </div>
          ) : status === 'Kurir Ditugaskan' ? (
            <Button size="lg" icon={PlayCircle} onClick={() => startLeg(order.id, leg)}>
              Mulai Tugas
            </Button>
          ) : status === 'Dalam Perjalanan' ? (
            <Button
              size="lg"
              variant="secondary"
              icon={CheckCircle2}
              onClick={() => finishLeg(order.id, leg)}
            >
              Selesaikan Tugas
            </Button>
          ) : status === 'Selesai' ? (
            <div className="flex w-full items-center gap-3 rounded-lg bg-secondary-light px-4 py-3">
              <CheckCircle2 size={20} className="shrink-0 text-secondary-dark" />
              <p className="text-sm font-semibold text-secondary-dark">
                {isPickup
                  ? 'Jemputan selesai — laundry sudah masuk outlet dan akan diproses.'
                  : 'Pengantaran selesai. Pelanggan sudah menerima notifikasi.'}
              </p>
            </div>
          ) : (
            <div className="flex w-full items-center gap-3 rounded-lg bg-warning-light px-4 py-3">
              <Clock size={20} className="shrink-0 text-warning-dark" />
              <p className="text-sm font-semibold text-slate-700">
                Menunggu admin menugaskan kurir untuk tahap ini.
              </p>
            </div>
          )}

          {order.delivery.courierId === user?.id && (
            <a href={`tel:${order.customerPhone}`} className="sm:ml-auto">
              <Button variant="outline" size="lg" icon={Phone} full>
                Hubungi Pelanggan
              </Button>
            </a>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Data Pelanggan"
              subtitle={isPickup ? 'Titik pengambilan laundry' : 'Tujuan pengantaran laundry'}
              icon={User}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3.5">
                <p className="text-xs text-slate-500">Nama Pelanggan</p>
                <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3.5">
                <p className="text-xs text-slate-500">Nomor Telepon</p>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {order.customerPhone}
                </a>
              </div>
              <div className="rounded-lg border border-slate-200 p-3.5 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={13} /> Alamat Pelanggan
                </p>
                <p className="text-sm leading-relaxed font-semibold text-slate-800">
                  {order.customerAddress}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3.5 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={13} /> Jadwal
                </p>
                <p className="text-sm font-bold text-slate-800">{jadwal}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Detail Laundry"
              subtitle="Barang yang perlu diantar atau dijemput"
              icon={Shirt}
            />
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div>
                <InfoRow label="Jenis Layanan" value={layanan.name} icon={Shirt} />
                <InfoRow label="Berat" value={`${order.weightKg} kg`} />
                <InfoRow label="Total Biaya" value={formatRupiah(order.total)} icon={Wallet} />
              </div>
              <div>
                <InfoRow label="Tahap Tugas" value={isPickup ? 'Penjemputan' : 'Pengantaran'} icon={Bike} />
                <InfoRow
                  label="Tujuan"
                  value={isPickup ? 'Outlet LaundryKu' : order.customerAddress}
                />
                <InfoRow label="Catatan" value={order.note || '-'} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <LaundryBadge status={order.laundryStatus} />
              <PaymentBadge status={order.paymentStatus} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Peta Ilustratif" subtitle="Simulasi posisi pengiriman" />
            <MockMap
              status={status}
              label={
                !enabled
                  ? 'Tahap ini tidak digunakan'
                  : status === 'Selesai'
                    ? isPickup
                      ? 'Laundry sudah masuk ke outlet'
                      : 'Pengiriman telah diterima pelanggan'
                    : status === 'Dalam Perjalanan'
                      ? isPickup
                        ? 'Dalam perjalanan menuju outlet'
                        : 'Dalam perjalanan menuju pelanggan'
                      : 'Kurir siap berangkat'
              }
            />
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Status Tugas" subtitle="Perjalanan tahap ini" icon={Navigation} />
            <LegTimeline
              title={isPickup ? 'Tahap 1 — Penjemputan' : 'Tahap 2 — Pengantaran'}
              subtitle={
                isPickup
                  ? 'Ambil laundry dari pelanggan ke outlet'
                  : 'Antar laundry dari outlet ke pelanggan'
              }
              icon={isPickup ? Bike : Truck}
              status={status}
              enabled={enabled}
            />
          </Card>

          {kurir && (
            <Card>
              <CardHeader title="Kurir Ditugaskan" icon={Truck} />
              <div className="flex items-center gap-3 rounded-lg bg-primary-light/50 p-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {kurir.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{kurir.name}</p>
                  <p className="text-xs text-slate-500">{kurir.vehicle ?? 'Kurir LaundryKu'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}