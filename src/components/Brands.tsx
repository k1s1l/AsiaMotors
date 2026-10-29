import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '../i18n'
import { brands } from '../data/company'
import { scrollToTarget, useReveals } from '../lib/motion'
import { Split } from './Split'

export function Brands() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)
  useReveals(root)

  const pick = (brand: string) => {
    window.dispatchEvent(new CustomEvent('finder:brand', { detail: brand }))
    scrollToTarget('finder')
  }

  return (
    <section id="brands" ref={root} className="bg-paper py-24 text-ink lg:py-36">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-accent" data-reveal>
              {t.brands.eyebrow}
            </p>
            <h2 data-split className="display mt-5 text-[clamp(32px,4.6vw,68px)]">
              <Split text={t.brands.title} />
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-[13px] leading-relaxed text-ink/50">
            {t.brands.note}
          </p>
        </div>
        <ul className="mt-14 border-t border-ink/15">
          {brands.map((b, i) => (
            <li key={b.name} data-reveal className="border-b border-ink/15">
              <button onClick={() => pick(b.name)} className="group relative flex w-full items-center gap-4 overflow-hidden py-5 text-left sm:gap-8 sm:py-7">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />
                <span className="relative w-8 font-mono text-[11px] text-ink/40 transition-colors duration-500 group-hover:text-accent sm:pl-4">0{i + 1}</span>
                <span className="relative flex-1 font-display text-[clamp(30px,6.4vw,104px)] font-semibold uppercase leading-[0.9] tracking-[-0.045em] transition-[color,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 group-hover:text-white">
                  {b.name}
                </span>
                <span className="relative hidden max-w-[18rem] text-right text-[13px] text-ink/50 transition-colors duration-500 group-hover:text-white/60 md:block">{b.models.join(' · ')}</span>
                <span className="relative mr-1 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-white sm:mr-4 sm:h-14 sm:w-14">
                  <ArrowUpRight size={20} />
                </span>
                <span className="sr-only">{t.brands.pick}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
