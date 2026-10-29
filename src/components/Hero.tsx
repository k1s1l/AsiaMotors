import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Pause, Play } from 'lucide-react'
import { useI18n } from '../i18n'
import { gsap, reducedMotion, scrollToTarget } from '../lib/motion'
import { Split } from './Split'
import { company } from '../data/company'

/**
 * Hero film. Swap the files in /public/media to use final footage:
 *   hero-1600.webm / hero-1600.mp4 — desktop, hero-960.mp4 — phones / save-data, hero-poster.webp — poster & fallback.
 * CHAPTER_LEN must match the shot length of the film (shot 3.6 s − 0.6 s crossfade).
 */
const CHAPTER_LEN = 3.0

export function Hero() {
  const { t, lang } = useI18n()
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [chapter, setChapter] = useState(0)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)

  // pick a rendition: small file on phones / data-saver, nothing on reduced motion (poster only, user can press play)
  useEffect(() => {
    const v = video.current
    if (!v) return
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    const small = window.innerWidth < 768 || conn?.saveData
    const sources = small
      ? [['media/hero-960.mp4', 'video/mp4']]
      : [
          ['media/hero-1600.webm', 'video/webm'],
          ['media/hero-1600.mp4', 'video/mp4'],
        ]
    v.innerHTML = sources.map(([src, type]) => `<source src="${src}" type="${type}">`).join('')
    v.lastElementChild?.addEventListener('error', () => setFailed(true))
    v.load()
    if (!reducedMotion()) v.play().catch(() => setPlaying(false))
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v) return
    let raf = 0
    const tick = () => {
      const time = v.currentTime
      const c = Math.min(3, Math.floor(time / CHAPTER_LEN))
      setChapter(c)
      setProgress(Math.min(1, (time - c * CHAPTER_LEN) / CHAPTER_LEN))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // intro + scroll choreography
  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.35, defaults: { ease: 'expo.out' } })
      tl.fromTo('[data-hero-media]', { scale: 1.18 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0)
        .from('[data-hero-shade]', { autoAlpha: 0, duration: 1.4 }, 0)
        .from('[data-hero-eyebrow]', { y: 20, autoAlpha: 0, duration: 1 }, 0.3)
        .from('.hero-title .sw > span', { yPercent: 115, duration: 1.4, stagger: 0.08 }, 0.35)
        .from('[data-hero-fade]', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 0.8)
        .from('[data-hero-side] > *', { y: 20, autoAlpha: 0, duration: 1.1, stagger: 0.08 }, 1.0)

      // on scroll the film recedes into a rounded frame and the copy drifts up
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        .to('[data-hero-frame]', { clipPath: 'inset(6% 3% 0% 3% round 28px)', ease: 'none' }, 0)
        .to('[data-hero-media]', { yPercent: 12, ease: 'none' }, 0)
        .to('[data-hero-copy]', { yPercent: -18, autoAlpha: 0.15, ease: 'none' }, 0)
    }, root)
    return () => ctx.revert()
  }, [])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  const jump = (i: number) => {
    const v = video.current
    if (!v) return
    v.currentTime = i * CHAPTER_LEN + 0.05
    v.play().catch(() => {})
  }

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[640px] bg-ink" aria-label="Asia Motor">
      <div data-hero-frame className="absolute inset-0 overflow-hidden [clip-path:inset(0%_0%_0%_0%_round_0px)]">
        <div data-hero-media className="absolute inset-0 will-change-transform">
          {/* poster doubles as the fallback when the video cannot play */}
          <img src="media/hero-poster.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_50%]" fetchPriority="high" />
          {!failed && (
            <video
              ref={video}
              className={`absolute inset-0 h-full w-full object-cover object-[70%_50%] transition-opacity duration-1000 ${playing ? 'opacity-100' : 'opacity-0'}`}
              muted
              loop
              playsInline
              autoPlay={!reducedMotion()}
              preload="metadata"
              poster="media/hero-poster.webp"
              aria-hidden="true"
              onPlaying={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setFailed(true)}
            />
          )}
        </div>
        <div data-hero-shade className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,11,13,.92)_0%,rgba(10,11,13,.55)_40%,rgba(10,11,13,0)_70%)] max-md:bg-[linear-gradient(180deg,rgba(10,11,13,.35)_0%,rgba(10,11,13,.2)_35%,rgba(10,11,13,.92)_75%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/90 to-transparent" />
          <div className="grain absolute inset-0" />
        </div>
      </div>

      <div data-hero-copy className="container-x relative z-10 flex h-full flex-col justify-end pb-28 pt-28 sm:pb-32 lg:justify-center lg:pb-16">
        <p data-hero-eyebrow className="eyebrow flex items-center gap-3 text-white/70">
          <span className="h-px w-10 bg-accent" />
          {t.hero.eyebrow}
        </p>
        <h1 className="hero-title display mt-6 text-[8.8vw] sm:text-[clamp(40px,7.6vw,132px)] text-white">
          {t.hero.title.map((line, i) => (
            <Split key={line + i} text={line} className={`block ${i === 2 ? 'text-white/45' : ''}`} />
          ))}
        </h1>
        <p data-hero-fade className="mt-7 max-w-[34rem] text-[16px] leading-relaxed text-white/70 sm:text-[17px]">
          {t.hero.lead}
        </p>
        <div data-hero-fade className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button className="btn btn-accent" onClick={() => scrollToTarget('finder')}>
            {t.hero.ctaFind} <ArrowUpRight size={18} className="btn-ico" />
          </button>
          <button className="btn btn-ghost" onClick={() => scrollToTarget('categories')}>
            {t.hero.ctaCatalog}
          </button>
        </div>
      </div>

      <div data-hero-side className="container-x absolute inset-x-0 bottom-0 z-10 grid grid-cols-[auto_1fr_auto] items-center gap-8 pb-6 text-white/60">
        <button onClick={() => scrollToTarget('finder')} className="group eyebrow flex items-center gap-3" aria-label={t.hero.scroll}>
          <span className="relative block h-10 w-px overflow-hidden bg-white/20">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_cubic-bezier(.76,0,.24,1)_infinite] bg-accent" />
          </span>
          <span className="hidden sm:inline">{t.hero.scroll}</span>
          <ArrowDownRight size={14} className="transition-transform group-hover:translate-y-0.5" />
        </button>
        {/* film chapters, synced with the video timeline */}
        <div className="hidden justify-center gap-6 lg:flex">
          {t.hero.chapters.map((c, i) => (
            <button key={c} onClick={() => jump(i)} className="group w-36 py-2 text-left" aria-label={c}>
              <span className={`flex items-baseline gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors duration-500 ${i === chapter ? 'text-white' : 'text-white/35 group-hover:text-white/70'}`}>
                <span className={i === chapter ? 'text-accent' : ''}>0{i + 1}</span>
                {c}
              </span>
              <span className="mt-2.5 block h-px w-full bg-white/15">
                <span className="block h-full origin-left bg-white" style={{ transform: `scaleX(${i === chapter ? progress : i < chapter ? 1 : 0})` }} />
              </span>
            </button>
          ))}
        </div>
        <div className="col-start-3 flex items-center gap-5">
          <span className="eyebrow hidden md:block">
            {t.hero.since} · {company.city[lang]}
          </span>
          <button onClick={toggle} className="icon-btn border border-white/20 text-white hover:bg-white hover:text-ink" aria-label={playing ? t.hero.pause : t.hero.play}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(200%)}}`}</style>
    </section>
  )
}
