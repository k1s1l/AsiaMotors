import { useLayoutEffect, useRef } from 'react'
import { useI18n } from '../i18n'
import { company } from '../data/company'
import { gsap, reducedMotion, useReveals } from '../lib/motion'
import { Split } from './Split'

export function Why() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)
  const year = useRef<HTMLSpanElement>(null)
  useReveals(root)

  // the founding year counts up once, from 1990 to the real value
  useLayoutEffect(() => {
    if (reducedMotion() || !year.current) return
    const ctx = gsap.context(() => {
      const o = { v: 1990 }
      gsap.to(o, {
        v: company.since,
        duration: 1.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: year.current, start: 'top 85%' },
        onUpdate: () => {
          if (year.current) year.current.textContent = String(Math.round(o.v))
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={root} className="relative overflow-hidden bg-ink py-24 text-white lg:py-36">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow text-accent" data-reveal>
              {t.why.eyebrow}
            </p>
            <h2 data-split className="display mt-6 text-[clamp(38px,6.2vw,104px)]">
              {t.why.title.map((l, i) => (
                <Split key={l} text={l} className={`block ${i === 1 ? 'text-accent' : ''}`} />
              ))}
            </h2>
            <div data-reveal className="mt-14 flex items-end gap-6 border-t border-white/12 pt-8">
              <div>
                <p className="eyebrow text-white/45">{t.why.sinceLabel}</p>
                <span ref={year} className="font-display text-[clamp(64px,9vw,148px)] font-semibold leading-[0.85] tracking-[-0.05em] tabular-nums">
                  {company.since}
                </span>
              </div>
              <p className="mb-2 max-w-[15rem] text-sm leading-relaxed text-white/55">{t.why.sinceText}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div data-clip className="relative mb-10 aspect-[4/3] overflow-hidden rounded-[22px]">
            <img src="media/cat-transmission.webp" alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <ol>
            {t.why.items.map((it, i) => (
              <li key={it.k} data-reveal className="group border-t border-white/12 py-8 last:border-b">
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-[11px] text-accent">0{i + 1}</span>
                  <div>
                    <p className="eyebrow text-white/45">{it.k}</p>
                    <p className="mt-3 font-display text-[clamp(20px,2vw,28px)] font-semibold uppercase leading-[1.05] tracking-[-0.02em] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                      {it.t}
                    </p>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/60">{it.d}</p>
                  </div>
                </div>
                {i === 1 && (
                  <div data-clip className="relative ml-10 mt-8 aspect-[16/10] overflow-hidden rounded-[18px]">
                    <img src="media/cat-suspension.webp" alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
