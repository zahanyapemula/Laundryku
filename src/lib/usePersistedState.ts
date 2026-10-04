import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * State yang disimpan ke localStorage.
 * Memastikan sesi login dan data pesanan tetap ada saat halaman di-refresh,
 * sehingga demo antar role (admin -> kurir -> pelanggan) berjalan mulus.
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  normalize?: (raw: unknown, fallback: T) => T,
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T
        // Data dari storage bisa berasal dari versi aplikasi yang berbeda,
        // jadi selalu dinormalisasi sebelum dipakai.
        return normalize ? normalize(parsed, initialValue) : parsed
      }
    } catch {
      // data rusak / tidak bisa dibaca -> pakai nilai awal
    }
    return initialValue
  })

  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage penuh atau diblokir -> abaikan, aplikasi tetap berjalan
    }
  }, [key, value])

  const reset = useCallback(() => {
    setValue(initialValue)
    try {
      window.localStorage.removeItem(key)
    } catch {
      // abaikan
    }
  }, [initialValue, key])

  return [value, setValue, reset] as const
}