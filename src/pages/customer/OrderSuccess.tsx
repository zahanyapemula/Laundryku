import { useMemo } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  CreditCard,
  Home,
  PackageCheck,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { serviceById } from '../../data/demoData'
import { Button, Card } from '../../components/ui'
import { LaundryBadge, PaymentBadge } from '../../components/Status'

export default function OrderSuccess() {
  const { orders, pushToast } = useStore()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const orderId = params.get('id')

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId],
  )

  if (!order) return <Navigate to="/pelanggan/pesanan" replace />

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="text-center">
        <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-light">
          <CheckCircle2 size={44} className="text-secondary-dark" />
        </span>
        <h2 className="text-2xl font-extrabold text-slate-800">
          Pesanan Berhasil Dibuat!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Pesanan laundry Anda sudah kami terima dan menunggu diproses oleh tim kami.
          Simpan nomor pesanan untuk melacak status laundry.
        </p>

        <div className="mx-auto my-6 max-w-sm rounded-xl border-2 border-dashed border-primary bg-primary-light/40 px-5 py-4">
          <p className="text-xs font-bold tracking-wide text-primary-dark uppercase">
            Nomor Pesanan
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <p className="text-3xl font-extrabold tracking-wider text-primary-dark">
              {order.id}
            </p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(order.id)
                pushToast('Nomor pesanan disalin', 'info')
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary transition-colors hover:bg-primary hover:text-white"
              aria-label="Salin nomor pesanan"
            >
              <Copy size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Layanan</p>
            <p className="text-sm font-bold text-slate-800">
              {serviceById(order.serviceId).name}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Berat</p>
            <p className="text-sm font-bold text-slate-800">{order.weightKg} kg</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Total Biaya</p>
            <p className="text-sm font-bold text-primary">{formatRupiah(order.total)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Tanggal Pesanan</p>
            <p className="text-sm font-bold text-slate-800">
              {formatDate(order.orderDate)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Status Pembayaran</p>
            <div className="mt-1">
              <PaymentBadge status={order.paymentStatus} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Status Laundry</p>
            <div className="mt-1">
              <LaundryBadge status={order.laundryStatus} />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-warning-light/60 px-4 py-3 text-left">
          <p className="flex items-start gap-2 text-sm text-slate-700">
            <CreditCard size={16} className="mt-0.5 shrink-0 text-warning-dark" />
            <span>
              Pesanan Anda belum dibayar. Selesaikan pembayaran melalui halaman Pembayaran
              agar laundry dapat diproses lebih cepat.
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to={`/pelanggan/pesanan/${order.id}`} className="flex-1">
            <Button size="lg" full icon={ArrowRight}>
              Lihat Detail Pesanan
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            icon={Home}
            onClick={() => navigate('/pelanggan')}
            className="sm:w-1/3"
          >
            Dashboard
          </Button>
        </div>

        <Link
          to="/pelanggan/pesanan"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary"
        >
          <ArrowLeft size={14} /> Kembali ke Daftar Pesanan
        </Link>
      </Card>

      {/* Langkah lanjutan */}
      <Card className="mt-5">
        <p className="mb-4 text-sm font-bold text-slate-800">Apa selanjutnya?</p>
        <div className="space-y-3">
          {[
            {
              icon: PackageCheck,
              title: 'Lacak status laundry',
              desc: 'Pantau perkembangan laundry Anda secara langsung.',
              to: `/pelanggan/pesanan/${order.id}/status`,
            },
            {
              icon: CreditCard,
              title: 'Selesaikan pembayaran',
              desc: 'Bayar melalui Virtual Account, QRIS, atau E-Wallet.',
              to: `/pelanggan/pesanan/${order.id}/pembayaran`,
            },
          ].map((s) => (
            <Link
              key={s.title}
              to={s.to}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3.5 transition-colors hover:border-primary hover:bg-primary-light/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <s.icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-slate-400" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}