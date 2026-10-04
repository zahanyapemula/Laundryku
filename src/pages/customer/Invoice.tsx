import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Shirt } from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { courierById, serviceById } from '../../data/demoData'
import { DELIVERY_STEPS } from '../../types'
import { Button, Card, EmptyState } from '../../components/ui'
import { PaymentBadge } from '../../components/Status'

export default function Invoice() {
  const { id } = useParams()
  const { orders } = useStore()
  const navigate = useNavigate()

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id])
  if (!order) {
    return (
      <EmptyState
        icon={Shirt}
        title="Pesanan tidak ditemukan"
        description="Nomor pesanan yang Anda cari tidak tersedia."
        action={
          <Button icon={ArrowLeft} onClick={() => navigate('/pelanggan/pesanan')}>
            Kembali ke Pesanan Saya
          </Button>
        }
      />
    )
  }

  const layanan = serviceById(order.serviceId)
  const kurir = courierById(order.delivery.courierId)
  const subtotal = order.pricePerKg * order.weightKg
  const biayaJemput = order.delivery.pickup.enabled ? 10000 : 0
  const biayaAntar = order.delivery.delivery.enabled ? 5000 : 0
  const nomorInvoice = `INV-${order.id.replace('ORD-', '')}-${order.orderDate.replace(/-/g, '')}`

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate(`/pelanggan/pesanan/${order.id}`)}
        >
          Kembali ke Detail Pesanan
        </Button>
        <Button icon={Printer} onClick={() => window.print()}>
          Cetak Invoice
        </Button>
      </div>

      <Card className="invoice-sheet">
        {/* Kop */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-primary pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Shirt size={26} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">LaundryKu</h1>
              <p className="text-xs text-slate-500">
                Sistem Informasi Pemesanan Laundry
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Jl. Ahmad Yani No. 12, Jakarta • (021) 555-0123
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
              Invoice
            </p>
            <p className="text-lg font-extrabold text-primary">{nomorInvoice}</p>
            <p className="text-xs text-slate-500">
              Tanggal: {formatDate(order.orderDate)}
            </p>
          </div>
        </div>

        {/* Pelanggan & status */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
              Tagihan Kepada
            </p>
            <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
            <p className="text-xs text-slate-500">{order.customerPhone}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {order.customerAddress}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
              Status
            </p>
            <div className="flex items-center justify-between gap-2 py-1 text-sm">
              <span className="text-slate-500">Pembayaran</span>
              <PaymentBadge status={order.paymentStatus} />
            </div>
            <div className="flex items-center justify-between gap-2 py-1 text-sm">
              <span className="text-slate-500">Status Laundry</span>
              <span className="text-sm font-semibold text-slate-800">
                {order.laundryStatus}
              </span>
            </div>
            {order.paymentMethod && (
              <div className="flex items-center justify-between gap-2 py-1 text-sm">
                <span className="text-slate-500">Metode</span>
                <span className="text-sm font-semibold text-slate-800">
                  {order.paymentMethod}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rincian */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
            Rincian Layanan
          </p>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">
                    Layanan
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">
                    Berat
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">
                    Harga/kg
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">{layanan.name}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{order.weightKg} kg</td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {formatRupiah(order.pricePerKg)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {formatRupiah(subtotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {biayaJemput > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Biaya penjemputan</span>
                <span>{formatRupiah(biayaJemput)}</span>
              </div>
            )}
            {biayaAntar > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Biaya pengantaran</span>
                <span>{formatRupiah(biayaAntar)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t-2 border-slate-800 pt-2">
              <span className="font-bold text-slate-800">Total Tagihan</span>
              <span className="text-lg font-extrabold text-primary">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Pengiriman 2 tahap */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
              Tahap 1 — Penjemputan
            </p>
            {order.delivery.pickup.enabled ? (
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>
                  Jadwal: {formatDate(order.delivery.date)}, {order.delivery.time} WIB
                </li>
                <li>
                  Status: <span className="font-semibold">{order.delivery.pickup.status}</span>
                </li>
                <li>Tujuan: Outlet LaundryKu</li>
              </ul>
            ) : (
              <p className="text-xs text-slate-500">Tahap ini tidak dipilih.</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
              Tahap 2 — Pengantaran
            </p>
            {order.delivery.delivery.enabled ? (
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>
                  Jadwal: {formatDate(order.delivery.destDate)}, {order.delivery.destTime} WIB
                </li>
                <li>
                  Status:{' '}
                  <span className="font-semibold">{order.delivery.delivery.status}</span>
                </li>
                <li>Tujuan: {order.customerAddress}</li>
                <li>Kurir: {kurir?.name ?? 'Belum ditugaskan'}</li>
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                Pelanggan mengambil laundry sendiri di outlet.
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Status pengiriman mengikuti tahapan: {DELIVERY_STEPS.join(' → ')}.
        </p>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          <p>Invoice ini dibuat otomatis oleh sistem LaundryKu.</p>
          <p className="mt-1">Simpan nomor invoice untuk keperluan klaim dan cek pembayaran.</p>
        </div>
      </Card>

      <div className="no-print">
        <Button
          variant="outline"
          full
          icon={Printer}
          onClick={() => window.print()}
        >
          Cetak / Simpan Invoice (PDF)
        </Button>
      </div>
    </div>
  )
}