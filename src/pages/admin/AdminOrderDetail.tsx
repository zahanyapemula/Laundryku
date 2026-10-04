import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  Bike,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  MapPin,
  PackageSearch,
  Phone,
  RefreshCw,
  StickyNote,
  Store,
  Truck,
  User,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { serviceById } from '../../data/demoData'
import { LAUNDRY_STEPS } from '../../types'
import type { LaundryStatus } from '../../types'
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input } from '../../components/ui'
import {
  LaundryBadge,
  LegTimeline,
  MiniTimeline,
  OrderStateBadge,
  PaymentBadge,
} from '../../components/Status'
import Modal from '../../components/Modal'

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

export default function AdminOrderDetail() {
  const { id } = useParams()
  const {
    orders,
    couriers,
    updateLaundryStatus,
    updatePaymentStatus,
    assignCourier,
    cancelOrder,
    showDialog,
  } = useStore()
  const navigate = useNavigate()

  const [statusOpen, setStatusOpen] = useState(false)
  const [courierOpen, setCourierOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [pickedStatus, setPickedStatus] = useState<LaundryStatus>('Diproses')
  const [pickedCourier, setPickedCourier] = useState('')

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id])

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Pesanan tidak ditemukan"
        description="Nomor pesanan yang Anda cari tidak tersedia."
        action={
          <Button icon={ArrowLeft} onClick={() => navigate('/admin/pesanan')}>
            Kembali ke Kelola Pesanan
          </Button>
        }
      />
    )
  }

  const layanan = serviceById(order.serviceId)
  const kurirTerpilih = order.delivery.courierId
    ? couriers.find((c) => c.id === order.delivery.courierId)
    : null

  const submitStatus = () => {
    updateLaundryStatus(order.id, pickedStatus)
    setStatusOpen(false)
  }

  const submitCourier = () => {
    if (!pickedCourier) {
      showDialog({
        type: 'error',
        title: 'Kurir Belum Dipilih',
        message: 'Silakan pilih salah satu kurir sebelum menyimpan.',
        confirmLabel: 'Mengerti',
      })
      return
    }
    assignCourier(order.id, pickedCourier)
    setCourierOpen(false)
    setPickedCourier('')
  }

  const submitCancel = () => {
    cancelOrder(order.id, cancelReason.trim())
    setCancelOpen(false)
    setCancelReason('')
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/pesanan')}>
        Kembali ke Kelola Pesanan
      </Button>

      {order.cancelled && (
        <div className="flex items-start gap-3 rounded-lg border border-danger-light bg-danger-light px-4 py-3">
          <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-bold text-danger">Pesanan Dibatalkan</p>
            <p className="text-xs text-slate-600">
              {formatDate(order.cancelled.at.slice(0, 10))} oleh {order.cancelled.by} —{' '}
              {order.cancelled.reason || 'tidak ada alasan'}
            </p>
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Order ID</p>
            <h2 className="text-2xl font-extrabold text-primary">{order.id}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <User size={14} /> {order.customerName}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> {formatDate(order.orderDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet size={14} /> {formatRupiah(order.total)}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={order.paymentStatus === 'Sudah Dibayar' ? 'outline' : 'warning'}
              icon={CreditCard}
              onClick={() =>
                updatePaymentStatus(
                  order.id,
                  order.paymentStatus === 'Sudah Dibayar' ? 'Belum Dibayar' : 'Sudah Dibayar',
                )
              }
            >
              {order.paymentStatus === 'Sudah Dibayar'
                ? 'Batalkan Verifikasi'
                : 'Periksa Pembayaran'}
            </Button>
            <Button
              icon={RefreshCw}
              onClick={() => {
                setPickedStatus(order.laundryStatus)
                setStatusOpen(true)
              }}
            >
              Update Status
            </Button>
            <Button variant="secondary" icon={Bike} onClick={() => setCourierOpen(true)}>
              {kurirTerpilih ? 'Ganti Kurir' : 'Assign Kurir'}
            </Button>
            <Button variant="danger" icon={Ban} onClick={() => setCancelOpen(true)}>
              Batalkan
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Layanan</p>
            <p className="text-sm font-bold text-slate-800">{layanan.name}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Berat</p>
            <p className="text-sm font-bold text-slate-800">{order.weightKg} kg</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Status Laundry</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <LaundryBadge status={order.laundryStatus} />
              <OrderStateBadge order={order} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3.5">
            <p className="text-xs text-slate-500">Status Pembayaran</p>
            <div className="mt-1">
              <PaymentBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Check payment */}
          <Card
            className={
              order.paymentStatus === 'Belum Dibayar' ? 'border-warning' : 'border-secondary'
            }
          >
            <CardHeader
              title="Check Payment"
              subtitle="Verifikasi pembayaran pelanggan"
              icon={CreditCard}
              action={<PaymentBadge status={order.paymentStatus} />}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Total Tagihan</p>
                <p className="text-sm font-extrabold text-slate-800">
                  {formatRupiah(order.total)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Metode</p>
                <p className="text-sm font-bold text-slate-800">
                  {order.paymentMethod ?? 'Belum memilih metode'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Tanggal Bayar</p>
                <p className="text-sm font-bold text-slate-800">
                  {order.paymentDate ? formatDate(order.paymentDate) : '-'}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {order.paymentStatus === 'Belum Dibayar'
                    ? 'Pembayaran belum diterima dari pelanggan.'
                    : 'Pembayaran sudah diverifikasi oleh admin.'}
                </p>
                <Button
                  variant={
                    order.paymentStatus === 'Belum Dibayar' ? 'warning' : 'outline'
                  }
                  icon={CheckCircle2}
                  onClick={() =>
                    updatePaymentStatus(
                      order.id,
                      order.paymentStatus === 'Belum Dibayar'
                        ? 'Sudah Dibayar'
                        : 'Belum Dibayar',
                    )
                  }
                >
                  {order.paymentStatus === 'Belum Dibayar'
                    ? 'Tandai Sudah Dibayar'
                    : 'Batalkan Verifikasi'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Data pelanggan */}
          <Card>
            <CardHeader
              title="Data Pesanan"
              subtitle="Informasi lengkap pelanggan"
              icon={ClipboardCheck}
            />
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div>
                <InfoRow label="Nama Pelanggan" value={order.customerName} icon={User} />
                <InfoRow label="Nomor Telepon" value={order.customerPhone} icon={Phone} />
                <InfoRow label="Alamat" value={order.customerAddress} icon={MapPin} />
              </div>
              <div>
                <InfoRow label="Layanan" value={layanan.name} />
                <InfoRow
                  label="Berat"
                  value={`${order.weightKg} kg × ${formatRupiah(order.pricePerKg)}`}
                />
                <InfoRow label="Total Biaya" value={formatRupiah(order.total)} icon={Wallet} />
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <InfoRow label="Catatan Pelanggan" value={order.note || '-'} icon={StickyNote} />
              <InfoRow
                label="Jadwal Penjemputan"
                value={
                  order.delivery.pickup.enabled
                    ? `${formatDate(order.delivery.date)}, ${order.delivery.time} WIB`
                    : 'Tidak dijemput'
                }
                icon={CalendarDays}
              />
              <InfoRow
                label="Jadwal Pengantaran"
                value={
                  order.delivery.delivery.enabled
                    ? `${formatDate(order.delivery.destDate)}, ${order.delivery.destTime} WIB`
                    : 'Ambil di outlet'
                }
                icon={Truck}
              />
            </div>
          </Card>

          {/* Kurir & 2 tahap */}
          <Card>
            <CardHeader
              title="Kurir & Pengiriman"
              subtitle="Dua tahap: penjemputan lalu pengantaran"
              icon={Truck}
            />
            {kurirTerpilih ? (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-primary-light/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {kurirTerpilih.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      {kurirTerpilih.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {kurirTerpilih.phone} • {kurirTerpilih.vehicle}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" icon={Bike} onClick={() => setCourierOpen(true)}>
                  Ganti Kurir
                </Button>
              </div>
            ) : (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-warning-light/50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Belum ada kurir yang ditugaskan untuk pesanan ini.
                </p>
                <Button size="sm" variant="secondary" icon={Bike} onClick={() => setCourierOpen(true)}>
                  Assign Kurir
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-xl border-2 border-primary/30 bg-primary-light/20 p-4">
                <LegTimeline
                  title="Tahap 1 — Penjemputan"
                  subtitle="Kurir mengambil laundry dari pelanggan ke outlet"
                  icon={Bike}
                  status={order.delivery.pickup.status}
                  enabled={order.delivery.pickup.enabled}
                />
              </div>
              <div className="rounded-xl border-2 border-secondary/30 bg-secondary-light/20 p-4">
                <LegTimeline
                  title="Tahap 2 — Pengantaran"
                  subtitle="Laundry diantar dari outlet ke pelanggan"
                  icon={Truck}
                  status={order.delivery.delivery.status}
                  enabled={order.delivery.delivery.enabled}
                />
              </div>
            </div>

            {!order.delivery.pickup.enabled && !order.delivery.delivery.enabled && (
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                <Store size={14} /> Pelanggan mengambil laundry sendiri di outlet.
              </p>
            )}
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Timeline Laundry" subtitle="Status terkini pesanan" />
            <MiniTimeline current={order.laundryStatus} />
            <Button
              full
              className="mt-5"
              icon={RefreshCw}
              onClick={() => {
                setPickedStatus(order.laundryStatus)
                setStatusOpen(true)
              }}
            >
              Update Status Laundry
            </Button>
          </Card>
        </div>
      </div>

      {/* Modal update status */}
      <Modal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Update Status Laundry"
        description={`Ubah tahap laundry untuk pesanan ${order.id}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStatusOpen(false)}>
              Batal
            </Button>
            <Button icon={CheckCircle2} onClick={submitStatus}>
              Simpan Status
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {LAUNDRY_STEPS.map((s) => {
            const active = pickedStatus === s
            const current = order.laundryStatus === s
            return (
              <button
                key={s}
                onClick={() => setPickedStatus(s)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary-light/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-sm font-bold text-slate-800">{s}</span>
                {current && <Badge tone="green">Status saat ini</Badge>}
                {active && !current && <Badge tone="blue">Dipilih</Badge>}
              </button>
            )
          })}
        </div>
      </Modal>

      {/* Modal assign kurir */}
      <Modal
        open={courierOpen}
        onClose={() => setCourierOpen(false)}
        title="Assign Kurir"
        description="Kurir akan menangani tahap penjemputan dan pengantaran"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCourierOpen(false)}>
              Batal
            </Button>
            <Button icon={Bike} onClick={submitCourier}>
              Simpan Kurir
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {couriers.map((c) => {
            const active = (pickedCourier || order.delivery.courierId) === c.id
            const assigned = order.delivery.courierId === c.id
            return (
              <button
                key={c.id}
                onClick={() => setPickedCourier(c.id)}
                className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary-light/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    active ? 'bg-primary' : 'bg-slate-400'
                  }`}
                >
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {c.phone} • {c.vehicle}
                  </p>
                </div>
                {assigned && <Badge tone="green">Saat ini</Badge>}
              </button>
            )
          })}
        </div>
      </Modal>

      {/* Modal pembatalan oleh admin */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Batalkan Pesanan"
        description={`Pesanan ${order.id} akan ditandai dibatalkan`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" icon={Ban} onClick={submitCancel}>
              Ya, Batalkan Pesanan
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Tindakan ini akan membatalkan seluruh jadwal pengiriman untuk pesanan{' '}
          {order.id}.
        </p>
        <div className="mt-4">
          <Field label="Alasan Pembatalan" hint="Opsional — dicatat pada riwayat pesanan">
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Contoh: Pelanggan tidak dapat dihubungi"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}