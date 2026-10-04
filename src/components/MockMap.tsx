import { MapPin, Navigation } from 'lucide-react'
import type { DeliveryStatus } from '../types'

/** Peta sederhana (mock) — tidak memakai Google Maps API. */
export default function MockMap({
  status,
  label,
}: {
  status: DeliveryStatus
  label: string
}) {
  const percent =
    status === 'Selesai'
      ? 100
      : status === 'Dalam Perjalanan'
        ? 66
        : status === 'Kurir Ditugaskan'
          ? 33
          : 8

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {/* Pola grid sebagai latar peta */}
      <svg
        viewBox="0 0 400 200"
        className="h-44 w-full sm:h-56"
        role="img"
        aria-label="Peta ilustratif jalur pengiriman"
      >
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="#E2E8F0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="200" fill="url(#grid)" />
        {/* jalan */}
        <path d="M0 150 H400" stroke="#CBD5E1" strokeWidth="14" />
        <path d="M120 0 V200" stroke="#CBD5E1" strokeWidth="12" />
        <path d="M290 0 V200" stroke="#CBD5E1" strokeWidth="10" />
        {/* rute */}
        <path
          d="M120 150 H290 V70"
          fill="none"
          stroke="#2563EB"
          strokeWidth="4"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
        {/* titik asal (outlet) */}
        <circle cx="120" cy="150" r="10" fill="#1D4ED8" stroke="#fff" strokeWidth="3" />
        {/* titik tujuan */}
        <circle cx="290" cy="70" r="10" fill="#10B981" stroke="#fff" strokeWidth="3" />
        {/* posisi kurir */}
        <circle
          cx={120 + (170 * percent) / 100}
          cy={percent >= 66 ? 150 - ((percent - 66) / 34) * 80 : 150}
          r="8"
          fill="#F59E0B"
          stroke="#fff"
          strokeWidth="3"
        />
        <text x="120" y="178" textAnchor="middle" fontSize="10" fill="#64748B">
          LaundryKu
        </text>
        <text x="290" y="40" textAnchor="middle" fontSize="10" fill="#64748B">
          Pelanggan
        </text>
      </svg>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Navigation size={15} className="text-warning-dark" />
          {label}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <MapPin size={13} /> Peta ilustratif
        </span>
      </div>
    </div>
  )
}