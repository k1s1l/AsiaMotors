import { useEffect, useRef, useState } from 'react'
import { Menu, Phone, Search, ShoppingBag, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { company } from '../data/company'
import { scrollToTarget } from '../lib/motion'

export function Header() {
  const { t, lang, setLang } = useI18n()
  const { cartCount, open, overlay } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [bump, setBump] = useState(false)
  const pinned = useRef(0)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (Date.now() > pinned.current) setHidden(y > 600 && y > last + 2)
      if (y < last - 2) setHidden(false)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // little pop on the cart badge whenever the count changes
  useEffect(() => {
    if (!cartCount) return
    // keep the header (and its cart badge) on screen for a moment after adding
    pinned.current = Date.now() + 1800
    setHidden(false)
    setBump(true)
    const id = setTimeout(() => setBump(false), 450)
    return () => clearTimeout(id)
  }, [cartCount])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToTarget(id)
  }

  const catalogOpen = overlay === 'catalog'

  return (
    <header
      data-intro="header"
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-700 ease-[var(--ease-out-expo)] ${
        hidden && !overlay ? '-translate-y-full' : 'translate-y-0'
      } ${scrolled || catalogOpen ? 'border-b border-white/8 bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'}`}
    >
      <div className="container-x flex h-[72px] items-center gap-4 lg:h-[84px]">
        <a href="#top" onClick={go('top')} className="text-white" aria-label="Asia Motor — на початок">
          <Logo />
        </a>
        <span className="hidden rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55 2xl:inline" title={t.demo}>
          Demo
        </span>

        <nav className="ml-6 hidden items-center gap-1 text-[14px] font-medium text-white/80 xl:flex" aria-label="Головна навігація">
          <button
            onClick={() => open(catalogOpen ? null : 'catalog')}
            aria-expanded={catalogOpen}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors ${catalogOpen ? 'bg-white text-ink' : 'hover:text-white'}`}
          >
            {t.nav.catalog}
            <ChevronDown size={15} className={`transition-transform duration-500 ${catalogOpen ? 'rotate-180' : ''}`} />
          </button>
          {[
            ['finder', t.nav.finder],
            ['about', t.nav.about],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={go(id)} className="rounded-full px-4 py-2 transition-colors hover:text-white">
              {label}
            </a>
          ))}
          <button onClick={() => open('delivery')} className="rounded-full px-4 py-2 transition-colors hover:text-white">
            {t.nav.delivery}
          </button>
          <a href="#contacts" onClick={go('contacts')} className="rounded-full px-4 py-2 transition-colors hover:text-white">
            {t.nav.contacts}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-1 text-white">
          <a href={company.phones[0].href} className="mr-2 hidden items-center gap-2 text-[14px] font-semibold tabular-nums lg:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent">
              <Phone size={14} />
            </span>
            {company.phones[0].display}
          </a>
          <div className="mr-1 hidden rounded-full border border-white/15 p-0.5 font-mono text-[11px] sm:flex" role="group" aria-label="Мова / Язык">
            {(['ua', 'ru'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? 'bg-white text-ink' : 'text-white/60 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="icon-btn hover:bg-white/10" onClick={() => open('search')} aria-label={t.nav.search}>
            <Search size={19} />
          </button>
          <button className="icon-btn relative hover:bg-white/10" onClick={() => open('cart')} aria-label={`${t.nav.cart}: ${cartCount}`}>
            <ShoppingBag size={19} />
            <span
              className={`absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white transition-transform duration-300 ${
                cartCount ? 'scale-100' : 'scale-0'
              } ${bump ? 'scale-125' : ''}`}
            >
              {cartCount}
            </span>
          </button>
          <button className="icon-btn hover:bg-white/10 xl:hidden" onClick={() => open('menu')} aria-label={t.nav.menu}>
            <Menu size={21} />
          </button>
        </div>
      </div>
    </header>
  )
}
