import { useMemo } from 'react'
import { LogOut, Mail, MapPin, Phone, User } from 'lucide-react'
import { useStore } from '../store'
import { formatRupiah, roleLabel } from '../lib/utils'
import { serviceById } from '../data/demoData'
import { Badge, Button, Card, CardHeader, StatCard } from '../components/ui'

export default function Profile() {
  const { user, orders, confirmLogout } = useStore()

  const myOrders = useMemo(
    () => orders.filter((o) => o.customerId === user?.id),
    [orders, user],
  )

  const activeTasks = useMemo(
    () =>
      orders
        .filter((o) => o.delivery.courierId === user?.id)
        .reduce(
          (n, o) =>
            n +
            (o.delivery.pickup.enabled ? 1 : 0) +
            (o.delivery.delivery.enabled ? 1 : 0),
          0,
        ),
    [orders, user],
  )

  const legDone = (status: string) => status === 'Selesai'
  const legOngoing = (status: string) => status === 'Dalam Perjalanan'

  if (!user) return null

  const totalBelanja = myOrders.reduce((s, o) => s + o.total, 0)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white">
            {user.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold text-slate-800">{user.name}</h2>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
              <Mail size={14} /> {user.email}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge tone="blue">{roleLabel(user.role)}</Badge>
              {user.vehicle && <Badge tone="purple">{user.vehicle}</Badge>}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
            <span className="flex items-center gap-2 text-slate-500">
              <User size={15} className="text-slate-400" /> Username
            </span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
            <span className="flex items-center gap-2 text-slate-500">
              <Phone size={15} className="text-slate-400" /> Nomor Telepon
            </span>
            <span className="font-semibold text-slate-800">{user.phone}</span>
          </div>
          <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
            <span className="flex shrink-0 items-center gap-2 text-slate-500">
              <MapPin size={15} className="text-slate-400" /> Alamat
            </span>
            <span className="text-right font-semibold text-slate-800">
              {user.address}
            </span>
          </div>
        </div>
      </Card>

      {user.role === 'customer' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Pesanan" value={myOrders.length} icon={User} tone="blue" />
          <StatCard
            label="Pesanan Selesai"
            value={myOrders.filter((o) => o.laundryStatus === 'Selesai').length}
            icon={User}
            tone="green"
          />
          <StatCard
            label="Total Belanja"
            value={formatRupiah(totalBelanja)}
            icon={User}
            tone="purple"
          />
        </div>
      )}

      {user.role === 'admin' && (
        <Card>
          <CardHeader title="Ringkasan Operasional" subtitle="Statistik operasional laundry" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Pesanan" value={orders.length} icon={User} tone="blue" />
            <StatCard
              label="Pesanan Selesai"
              value={orders.filter((o) => o.laundryStatus === 'Selesai').length}
              icon={User}
              tone="green"
            />
            <StatCard
              label="Total Pembayaran"
              value={formatRupiah(
                orders
                  .filter((o) => o.paymentStatus === 'Sudah Dibayar')
                  .reduce((s, o) => s + o.total, 0),
              )}
              icon={User}
              tone="purple"
            />
          </div>
        </Card>
      )}

      {user.role === 'courier' && (
        <Card>
          <CardHeader title="Ringkasan Tugas" subtitle="Statistik pekerjaan Anda" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Tugas" value={activeTasks} icon={User} tone="blue" />
            <StatCard
              label="Tugas Selesai"
              value={
                orders
                  .filter((o) => o.delivery.courierId === user.id)
                  .reduce(
                    (n, o) =>
                      n +
                      (o.delivery.pickup.enabled ? Number(legDone(o.delivery.pickup.status)) : 0) +
                      (o.delivery.delivery.enabled
                        ? Number(legDone(o.delivery.delivery.status))
                        : 0),
                    0,
                  )
              }
              icon={User}
              tone="green"
            />
            <StatCard
              label="Sedang Berjalan"
              value={
                orders
                  .filter((o) => o.delivery.courierId === user.id)
                  .reduce(
                    (n, o) =>
                      n +
                      (o.delivery.pickup.enabled
                        ? Number(legOngoing(o.delivery.pickup.status))
                        : 0) +
                      (o.delivery.delivery.enabled
                        ? Number(legOngoing(o.delivery.delivery.status))
                        : 0),
                    0,
                  )
              }
              icon={User}
              tone="amber"
            />
          </div>
        </Card>
      )}

      {user.role === 'admin' && orders.length > 0 && (
        <Card>
          <CardHeader title="Pesanan Terbaru" subtitle="Aktivitas terakhir pelanggan" />
          <ul className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-bold text-primary">{o.id}</p>
                  <p className="text-xs text-slate-500">
                    {o.customerName} • {serviceById(o.serviceId).name}
                  </p>
                </div>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(o.total)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Button
        variant="danger"
        size="lg"
        full
        icon={LogOut}
        onClick={() => {
          confirmLogout()
        }}
      >
        Logout
      </Button>
    </div>
  )
}