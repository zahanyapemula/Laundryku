import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shirt,
  Sparkles,
  UserCog,
  Truck,
} from 'lucide-react'
import { useStore } from '../store'
import type { Role } from '../types'
import { Button, Input } from '../components/ui'

const ROLES: { id: Role; label: string; desc: string; icon: typeof Shirt }[] = [
  { id: 'customer', label: 'Pelanggan', desc: 'Pesan & pantau laundry', icon: Shirt },
  { id: 'admin', label: 'Admin/Kasir', desc: 'Kelola pesanan & kurir', icon: UserCog },
  { id: 'courier', label: 'Kurir', desc: 'Pickup & pengantaran', icon: Truck },
]

const DEMO: { role: Role; email: string }[] = [
  { role: 'customer', email: 'customer@laundry.com' },
  { role: 'admin', email: 'admin@laundry.com' },
  { role: 'courier', email: 'courier@laundry.com' },
]

export default function Login() {
  const { user, login, pushToast, showDialog } = useStore()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('customer')
  const [email, setEmail] = useState('customer@laundry.com')
  const [password, setPassword] = useState('laundry123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin' : user.role === 'courier' ? '/kurir' : '/pelanggan'}
        replace
      />
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs: { email?: string; password?: string } = {}
    if (!email.trim()) errs.email = 'Email wajib diisi'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      errs.email = 'Format email tidak valid'
    if (!password) errs.password = 'Password wajib diisi'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    const res = login(email, password, role)
    if (!res.ok) {
      setError(res.error ?? 'Login gagal')
      return
    }
    setError('')
    pushToast('Berhasil masuk ke LaundryKu')
    if (res.dialog) showDialog(res.dialog)
    navigate(
      res.home ??
        (role === 'admin' ? '/admin' : role === 'courier' ? '/kurir' : '/pelanggan'),
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Panel kiri — identitas brand */}
      <div className="relative hidden flex-1 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Shirt size={24} />
          </span>
          <div>
            <p className="text-xl font-extrabold">LaundryKu</p>
            <p className="text-sm text-primary-light">Sistem Informasi Pemesanan Laundry</p>
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl leading-tight font-extrabold">
            Cuci rapi, antar tepat waktu.
          </h2>
          <p className="mt-4 text-primary-light">
            Satu sistem untuk pelanggan, admin/kasir, dan kurir. Pesanan, pembayaran,
            serta status laundry terhubung real-time dalam satu aplikasi.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Pesan laundry tanpa antre di outlet',
              'Pantau status laundry sampai selesai',
              'Kurir penjemputan & pengantaran terjadwal',
            ].map((t) => (
              <p key={t} className="flex items-center gap-3 text-sm text-white/90">
                <Sparkles size={16} className="shrink-0" />
                {t}
              </p>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-light">
          © 2026 LaundryKu — Prototipe Tugas Prototyping Tools & Feedback
        </p>
      </div>

      {/* Panel kanan — form login */}
      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-12 lg:w-[520px] lg:shrink-0">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <Shirt size={24} />
            </span>
            <div>
              <p className="text-lg font-extrabold text-slate-800">LaundryKu</p>
              <p className="text-xs text-slate-500">Sistem Informasi Pemesanan Laundry</p>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800">Masuk ke Akun Anda</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pilih role lalu masuk menggunakan akun demo.
          </p>

          {/* Pilihan role */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id)
                  setError('')
                  const demo = DEMO.find((d) => d.role === r.id)
                  if (demo) setEmail(demo.email)
                }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all ${
                  role === r.id
                    ? 'border-primary bg-primary-light/60 text-primary-dark'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <r.icon size={20} />
                <span className="text-xs leading-tight font-bold">{r.label}</span>
                <span className="text-[10px] leading-tight text-slate-400">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email / Username
              </span>
              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@laundry.com"
                  error={!!fieldErrors.email}
                  className="pl-9"
                />
              </div>
              {fieldErrors.email && (
                <span className="mt-1 block text-xs font-medium text-danger">
                  {fieldErrors.email}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  error={!!fieldErrors.password}
                  className="pr-10 pl-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Tampilkan password"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="mt-1 block text-xs font-medium text-danger">
                  {fieldErrors.password}
                </span>
              )}
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-light bg-danger-light px-3 py-2.5 text-sm text-danger">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" full icon={ArrowRight}>
              Masuk
            </Button>
          </form>

          {/* Akun demo */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-bold tracking-wide text-slate-500 uppercase">
              Akun Demo — Password: laundry123
            </p>
            <div className="space-y-2">
              {DEMO.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => {
                    setRole(d.role)
                    setEmail(d.email)
                    setPassword('laundry123')
                    setError('')
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left text-xs transition-colors hover:border-primary hover:bg-primary-light/40"
                >
                  <span className="font-semibold text-slate-700">
                    {ROLES.find((r) => r.id === d.role)?.label}
                  </span>
                  <span className="truncate text-slate-500">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}