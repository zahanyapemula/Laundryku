import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Bike,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Phone,
  StickyNote,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../store'
import { SERVICES } from '../../data/demoData'
import { formatDate, formatRupiah } from '../../lib/utils'
import { calculatePrice } from '../../lib/pricing'
import { useOrderDraft } from './OrderDraftContext'
import { Button, Card, CardHeader } from '../../components/ui'

function Row({
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

export default function OrderConfirm() {
  const { draft, reset } = useOrderDraft()
  const { createOrder, showDialog } = useStore()
  const navigate = useNavigate()

  const layanan = useMemo(
    () => SERVICES.find((s) => s.id === draft.serviceId) ?? SERVICES[0],
    [draft.serviceId],
  )
  const berat = Number(draft.weightKg) || 0
  const harga = calculatePrice(berat, layanan.pricePerKg, {
    pickupEnabled: draft.pickupEnabled,
    deliveryEnabled: draft.deliveryEnabled,
  })

  const lengkap =
    draft.customerName.trim() &&
    draft.customerPhone.trim() &&
    draft.customerAddress.trim() &&
    draft.serviceId &&
    berat > 0 &&
    (draft.pickupEnabled || draft.deliveryEnabled) &&
    (!draft.pickupEnabled || (draft.date && draft.time)) &&
    (!draft.deliveryEnabled || (draft.destDate && draft.destTime))

  if (!lengkap) {
    return <Navigate to="/pelanggan/pemesanan" replace />
  }

  const handleConfirm = () => {
    const order = createOrder({
      customerName: draft.customerName.trim(),
      customerPhone: draft.customerPhone.trim(),
      customerAddress: draft.customerAddress.trim(),
      serviceId: draft.serviceId,
      weightKg: berat,
      note: draft.note.trim(),
      pickupEnabled: draft.pickupEnabled,
      deliveryEnabled: draft.deliveryEnabled,
      date: draft.date,
      time: draft.time,
      destDate: draft.destDate,
      destTime: draft.destTime,
    })
    reset()
    showDialog({
      type: 'success',
      title: 'Pesanan Berhasil Dibuat!',
      message: `Nomor pesanan ${order.id} telah tercatat. Admin dan kurir sudah diberi tahu, dan Anda akan menerima notifikasi pada setiap perkembangan laundry.`,
      confirmLabel: 'Lihat Detail Pesanan',
      extra: [
        { label: 'Kembali ke Dashboard', to: '/pelanggan' },
        { label: 'Lihat Semua Pesanan', to: '/pelanggan/pesanan' },
      ],
      onConfirm: () => navigate(`/pelanggan/pesanan/berhasil?id=${order.id}`),
    })
    navigate(`/pelanggan/pesanan/berhasil?id=${order.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-warning-light bg-warning-light/60 px-4 py-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-warning-dark" />
        <p className="text-sm text-slate-700">
          Periksa kembali data pesanan Anda. Klik "Konfirmasi Pesanan" untuk membuat pesanan
          laundry.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Ringkasan Pesanan"
          subtitle="Detail data yang akan disimpan"
          icon={ClipboardCheck}
        />

        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-bold tracking-wide text-slate-400 uppercase">
              Data Pelanggan
            </p>
            <Row label="Nama" value={draft.customerName} icon={User} />
            <Row label="Telepon" value={draft.customerPhone} icon={Phone} />
            <Row label="Alamat" value={draft.customerAddress} icon={MapPin} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold tracking-wide text-slate-400 uppercase">
              Detail Laundry
            </p>
            <Row label="Layanan" value={layanan.name} />
            <Row label="Berat" value={`${berat} kg`} />
            <Row label="Harga per kg" value={formatRupiah(layanan.pricePerKg)} />
            <Row label="Catatan" value={draft.note.trim() || '-'} icon={StickyNote} />
          </div>
        </div>

        {/* Dua tahap */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-primary/30 bg-primary-light/20 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Bike size={16} className="text-primary" /> Tahap 1 — Penjemputan
            </p>
            {draft.pickupEnabled ? (
              <Row
                label="Jadwal"
                value={`${formatDate(draft.date)}, ${draft.time}`}
                icon={CalendarDays}
              />
            ) : (
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Store size={14} /> Tidak dipilih
              </p>
            )}
          </div>
          <div className="rounded-xl border-2 border-secondary/30 bg-secondary-light/20 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Truck size={16} className="text-secondary-dark" /> Tahap 2 — Pengantaran
            </p>
            {draft.deliveryEnabled ? (
              <>
                <Row
                  label="Jadwal"
                  value={`${formatDate(draft.destDate)}, ${draft.destTime}`}
                  icon={CalendarDays}
                />
                <Row label="Tujuan" value={draft.customerAddress} icon={MapPin} />
              </>
            ) : (
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Store size={14} /> Ambil sendiri di outlet
              </p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>
                Subtotal ({berat} kg × {formatRupiah(layanan.pricePerKg)})
              </span>
              <span>{formatRupiah(harga.subtotal)}</span>
            </div>
            {harga.pickupFee > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>Biaya penjemputan</span>
                <span>{formatRupiah(harga.pickupFee)}</span>
              </div>
            )}
            {harga.deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>Biaya pengantaran</span>
                <span>{formatRupiah(harga.deliveryFee)}</span>
              </div>
            )}
            {harga.discount > 0 && (
              <div className="flex justify-between text-sm text-secondary-dark">
                <span>Diskon berat ≥ 10 kg</span>
                <span>-{formatRupiah(harga.discount)}</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Wallet size={16} className="text-primary" /> Total
            </span>
            <span className="text-xl font-extrabold text-primary">
              {formatRupiah(harga.total)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            icon={ArrowLeft}
            className="sm:w-1/3"
            onClick={() => navigate('/pelanggan/pemesanan')}
          >
            Kembali
          </Button>
          <Button size="lg" icon={CheckCircle2} className="flex-1" onClick={handleConfirm}>
            Konfirmasi Pesanan
          </Button>
        </div>
      </Card>
    </div>
  )
}