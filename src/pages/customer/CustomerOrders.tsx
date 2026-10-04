import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, Plus, Search, Shirt } from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, formatRupiah } from '../../lib/utils'
import { serviceById } from '../../data/demoData'
import { Button, Card, EmptyState, Select, TableWrap, Td, Th } from '../../components/ui'
import {
  LaundryBadge,
  LegSummary,
  OrderStateBadge,
  PaymentBadge,
} from '../../components/Status'

const FILTERS = [
  { id: 'semua', label: 'Semua' },
  { id: 'diproses', label: 'Diproses' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'belum_bayar', label: 'Belum Dibayar' },
  { id: 'dibatalkan', label: 'Dibatalkan' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

export default function CustomerOrders() {
  const { user, orders } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterId>('semua')

  const list = useMemo(
    () => orders.filter((o) => o.customerId === user?.id),
    [orders, user],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return list.filter((o) => {
      const matchSearch = !q || o.id.toLowerCase().includes(q)
      const matchFilter =
        filter === 'semua'
          ? true
          : filter === 'diproses'
            ? !o.cancelled && o.laundryStatus !== 'Selesai'
            : filter === 'selesai'
              ? o.laundryStatus === 'Selesai'
              : filter === 'belum_bayar'
                ? o.paymentStatus === 'Belum Dibayar' && !o.cancelled
                : !!o.cancelled
      return matchSearch && matchFilter
    })
  }, [list, search, filter])

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
                placeholder="Cari berdasarkan ID pesanan, contoh ORD-001"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  filter === f.id
                    ? 'bg-primary text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterId)}
              className="w-full py-2 text-xs sm:w-auto lg:hidden"
            >
              {FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  Filter: {f.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={list.length ? Search : Shirt}
          title={list.length === 0 ? 'Belum ada pesanan' : 'Pesanan tidak ditemukan'}
          description={
            list.length === 0
              ? 'Anda belum pernah memesan laundry. Buat pesanan pertama Anda sekarang.'
              : 'Coba ubah kata kunci pencarian atau pilih filter lain.'
          }
          action={
            list.length === 0 ? (
              <Button icon={Plus} onClick={() => navigate('/pelanggan/pemesanan')}>
                Pesan Laundry
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setFilter('semua')
                }}
              >
                Reset Filter
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <TableWrap>
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr>
                    <Th>ID Pesanan</Th>
                    <Th>Tanggal</Th>
                    <Th>Layanan</Th>
                    <Th>Berat</Th>
                    <Th>Total</Th>
                    <Th>Status Laundry</Th>
                    <Th>Status Pembayaran</Th>
                    <Th>Pengiriman</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-slate-50">
                      <Td className="font-bold text-primary">{o.id}</Td>
                      <Td>{formatDate(o.orderDate)}</Td>
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
                        <LegSummary order={o} />
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={ArrowRight}
                          onClick={() => navigate(`/pelanggan/pesanan/${o.id}`)}
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
              <Card key={o.id} className={o.cancelled ? 'border-danger/40' : ''}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-base font-extrabold text-primary">
                      <ClipboardList size={16} /> {o.id}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(o.orderDate)}</p>
                  </div>
                  <p className="text-base font-extrabold text-slate-800">
                    {formatRupiah(o.total)}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Layanan</span>
                    <span className="font-semibold">
                      {serviceById(o.serviceId).name} ({o.weightKg} kg)
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
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
                  onClick={() => navigate(`/pelanggan/pesanan/${o.id}`)}
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
          Menampilkan {filtered.length} dari {list.length} pesanan
        </p>
      )}
    </div>
  )
}