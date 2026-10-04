import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  PackageSearch,
  QrCode,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { PAYMENT_METHODS, serviceById } from '../../data/demoData'
import type { PaymentMethod } from '../../types'
import { Badge, Button, Card, CardHeader, EmptyState, StatCard } from '../../components/ui'
import { PaymentBadge } from '../../components/Status'

const METHOD_ICON: Record<PaymentMethod, typeof CreditCard> = {
  'Virtual Account BCA': CreditCard,
  QRIS: QrCode,
  'E-Wallet': Smartphone,
}

const METHOD_DESC: Record<PaymentMethod, string> = {
  'Virtual Account BCA': 'Transfer melalui mobile atau internet banking BCA.',
  QRIS: 'Pindai kode QRIS di aplikasi m-banking Anda.',
  'E-Wallet': 'Bayar melalui GoPay, OVO, DANA, atau ShopeePay.',
}

/** Halaman ini bisa dibuka dua cara:
 *  - tanpa :id  -> daftar seluruh tagihan pelanggan
 *  - dengan :id -> rincian pembayaran satu pesanan
 */
export default function Payment() {
  const { id } = useParams()
  const { user, orders, payOrder } = useStore()
  const navigate = useNavigate()
  const [method, setMethod] = useState<PaymentMethod>('QRIS')
  const [processing, setProcessing] = useState(false)

  const myOrders = useMemo(
    () => orders.filter((o) => o.customerId === user?.id),
    [orders, user],
  )
  const order = useMemo(() => myOrders.find((o) => o.id === id), [myOrders, id])

  if (myOrders.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Belum ada tagihan"
        description="Halaman pembayaran akan terisi setelah Anda membuat pesanan laundry."
        action={
          <Button icon={PackageSearch} onClick={() => navigate('/pelanggan/pemesanan')}>
            Pesan Laundry
          </Button>
        }
      />
    )
  }

  if (!id) {
    // ---------- Daftar pembayaran ----------
    const belumBayar = myOrders.filter((o) => o.paymentStatus === 'Belum Dibayar')
    const sudahBayar = myOrders.filter((o) => o.paymentStatus === 'Sudah Dibayar')
    const totalBelum = belumBayar.reduce((s, o) => s + o.total, 0)
    const totalSudah = sudahBayar.reduce((s, o) => s + o.total, 0)

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Tagihan"
            value={formatRupiah(totalBelum)}
            icon={Wallet}
            tone="red"
            hint={`${belumBayar.length} pesanan belum dibayar`}
          />
          <StatCard
            label="Sudah Dibayar"
            value={formatRupiah(totalSudah)}
            icon={CheckCircle2}
            tone="green"
            hint={`${sudahBayar.length} pesanan lunas`}
          />
          <StatCard
            label="Total Transaksi"
            value={myOrders.length}
            icon={CreditCard}
            tone="blue"
            hint="Seluruh pesanan Anda"
          />
        </div>

        {belumBayar.length > 0 && (
          <Card padded={false}>
            <div className="px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Wallet size={16} className="text-warning-dark" /> Menunggu Pembayaran
              </h3>
              <p className="text-xs text-slate-500">
                Pilih pesanan untuk membuka halaman pembayaran.
              </p>
            </div>
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {belumBayar.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary">{o.id}</p>
                    <p className="truncate text-xs text-slate-500">
                      {serviceById(o.serviceId).name} • {o.weightKg} kg •{' '}
                      {formatDate(o.orderDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatRupiah(o.total)}
                    </span>
                    <Button
                      size="sm"
                      variant="warning"
                      icon={ArrowRight}
                      onClick={() => navigate(`/pelanggan/pesanan/${o.id}/pembayaran`)}
                    >
                      Bayar Sekarang
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card padded={false}>
          <div className="px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <CreditCard size={16} className="text-primary" /> Riwayat Pembayaran
            </h3>
            <p className="text-xs text-slate-500">Seluruh transaksi laundry Anda.</p>
          </div>
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {myOrders.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => navigate(`/pelanggan/pesanan/${o.id}/pembayaran`)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary">{o.id}</p>
                    <p className="truncate text-xs text-slate-500">
                      {serviceById(o.serviceId).name} •{' '}
                      {o.paymentDate ? formatDate(o.paymentDate) : formatDate(o.orderDate)}
                      {o.paymentMethod ? ` • ${o.paymentMethod}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatRupiah(o.total)}
                    </span>
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {belumBayar.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-secondary bg-secondary-light px-4 py-3.5">
            <CheckCircle2 size={20} className="shrink-0 text-secondary-dark" />
            <p className="text-sm font-semibold text-secondary-dark">
              Semua pesanan Anda sudah dibayar. Terima kasih!
            </p>
          </div>
        )}
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
          <Button icon={ArrowLeft} onClick={() => navigate('/pelanggan/pembayaran')}>
            Kembali ke Pembayaran
          </Button>
        }
      />
    )
  }

  const layanan = serviceById(order.serviceId)
  const belumBayar = order.paymentStatus === 'Belum Dibayar'

  const handlePay = () => {
    setProcessing(true)
    window.setTimeout(() => {
      payOrder(order.id, method)
      setProcessing(false)
    }, 600)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button
        variant="ghost"
        icon={ArrowLeft}
        onClick={() => navigate(`/pelanggan/pesanan/${order.id}`)}
      >
        Kembali ke Detail Pesanan
      </Button>

      {/* Ringkasan pembayaran */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
              Pembayaran Pesanan
            </p>
            <h2 className="text-2xl font-extrabold text-primary">{order.id}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {layanan.name} • {order.weightKg} kg • Dipesan {formatDate(order.orderDate)}
            </p>
          </div>
          <PaymentBadge status={order.paymentStatus} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'Layanan', value: layanan.name },
            { label: 'Berat', value: `${order.weightKg} kg` },
            {
              label: 'Tanggal Pembayaran',
              value: order.paymentDate ? formatDate(order.paymentDate) : '-',
            },
            { label: 'Metode Pembayaran', value: order.paymentMethod ?? '-' },
          ].map((d) => (
            <div key={d.label} className="rounded-lg border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">{d.label}</p>
              <p className="text-sm font-bold text-slate-800">{d.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-900 px-5 py-4 text-white">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Wallet size={16} /> Total Pembayaran
          </span>
          <span className="text-xl font-extrabold">{formatRupiah(order.total)}</span>
        </div>
      </Card>

      {belumBayar ? (
        <Card>
          <CardHeader
            title="Pilih Metode Pembayaran"
            subtitle="Simulasi pembayaran untuk prototipe"
            icon={CreditCard}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map((m) => {
              const Icon = METHOD_ICON[m]
              const active = method === m
              return (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    active
                      ? 'border-primary bg-primary-light/40'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-bold text-slate-800">{m}</span>
                  <span className="text-xs leading-relaxed text-slate-500">
                    {METHOD_DESC[m]}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Instruksi Pembayaran
            </p>
            <ol className="mt-2 space-y-1.5 text-sm text-slate-600">
              {[
                `Pilih metode ${method}.`,
                'Ikuti instruksi yang tampil pada halaman konfirmasi.',
                `Klik "Konfirmasi Pembayaran" untuk menyelesaikan transaksi ${formatRupiah(order.total)}.`,
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-primary">{i + 1}.</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>

          <Button
            size="lg"
            full
            className="mt-5"
            icon={CheckCircle2}
            disabled={processing}
            onClick={handlePay}
          >
            {processing ? 'Memproses pembayaran...' : 'Konfirmasi Pembayaran'}
          </Button>
        </Card>
      ) : (
        <Card className="border-secondary">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-light">
              <CheckCircle2 size={34} className="text-secondary-dark" />
            </span>
            <h3 className="text-lg font-extrabold text-secondary-dark">
              Pembayaran Berhasil Dikonfirmasi
            </h3>
            <p className="max-w-md text-sm text-slate-500">
              Pembayaran sebesar {formatRupiah(order.total)} untuk pesanan {order.id} telah
              diterima pada {order.paymentDate ? formatDate(order.paymentDate) : '-'} melalui{' '}
              {order.paymentMethod}.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={() => navigate(`/pelanggan/pesanan/${order.id}`)}
              >
                Kembali ke Detail Pesanan
              </Button>
              <Button
                variant="secondary"
                icon={PackageSearch}
                onClick={() => navigate(`/pelanggan/pesanan/${order.id}/status`)}
              >
                Lacak Status Laundry
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <p className="text-xs text-slate-400">
          Halaman pembayaran ini merupakan simulasi prototipe — tidak ada transaksi nyata.
        </p>
        <Badge tone="slate">{order.id}</Badge>
      </div>
    </div>
  )
}