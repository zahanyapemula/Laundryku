import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  ClipboardList,
  MapPin,
  PackageSearch,
  Phone,
  Store,
  Truck,
  User,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { courierById, serviceById } from '../../data/demoData'
import { Badge, Button, Card, CardHeader, EmptyState } from '../../components/ui'
import { DeliveryBadge, LegTimeline, getLegs } from '../../components/Status'
import MockMap from '../../components/MockMap'

export default function Delivery() {
  const { id } = useParams()
  const { user, orders } = useStore()
  const navigate = useNavigate()

  const list = useMemo(
    () => orders.filter((o) => o.customerId === user?.id && !o.cancelled),
    [orders, user],
  )
  const order = useMemo(() => list.find((o) => o.id === id) ?? list[0], [list, id])

  if (!list.length) {
    return (
      <EmptyState
        icon={Truck}
        title="Belum ada pengantaran"
        description="Informasi penjemputan dan pengantaran laundry akan tampil di sini."
        action={
          <Button icon={ClipboardList} onClick={() => navigate('/pelanggan/pemesanan')}>
            Pesan Laundry
          </Button>
        }
      />
    )
  }

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Pesanan tidak ditemukan"
        description="Pilih pesanan lain dari daftar di bawah."
      />
    )
  }

  const layanan = serviceById(order.serviceId)
  const kurir = courierById(order.delivery.courierId)
  const legs = getLegs(order)
  const statusUntukPeta = order.delivery.delivery.enabled
    ? order.delivery.delivery.status
    : order.delivery.pickup.status

  return (
    <div className="space-y-5">
      {/* Pilih pesanan */}
      {list.length > 1 && (
        <Card>
          <CardHeader
            title="Pilih Pesanan"
            subtitle="Pilih pesanan yang ingin dilacak pengirimannya"
            icon={ClipboardList}
          />
          <div className="flex flex-wrap gap-2">
            {list.map((o) => (
              <button
                key={o.id}
                onClick={() => navigate(`/pelanggan/pesanan/${o.id}/pengantaran`)}
                className={`rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all ${
                  order.id === o.id
                    ? 'border-primary bg-primary-light/50 text-primary-dark'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {o.id}
              </button>
            ))}
          </div>
        </Card>
      )}

      {id && (
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate(`/pelanggan/pesanan/${order.id}`)}
        >
          Kembali ke Detail Pesanan
        </Button>
      )}

      {/* Ringkasan 2 tahap */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
              Penjemputan / Pengantaran
            </p>
            <h2 className="text-2xl font-extrabold text-primary">{order.id}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {layanan.name} • {order.weightKg} kg • {formatRupiah(order.total)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Badge tone="blue">
              {order.delivery.pickup.enabled ? 'Jemput' : 'Tanpa Jemput'} →{' '}
              {order.delivery.delivery.enabled ? 'Antar' : 'Ambil di Outlet'}
            </Badge>
          </div>
        </div>

        {/* Timeline kedua tahap */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {legs.map((leg) => (
            <div
              key={leg.key}
              className={`rounded-xl border-2 p-4 ${
                leg.key === 'pickup'
                  ? 'border-primary/30 bg-primary-light/20'
                  : 'border-secondary/30 bg-secondary-light/20'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  {leg.key === 'pickup' ? <Bike size={16} /> : <Truck size={16} />}
                  {leg.title}
                </p>
                {leg.enabled && <DeliveryBadge status={leg.status} />}
              </div>
              <LegTimeline
                title={leg.title}
                subtitle={leg.subtitle}
                icon={leg.icon}
                status={leg.status}
                enabled={leg.enabled}
              />
              {leg.enabled && (
                <p className="mt-3 flex items-center gap-1.5 border-t border-white/60 pt-3 text-xs font-semibold text-slate-700">
                  <CalendarDays size={13} />
                  {formatDate(leg.date)}, {leg.time} WIB
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Alamat & Kontak Pelanggan"
              subtitle="Data ini dilihat kurir yang ditugaskan"
              icon={User}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3.5">
                <p className="text-xs text-slate-500">Nama Pelanggan</p>
                <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3.5">
                <p className="text-xs text-slate-500">Nomor Telepon</p>
                <p className="text-sm font-bold text-slate-800">{order.customerPhone}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3.5 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={13} /> Alamat Pengantaran
                </p>
                <p className="text-sm leading-relaxed font-semibold text-slate-800">
                  {order.customerAddress}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3.5">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Bike size={13} /> Jadwal Jemput
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {order.delivery.pickup.enabled
                    ? `${formatDate(order.delivery.date)}, ${order.delivery.time}`
                    : 'Tidak dijemput'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3.5">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Truck size={13} /> Jadwal Antar
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {order.delivery.delivery.enabled
                    ? `${formatDate(order.delivery.destDate)}, ${order.delivery.destTime}`
                    : 'Ambil di outlet'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Peta Ilustratif"
              subtitle="Simulasi posisi laundry pada tahap berjalan"
              icon={Store}
            />
            <MockMap
              status={statusUntukPeta}
              label={
                order.delivery.pickup.enabled &&
                order.delivery.pickup.status !== 'Selesai'
                  ? 'Kurir menjemput laundry ke outlet'
                  : order.delivery.delivery.enabled &&
                      order.delivery.delivery.status !== 'Selesai'
                    ? 'Kurir mengantar laundry ke alamat Anda'
                    : 'Pengiriman telah selesai'
              }
            />
          </Card>
        </div>

        {/* Kurir */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader
              title="Informasi Kurir"
              subtitle="Kurir yang menangani kedua tahap"
              icon={Bike}
            />
            {kurir ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-primary-light/50 p-3.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {kurir.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{kurir.name}</p>
                    <p className="text-xs text-slate-500">Kurir LaundryKu</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Telepon</span>
                    <a
                      href={`tel:${kurir.phone}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {kurir.phone}
                    </a>
                  </div>
                  {kurir.vehicle && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kendaraan</span>
                      <span className="font-semibold text-slate-800">{kurir.vehicle}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wilayah</span>
                    <span className="font-semibold text-slate-800">{kurir.address}</span>
                  </div>
                </div>
                <a href={`tel:${kurir.phone}`}>
                  <Button full variant="outline" icon={Phone}>
                    Hubungi Kurir
                  </Button>
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Bike size={26} />
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Kurir belum ditugaskan
                </p>
                <p className="text-xs text-slate-500">
                  Admin akan menugaskan kurir untuk pesanan {order.id}.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}