import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Home,
  Info,
  LogOut,
  Menu,
  Package,
  PackageSearch,
  Shirt,
  Truck,
  User,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import { roleLabel, timeAgo } from '../lib/utils'

interface NavItem {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}

const NAV: Record<string, NavItem[]> = {
  customer: [
    { to: '/pelanggan', label: 'Dashboard', icon: Home, end: true },
    { to: '/pelanggan/pemesanan', label: 'Pesan Laundry', icon: Shirt },
    { to: '/pelanggan/pesanan', label: 'Pesanan Saya', icon: ClipboardList },
    { to: '/pelanggan/status', label: 'Status Laundry', icon: PackageSearch },
    { to: '/pelanggan/pembayaran', label: 'Pembayaran', icon: CreditCard },
    { to: '/pelanggan/pengantaran', label: 'Penjemputan/Pengantaran', icon: Truck },
    { to: '/profil', label: 'Profil', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: Home, end: true },
    { to: '/admin/pesanan', label: 'Kelola Pesanan', icon: ClipboardList },
    { to: '/profil', label: 'Profil', icon: User },
  ],
  courier: [
    { to: '/kurir', label: 'Dashboard', icon: Home, end: true },
    { to: '/kurir/tugas', label: 'Tugas Saya', icon: Package },
    { to: '/profil', label: 'Profil', icon: User },
  ],
}

const TITLES: { match: RegExp; title: string; breadcrumb: string[] }[] = [
  { match: /^\/pelanggan$/, title: 'Dashboard', breadcrumb: ['Pelanggan'] },
  {
    match: /^\/pelanggan\/pemesanan$/,
    title: 'Pesan Laundry',
    breadcrumb: ['Pelanggan', 'Pesanan Saya'],
  },
  {
    match: /^\/pelanggan\/konfirmasi$/,
    title: 'Konfirmasi Pesanan',
    breadcrumb: ['Pelanggan', 'Pesan Laundry', 'Konfirmasi'],
  },
  {
    match: /^\/pelanggan\/pesanan\/berhasil$/,
    title: 'Pesanan Berhasil',
    breadcrumb: ['Pelanggan', 'Pesanan Saya'],
  },
  {
    match: /^\/pelanggan\/pesanan\/[^/]+\/status$/,
    title: 'Status Laundry',
    breadcrumb: ['Pelanggan', 'Detail Pesanan', 'Status Laundry'],
  },
  {
    match: /^\/pelanggan\/pesanan\/[^/]+\/pembayaran$/,
    title: 'Pembayaran',
    breadcrumb: ['Pelanggan', 'Detail Pesanan', 'Pembayaran'],
  },
  {
    match: /^\/pelanggan\/pesanan\/[^/]+\/pengantaran$/,
    title: 'Penjemputan/Pengantaran',
    breadcrumb: ['Pelanggan', 'Detail Pesanan', 'Pengantaran'],
  },
  {
    match: /^\/pelanggan\/pesanan\/[^/]+\/invoice$/,
    title: 'Invoice Laundry',
    breadcrumb: ['Pelanggan', 'Detail Pesanan', 'Invoice'],
  },
  {
    match: /^\/pelanggan\/pesanan\/[^/]+$/,
    title: 'Detail Pesanan',
    breadcrumb: ['Pelanggan', 'Pesanan Saya'],
  },
  {
    match: /^\/pelanggan\/status$/,
    title: 'Status Laundry',
    breadcrumb: ['Pelanggan'],
  },
  {
    match: /^\/pelanggan\/pembayaran$/,
    title: 'Pembayaran',
    breadcrumb: ['Pelanggan'],
  },
  {
    match: /^\/pelanggan\/pesanan$/,
    title: 'Pesanan Saya',
    breadcrumb: ['Pelanggan'],
  },
  { match: /^\/admin$/, title: 'Dashboard Admin', breadcrumb: ['Admin/Kasir'] },
  {
    match: /^\/admin\/pesanan\/[^/]+$/,
    title: 'Detail Pesanan Admin',
    breadcrumb: ['Admin/Kasir', 'Kelola Pesanan'],
  },
  {
    match: /^\/admin\/pesanan$/,
    title: 'Kelola Pesanan',
    breadcrumb: ['Admin/Kasir'],
  },
  {
    match: /^\/kurir\/tugas\/[^/]+\/[^/]+$/,
    title: 'Detail Tugas Kurir',
    breadcrumb: ['Kurir', 'Tugas Saya'],
  },
  {
    match: /^\/kurir\/tugas\/[^/]+$/,
    title: 'Detail Tugas Kurir',
    breadcrumb: ['Kurir', 'Tugas Saya'],
  },
  { match: /^\/kurir\/tugas$/, title: 'Tugas Saya', breadcrumb: ['Kurir'] },
  { match: /^\/kurir$/, title: 'Dashboard Kurir', breadcrumb: ['Kurir'] },
  { match: /^\/profil$/, title: 'Profil', breadcrumb: ['Profil'] },
]

function usePageMeta() {
  const { pathname } = useLocation()
  const found = TITLES.find((t) => t.match.test(pathname))
  return found ?? { title: 'LaundryKu', breadcrumb: ['LaundryKu'] }
}

/* ----------------------------- Sidebar ------------------------------ */

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, confirmLogout } = useStore()
  if (!user) return null
  const items = NAV[user.role] ?? []

  return (
    <div className="flex h-full flex-col bg-white">
      <Link
        to={user.role === 'admin' ? '/admin' : user.role === 'courier' ? '/kurir' : '/pelanggan'}
        onClick={onNavigate}
        className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
          <Shirt size={20} />
        </span>
        <div>
          <p className="text-base font-extrabold text-slate-800">LaundryKu</p>
          <p className="text-[11px] font-medium text-slate-500">
            Sistem Informasi Laundry
          </p>
        </div>
      </Link>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pt-1 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Menu {roleLabel(user.role)}
        </p>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary-dark'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <item.icon size={17} className="shrink-0" />
            <span className="leading-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={() => {
            confirmLogout()
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-light"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )
}

/* ----------------------------- Toasts ------------------------------- */

function ToastHost() {
  const { toasts, dismissToast } = useStore()
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed top-20 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`animate-toast-in pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 bg-white p-3.5 shadow-lg ring-1 ring-slate-900/5 ${
            t.type === 'success'
              ? 'border-l-secondary'
              : t.type === 'error'
                ? 'border-l-danger'
                : 'border-l-primary'
          }`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              t.type === 'success'
                ? 'bg-secondary-light text-secondary-dark'
                : t.type === 'error'
                  ? 'bg-danger-light text-danger'
                  : 'bg-primary-light text-primary'
            }`}
          >
            {t.type === 'success' ? (
              <Check size={14} />
            ) : t.type === 'error' ? (
              <X size={14} />
            ) : (
              <Info size={14} />
            )}
          </span>
          <p className="flex-1 text-sm font-medium text-slate-700">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Tutup notifikasi"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

/* --------------------------- Notification --------------------------- */

function NotificationBell() {
  const { myNotifications, unreadCount } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
        aria-label="Notifikasi"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-toast-in absolute right-0 z-[60] mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-800">Notifikasi</p>
            <span className="text-xs text-slate-500">{unreadCount} belum dibaca</span>
          </div>
          <div className="scrollbar-thin max-h-80 overflow-y-auto">
            {myNotifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                Belum ada notifikasi
              </p>
            ) : (
              myNotifications.map((n) => (
                <div
                  key={n.id}
                  className="border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        n.kind === 'success'
                          ? 'bg-secondary'
                          : n.kind === 'warning'
                            ? 'bg-warning'
                            : 'bg-primary'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs leading-relaxed text-slate-500">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {timeAgo(n.time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------- Profile dropdown ------------------------ */

function ProfileMenu() {
  const { user, confirmLogout } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 transition-colors hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {user.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-semibold text-slate-800">
            {user.name}
          </span>
          <span className="block text-[11px] leading-tight text-slate-500">
            {roleLabel(user.role)}
          </span>
        </span>
        <ChevronDown size={15} className="text-slate-400" />
      </button>

      {open && (
        <div className="animate-toast-in absolute right-0 z-[60] mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Link
            to="/profil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <User size={16} /> Profil Saya
          </Link>
          <button
            onClick={() => {
              confirmLogout()
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger-light"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  )
}

/* ----------------------------- Layout ------------------------------- */

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const meta = usePageMeta()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (!user) return <>{children}</>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-slate-200 lg:block">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-toast-in absolute inset-y-0 left-0 w-64 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 -right-11 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Navbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <nav className="flex items-center gap-1.5 text-xs text-slate-400">
                {meta.breadcrumb.map((b, i) => (
                  <span key={b} className="flex items-center gap-1.5">
                    {i > 0 && <span>/</span>}
                    <span className={i === meta.breadcrumb.length - 1 ? 'text-slate-500' : ''}>
                      {b}
                    </span>
                  </span>
                ))}
              </nav>
              <h1 className="truncate text-lg font-extrabold text-slate-800">
                {meta.title}
              </h1>
            </div>
            <NotificationBell />
            <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
            <ProfileMenu />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      <ToastHost />
    </div>
  )
}