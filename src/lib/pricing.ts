export interface PriceBreakdown {
  subtotal: number
  pickupFee: number
  deliveryFee: number
  discount: number
  total: number
}

export const PICKUP_FEE = 10000
export const DELIVERY_FEE = 5000
export const DISCOUNT_THRESHOLD_KG = 10
export const DISCOUNT_AMOUNT = 5000

/** Satu-satunya sumber perhitungan harga — dipakai form, konfirmasi, dan pembuatan pesanan. */
export function calculatePrice(
  weightKg: number,
  pricePerKg: number,
  legs: { pickupEnabled: boolean; deliveryEnabled: boolean },
): PriceBreakdown {
  const subtotal = pricePerKg * weightKg
  const pickupFee = legs.pickupEnabled && weightKg > 0 ? PICKUP_FEE : 0
  const deliveryFee = legs.deliveryEnabled && weightKg > 0 ? DELIVERY_FEE : 0
  const discount = weightKg >= DISCOUNT_THRESHOLD_KG ? DISCOUNT_AMOUNT : 0
  return {
    subtotal,
    pickupFee,
    deliveryFee,
    discount,
    total: Math.max(0, subtotal + pickupFee + deliveryFee - discount),
  }
}