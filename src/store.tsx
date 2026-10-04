import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { COURIERS, DEMO_USERS, INITIAL_ORDERS, SERVICES } from './data/demoData'
import type {
  AppNotification,
  DeliveryLeg,
  DeliveryStatus,
  LaundryStatus,
  Order,
  PaymentMethod,
  PaymentStatus,
  Role,
  User,
} from './types'
import { nextOrderId, uniqueId } from './lib/utils'
import { calculatePrice } from './lib/pricing'
import { usePersistedState } from './lib/usePersistedState'
import { normalizeState } from './lib/migrateState'
import { api } from './lib/api'

const STORAGE_KEY = 'laundryku.state.v1'

interface PersistedState {
  user: User | null
  orders: Order[]
  notifications: AppNotification[]
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export interface NewOrderInput {
  customerName: string
  customerPhone: string
  customerAddress: string
  serviceId: string
  weightKg: number
  note: string
  pickupEnabled: boolean
  deliveryEnabled: boolean
  date: string
  time: string
  destDate: string
  destTime: string
}

export interface RescheduleInput {
  date: string
  time: string
  destDate: string
  destTime: string
}

export type LegKey = 'pickup' | 'delivery'

export interface ConfirmDialog {
  type: 'confirm' | 'success' | 'info' | 'error'
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger' | 'warning'
  /** aksi tambahan yang tampil di bawah tombol utama */
  extra?: { label: string; to: string }[]
  onConfirm?: () => void
}

interface StoreValue {
  user: User | null
  orders: Order[]
  notifications: AppNotification[]
  toasts: Toast[]
  dialog: ConfirmDialog | null
  apiOnline: boolean
  couriers: User[]
  login: (email: string, password: string, role: Role) => {
    ok: boolean
    error?: string
    /** Dialog sukses otomatis muncul setelah login berhasil */
    dialog?: ConfirmDialog
    /** Halaman tujuan setelah login */
    home?: string
  }
  logout: () => void
  createOrder: (input: NewOrderInput) => Order
  payOrder: (orderId: string, method: PaymentMethod) => void
  updateLaundryStatus: (orderId: string, status: LaundryStatus) => void
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void
  assignCourier: (orderId: string, courierId: string) => void
  startLeg: (orderId: string, leg: LegKey) => void
  finishLeg: (orderId: string, leg: LegKey) => void
  cancelOrder: (orderId: string, reason: string) => void
  rescheduleOrder: (orderId: string, input: RescheduleInput) => void
  pushToast: (message: string, type?: Toast['type']) => void
  notify: (
    recipient: string,
    title: string,
    message: string,
    kind?: AppNotification['kind'],
  ) => void
  showDialog: (dialog: ConfirmDialog) => void
  closeDialog: () => void
  confirmLogout: () => void
  dismissToast: (id: string) => void
  myNotifications: AppNotification[]
  unreadCount: number
}

const StoreContext = createContext<StoreValue | null>(null)

const nowISO = () => new Date().toISOString()
const todayStr = () => new Date().toISOString().slice(0, 10)

/** helper: ubah status satu tahap pengiriman */
function withLegStatus(order: Order, leg: LegKey, status: DeliveryStatus): Order {
  const next: DeliveryLeg = { ...order.delivery[leg], status }
  return {
    ...order,
    delivery: { ...order.delivery, [leg]: next },
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [dialog, setDialog] = useState<ConfirmDialog | null>(null)
  const [apiOnline, setApiOnline] = useState(false)
  const [state, setState] = usePersistedState<PersistedState>(
    STORAGE_KEY,
    {
      user: null,
      orders: INITIAL_ORDERS,
      notifications: [
        {
          id: 'ntf-awal',
          recipient: 'u-customer',
          title: 'Pesanan diproses',
          message:
            'Laundry Anda ORD-001 sedang kami proses. Estimasi selesai 3 hari kerja.',
          time: nowISO(),
          read: false,
          kind: 'info',
        },
      ],
    },
    (raw, fallback) => normalizeState(raw, fallback.orders) as PersistedState,
  )

  const user = state.user
  const orders = state.orders
  const notifications = state.notifications

  const setUser = (u: User | null) => setState((s) => ({ ...s, user: u }))
  const setOrders = (updater: Order[] | ((prev: Order[]) => Order[])) =>
    setState((s) => ({
      ...s,
      orders: typeof updater === 'function' ? updater(s.orders) : updater,
    }))
  const setNotifications = (
    updater: AppNotification[] | ((prev: AppNotification[]) => AppNotification[]),
  ) =>
    setState((s) => ({
      ...s,
      notifications:
        typeof updater === 'function' ? updater(s.notifications) : updater,
    }))

  /* ------------------------------------------------------------------ */
  /* Sinkronisasi ke backend PHP (opsional — fallback ke localStorage)    */
  /* ------------------------------------------------------------------ */

  const ordersRef = useRef(orders)
  ordersRef.current = orders

  useEffect(() => {
    let alive = true
    // Hanya tarik data dari server saat browser belum pernah menyimpan state
    // (mis. komputer baru). Jika sudah ada state lokal, state lokal-lah yang
    // menjadi acuan agar perubahan terbaru tidak tertimpa oleh data lama.
    const adaStateLokal = !!window.localStorage.getItem(STORAGE_KEY)

    api
      .pullOrders()
      .then((remote) => {
        if (!alive) return
        setApiOnline(true)
        if (!adaStateLokal && Array.isArray(remote) && remote.length > 0) {
          setOrders(normalizeState({ orders: remote }, orders).orders)
        } else {
          api.pushOrders(ordersRef.current)
        }
      })
      .catch(() => {
        if (!alive) return
        // Backend tidak aktif -> aplikasi tetap berjalan penuh dari localStorage.
        setApiOnline(false)
      })
    return () => {
      alive = false
    }
  }, [setOrders])

  useEffect(() => {
    if (!apiOnline) return
    const timer = window.setTimeout(() => {
      api.pushOrders(orders)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [orders, apiOnline])

  /* ------------------------------------------------------------------ */
  /* Notifikasi                                                           */
  /* ------------------------------------------------------------------ */

  const pushToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = uniqueId('toast')
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (
      recipient: string,
      title: string,
      message: string,
      kind: AppNotification['kind'] = 'info',
    ) => {
      setNotifications((prev) => [
        { id: uniqueId('ntf'), recipient, title, message, time: nowISO(), read: false, kind },
        ...prev,
      ])
    },
    [setNotifications],
  )

  const showDialog = useCallback((d: ConfirmDialog) => setDialog(d), [])
  const closeDialog = useCallback(() => setDialog(null), [])

  /* ------------------------------------------------------------------ */
  /* Auth                                                                 */
  /* ------------------------------------------------------------------ */

  const login: StoreValue['login'] = useCallback(
    (email, password, role) => {
      const found = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (!found)
        return { ok: false, error: 'Email atau username tidak ditemukan.' }
      if (found.password !== password)
        return { ok: false, error: 'Password salah. Silakan coba lagi.' }
      if (found.role !== role)
        return {
          ok: false,
          error: `Akun ini terdaftar sebagai ${
            found.role === 'admin'
              ? 'Admin/Kasir'
              : found.role === 'courier'
                ? 'Kurir'
                : 'Pelanggan'
          }. Pilih role yang sesuai.`,
        }
      setUser(found)
      const home =
        found.role === 'admin' ? '/admin' : found.role === 'courier' ? '/kurir' : '/pelanggan'
      const roleName =
        found.role === 'admin'
          ? 'Admin/Kasir'
          : found.role === 'courier'
            ? 'Kurir'
            : 'Pelanggan'
      return {
        ok: true,
        dialog: {
          type: 'success' as const,
          title: 'Berhasil Masuk!',
          message: `Selamat datang, ${found.name}. Anda masuk sebagai ${roleName}.`,
          confirmLabel: 'Masuk ke Dashboard',
        },
        home,
      }
    },
    [setUser],
  )

  const logout = useCallback(() => {
    setUser(null)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [setNotifications])

  /** Dialog konfirmasi sebelum keluar — mencegah logout tak sengaja. */
  const confirmLogout = useCallback(() => {
    setDialog({
      type: 'confirm',
      title: 'Keluar dari LaundryKu?',
      message:
        'Anda akan keluar dari akun ini. Data pesanan dan status laundry tetap tersimpan.',
      confirmLabel: 'Ya, Keluar',
      cancelLabel: 'Batal, Lanjut Demo',
      tone: 'danger',
      onConfirm: () => {
        logout()
        window.location.assign('/login')
      },
    })
  }, [logout, setDialog])

  const updateOrder = useCallback(
    (orderId: string, updater: (o: Order) => Order) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updater(o) : o)))
    },
    [setOrders],
  )

  /* ------------------------------------------------------------------ */
  /* Aksi lintas role                                                     */
  /* ------------------------------------------------------------------ */

  const createOrder = useCallback(
    (input: NewOrderInput) => {
      const service = SERVICES.find((s) => s.id === input.serviceId) ?? SERVICES[0]
      const harga = calculatePrice(input.weightKg, service.pricePerKg, {
        pickupEnabled: input.pickupEnabled,
        deliveryEnabled: input.deliveryEnabled,
      })

      const orderId = nextOrderId(orders)
      const order: Order = {
        id: orderId,
        customerId: user?.id ?? 'u-customer',
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        serviceId: service.id,
        weightKg: input.weightKg,
        pricePerKg: service.pricePerKg,
        total: harga.total,
        note: input.note,
        orderDate: todayStr(),
        laundryStatus: 'Pesanan Dibuat',
        paymentStatus: 'Belum Dibayar',
        paymentMethod: null,
        paymentDate: null,
        delivery: {
          pickup: { enabled: input.pickupEnabled, status: 'Menunggu Kurir' },
          delivery: { enabled: input.deliveryEnabled, status: 'Menunggu Kurir' },
          courierId: null,
          date: input.date,
          time: input.time,
          destDate: input.destDate || input.date,
          destTime: input.destTime || input.time,
          rescheduleCount: 0,
        },
        cancelled: null,
      }
      setOrders((prev) => [order, ...prev])
      notify(
        order.customerId,
        'Pesanan berhasil dibuat',
        `Pesanan ${orderId} atas nama ${order.customerName} menunggu kurir dan pemrosesan laundry.`,
        'success',
      )
      notify(
        'admin',
        'Pesanan baru masuk',
        `${orderId} — ${order.customerName}, ${order.weightKg} kg ${service.name}.`,
        'info',
      )
      pushToast('Pesanan berhasil dibuat')
      return order
    },
    [orders, notify, pushToast, setOrders, user],
  )

  const payOrder = useCallback(
    (orderId: string, method: PaymentMethod) => {
      const order = orders.find((o) => o.id === orderId)
      updateOrder(orderId, (o) => ({
        ...o,
        paymentStatus: 'Sudah Dibayar',
        paymentMethod: method,
        paymentDate: todayStr(),
      }))
      notify(
        'admin',
        'Pembayaran diterima',
        `Pembayaran ${orderId} telah dikonfirmasi oleh pelanggan.`,
        'success',
      )
      setDialog({
        type: 'success',
        title: 'Pembayaran Berhasil!',
        message: `Pembayaran ${orderId} sebesar ${
          order ? 'tagihan laundry Anda' : 'tagihan laundry'
        } telah kami terima. Laundry akan segera diproses.`,
        confirmLabel: 'Lihat Status Laundry',
        extra: [
          { label: 'Kembali ke Pembayaran', to: `/pelanggan/pesanan/${orderId}/pembayaran` },
        ],
        onConfirm: () => {
          window.location.assign(`/pelanggan/pesanan/${orderId}/status`)
        },
      })
      pushToast('Pembayaran berhasil dikonfirmasi')
    },
    [notify, pushToast, setDialog, updateOrder],
  )

  const updateLaundryStatus = useCallback(
    (orderId: string, status: LaundryStatus) => {
      const order = orders.find((o) => o.id === orderId)
      updateOrder(orderId, (o) => ({ ...o, laundryStatus: status }))
      if (order) {
        notify(
          order.customerId,
          'Status laundry diperbarui',
          `Status laundry ${orderId} sekarang: ${status}.`,
          status === 'Selesai' ? 'success' : 'info',
        )
        setDialog({
          type: 'success',
          title: 'Status Laundry Diperbarui',
          message: `Pesanan ${orderId} kini berstatus "${status}". Pelanggan sudah diberi tahu.`,
          confirmLabel: 'Mengerti',
        })
      }
      pushToast('Status laundry berhasil diperbarui')
    },
    [notify, orders, pushToast, setDialog, updateOrder],
  )

  const updatePaymentStatus = useCallback(
    (orderId: string, status: PaymentStatus) => {
      updateOrder(orderId, (o) => ({
        ...o,
        paymentStatus: status,
        paymentDate: status === 'Sudah Dibayar' ? (o.paymentDate ?? todayStr()) : null,
      }))
      setDialog({
        type: 'success',
        title:
          status === 'Sudah Dibayar' ? 'Pembayaran Terverifikasi' : 'Verifikasi Dibatalkan',
        message:
          status === 'Sudah Dibayar'
            ? `Pembayaran ${orderId} ditandai sudah dibayar.`
            : `Pembayaran ${orderId} dikembalikan menjadi belum dibayar.`,
        confirmLabel: 'Mengerti',
      })
      pushToast('Status pembayaran berhasil diperbarui')
    },
    [pushToast, setDialog, updateOrder],
  )

  const assignCourier = useCallback(
    (orderId: string, courierId: string) => {
      const courier = COURIERS.find((u) => u.id === courierId)
      const order = orders.find((o) => o.id === orderId)
      updateOrder(orderId, (o) => ({
        ...o,
        delivery: {
          ...o.delivery,
          courierId,
          pickup: o.delivery.pickup.enabled
            ? { ...o.delivery.pickup, status: 'Kurir Ditugaskan' }
            : o.delivery.pickup,
          delivery: o.delivery.delivery.enabled
            ? { ...o.delivery.delivery, status: 'Kurir Ditugaskan' }
            : o.delivery.delivery,
        },
      }))
      if (courier) {
        notify(
          courierId,
          'Tugas baru masuk',
          `Tugas untuk ${orderId} atas nama ${order?.customerName ?? '-'}.`,
          'info',
        )
      }
      if (order) {
        notify(
          order.customerId,
          'Kurir telah ditugaskan',
          `${courier?.name ?? 'Kurir'} akan menjemput laundry ${orderId} pada ${order.delivery.date} pukul ${order.delivery.time}.`,
          'info',
        )
      }
      setDialog({
        type: 'success',
        title: 'Kurir Berhasil Ditugaskan',
        message: `${courier?.name ?? 'Kurir'} kini menangani ${orderId}. Tugas otomatis muncul di dashboard kurir.`,
        confirmLabel: 'Mengerti',
      })
      pushToast('Kurir berhasil ditugaskan')
    },
    [notify, orders, pushToast, setDialog, updateOrder],
  )

  /* ---------------------- 2 tahap pengiriman ------------------------ */

  const startLeg = useCallback(
    (orderId: string, leg: LegKey) => {
      const order = orders.find((o) => o.id === orderId)
      updateOrder(orderId, (o) => withLegStatus(o, leg, 'Dalam Perjalanan'))
      const label = leg === 'pickup' ? 'Penjemputan' : 'Pengantaran'
      if (order) {
        notify(
          order.customerId,
          `Kurir sedang menuju ${label.toLowerCase()}`,
          `${orderId} — kurir dalam perjalanan untuk ${label.toLowerCase()}.`,
          'info',
        )
      }
      setDialog({
        type: 'info',
        title: `Tugas ${label} Dimulai`,
        message: `Kurir sedang bepergian menangani ${label.toLowerCase()} untuk pesanan ${orderId}.`,
        confirmLabel: 'Lanjutkan',
      })
      pushToast(`Tugas ${label} dimulai`, 'info')
    },
    [notify, orders, pushToast, setDialog, updateOrder],
  )

  const finishLeg = useCallback(
    (orderId: string, leg: LegKey) => {
      const order = orders.find((o) => o.id === orderId)
      const label = leg === 'pickup' ? 'Penjemputan' : 'Pengantaran'

      updateOrder(orderId, (o) => {
        let next = withLegStatus(o, leg, 'Selesai')
        if (leg === 'pickup') {
          // Laundry sudah masuk outlet -> mulai proses laundry.
          if (next.laundryStatus === 'Pesanan Dibuat') next.laundryStatus = 'Diproses'
          // المرحلة antar siap dijalankan bila diaktifkan.
          if (
            next.delivery.delivery.enabled &&
            next.delivery.delivery.status === 'Menunggu Kurir'
          ) {
            next = {
              ...next,
              delivery: {
                ...next.delivery,
                delivery: { ...next.delivery.delivery, status: 'Kurir Ditugaskan' },
              },
            }
          }
        }
        if (leg === 'delivery') {
          next = { ...next, laundryStatus: 'Selesai' }
        }
        return next
      })

      if (order) {
        notify(
          order.customerId,
          leg === 'delivery'
            ? 'Pesanan laundry Anda sudah selesai'
            : 'Laundry sudah dijemput',
          leg === 'delivery'
            ? `Pengantaran ${orderId} telah diterima pelanggan. Terima kasih!`
            : `${label} ${orderId} selesai. Laundry Anda sudah masuk ke outlet kami.`,
          'success',
        )
      }
      setDialog({
        type: 'success',
        title: 'Tugas Berhasil Diselesaikan',
        message:
          leg === 'delivery'
            ? `Pengantaran ${orderId} selesai. Pelanggan telah menerima notifikasi bahwa laundry-nya selesai.`
            : `Penjemputan ${orderId} selesai. Laundry sudah berada di outlet dan akan diproses.`,
        confirmLabel: 'Kembali ke Tugas Saya',
        extra: [{ label: 'Lihat Pesanan', to: `/kurir/tugas/${orderId}/${leg}` }],
        onConfirm: () => window.location.assign('/kurir'),
      })
      pushToast('Tugas berhasil diselesaikan')
    },
    [notify, orders, pushToast, setDialog, updateOrder],
  )

  /* ------------------------- Pembatalan ----------------------------- */

  const cancelOrder = useCallback(
    (orderId: string, reason: string) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) return
      if (order.laundryStatus !== 'Pesanan Dibuat') {
        setDialog({
          type: 'error',
          title: 'Pesanan Tidak Dapat Dibatalkan',
          message: `Pesanan ${orderId} sudah masuk proses laundry sehingga tidak bisa dibatalkan. Hubungi admin untuk bantuan.`,
          confirmLabel: 'Mengerti',
        })
        pushToast('Pesanan tidak dapat dibatalkan', 'error')
        return
      }
      updateOrder(orderId, (o) => ({
        ...o,
        cancelled: { at: nowISO(), reason, by: user?.name ?? '-' },
      }))
      notify(
        order.customerId,
        'Pesanan dibatalkan',
        `${orderId} dibatalkan. Alasan: ${reason || 'tidak diisi'}.`,
        'warning',
      )
      notify(
        'admin',
        'Pesanan dibatalkan pelanggan',
        `${orderId} dibatalkan. Alasan: ${reason || 'tidak diisi'}.`,
        'warning',
      )
      setDialog({
        type: 'success',
        title: 'Pesanan Berhasil Dibatalkan',
        message: `Pesanan ${orderId} telah dibatalkan. Admin sudah diberi tahu.`,
        confirmLabel: 'Kembali ke Pesanan Saya',
        onConfirm: () => window.location.assign('/pelanggan/pesanan'),
      })
      pushToast('Pesanan berhasil dibatalkan')
    },
    [notify, orders, pushToast, setDialog, updateOrder, user],
  )

  /* ------------------------ Jadwal ulang ---------------------------- */

  const rescheduleOrder = useCallback(
    (orderId: string, input: RescheduleInput) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) return
      updateOrder(orderId, (o) => ({
        ...o,
        delivery: {
          ...o.delivery,
          date: input.date || o.delivery.date,
          time: input.time || o.delivery.time,
          destDate: input.destDate || o.delivery.destDate,
          destTime: input.destTime || o.delivery.destTime,
          rescheduleCount: o.delivery.rescheduleCount + 1,
          // jadwal baru -> kembali menunggu kurir
          pickup: o.delivery.pickup.status === 'Selesai'
            ? o.delivery.pickup
            : { ...o.delivery.pickup, status: o.delivery.courierId ? 'Kurir Ditugaskan' : 'Menunggu Kurir' },
        },
      }))
      const kurir = DEMO_USERS.find((u) => u.id === order.delivery.courierId)
      if (kurir) {
        notify(
          kurir.id,
          'Jadwal tugas berubah',
          `Jadwal ${orderId} kini ${input.date} pukul ${input.time}.`,
          'warning',
        )
      }
      notify(
        order.customerId,
        'Jadwal berhasil diubah',
        `Jadwal ${orderId} diperbarui menjadi ${input.date}, ${input.time}.`,
        'success',
      )
      setDialog({
        type: 'success',
        title: 'Jadwal Berhasil Diperbarui',
        message: `Jadwal penjemputan ${orderId} kini ${input.date} pukul ${input.time}. Kurir akan diberi tahu.`,
        confirmLabel: 'Kembali ke Detail Pesanan',
        onConfirm: () => window.location.assign(`/pelanggan/pesanan/${orderId}`),
      })
      pushToast('Jadwal berhasil diubah')
    },
    [notify, orders, pushToast, setDialog, updateOrder],
  )

  /* ------------------------------------------------------------------ */

  const myNotifications = useMemo(() => {
    if (!user) return []
    return notifications
      .filter((n) => n.recipient === user.id || n.recipient === user.role)
      .sort((a, b) => (a.time < b.time ? 1 : -1))
  }, [notifications, user])

  const unreadCount = myNotifications.filter((n) => !n.read).length

  const value: StoreValue = {
    user,
    orders,
    notifications,
    toasts,
    dialog,
    apiOnline,
    couriers: COURIERS,
    login,
    logout,
    createOrder,
    payOrder,
    updateLaundryStatus,
    updatePaymentStatus,
    assignCourier,
    startLeg,
    finishLeg,
    cancelOrder,
    rescheduleOrder,
    pushToast,
    notify,
    showDialog,
    closeDialog,
    confirmLogout,
    dismissToast,
    myNotifications,
    unreadCount,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore harus dipakai di dalam StoreProvider')
  return ctx
}