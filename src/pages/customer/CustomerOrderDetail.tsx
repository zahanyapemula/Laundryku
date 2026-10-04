import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  CalendarDays,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Route,
  StickyNote,
  Truck,
  User,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah, todayISO } from '../../lib/utils'
import { courierById, serviceById } from '../../data/demoData'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Textarea,
} from '../../components/ui'
import Modal from '../../components/Modal'
import { LegSummary, MiniTimeline, PaymentBadge } from '../../components/Status'
import { LaundryBadge, OrderStateBadge } from '../../components/Status'

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

const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

export default function CustomerOrderDetail() {
  const { id } = useParams()
  const { orders, cancelOrder, rescheduleOrder, showDialog } = useStore()
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [jadwal, setJadwal] = useState({ date: '', time: '', destDate: '', destTime: '' })

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id])

  if (!order) return <Navigate to="/pelanggan/pesanan" replace />

  const layanan = serviceById(order.serviceId)
  const kurir = courierById(order.delivery.courierId)
  const bisaDibatalkan = order.laundryStatus === 'Pesanan Dibuat' && !order.cancelled
  const jadwalSudahLewat = order.delivery.date < todayISO()

  const openReschedule = () => {
    setJadwal({
      date: order.delivery.date,
      time: order.delivery.time,
      destDate: order.delivery.destDate,
      destTime: order.delivery.destTime,
    })
    setRescheduleOpen(true)
  }

  const submitReschedule = () => {
    rescheduleOrder(order.id, jadwal)
    setRescheduleOpen(false)
  }

  const submitCancel = () => {
    cancelOrder(order.id, reason.trim())
    setCancelOpen(false)
    setReason('')
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/pelanggan/pesanan')}>
        Kembali ke Pesanan Saya
      </Button>

      {order.cancelled && (
        <div className="flex items-start gap-3 rounded-lg border border-danger-light bg-danger-light px-4 py-3">
          <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-bold text-danger">Pesanan Dibatalkan</p>
            <p className="text-xs text-slate-600">
              Dibatalkan pada {formatDate(order.cancelled.at.slice(0, 10))} oleh{' '}
              {order.cancelled.by}. Alasan: {order.cancelled.reason || 'tidak diisi'}.
            </p>
          </div>
        </div>
      )}

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Order ID</p>
          <h2 className="text-2xl font-extrabold text-primary">{order.id}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays size={14} /> Dipesan pada {formatDate(order.orderDate)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <OrderStateBadge order={order} />
          <LaundryBadge status={order.laundryStatus} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Informasi Pesanan" subtitle="Detail lengkap pesanan laundry" />
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div>
                <InfoRow label="Order ID" value={order.id} />
                <InfoRow label="Nama Pelanggan" value={order.customerName} icon={User} />
                <InfoRow label="Nomor Telepon" value={order.customerPhone} icon={Phone} />
                <InfoRow label="Alamat" value={order.customerAddress} icon={MapPin} />
              </div>
              <div>
                <InfoRow label="Layanan" value={layanan.name} />
                <InfoRow label="Berat" value={`${order.weightKg} kg × ${formatRupiah(order.pricePerKg)}`} />
                <InfoRow label="Total Biaya" value={formatRupiah(order.total)} icon={Wallet} />
                <InfoRow label="Status Pembayaran" value={order.paymentStatus} icon={CreditCard} />
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">
                Pengiriman 2 Tahap
              </p>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-2">
                  <span className="text-sm text-slate-500">Tahap 1 — Penjemputan</span>
                  <span className="text-right text-sm font-semibold text-slate-800">
                    {order.delivery.pickup.enabled
                      ? `${formatDate(order.delivery.date)}, ${order.delivery.time}`
                      : 'Tidak dipilih'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-2">
                  <span className="text-sm text-slate-500">Tahap 2 — Pengantaran</span>
                  <span className="text-right text-sm font-semibold text-slate-800">
                    {order.delivery.delivery.enabled
                      ? `${formatDate(order.delivery.destDate)}, ${order.delivery.destTime}`
                      : 'Ambil di outlet'}
                  </span>
                </div>
                <InfoRow
                  label="Status Pengiriman"
                  value="Lihat halaman Penjemputan/Pengantaran"
                  icon={Truck}
                />
                <InfoRow
                  label="Kurir"
                  value={kurir ? `${kurir.name} (${kurir.phone})` : 'Belum ditugaskan'}
                  icon={Truck}
                />
                <InfoRow label="Catatan" value={order.note || '-'} icon={StickyNote} />
                {order.delivery.rescheduleCount > 0 && (
                  <p className="pt-2 text-xs text-slate-500">
                    Jadwal pernah diubah {order.delivery.rescheduleCount} kali.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Aksi management pelanggan */}
          <Card>
            <CardHeader
              title="Kelola Pesanan"
              subtitle="Ubah jadwal atau batalkan pesanan"
              icon={CalendarClock}
            />
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                icon={FileText}
                onClick={() => navigate(`/pelanggan/pesanan/${order.id}/invoice`)}
              >
                Lihat Invoice
              </Button>
              <Button
                variant="outline"
                icon={CalendarClock}
                disabled={!!order.cancelled}
                onClick={openReschedule}
              >
                Ubah Jadwal
              </Button>
              {bisaDibatalkan ? (
                <Button variant="danger" icon={Ban} onClick={() => setCancelOpen(true)}>
                  Batalkan Pesanan
                </Button>
              ) : (
                <Button
                  variant="danger"
                  icon={Ban}
                  onClick={() =>
                    showDialog({
                      type: 'error',
                      title: 'Pesanan Tidak Dapat Dibatalkan',
                      message:
                        order.cancelled
                          ? `Pesanan ${order.id} sudah dibatalkan.`
                          : `Pesanan ${order.id} sudah masuk proses laundry sehingga tidak bisa dibatalkan. Hubungi admin untuk bantuan.`,
                      confirmLabel: 'Mengerti',
                    })
                  }
                >
                  Batalkan Pesanan
                </Button>
              )}
            </div>
            {jadwalSudahLewat && !order.cancelled && (
              <p className="mt-3 text-xs text-slate-500">
                Jadwal penjemputan sudah berlalu — hubungi admin bila perlu perubahan mendadak.
              </p>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button icon={Route} onClick={() => navigate(`/pelanggan/pesanan/${order.id}/status`)}>
              Lacak Status Laundry
            </Button>
            <Button
              variant="outline"
              icon={CreditCard}
              onClick={() => navigate(`/pelanggan/pesanan/${order.id}/pembayaran`)}
            >
              Pembayaran
            </Button>
            <Button
              variant="secondary"
              icon={Truck}
              onClick={() => navigate(`/pelanggan/pesanan/${order.id}/pengantaran`)}
            >
              Penjemputan/Pengantaran
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Timeline Laundry" subtitle="Perkembangan pesanan Anda" />
            <MiniTimeline current={order.laundryStatus} />
          </Card>

          <Card className="mt-5">
            <CardHeader title="Ringkasan" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status Laundry</span>
                <LaundryBadge status={order.laundryStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Bayar</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pengiriman</span>
                <LegSummary order={order} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal pembatalan */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Batalkan Pesanan"
        description={`Pembatalan tidak dapat dibatalkan kembali — pesanan ${order.id}.`}
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
        <div className="rounded-lg bg-danger-light px-4 py-3">
          <p className="text-sm font-semibold text-danger">
            Anda akan membatalkan pesanan {order.id} senilai {formatRupiah(order.total)}.
          </p>
        </div>
        <div className="mt-4">
          <Field label="Alasan Pembatalan" hint="Opsional — membantu admin memahami alasan pembatalan">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Salah pilih layanan laundry"
            />
          </Field>
        </div>
      </Modal>

      {/* Modal ubah jadwal */}
      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Ubah Jadwal Pengiriman"
        description="Kurir akan menerima notifikasi tentang jadwal terbaru."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRescheduleOpen(false)}>
              Batal
            </Button>
            <Button icon={CalendarClock} onClick={submitReschedule}>
              Simpan Jadwal Baru
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {order.delivery.pickup.enabled && (
            <div className="rounded-lg border-2 border-primary/30 bg-primary-light/20 p-3.5">
              <p className="mb-3 text-sm font-bold text-slate-800">
                Tahap 1 — Penjemputan
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Tanggal Jemput" required>
                  <Input
                    type="date"
                    min={todayISO()}
                    value={jadwal.date}
                    onChange={(e) => setJadwal((j) => ({ ...j, date: e.target.value }))}
                  />
                </Field>
                <Field label="Jam Jemput" required>
                  <select
                    value={jadwal.time}
                    onChange={(e) => setJadwal((j) => ({ ...j, time: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {order.delivery.delivery.enabled && (
            <div className="rounded-lg border-2 border-secondary/30 bg-secondary-light/20 p-3.5">
              <p className="mb-3 text-sm font-bold text-slate-800">
                Tahap 2 — Pengantaran
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Tanggal Antar" required>
                  <Input
                    type="date"
                    min={jadwal.date || todayISO()}
                    value={jadwal.destDate}
                    onChange={(e) => setJadwal((j) => ({ ...j, destDate: e.target.value }))}
                  />
                </Field>
                <Field label="Jam Antar" required>
                  <select
                    value={jadwal.destTime}
                    onChange={(e) => setJadwal((j) => ({ ...j, destTime: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {order.delivery.rescheduleCount > 0 && (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarClock size={14} />
              Jadwal ini pernah diubah {order.delivery.rescheduleCount} kali sebelumnya.
            </p>
          )}
          {!order.delivery.pickup.enabled && !order.delivery.delivery.enabled && (
            <p className="text-sm text-slate-500">
              Pesanan ini diambil sendiri di outlet, tidak ada jadwal yang perlu diubah.
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}