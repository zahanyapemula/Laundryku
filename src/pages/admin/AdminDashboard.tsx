import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Shirt,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { courierById, serviceById } from '../../data/demoData'
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

export default function AdminDashboard() {
  const { orders } = useStore()
  const navigate = useNavigate()

  const baru = orders.filter((o) => o.laundryStatus === 'Pesanan Dibuat').length
  const diproses = orders.filter((o) => o.laundryStatus === 'Diproses').length
  const selesai = orders.filter((o) => o.laundryStatus === 'Selesai').length
  const belumBayar = orders.filter((o) => o.paymentStatus === 'Belum Dibayar')
  const totalBayar = orders
    .filter((o) => o.paymentStatus === 'Sudah Dibayar')
    .reduce((s, o) => s + o.total, 0)
  const totalPelanggan = new Set(orders.map((o) => o.customerId)).size

  const terbaru = useMemo(() => orders.slice(0, 6), [orders])

  const breakdown = useMemo(
    () => [
      { label: 'Pesanan Dibuat', total: orders.length, count: baru },
      { label: 'Diproses', total: orders.length, count: diproses },
      {
        label: 'Laundry Selesai',
        total: orders.length,
        count: orders.filter((o) => o.laundryStatus === 'Laundry Selesai').length,
      },
      {
        label: 'Siap Diambil/Diantar',
        total: orders.length,
        count: orders.filter((o) => o.laundryStatus === 'Siap Diambil/Diantar').length,
      },
      { label: 'Selesai', total: orders.length, count: selesai },
    ],
    [orders, baru, diproses, selesai],
  )

  return (
    <div className="space-y-6">
      {/* Statistik utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pesanan Baru" value={baru} icon={Package} tone="blue" hint="Menunggu diproses" />
        <StatCard label="Pesanan Diproses" value={diproses} icon={Clock} tone="amber" hint="Sedang dicuci" />
        <StatCard label="Pesanan Selesai" value={selesai} icon={CheckCircle2} tone="green" hint="Sudah selesai" />
        <StatCard
          label="Belum Dibayar"
          value={belumBayar.length}
          icon={CreditCard}
          tone="red"
          hint="Perlu diperiksa pembayaran"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Pembayaran"
          value={formatRupiah(totalBayar)}
          icon={Wallet}
          tone="green"
          hint="Dari pesanan yang sudah dibayar"
        />
        <StatCard
          label="Total Pelanggan"
          value={totalPelanggan}
          icon={Users}
          tone="blue"
          hint="Pelanggan aktif"
        />
        <StatCard
          label="Total Pesanan"
          value={orders.length}
          icon={TrendingUp}
          tone="purple"
          hint="Sepanjang periode demo"
        />
      </div>

      {/* Ringkasan status laundry */}
      <Card>
        <CardHeader
          title="Status Laundry"
          subtitle="Distribusi tahap laundry seluruh pesanan"
          icon={Shirt}
        />
        <div className="space-y-3">
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{b.label}</span>
                <span className="text-slate-500">
                  <span className="font-bold text-slate-800">{b.count}</span> pesanan
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    b.label === 'Selesai'
                      ? 'bg-secondary'
                      : b.label === 'Diproses'
                        ? 'bg-warning'
                        : 'bg-primary'
                  }`}
                  style={{ width: `${b.total ? (b.count / b.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Status pembayaran */}
      <Card>
        <CardHeader
          title="Status Pembayaran"
          subtitle="Pesanan yang menunggu pembayaran pelanggan"
          icon={CreditCard}
          action={
            belumBayar.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                icon={ArrowRight}
                onClick={() => navigate('/admin/pesanan?filter=belum_bayar')}
              >
                Periksa Pembayaran
              </Button>
            ) : undefined
          }
        />
        {belumBayar.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg bg-secondary-light px-4 py-3 text-sm font-semibold text-secondary-dark">
            <CheckCircle2 size={18} /> Semua pesanan sudah dibayar.
          </p>
        ) : (
          <ul className="space-y-2">
            {belumBayar.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-primary">{o.id}</p>
                  <p className="text-xs text-slate-500">
                    {o.customerName} • {serviceById(o.serviceId).name} •{' '}
                    {formatRupiah(o.total)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentBadge status={o.paymentStatus} />
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => navigate(`/admin/pesanan/${o.id}`)}
                  >
                    Periksa Bayar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Pesanan terbaru */}
      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Package size={16} className="text-primary" /> Pesanan Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Customer, layanan, status laundry, pembayaran, dan kurir.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate('/admin/pesanan')}
          >
            Kelola Pesanan
          </Button>
        </div>

        {terbaru.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState
              icon={Package}
              title="Belum ada pesanan"
              description="Pesanan dari pelanggan akan muncul di sini secara otomatis."
            />
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Customer</Th>
                  <Th>Layanan</Th>
                  <Th>Total</Th>
                  <Th>Status Laundry</Th>
                  <Th>Status Pembayaran</Th>
                  <Th>Kurir</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {terbaru.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-slate-50">
                    <Td className="font-bold text-primary">{o.id}</Td>
                    <Td>
                      <p className="font-semibold text-slate-800">{o.customerName}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(o.orderDate)}
                      </p>
                    </Td>
                    <Td>{serviceById(o.serviceId).name}</Td>
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
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                          <Truck size={13} className="text-slate-400" />
                          {courierById(o.delivery.courierId)?.name ?? 'Belum ada'}
                        </span>
                        <LegSummary order={o} />
                      </div>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={ArrowRight}
                        onClick={() => navigate(`/admin/pesanan/${o.id}`)}
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