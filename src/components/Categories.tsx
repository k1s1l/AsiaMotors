import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { categories } from '../data/categories'
import { gsap, reducedMotion, scrollToTarget, useReveals } from '../lib/motion'
import { Split } from './Split'

// bento layout — one entry per category, in the order of data/categories.ts
const small = 'aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto'
const spans = [
  'col-span-2 lg:col-span-7 lg:row-span-2 aspect-[4/3] lg:aspect-auto',
  'col-span-2 sm:col-span-1 lg:col-span-5 aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto',
  'col-span-2 sm:col-span-1 lg:col-span-5 aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto',
  `lg:col-span-4 ${small}`,
  `lg:col-span-4 ${small}`,
  `lg:col-span-4 ${small}`,
  `lg:col-span-5 ${small}`,
  `lg:col-span-7 ${small}`,
  `lg:col-span-7 ${small}`,
  'col-span-2 lg:col-span-5 aspect-[16/10] lg:aspect-auto',
]

export function Categories() {
  const { t } = useI18n()
  const { setFilter } = useStore()
  const root = useRef<HTMLElement>(null)
  useReveals(root)

  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card, i) => {
        gsap.from(card, { y: 60, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: card, start: 'top 92%' } })
        const img = card.querySelector('[data-par]')
        if (img) gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const pick = (id: (typeof categories)[number]['id']) => {
    setFilter({ category: id, query: '', car: null })
    scrollToTarget('products')
  }

  return (
    <section id="categories" ref={root} className="relative bg-ink py-24 text-white lg:py-36">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-accent" data-reveal>
              {t.cats.eyebrow}
            </p>
            <h2 data-split className="display mt-5 text-[clamp(36px,6vw,96px)]">
              <Split text={t.cats.title} />
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-[16px] leading-relaxed text-white/55">
            {t.cats.lead}
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:auto-rows-[300px]">
          {categories.map((c, i) => (
            <li key={c.id} data-card className={`${spans[i]} relative`}>
              <button
                onClick={() => pick(c.id)}
                className="group img-zoom absolute inset-0 overflow-hidden rounded-[22px] bg-ink-2 text-left ring-1 ring-white/8 transition-[box-shadow] duration-500 hover:ring-white/25"
                aria-label={`${t.cats.names[c.id]} — ${t.cats.open}`}
              >
                <span data-par className="absolute -inset-y-[6%] inset-x-0 block">
                  <img src={c.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <span className="absolute left-4 top-4 font-mono text-[11px] tracking-[0.16em] text-white/55 sm:left-6 sm:top-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-ink/30 backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent sm:right-5 sm:top-5 sm:h-12 sm:w-12">
                  <ArrowUpRight size={18} />
                </span>
                <span className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                  <span className={`block font-display font-semibold uppercase leading-[1.02] tracking-[-0.02em] ${i === 0 ? 'text-[clamp(24px,3.4vw,52px)]' : 'text-[clamp(15px,1.7vw,24px)]'}`}>
                    {t.cats.names[c.id]}
                  </span>
                  <span className="mt-2 hidden text-[13px] text-white/55 sm:block">{t.cats.hints[c.id]}</span>
                  <span className="mt-4 block h-px w-full origin-left scale-x-[0.15] bg-accent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
