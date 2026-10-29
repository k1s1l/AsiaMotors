import { useRef } from 'react'
import { ArrowUpRight, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import { scrollToTarget, useReveals } from '../lib/motion'
import { Split } from './Split'

export function Cta() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)
  useReveals(root)
  const ticker = [...t.hero.chapters, ...t.why.items.map((i) => i.k)]
  return (
    <section ref={root} className="relative overflow-hidden bg-accent text-white">
      <div className="border-b border-white/20 py-4" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-tight">
          {[...ticker, ...ticker, ...ticker, ...ticker].map((w, i) => (
            <span key={i} className="flex items-center gap-10">
              {w} <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            </span>
          ))}
        </div>
      </div>
      <div className="container-x grid gap-10 py-24 lg:grid-cols-12 lg:items-end lg:py-32">
        <h2 data-split className="display text-[clamp(40px,7.4vw,124px)] lg:col-span-8">
          {t.cta.title.map((l) => (
            <Split key={l} text={l} className="block" />
          ))}
        </h2>
        <div className="lg:col-span-4">
          <p data-reveal className="max-w-sm text-[17px] leading-relaxed text-white/85">
            {t.cta.lead}
          </p>
          <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button className="btn btn-dark" onClick={() => scrollToTarget('finder')}>
              {t.cta.find} <ArrowUpRight size={18} className="btn-ico" />
            </button>
            <button className="btn border border-white/50 text-white before:bg-white hover:text-ink" onClick={() => scrollToTarget('contacts')}>
              <Phone size={16} /> {t.cta.contact}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
