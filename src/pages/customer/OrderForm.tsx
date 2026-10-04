import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CalendarDays,
  ClipboardList,
  Clock,
  Info,
  MapPin,
  Phone,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { SERVICES } from '../../data/demoData'
import { formatRupiah, todayISO } from '../../lib/utils'
import { calculatePrice } from '../../lib/pricing'
import { useOrderDraft } from './OrderDraftContext'
import { Button, Card, CardHeader, Field, Input, Textarea } from '../../components/ui'

const TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
]

type Errors = Partial<
  Record<
    'name' | 'phone' | 'address' | 'service' | 'weight' | 'legs' | 'date' | 'time' | 'destDate' | 'destTime',
    string
  >
>

export default function OrderForm() {
  const { draft, setDraft } = useOrderDraft()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Errors>({})

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const berat = Number(draft.weightKg) || 0
  const layanan = SERVICES.find((s) => s.id === draft.serviceId) ?? SERVICES[0]
  const harga = calculatePrice(berat, layanan.pricePerKg, {
    pickupEnabled: draft.pickupEnabled,
    deliveryEnabled: draft.deliveryEnabled,
  })

  const estimasiSelesai = useMemo(() => {
    const base = new Date(`${todayISO()}T00:00:00`)
    base.setDate(base.getDate() + layanan.estimateDays)
    return base.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [layanan])

  const validate = (): boolean => {
    const e: Errors = {}
    if (!draft.customerName.trim()) e.name = 'Nama pelanggan wajib diisi'
    if (!draft.customerPhone.trim()) e.phone = 'Nomor telepon wajib diisi'
    else if (!/^[0-9+\-\s]{8,15}$/.test(draft.customerPhone.trim()))
      e.phone = 'Nomor telepon tidak valid (8-15 digit)'
    if (!draft.customerAddress.trim()) e.address = 'Alamat wajib diisi'
    else if (draft.customerAddress.trim().length < 10)
      e.address = 'Alamat minimal 10 karakter agar kurir mudah menemukan lokasi'
    if (!draft.serviceId) e.service = 'Layanan wajib dipilih'
    if (!draft.weightKg) e.weight = 'Berat wajib diisi'
    else if (berat <= 0) e.weight = 'Berat harus lebih dari 0'
    else if (berat > 50) e.weight = 'Berat maksimum 50 kg per pesanan'
    if (!draft.pickupEnabled && !draft.deliveryEnabled)
      e.legs = 'Pilih minimal satu layanan: penjemputan atau pengantaran'

    if (draft.pickupEnabled) {
      if (!draft.date) e.date = 'Tanggal penjemputan wajib dipilih'
      else if (draft.date < todayISO()) e.date = 'Tanggal tidak boleh di masa lalu'
      if (!draft.time) e.time = 'Jam penjemputan wajib dipilih'
    }
    if (draft.deliveryEnabled) {
      if (!draft.destDate) e.destDate = 'Tanggal pengantaran wajib dipilih'
      else if (draft.destDate < todayISO()) e.destDate = 'Tanggal tidak boleh di masa lalu'
      if (!draft.destTime) e.destTime = 'Jam pengantaran wajib dipilih'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    navigate('/pelanggan/konfirmasi')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-primary-light bg-primary-light/50 px-4 py-3">
        <Info size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm text-slate-700">
          Pengiriman terdiri dari 2 tahap: laundry dijemput ke outlet, lalu diantar kembali
          ke alamat Anda. Harga dihitung otomatis dari berat dan layanan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Data Pelanggan"
              subtitle="Digunakan kurir untuk menghubungi Anda"
              icon={User}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama Pelanggan" required error={errors.name}>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={draft.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    placeholder="Nama lengkap"
                    error={!!errors.name}
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="Nomor Telepon" required error={errors.phone}>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={draft.customerPhone}
                    onChange={(e) => set('customerPhone', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    error={!!errors.phone}
                    className="pl-9"
                  />
                </div>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Alamat" required error={errors.address}>
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute top-3.5 left-3 text-slate-400" />
                    <Textarea
                      value={draft.customerAddress}
                      onChange={(e) => set('customerAddress', e.target.value)}
                      placeholder="Alamat lengkap beserta patokan"
                      error={!!errors.address}
                      className="pl-9"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Layanan Laundry"
              subtitle="Pilih jenis layanan dan berat laundry"
              icon={ClipboardList}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Jenis Layanan" required error={errors.service}>
                <div className="grid grid-cols-1 gap-2">
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => set('serviceId', s.id)}
                      className={`flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                        draft.serviceId === s.id
                          ? 'border-primary bg-primary-light/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.description}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-primary">
                        {formatRupiah(s.pricePerKg)}/kg
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <div className="space-y-4">
                <Field
                  label="Berat (kg)"
                  required
                  error={errors.weight}
                  hint={`Estimasi laundry selesai: ${estimasiSelesai}`}
                >
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={draft.weightKg}
                    onChange={(e) => set('weightKg', e.target.value)}
                    placeholder="Contoh: 5"
                    error={!!errors.weight}
                  />
                </Field>
                <Field label="Catatan" hint="Opsional — permintaan khusus untuk laundry">
                  <Textarea
                    value={draft.note}
                    onChange={(e) => set('note', e.target.value)}
                    placeholder="Contoh: Jangan setrika kaos Sensitive"
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* 2 tahap pengiriman */}
          <Card>
            <CardHeader
              title="Pengiriman (2 Tahap)"
              subtitle="Jemput dulu ke outlet, lalu antar ke alamat Anda"
              icon={Bike}
            />

            {errors.legs && (
              <p className="mb-3 rounded-lg bg-danger-light px-3 py-2 text-xs font-medium text-danger">
                {errors.legs}
              </p>
            )}

            {/* Tahap 1 */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary-light/20 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                  <Bike size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Tahap 1 — Penjemputan
                  </p>
                  <p className="text-xs text-slate-500">
                    Kurir mengambil laundry dari Anda menuju outlet
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('pickupEnabled', !draft.pickupEnabled)}
                  className={`ml-auto relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    draft.pickupEnabled ? 'bg-primary' : 'bg-slate-300'
                  }`}
                  aria-label="Aktifkan penjemputan"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      draft.pickupEnabled ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {draft.pickupEnabled && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Tanggal Jemput" required error={errors.date}>
                    <div className="relative">
                      <CalendarDays size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="date"
                        min={todayISO()}
                        value={draft.date}
                        onChange={(e) => set('date', e.target.value)}
                        error={!!errors.date}
                        className="pl-9"
                      />
                    </div>
                  </Field>
                  <Field label="Jam Jemput" required error={errors.time}>
                    <div className="relative">
                      <Clock size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                      <select
                        value={draft.time}
                        onChange={(e) => set('time', e.target.value)}
                        className={`w-full appearance-none rounded-lg border bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                          errors.time ? 'border-danger' : 'border-slate-300'
                        }`}
                      >
                        <option value="">-- Pilih jam --</option>
                        {TIMES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </Field>
                </div>
              )}
            </div>

            {/* Tahap 2 */}
            <div className="mt-4 rounded-xl border-2 border-secondary/30 bg-secondary-light/20 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-white">
                  <Truck size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Tahap 2 — Pengantaran
                  </p>
                  <p className="text-xs text-slate-500">
                    Laundry diantar dari outlet ke alamat Anda
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('deliveryEnabled', !draft.deliveryEnabled)}
                  className={`ml-auto relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    draft.deliveryEnabled ? 'bg-secondary' : 'bg-slate-300'
                  }`}
                  aria-label="Aktifkan pengantaran"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      draft.deliveryEnabled ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {draft.deliveryEnabled ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Tanggal Antar" required error={errors.destDate}>
                    <div className="relative">
                      <CalendarDays size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="date"
                        min={draft.date || todayISO()}
                        value={draft.destDate}
                        onChange={(e) => set('destDate', e.target.value)}
                        error={!!errors.destDate}
                        className="pl-9"
                      />
                    </div>
                  </Field>
                  <Field label="Jam Antar" required error={errors.destTime}>
                    <div className="relative">
                      <Clock size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                      <select
                        value={draft.destTime}
                        onChange={(e) => set('destTime', e.target.value)}
                        className={`w-full appearance-none rounded-lg border bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                          errors.destTime ? 'border-danger' : 'border-slate-300'
                        }`}
                      >
                        <option value="">-- Pilih jam --</option>
                        {TIMES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </Field>
                </div>
              ) : (
                <p className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs text-slate-600">
                  <Store size={15} className="text-secondary-dark" />
                  Tidak diantar — Anda akan mengambil laundry sendiri di outlet.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Ringkasan harga */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader
              title="Estimasi Harga"
              subtitle="Dihitung otomatis dari berat"
              icon={Wallet}
            />
            <div className="space-y-2.5 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Layanan</span>
                <span className="font-semibold text-slate-800">{layanan.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Harga per kg</span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(layanan.pricePerKg)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Berat</span>
                <span className="font-semibold text-slate-800">{berat} kg</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(harga.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Bike size={13} /> Biaya penjemputan
                </span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(harga.pickupFee)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Truck size={13} /> Biaya pengantaran
                </span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(harga.deliveryFee)}
                </span>
              </div>
              {harga.discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Diskon ≥ 10 kg</span>
                  <span className="font-semibold text-secondary-dark">
                    -{formatRupiah(harga.discount)}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Total Bayar</span>
              <span className="text-xl font-extrabold text-primary">
                {formatRupiah(harga.total)}
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <Button type="submit" size="lg" full icon={ArrowRight}>
                Lanjut ke Konfirmasi
              </Button>
              <Button
                type="button"
                variant="ghost"
                full
                icon={ArrowLeft}
                onClick={() => navigate('/pelanggan')}
              >
                Batal
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}