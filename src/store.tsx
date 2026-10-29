import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { products, type Product } from './data/products'
import type { CategoryId } from './data/categories'

export type Overlay = null | 'menu' | 'catalog' | 'search' | 'cart' | 'delivery' | { product: string }

export interface Filter {
  category: CategoryId | null
  query: string
  /** car picked in the finder, e.g. { brand: 'Geely', model: 'Emgrand X7' } */
  car: { brand: string; model: string; label: string; tokens: string[] } | null
}

interface Store {
  cart: Record<string, number>
  cartCount: number
  add: (id: string) => void
  setQty: (id: string, qty: number) => void
  overlay: Overlay
  open: (o: Overlay) => void
  close: () => void
  filter: Filter
  setFilter: (f: Partial<Filter>) => void
  resetFilter: () => void
  toast: string | null
  notify: (msg: string) => void
}

const Ctx = createContext<Store | null>(null)
const emptyFilter: Filter = { category: null, query: '', car: null }

function loadCart(): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem('am-cart') || '{}')
    return Object.fromEntries(Object.entries(raw).filter(([id, q]) => products.some((p) => p.id === id) && typeof q === 'number' && q > 0)) as Record<string, number>
  } catch {
    return {}
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>(loadCart)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [filter, setFilterState] = useState<Filter>(emptyFilter)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem('am-cart', JSON.stringify(cart))
    } catch {
      /* storage unavailable */
    }
  }, [cart])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout((notify as unknown as { t?: number }).t)
    ;(notify as unknown as { t?: number }).t = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const value = useMemo<Store>(
    () => ({
      cart,
      cartCount: Object.values(cart).reduce((a, b) => a + b, 0),
      add: (id) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 })),
      setQty: (id, qty) =>
        setCart((c) => {
          const next = { ...c }
          if (qty <= 0) delete next[id]
          else next[id] = qty
          return next
        }),
      overlay,
      open: setOverlay,
      close: () => setOverlay(null),
      filter,
      setFilter: (f) => setFilterState((s) => ({ ...s, ...f })),
      resetFilter: () => setFilterState(emptyFilter),
      toast,
      notify,
    }),
    [cart, overlay, filter, toast, notify],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}

export const norm = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '')

export function matchProducts(f: Filter): Product[] {
  const q = norm(f.query)
  return products.filter((p) => {
    if (f.category && p.category !== f.category) return false
    if (f.car) {
      const hay = norm(p.name + ' ' + p.fits.join(' '))
      // a model match is required; the brand alone ("Geely") would be too loose
      if (!f.car.tokens.some((t) => hay.includes(t))) return false
    }
    if (q) {
      const hay = norm([p.name, p.article, p.carBrand, ...p.fits].join(' '))
      if (!hay.includes(q)) return false
    }
    return true
  })
}
