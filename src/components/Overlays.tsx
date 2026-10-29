import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, ExternalLink, Mail, Minus, Phone, Plus, Search, ShoppingBag, Trash2, X, Info } from 'lucide-react'
import { useI18n } from '../i18n'
import { matchProducts, useStore } from '../store'
import { products, formatPrice } from '../data/products'
import { categories, type CategoryId } from '../data/categories'
import { company } from '../data/company'
import { lockScroll, scrollToTarget } from '../lib/motion'
import { Logo } from './Logo'

/** Panel shell: stays mounted for CSS transitions, inert while closed, focuses itself on open. */
function Panel({ open, children, className, label }: { open: boolean; children: ReactNode; className: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>('button, a, input, select')
      el?.focus({ preventScroll: true })
    }, 60)
    return () => clearTimeout(id)
  }, [open])
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} aria-hidden={!open} inert={!open} className={className} data-open={open} data-lenis-prevent>
      {children}
    </div>
  )
}

function Backdrop({ open, onClick, z = 'z-[60]' }: { open: boolean; onClick: () => void; z?: string }) {
  return (
    <div
      onClick={onClick}
      aria-hidden="true"
      className={`fixed inset-0 ${z} bg-black/55 backdrop-blur-[2px] transition-opacity duration-500 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    />
  )
}

const drawerCls = (open: boolean) =>
  `fixed right-0 top-0 z-[70] flex h-[100dvh] w-full max-w-[520px] flex-col bg-paper text-ink transition-transform duration-700 ease-[var(--ease-out-expo)] ${
    open ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
  }`

function DrawerHead({ title, onClose, closeLabel }: { title: ReactNode; onClose: () => void; closeLabel: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
      <div className="font-display text-lg font-semibold uppercase tracking-tight">{title}</div>
      <button className="icon-btn border border-ink/15 hover:bg-ink hover:text-white" onClick={onClose} aria-label={closeLabel}>
        <X size={18} />
      </button>
    </div>
  )
}

export function Overlays() {
  const { overlay, close } = useStore()
  const isOpen = overlay !== null

  useEffect(() => {
    lockScroll(isOpen && overlay !== 'catalog')
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, overlay, close])

  return (
    <>
      <CatalogPanel />
      <MobileMenu />
      <SearchOverlay />
      <Backdrop open={overlay === 'cart' || overlay === 'delivery' || typeof overlay === 'object' && overlay !== null} onClick={close} />
      <CartDrawer />
      <ProductDrawer />
      <DeliveryDrawer />
      <Toast />
    </>
  )
}

// ---------------------------------------------------------------- catalog mega panel
function useCategoryAction() {
  const { setFilter, close } = useStore()
  return (id: CategoryId) => {
    setFilter({ category: id, query: '', car: null })
    close()
    setTimeout(() => scrollToTarget('products'), 80)
  }
}

function CatalogPanel() {
  const { t } = useI18n()
  const { overlay, close } = useStore()
  const open = overlay === 'catalog'
  const pick = useCategoryAction()
  return (
    <>
      <div onClick={close} aria-hidden="true" className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-500 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <Panel
        open={open}
        label={t.nav.catalog}
        className={`fixed inset-x-0 top-[72px] z-40 border-b border-white/8 bg-ink/95 backdrop-blur-xl transition-[clip-path] duration-700 ease-[var(--ease-out-expo)] lg:top-[84px] ${
          open ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_2.2fr]">
          <div className="hidden lg:block">
            <p className="eyebrow text-accent">{t.cats.eyebrow}</p>
            <p className="display mt-4 text-3xl text-white">{t.cats.title}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">{t.cats.lead}</p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {categories.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => pick(c.id)}
                  className="group flex w-full items-center gap-4 border-b border-white/8 py-3.5 text-left"
                  style={{ transitionDelay: open ? `${i * 25}ms` : '0ms' }}
                >
                  <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-3">
                    <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-white">{t.cats.names[c.id]}</span>
                    <span className="block truncate text-[13px] text-white/45">{t.cats.hints[c.id]}</span>
                  </span>
                  <ArrowUpRight size={18} className="text-white/30 transition-all duration-500 group-hover:rotate-45 group-hover:text-accent" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </>
  )
}

// ---------------------------------------------------------------- mobile menu
function MobileMenu() {
  const { t, lang, setLang } = useI18n()
  const { overlay, close, open: openOverlay } = useStore()
  const open = overlay === 'menu'
  const go = (id: string) => {
    close()
    setTimeout(() => scrollToTarget(id), 60)
  }
  const links: [string, () => void][] = [
    [t.nav.catalog, () => go('categories')],
    [t.nav.finder, () => go('finder')],
    [t.nav.about, () => go('about')],
    [t.nav.delivery, () => openOverlay('delivery')],
    [t.nav.contacts, () => go('contacts')],
  ]
  return (
    <Panel
      open={open}
      label={t.nav.menu}
      className={`fixed inset-0 z-[80] flex flex-col bg-ink text-white transition-[clip-path] duration-700 ease-[var(--ease-in-out-quart)] ${
        open ? '[clip-path:circle(150%_at_100%_0)]' : '[clip-path:circle(0%_at_100%_0)]'
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between">
        <Logo />
        <button className="icon-btn border border-white/20" onClick={close} aria-label={t.nav.close}>
          <X size={20} />
        </button>
      </div>
      <nav className="container-x mt-6 flex-1 overflow-y-auto">
        <ul>
          {links.map(([label, fn], i) => (
            <li key={label} className="overflow-hidden border-b border-white/10">
              <button
                onClick={fn}
                className={`flex w-full items-center justify-between py-5 text-left font-display text-[26px] font-semibold uppercase tracking-tight transition-transform duration-700 ease-[var(--ease-out-expo)] ${
                  open ? 'translate-y-0' : 'translate-y-full'
                }`}
                style={{ transitionDelay: open ? `${180 + i * 60}ms` : '0ms' }}
              >
                <span className="flex items-start gap-3">
                  <span className="mt-1 font-mono text-[11px] text-accent">0{i + 1}</span>
                  {label}
                </span>
                <ArrowUpRight size={22} className="text-white/40" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container-x space-y-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
        <div className="flex gap-2">
          {(['ua', 'ru'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-full border px-4 py-2 font-mono text-xs uppercase ${lang === l ? 'border-white bg-white text-ink' : 'border-white/20 text-white/70'}`}>
              {l}
            </button>
          ))}
        </div>
        {company.phones.map((p) => (
          <a key={p.href} href={p.href} className="btn btn-ghost w-full justify-between">
            {p.display} <Phone size={16} />
          </a>
        ))}
      </div>
    </Panel>
  )
}

// ---------------------------------------------------------------- search
function SearchOverlay() {
  const { t } = useI18n()
  const { overlay, close, open: openOverlay } = useStore()
  const open = overlay === 'search'
  const [q, setQ] = useState('')
  const results = useMemo(() => (q.trim().length > 1 ? matchProducts({ category: null, car: null, query: q }) : []), [q])
  useEffect(() => {
    if (!open) setQ('')
  }, [open])
  return (
    <>
      <div onClick={close} aria-hidden="true" className={`fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <Panel
        open={open}
        label={t.nav.search}
        className={`fixed inset-x-0 top-0 z-[76] max-h-[100dvh] overflow-y-auto bg-paper text-ink transition-transform duration-700 ease-[var(--ease-out-expo)] ${open ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="container-x py-6 lg:py-10">
          <div className="flex items-center gap-4 border-b-2 border-ink pb-4">
            <Search size={26} className="shrink-0" />
            <input
              data-autofocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search.placeholder}
              aria-label={t.nav.search}
              className="field font-display text-xl font-medium tracking-tight placeholder:text-ink/30 sm:text-3xl"
            />
            <button className="icon-btn shrink-0 border border-ink/15 hover:bg-ink hover:text-white" onClick={close} aria-label={t.nav.close}>
              <X size={18} />
            </button>
          </div>
          <p className="eyebrow mt-4 text-ink/45">{t.search.hint}</p>
          {q.trim().length > 1 && (
            <div className="mt-6">
              <p className="eyebrow mb-3 text-ink/60">
                {t.search.results}: {results.length}
              </p>
              {results.length === 0 ? (
                <p className="py-6 text-lg text-ink/60">{t.search.nothing}</p>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button onClick={() => openOverlay({ product: p.id })} className="group flex w-full items-center gap-4 py-3 text-left">
                        <img src={p.image} alt="" className="h-16 w-16 rounded-xl bg-paper-2 object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold leading-snug">{p.name}</span>
                          <span className="font-mono text-xs text-ink/50">
                            {t.products.article} {p.article}
                          </span>
                        </span>
                        <span className="hidden font-semibold sm:block">{formatPrice(p)}</span>
                        <ArrowUpRight size={18} className="text-ink/30 transition-transform group-hover:rotate-45 group-hover:text-accent" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Panel>
    </>
  )
}

// ---------------------------------------------------------------- cart
function CartDrawer() {
  const { t } = useI18n()
  const { overlay, close, cart, setQty } = useStore()
  const open = overlay === 'cart'
  const [demo, setDemo] = useState(false)
  useEffect(() => {
    if (!open) setDemo(false)
  }, [open])
  const lines = products.filter((p) => cart[p.id])
  const uah = lines.filter((p) => p.currency === 'UAH').reduce((s, p) => s + p.price * cart[p.id], 0)
  const hasUsd = lines.some((p) => p.currency === 'USD')
  const mailBody = encodeURIComponent(lines.map((p) => `${p.name} — ${t.products.article} ${p.article} × ${cart[p.id]}`).join('\n'))

  return (
    <Panel open={open} label={t.cart.title} className={drawerCls(open)}>
      <DrawerHead title={<>{t.cart.title} <span className="text-ink/40">({lines.length})</span></>} onClose={close} closeLabel={t.nav.close} />
      <div className="flex-1 overflow-y-auto px-6">
        {lines.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <ShoppingBag size={40} className="mx-auto text-ink/20" />
              <p className="mt-4 font-display text-xl font-semibold uppercase">{t.cart.empty}</p>
              <p className="mx-auto mt-2 max-w-xs text-sm text-ink/55">{t.cart.emptyHint}</p>
              <button
                className="btn btn-dark mt-6"
                onClick={() => {
                  close()
                  setTimeout(() => scrollToTarget('products'), 60)
                }}
              >
                {t.hero.ctaCatalog}
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {lines.map((p) => (
              <li key={p.id} className="flex gap-4 py-5">
                <img src={p.image} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-paper-2 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-snug">{p.name}</p>
                  <p className="mt-1 font-mono text-[11px] text-ink/50">
                    {t.products.article} {p.article}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-ink/15">
                      <button className="grid h-9 w-9 place-items-center" onClick={() => setQty(p.id, cart[p.id] - 1)} aria-label="−1">
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{cart[p.id]}</span>
                      <button className="grid h-9 w-9 place-items-center" onClick={() => setQty(p.id, cart[p.id] + 1)} aria-label="+1">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-semibold tabular-nums">{formatPrice({ price: p.price * cart[p.id], currency: p.currency })}</span>
                  </div>
                </div>
                <button className="self-start text-ink/35 hover:text-accent" onClick={() => setQty(p.id, 0)} aria-label={t.cart.remove}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {lines.length > 0 && (
        <div className="border-t border-ink/10 bg-paper-2/60 px-6 py-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink/60">{t.cart.total}</span>
            <span className="font-display text-2xl font-semibold tabular-nums">{formatPrice({ price: uah, currency: 'UAH' })}</span>
          </div>
          {hasUsd && <p className="mt-1 text-xs text-ink/50">{t.cart.mixed}</p>}
          {demo ? (
            <div className="mt-4 rounded-2xl bg-ink p-5 text-white" role="status">
              <p className="flex items-center gap-2 font-semibold">
                <Info size={16} className="text-accent" /> {t.cart.demoTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{t.cart.demoText}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a href={company.phones[0].href} className="btn btn-accent min-h-[46px] text-sm">
                  <Phone size={15} /> {company.phones[0].display}
                </a>
                <a href={`mailto:${company.email}?subject=${encodeURIComponent('Запит з сайту')}&body=${mailBody}`} className="btn btn-ghost min-h-[46px] text-sm">
                  <Mail size={15} /> {t.cart.mail}
                </a>
              </div>
            </div>
          ) : (
            <button className="btn btn-dark mt-4 w-full" onClick={() => setDemo(true)}>
              {t.cart.checkout} <ArrowUpRight size={16} className="btn-ico" />
            </button>
          )}
        </div>
      )}
    </Panel>
  )
}

// ---------------------------------------------------------------- product details
function ProductDrawer() {
  const { t } = useI18n()
  const { overlay, close, add, notify } = useStore()
  const id = typeof overlay === 'object' && overlay ? overlay.product : null
  const last = useRef(products[0])
  const found = products.find((p) => p.id === id)
  if (found) last.current = found
  const p = last.current
  const open = !!found
  return (
    <Panel open={open} label={p.name} className={drawerCls(open)}>
      <DrawerHead title={<span className="font-mono text-xs font-normal normal-case tracking-normal text-ink/55">{t.products.article} {p.article}</span>} onClose={close} closeLabel={t.nav.close} />
      <div className="flex-1 overflow-y-auto">
        <div className="relative bg-[#e9e7e2]">
          <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
          <span className="eyebrow absolute left-5 top-5 rounded-full bg-white/70 px-3 py-1.5 text-ink/60 backdrop-blur">{t.products.illustration}</span>
        </div>
        <div className="px-6 py-6">
          <p className="eyebrow text-accent">{p.carBrand}</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{p.name}</h3>
          <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-ink/55">{t.products.article}</dt>
              <dd className="font-mono">{p.article}</dd>
            </div>
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-ink/55">{t.products.fits}</dt>
              <dd className="text-right">{p.fits.join(', ')}</dd>
            </div>
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-ink/55">{t.products.priceNote}</dt>
              <dd className="font-semibold">{formatPrice(p)}</dd>
            </div>
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-ink/55">{t.products.stock.split(' ')[0]}</dt>
              <dd>{t.products.stock}</dd>
            </div>
          </dl>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-ink/50">
            <Info size={14} className="mt-0.5 shrink-0" /> {t.products.photoNote}
          </p>
          <a href={p.url} target="_blank" rel="noreferrer" className="link-u mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
            {t.products.source} <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-ink/10 px-6 py-5">
        <button
          className="btn btn-dark"
          onClick={() => {
            add(p.id)
            notify(t.toast.added)
          }}
        >
          <ShoppingBag size={16} /> {t.products.add}
        </button>
        <a href={company.phones[0].href} className="btn btn-line" aria-label={t.nav.callUs}>
          <Phone size={16} />
        </a>
      </div>
    </Panel>
  )
}

// ---------------------------------------------------------------- delivery & payment
function DeliveryDrawer() {
  const { t } = useI18n()
  const { overlay, close } = useStore()
  const open = overlay === 'delivery'
  return (
    <Panel open={open} label={t.delivery.title} className={drawerCls(open)}>
      <DrawerHead title={t.delivery.title} onClose={close} closeLabel={t.nav.close} />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <ol className="space-y-px overflow-hidden rounded-2xl">
          {t.delivery.items.map((it, i) => (
            <li key={it.t} className="bg-white/60 p-5">
              <p className="font-mono text-[11px] text-accent">0{i + 1}</p>
              <p className="mt-2 text-lg font-semibold">{it.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/60">{it.d}</p>
            </li>
          ))}
        </ol>
        <a href={company.pages.delivery} target="_blank" rel="noreferrer" className="link-u mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
          {t.delivery.more} <ExternalLink size={14} />
        </a>
      </div>
      <div className="grid gap-2 border-t border-ink/10 px-6 py-5 sm:grid-cols-2">
        {company.phones.map((p) => (
          <a key={p.href} href={p.href} className="btn btn-line text-sm">
            <Phone size={15} /> {p.display}
          </a>
        ))}
      </div>
    </Panel>
  )
}

// ---------------------------------------------------------------- toast
function Toast() {
  const { toast, open } = useStore()
  const { t } = useI18n()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4">
      <div
        className={`pointer-events-auto flex items-center gap-4 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-semibold text-ink shadow-2xl transition-all duration-500 ease-[var(--ease-out-expo)] ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-accent" />
        {toast}
        <button className="rounded-full bg-ink px-4 py-2 text-white" onClick={() => open('cart')} tabIndex={toast ? 0 : -1}>
          {t.nav.cart}
        </button>
      </div>
    </div>
  )
}
