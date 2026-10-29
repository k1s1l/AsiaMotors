import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../lib/motion'
import { useI18n } from '../i18n'
import { Logo } from './Logo'

/** Short opening curtain (≈1.4 s) — skipped for reduced motion and on repeat visits in the same tab. */
export function Intro() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(() => {
    if (reducedMotion()) return true
    try {
      return sessionStorage.getItem('am-intro') === '1'
    } catch {
      return false
    }
  })

  useLayoutEffect(() => {
    if (done || !ref.current) return
    const ctx = gsap.context(() => {
      const n = { v: 0 }
      gsap
        .timeline({
          onComplete: () => {
            try {
              sessionStorage.setItem('am-intro', '1')
            } catch {
              /* ignore */
            }
            setDone(true)
          },
        })
        .from('[data-i-logo]', { yPercent: 120, duration: 0.7, ease: 'expo.out' })
        .to(n, { v: 100, duration: 0.8, ease: 'power2.inOut', onUpdate: () => {
          const el = ref.current?.querySelector('[data-i-count]')
          if (el) el.textContent = String(Math.round(n.v)).padStart(3, '0')
        } }, 0.1)
        .to('[data-i-bar]', { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 0.1)
        .to('[data-i-inner]', { yPercent: -40, autoAlpha: 0, duration: 0.6, ease: 'expo.in' }, 1.0)
        .to(ref.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, 1.1)
    }, ref)
    return () => ctx.revert()
  }, [done])

  if (done) return null
  return (
    <div ref={ref} className="fixed inset-0 z-[100] grid place-items-center bg-ink text-white [clip-path:inset(0_0_0_0)]" aria-hidden="true">
      <div data-i-inner className="w-[min(320px,80vw)]">
        <div className="overflow-hidden">
          <div data-i-logo>
            <Logo />
          </div>
        </div>
        <div className="mt-6 h-px bg-white/15">
          <div data-i-bar className="h-full origin-left scale-x-0 bg-accent" />
        </div>
        <div className="eyebrow mt-3 flex justify-between text-white/45">
          <span>{t.intro}</span>
          <span data-i-count>000</span>
        </div>
      </div>
    </div>
  )
}
