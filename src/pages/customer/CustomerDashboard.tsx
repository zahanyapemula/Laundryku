import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Plus,
  Shirt,
  Truck,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { serviceById, courierById } from '../../data/demoData'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  StatCard,
  TableWrap,
  Td,
  Th,
} from '../../components/ui'
import { LaundryBadge, LegSummary, OrderStateBadge, PaymentBadge } from '../../components/Status'

export default function CustomerDashboard() {
  const { user, orders } = useStore()
  const navigate = useNavigate()

  const myOrders = useMemo(
    () => orders.filter((o) => o.customerId === user?.id && !o.cancelled),
    [orders, user],
  )

  const aktif = myOrders.filter((o) => o.laundryStatus !== 'Selesai').length
  const diproses = myOrders.filter((o) => o.laundryStatus === 'Diproses').length
  const selesai = myOrders.filter((o) => o.laundryStatus === 'Selesai').length
  const totalBayar = myOrders
    .filter((o) => o.paymentStatus === 'Sudah Dibayar')
    .reduce((sum, o) => sum + o.total, 0)
  const belumBayar = myOrders.filter((o) => o.paymentStatus === 'Belum Dibayar')
  const terbaru = myOrders.slice(0, 5)

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-start gap-4 border-0 bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold">
            Halo, {user?.name}! Selamat datang kembali 👋
          </h2>
          <p className="mt-1 text-sm text-primary-light">
            Pantau pesanan, pembayaran, dan pengiriman laundry Anda di satu tempat.
          </p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          icon={Plus}
          onClick={() => navigate('/pelanggan/pemesanan')}
          className="shrink-0"
        >
          Pesan Laundry
        </Button>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pesanan Aktif" value={aktif} icon={Package} tone="blue" hint="Belum selesai" />
        <StatCard label="Pesanan Diproses" value={diproses} icon={Clock} tone="amber" hint="Sedang dicuci" />
        <StatCard label="Pesanan Selesai" value={selesai} icon={CheckCircle2} tone="green" hint="Sudah diterima" />
        <StatCard
          label="Total Pembayaran"
          value={formatRupiah(totalBayar)}
          icon={Wallet}
          tone="purple"
          hint={`${belumBayar.length} pesanan belum dibayar`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Status Pembayaran"
            subtitle="Pesanan yang menunggu pembayaran"
            icon={CreditCard}
            action={
              <button
                onClick={() => navigate('/pelanggan/pembayaran')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Lihat Semua
              </button>
            }
          />
          {belumBayar.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-secondary-light px-4 py-4">
              <CheckCircle2 size={20} className="shrink-0 text-secondary-dark" />
              <p className="text-sm font-semibold text-secondary-dark">
                Semua pesanan Anda sudah dibayar. Terima kasih!
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {belumBayar.slice(0, 3).map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{o.id}</p>
                    <p className="truncate text-xs text-slate-500">
                      {serviceById(o.serviceId).name} • {formatRupiah(o.total)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="warning"
                    icon={CreditCard}
                    onClick={() => navigate(`/pelanggan/pesanan/${o.id}/pembayaran`)}
                  >
                    Bayar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Info Pickup / Delivery"
            subtitle="Status pengiriman 2 tahap laundry Anda"
            icon={Truck}
            action={
              <button
                onClick={() => navigate('/pelanggan/pengantaran')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Lihat Semua
              </button>
            }
          />
          {myOrders.filter(
            (o) =>
              (o.delivery.pickup.enabled && o.delivery.pickup.status !== 'Selesai') ||
              (o.delivery.delivery.enabled && o.delivery.delivery.status !== 'Selesai'),
          ).length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-secondary-light px-4 py-4">
              <CheckCircle2 size={20} className="shrink-0 text-secondary-dark" />
              <p className="text-sm font-semibold text-secondary-dark">
                Tidak ada pengiriman yang sedang berjalan.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {myOrders
                .filter(
                  (o) =>
                    (o.delivery.pickup.enabled && o.delivery.pickup.status !== 'Selesai') ||
                    (o.delivery.delivery.enabled && o.delivery.delivery.status !== 'Selesai'),
                )
                .slice(0, 3)
                .map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">{o.id}</p>
                      <p className="truncate text-xs text-slate-500">
                        Kurir: {courierById(o.delivery.courierId)?.name ?? 'Belum ditugaskan'} • Jemput{' '}
                        {formatDate(o.delivery.date)}, {o.delivery.time}
                      </p>
                    </div>
                    <LegSummary order={o} />
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Shirt size={16} className="text-primary" /> Pesanan Terbaru
            </h3>
            <p className="text-xs text-slate-500">Pesanan laundry Anda terakhir.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate('/pelanggan/pesanan')}
          >
            Lihat Semua Pesanan
          </Button>
        </div>

        {terbaru.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState
              icon={Shirt}
              title="Belum ada pesanan"
              description="Pesanan laundry Anda akan muncul di sini setelah Anda membuat pesanan pertama."
              action={
                <Button icon={Plus} onClick={() => navigate('/pelanggan/pemesanan')}>
                  Pesan Laundry
                </Button>
              }
            />
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[840px]">
              <thead>
                <tr>
                  <Th>ID Pesanan</Th>
                  <Th>Tanggal</Th>
                  <Th>Layanan</Th>
                  <Th>Berat</Th>
                  <Th>Total</Th>
                  <Th>Status Laundry</Th>
                  <Th>Status Pembayaran</Th>
                  <Th>Pengiriman</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {terbaru.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-slate-50">
                    <Td className="font-bold text-primary">{o.id}</Td>
                    <Td>{formatDate(o.orderDate)}</Td>
                    <Td>{serviceById(o.serviceId).name}</Td>
                    <Td>{o.weightKg} kg</Td>
                    <Td className="font-semibold">{formatRupiah(o.total)}</Td>
                    <Td>
                      <div className="flex flex-col gap-1">
                        <LaundryBadge status={o.laundryStatus} />
                        <OrderStateBadge order={o} />
                      </div>
                    </Td>
                    <Td>
                      <PaymentBadge status={o.paymentStatus} />
                    </Td>
                    <Td>
                      <LegSummary order={o} />
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={ArrowRight}
                        onClick={() => navigate(`/pelanggan/pesanan/${o.id}`)}
                      >
                        Lihat Detail
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </div>
  )
}