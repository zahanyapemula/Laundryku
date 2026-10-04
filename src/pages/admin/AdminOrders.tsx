import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ClipboardList, Search, Truck } from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { courierById, serviceById } from '../../data/demoData'
import {
  Button,
  Card,
  EmptyState,
  TableWrap,
  Td,
  Th,
} from '../../components/ui'
import { LaundryBadge, LegSummary, OrderStateBadge, PaymentBadge } from '../../components/Status'

const FILTERS = [
  { id: 'semua', label: 'Semua' },
  { id: 'baru', label: 'Baru' },
  { id: 'diproses', label: 'Diproses' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'belum_bayar', label: 'Belum Dibayar' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

export default function AdminOrders() {
  const { orders } = useStore()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const initial = (params.get('filter') as FilterId) ?? 'semua'
  const [filter, setFilter] = useState<FilterId>(
    FILTERS.some((f) => f.id === initial) ? initial : 'semua',
  )

  useEffect(() => {
    const f = params.get('filter') as FilterId | null
    if (f && FILTERS.some((x) => x.id === f)) setFilter(f)
  }, [params])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        serviceById(o.serviceId).name.toLowerCase().includes(q)
      const matchFilter =
        filter === 'semua'
          ? true
          : filter === 'baru'
            ? o.laundryStatus === 'Pesanan Dibuat'
            : filter === 'diproses'
              ? o.laundryStatus === 'Diproses' ||
                o.laundryStatus === 'Laundry Selesai' ||
                o.laundryStatus === 'Siap Diambil/Diantar'
              : filter === 'selesai'
                ? o.laundryStatus === 'Selesai'
                : o.paymentStatus === 'Belum Dibayar'
      return matchSearch && matchFilter
    })
  }, [orders, search, filter])

  const pick = (id: FilterId) => {
    setFilter(id)
    if (id === 'semua') setParams({})
    else setParams({ filter: id })
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Cari Pesanan
            </label>
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID pesanan, nama pelanggan, atau layanan"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => pick(f.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  filter === f.id
                    ? 'bg-primary text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={
            orders.length === 0 ? 'Belum ada pesanan masuk' : 'Pesanan tidak ditemukan'
          }
          description={
            orders.length === 0
              ? 'Pesanan yang dibuat pelanggan akan otomatis tampil di daftar ini.'
              : 'Ubah kata kunci pencarian atau pilih filter lain.'
          }
          action={
            orders.length > 0 ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('')
                  pick('semua')
                }}
              >
                Reset Filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <TableWrap>
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Pelanggan</Th>
                    <Th>Layanan</Th>
                    <Th>Berat</Th>
                    <Th>Total</Th>
                    <Th>Status Laundry</Th>
                    <Th>Status Pembayaran</Th>
                    <Th>Kurir</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-slate-50">
                      <Td className="font-bold text-primary">{o.id}</Td>
                      <Td>
                        <p className="font-semibold text-slate-800">{o.customerName}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(o.orderDate)}
                        </p>
                      </Td>
                      <Td>{serviceById(o.serviceId).name}</Td>
                      <Td>{o.weightKg} kg</Td>
                      <Td className="font-semibold">{formatRupiah(o.total)}</Td>
                      <Td>
                        <div className="flex flex-col gap-1">
                          <LaundryBadge status={o.laundryStatus} />
                          <OrderStateBadge order={o} />
                        </div>
                      </Td>
                      <Td>
                        <PaymentBadge status={o.paymentStatus} />
                      </Td>
                      <Td>
                        <div className="space-y-1">
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                            <Truck size={13} className="text-slate-400" />
                            {courierById(o.delivery.courierId)?.name ?? 'Belum ada'}
                          </span>
                          <LegSummary order={o} />
                        </div>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={ArrowRight}
                          onClick={() => navigate(`/admin/pesanan/${o.id}`)}
                        >
                          Lihat Detail
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </div>

          <div className="space-y-3 lg:hidden">
            {filtered.map((o) => (
              <Card key={o.id}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-extrabold text-primary">{o.id}</p>
                    <p className="text-xs text-slate-500">
                      {o.customerName} • {formatDate(o.orderDate)}
                    </p>
                  </div>
                  <p className="text-base font-extrabold text-slate-800">
                    {formatRupiah(o.total)}
                  </p>
                </div>
                <p className="mb-3 text-sm text-slate-600">
                  {serviceById(o.serviceId).name} • {o.weightKg} kg
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <LaundryBadge status={o.laundryStatus} />
                  <PaymentBadge status={o.paymentStatus} />
                  <OrderStateBadge order={o} />
                </div>
                <div className="mt-2">
                  <LegSummary order={o} />
                </div>
                <Button
                  full
                  className="mt-4"
                  icon={ArrowRight}
                  onClick={() => navigate(`/admin/pesanan/${o.id}`)}
                >
                  Lihat Detail
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-xs text-slate-500">
          Menampilkan {filtered.length} dari {orders.length} pesanan
        </p>
      )}
    </div>
  )
}