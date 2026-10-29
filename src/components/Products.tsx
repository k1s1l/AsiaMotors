import { useEffect, useMemo, useRef } from 'react'
import { ArrowUpRight, ExternalLink, Phone, Plus, Search, X, Check } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n'
import { matchProducts, useStore } from '../store'
import { formatPrice, products, type Product } from '../data/products'
import { categories, type CategoryId } from '../data/categories'
import { company } from '../data/company'
import { ScrollTrigger, useReveals } from '../lib/motion'
import { Split } from './Split'

function ProductCard({ p, i }: { p: Product; i: number }) {
  const { t } = useI18n()
  const { add, open, notify } = useStore()
  const [added, setAdded] = useState(false)
  const onAdd = () => {
    add(p.id)
    notify(t.toast.added)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }
  return (
    <li className="animate-[cardIn_.9s_var(--ease-out-expo)_both]" style={{ animationDelay: `${i * 70}ms` }}>
      <article className="group flex h-full flex-col">
        <button onClick={() => open({ product: p.id })} className="img-zoom relative block overflow-hidden rounded-[22px] bg-[#e9e7e2] text-left" aria-label={`${t.products.details}: ${p.name}`}>
          <img src={p.image} alt="" loading="lazy" decoding="async" className="aspect-[5/4] w-full object-cover" />
          <span className="absolute left-4 top-4 flex gap-1.5">
            <span className="eyebrow rounded-full bg-white/75 px-2.5 py-1 text-[10px] text-ink/55 backdrop-blur">{t.products.illustration}</span>
            {p.original && <span className="eyebrow rounded-full bg-ink px-2.5 py-1 text-[10px] text-white">{t.products.original}</span>}
          </span>
          <span className="absolute bottom-4 right-4 flex translate-y-3 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100">
            {t.products.details} <ArrowUpRight size={15} />
          </span>
        </button>
        <div className="flex flex-1 flex-col px-1 pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow text-accent">{p.carBrand}</span>
            <span className="font-mono text-[11px] text-ink/45">
              {t.products.article} {p.article}
            </span>
          </div>
          <h3 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-[-0.01em]">
            <button onClick={() => open({ product: p.id })} className="link-u text-left">
              {p.name}
            </button>
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.fits.map((f) => (
              <span key={f} className="rounded-full border border-ink/12 px-2.5 py-1 text-[12px] text-ink/65">
                {f}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <p className="font-display text-[22px] font-semibold tracking-tight tabular-nums">{formatPrice(p)}</p>
              <p className="mt-0.5 text-[12px] text-ink/45">{t.products.stock}</p>
            </div>
            <button
              onClick={onAdd}
              className={`btn min-h-[46px] px-5 text-[14px] ${added ? 'bg-accent text-white' : 'btn-dark'}`}
              aria-label={`${t.products.add}: ${p.name}`}
            >
              {added ? <Check size={16} /> : <Plus size={16} />} {added ? t.products.added : t.products.add}
            </button>
          </div>
        </div>
      </article>
    </li>
  )
}

export function Products() {
  const { t } = useI18n()
  const { filter, setFilter, resetFilter } = useStore()
  const root = useRef<HTMLElement>(null)
  useReveals(root)
  const list = useMemo(() => matchProducts(filter), [filter])
  const chips = useMemo(() => {
    const ids = categories.map((c) => c.id).filter((id) => products.some((p) => p.category === id))
    if (filter.category && !ids.includes(filter.category)) ids.push(filter.category)
    return ids as CategoryId[]
  }, [filter.category])
  const activeCat = categories.find((c) => c.id === filter.category)
  const key = JSON.stringify(filter)
  // the grid height changes with the filter — re-measure every trigger below it
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => clearTimeout(id)
  }, [list.length])

  return (
    <section id="products" ref={root} className="relative bg-paper py-24 text-ink lg:py-36">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-accent" data-reveal>
              {t.products.eyebrow}
            </p>
            <h2 data-split className="display mt-5 text-[clamp(36px,6vw,96px)]">
              <Split text={t.products.title} />
            </h2>
          </div>
          <p data-reveal className="max-w-md text-[15px] leading-relaxed text-ink/60 lg:col-span-4 lg:col-start-9">
            {t.products.lead}
          </p>
        </div>

        <div data-reveal className="z-20 mt-12 rounded-[22px] bg-paper/85 py-3 backdrop-blur-xl lg:sticky lg:top-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-h-[50px] items-center gap-3 rounded-full border border-ink/15 bg-white px-5 lg:w-[380px]">
              <Search size={17} className="shrink-0 text-ink/40" />
              <input value={filter.query} onChange={(e) => setFilter({ query: e.target.value })} placeholder={t.products.search} aria-label={t.products.search} className="field text-[15px] placeholder:text-ink/35" />
              {filter.query && (
                <button onClick={() => setFilter({ query: '' })} aria-label={t.products.reset}>
                  <X size={16} />
                </button>
              )}
            </label>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label={t.products.filtered}>
              <button onClick={() => setFilter({ category: null })} aria-pressed={!filter.category} className={`shrink-0 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${!filter.category ? 'border-ink bg-ink text-white' : 'border-ink/15 hover:border-ink/40'}`}>
                {t.products.all} <span className="ml-1 opacity-50">{products.length}</span>
              </button>
              {chips.map((id) => (
                <button key={id} onClick={() => setFilter({ category: filter.category === id ? null : id })} aria-pressed={filter.category === id} className={`shrink-0 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${filter.category === id ? 'border-ink bg-ink text-white' : 'border-ink/15 hover:border-ink/40'}`}>
                  {t.cats.names[id]}
                </button>
              ))}
              {filter.car && (
                <button onClick={() => setFilter({ car: null })} className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[14px] font-semibold text-white">
                  {filter.car.label} <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {list.length ? (
          <ul key={key} className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </ul>
        ) : (
          <div key={key} className="mt-10 grid animate-[cardIn_.8s_var(--ease-out-expo)_both] gap-6 rounded-[28px] border border-dashed border-ink/20 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="font-display text-2xl font-semibold uppercase tracking-tight">{t.products.empty}</p>
              <p className="mt-3 max-w-lg text-ink/60">{t.products.emptyHint}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <a href={company.phones[0].href} className="btn btn-accent">
                <Phone size={16} /> {company.phones[0].display}
              </a>
              {activeCat?.url && (
                <a href={activeCat.url} target="_blank" rel="noreferrer" className="btn btn-line">
                  asiamotor.com.ua <ExternalLink size={15} />
                </a>
              )}
              <button onClick={resetFilter} className="btn btn-line">
                {t.products.reset}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}`}</style>
    </section>
  )
}
