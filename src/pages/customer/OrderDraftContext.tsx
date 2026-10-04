import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { SERVICES } from '../../data/demoData'
import { usePersistedState } from '../../lib/usePersistedState'

export interface OrderDraft {
  customerName: string
  customerPhone: string
  customerAddress: string
  serviceId: string
  weightKg: string
  note: string
  /** tahap 1: kurir menjemput laundry ke outlet */
  pickupEnabled: boolean
  /** tahap 2: kurir mengantar laundry ke pelanggan */
  deliveryEnabled: boolean
  date: string
  time: string
  destDate: string
  destTime: string
}

const emptyDraft: OrderDraft = {
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  serviceId: SERVICES[0].id,
  weightKg: '',
  note: '',
  pickupEnabled: true,
  deliveryEnabled: true,
  date: '',
  time: '',
  destDate: '',
  destTime: '',
}

const DraftContext = createContext<{
  draft: OrderDraft
  setDraft: React.Dispatch<React.SetStateAction<OrderDraft>>
  reset: () => void
} | null>(null)

export function OrderDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft, reset] = usePersistedState<OrderDraft>(
    'laundryku.draft.v1',
    emptyDraft,
  )
  const value = useMemo(() => ({ draft, setDraft, reset }), [draft, setDraft, reset])
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useOrderDraft() {
  const ctx = useContext(DraftContext)
  if (!ctx) throw new Error('useOrderDraft harus dipakai di dalam OrderDraftProvider')
  return ctx
}

export { emptyDraft }