import { useLayoutEffect, useRef } from 'react'
import { useI18n } from '../i18n'
import { gsap, reducedMotion } from '../lib/motion'

/** Pinned image-reveal: the frame opens from a small window to full-bleed while the statement lights up line by line. */
export function Story() {
  const { t, lang } = useI18n()
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=160%', scrub: 0.8, pin: true, anticipatePin: 1 },
      })
      tl.fromTo('[data-story-frame]', { clipPath: 'inset(22% 30% 22% 30% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('[data-story-img]', { scale: 1.35 }, { scale: 1, ease: 'power2.out', duration: 1.2 }, 0)
        .from('[data-story-eyebrow]', { autoAlpha: 0, y: 20, duration: 0.3 }, 0.35)
        .fromTo('[data-story-line]', { opacity: 0.12 }, { opacity: 1, stagger: 0.18, duration: 0.3, ease: 'none' }, 0.45)
        .from('[data-story-text]', { autoAlpha: 0, y: 30, duration: 0.3 }, 1.0)
    }, root)
    return () => ctx.revert()
  }, [lang])

  return (
    <section ref={root} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-white" aria-label={t.story.lines.join(' ')}>
      <div data-story-frame className="absolute inset-0 overflow-hidden">
        <img data-story-img src="media/story-macro.webp" alt="" loading="lazy" className="h-full w-full object-cover object-[75%_50%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,11,13,.9)_0%,rgba(10,11,13,.6)_45%,rgba(10,11,13,.1)_80%)] max-md:bg-ink/65" />
      </div>
      <div className="container-x relative flex h-full flex-col justify-center">
        <p data-story-eyebrow className="eyebrow text-accent">
          {t.story.eyebrow}
        </p>
        <p className="display mt-6 max-w-[16ch] text-[clamp(30px,5vw,80px)] leading-[1.02]">
          {t.story.lines.map((l) => (
            <span key={l} data-story-line className="block">
              {l}
            </span>
          ))}
        </p>
        <p data-story-text className="mt-8 max-w-lg text-[16px] leading-relaxed text-white/65">
          {t.story.text}
        </p>
      </div>
    </section>
  )
}
