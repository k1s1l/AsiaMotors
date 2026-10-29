import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, Info, Mail, RotateCcw } from 'lucide-react'
import { useI18n } from '../i18n'
import { matchProducts, norm, useStore } from '../store'
import { demoVehicles } from '../data/vehicles'
import { company } from '../data/company'
import { scrollToTarget, useReveals } from '../lib/motion'
import { Split } from './Split'

function Select({ label, value, onChange, options, disabled, step }: { label: string; value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean; step: number }) {
  const { t } = useI18n()
  const id = `f-${step}`
  return (
    <div className={`group relative border-b border-ink/15 transition-opacity lg:border-b-0 lg:border-r ${disabled ? 'opacity-40' : ''}`}>
      <label htmlFor={id} className="eyebrow flex items-center gap-2 px-5 pt-5 text-ink/50">
        <span className={value ? 'text-accent' : ''}>0{step}</span> {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="field cursor-pointer px-5 pb-5 pt-2 pr-10 text-[17px] font-semibold disabled:cursor-not-allowed"
      >
        <option value="">{t.finder.choose}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute bottom-6 right-5 text-ink/40" />
    </div>
  )
}

export function Finder() {
  const { t } = useI18n()
  const { setFilter } = useStore()
  const root = useRef<HTMLElement>(null)
  useReveals(root)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [engine, setEngine] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [vin, setVin] = useState('')

  // brand rows in the Brands section preselect the make here
  useEffect(() => {
    const onBrand = (e: Event) => {
      const b = (e as CustomEvent<string>).detail
      if (!demoVehicles[b]) return
      setBrand(b)
      setModel('')
      setYear('')
      setEngine('')
      setResult(null)
      setTimeout(() => document.getElementById('f-2')?.focus({ preventScroll: true }), 900)
    }
    window.addEventListener('finder:brand', onBrand)
    return () => window.removeEventListener('finder:brand', onBrand)
  }, [])

  const models = brand ? demoVehicles[brand] : []
  const m = models.find((x) => x.name === model)
  const years = useMemo(() => (m ? Array.from({ length: m.years[1] - m.years[0] + 1 }, (_, i) => String(m.years[1] - i)) : []), [m])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !m) return
    const label = [brand, model, year, engine].filter(Boolean).join(' ')
    const car = { brand, model, label, tokens: m.match ?? [norm(model)] }
    const n = matchProducts({ category: null, query: '', car }).length
    setResult(t.finder.found(n, label))
    setFilter({ car, category: null, query: '' })
    if (n) setTimeout(() => scrollToTarget('products'), 500)
  }

  const reset = () => {
    setBrand('')
    setModel('')
    setYear('')
    setEngine('')
    setResult(null)
    setFilter({ car: null })
  }

  return (
    <section id="finder" ref={root} className="relative bg-paper py-24 text-ink lg:py-36">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-accent" data-reveal>
              {t.finder.eyebrow}
            </p>
            <h2 data-split className="display mt-5 text-[clamp(32px,4.6vw,68px)]">
              <Split text={t.finder.title} />
            </h2>
          </div>
          <p data-reveal className="max-w-md self-end text-[17px] leading-relaxed text-ink/65 lg:col-span-5 lg:col-start-8">
            {t.finder.lead}
          </p>
        </div>

        <form onSubmit={submit} data-reveal className="mt-14 overflow-hidden rounded-[28px] bg-white shadow-[0_40px_80px_-40px_rgba(10,11,13,.25)] ring-1 ring-ink/5">
          <div className="grid lg:grid-cols-[repeat(4,1fr)_auto]">
            <Select step={1} label={t.finder.brand} value={brand} options={Object.keys(demoVehicles)} onChange={(v) => (setBrand(v), setModel(''), setYear(''), setEngine(''), setResult(null))} />
            <Select step={2} label={t.finder.model} value={model} options={models.map((x) => x.name)} disabled={!brand} onChange={(v) => (setModel(v), setYear(''), setEngine(''), setResult(null))} />
            <Select step={3} label={t.finder.year} value={year} options={years} disabled={!m} onChange={setYear} />
            <Select step={4} label={t.finder.engine} value={engine} options={m?.engines ?? []} disabled={!m} onChange={setEngine} />
            <div className="flex gap-2 p-3">
              <button type="submit" disabled={!m} className="btn btn-accent h-full min-h-[60px] flex-1 rounded-[20px] px-8 disabled:cursor-not-allowed disabled:opacity-40 lg:min-w-[220px]">
                {t.finder.submit} <ArrowUpRight size={18} className="btn-ico" />
              </button>
              {brand && (
                <button type="button" onClick={reset} className="icon-btn h-auto w-14 rounded-[20px] border border-ink/10 hover:bg-ink hover:text-white" aria-label={t.finder.reset}>
                  <RotateCcw size={17} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-ink/8 bg-paper-2/40 px-5 py-4 text-[13px] sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-ink/55">
              <Info size={15} className="mt-0.5 shrink-0" /> {t.finder.demoNote}
            </p>
            {result && (
              <p role="status" className="font-semibold text-ink">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
                {result}
              </p>
            )}
          </div>
        </form>

        <div data-reveal className="mt-6 grid gap-6 rounded-[28px] bg-ink p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <p className="font-display text-xl font-semibold uppercase tracking-tight">{t.finder.vinTitle}</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">{t.finder.vinLead}</p>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('Підбір за VIN ' + vin)}&body=${encodeURIComponent('VIN: ' + vin)}`
            }}
          >
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17))}
              placeholder={t.finder.vinPlaceholder}
              aria-label="VIN"
              className="field min-h-[52px] flex-1 rounded-full border border-white/15 bg-white/5 px-5 font-mono text-sm tracking-wider placeholder:text-white/35 focus:border-white/40"
            />
            <button type="submit" disabled={vin.length < 11} className="btn btn-ghost disabled:opacity-40">
              <Mail size={16} /> {t.finder.vinSend}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
