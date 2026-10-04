import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CreditCard,
  PackageSearch,
  Route,
  Shirt,
  Truck,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { serviceById } from '../../data/demoData'
import { LAUNDRY_STEPS } from '../../types'
import { Badge, Button, Card, CardHeader, EmptyState } from '../../components/ui'
import { LegSummary, LaundryTimeline, PaymentBadge } from '../../components/Status'

/** Halaman ini bisa dibuka dua cara:
 *  - tanpa :id  -> daftar seluruh status laundry pelanggan
 *  - dengan :id -> timeline satu pesanan
 */
export default function LaundryStatus() {
  const { id } = useParams()
  const { user, orders } = useStore()
  const navigate = useNavigate()

  const myOrders = useMemo(
    () => orders.filter((o) => o.customerId === user?.id),
    [orders, user],
  )
  const order = useMemo(
    () => myOrders.find((o) => o.id === id),
    [myOrders, id],
  )

  if (myOrders.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Belum ada pesanan"
        description="Status laundry Anda akan tampil di sini setelah Anda membuat pesanan pertama."
        action={
          <Button icon={Shirt} onClick={() => navigate('/pelanggan/pemesanan')}>
            Pesan Laundry
          </Button>
        }
      />
    )
  }

  if (!id) {
    // ---------- Daftar status laundry ----------
    const aktif = myOrders.filter((o) => o.laundryStatus !== 'Selesai')
    return (
      <div className="space-y-5">
        <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Status Laundry Anda
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {aktif.length} pesanan sedang berjalan, {myOrders.length - aktif.length}{' '}
              pesanan sudah selesai.
            </p>
          </div>
          <Button icon={Shirt} onClick={() => navigate('/pelanggan/pemesanan')}>
            Pesan Laundry
          </Button>
        </Card>

        {aktif.length > 0 && (
          <Card>
            <CardHeader
              title="Sedang Berjalan"
              subtitle="Pesanan yang belum selesai"
              icon={Route}
            />
            <div className="space-y-4">
              {aktif.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-extrabold text-primary">{o.id}</p>
                      <p className="text-xs text-slate-500">
                        {serviceById(o.serviceId).name} • {o.weightKg} kg •{' '}
                        {formatRupiah(o.total)} • {formatDate(o.orderDate)}
                      </p>
                    </div>
                    <Badge tone="blue">{o.laundryStatus}</Badge>
                  </div>
                  <LaundryTimeline current={o.laundryStatus} />
                  <Button
                    className="mt-4"
                    size="sm"
                    variant="outline"
                    icon={ArrowRight}
                    onClick={() => navigate(`/pelanggan/pesanan/${o.id}/status`)}
                  >
                    Lihat Detail
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card padded={false}>
          <div className="px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Bell size={16} className="text-primary" /> Semua Status Laundry
            </h3>
            <p className="text-xs text-slate-500">
              Klik pesanan untuk melihat timeline lengkap.
            </p>
          </div>
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {myOrders.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => navigate(`/pelanggan/pesanan/${o.id}/status`)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary">{o.id}</p>
                    <p className="truncate text-xs text-slate-500">
                      {serviceById(o.serviceId).name} • {o.weightKg} kg •{' '}
                      {formatDate(o.orderDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      tone={
                        o.laundryStatus === 'Selesai'
                          ? 'green'
                          : o.laundryStatus === 'Diproses'
                            ? 'amber'
                            : 'blue'
                      }
                    >
                      {o.laundryStatus}
                    </Badge>
                    <ArrowRight size={16} className="text-slate-400" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Pesanan tidak ditemukan"
        description="Nomor pesanan yang Anda cari tidak tersedia."
        action={
          <Button icon={ArrowLeft} onClick={() => navigate('/pelanggan/status')}>
            Kembali ke Status Laundry
          </Button>
        }
      />
    )
  }

  const layanan = serviceById(order.serviceId)
  const currentIndex = LAUNDRY_STEPS.indexOf(order.laundryStatus)

  return (
    <div className="space-y-5">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(`/pelanggan/pesanan/${order.id}`)}>
        Kembali ke Detail Pesanan
      </Button>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
              Status Laundry
            </p>
            <h2 className="text-2xl font-extrabold text-primary">{order.id}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {layanan.name} • {order.weightKg} kg • {formatRupiah(order.total)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Badge tone="blue">{order.laundryStatus}</Badge>
            <p className="text-xs text-slate-500">Diperbarui sesuai nota laundry</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Perkembangan Laundry"
          subtitle={`Tahap ${currentIndex + 1} dari ${LAUNDRY_STEPS.length}`}
          icon={Route}
        />
        <LaundryTimeline current={order.laundryStatus} />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Informasi Pesanan" icon={Shirt} />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Layanan</span>
              <span className="font-semibold">{layanan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Berat</span>
              <span className="font-semibold">{order.weightKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal Masuk</span>
              <span className="font-semibold">{formatDate(order.orderDate)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Status Pembayaran" icon={CreditCard} />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <PaymentBadge status={order.paymentStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode</span>
              <span className="font-semibold">{order.paymentMethod ?? '-'}</span>
            </div>
          </div>
          <Button
            full
            size="sm"
            variant="outline"
            className="mt-3"
            icon={CreditCard}
            onClick={() => navigate(`/pelanggan/pesanan/${order.id}/pembayaran`)}
          >
            Halaman Pembayaran
          </Button>
        </Card>

        <Card>
          <CardHeader title="Pengiriman" icon={Truck} />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Jenis</span>
              <span className="font-semibold">
                {order.delivery.pickup.enabled ? 'Jemput' : 'Tanpa Jemput'} →{' '}
                {order.delivery.delivery.enabled ? 'Antar' : 'Ambil di Outlet'}
              </span>
            </div>
            <LegSummary order={order} />
          </div>
          <Button
            full
            size="sm"
            variant="outline"
            className="mt-3"
            icon={Truck}
            onClick={() => navigate(`/pelanggan/pesanan/${order.id}/pengantaran`)}
          >
            Info Pengiriman
          </Button>
        </Card>
      </div>

      {/* Daftar status pesanan lain */}
      <Card padded={false}>
        <div className="px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Bell size={16} className="text-primary" /> Status Pesanan Lainnya
          </h3>
          <p className="text-xs text-slate-500">Ringkasan laundry yang sedang berjalan.</p>
        </div>
        {myOrders.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState
              icon={PackageSearch}
              title="Belum ada pesanan"
              description="Status laundry Anda akan muncul di sini."
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {myOrders.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => navigate(`/pelanggan/pesanan/${o.id}/status`)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-bold text-primary">{o.id}</p>
                    <p className="text-xs text-slate-500">
                      {serviceById(o.serviceId).name} • {o.weightKg} kg
                    </p>
                  </div>
                  <Badge tone={o.id === order.id ? 'blue' : 'slate'}>
                    {o.laundryStatus}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}