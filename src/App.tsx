import { useEffect } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Finder } from './components/Finder'
import { Categories } from './components/Categories'
import { Products } from './components/Products'
import { Why } from './components/Why'
import { Story } from './components/Story'
import { Brands } from './components/Brands'
import { Cta } from './components/Cta'
import { Footer } from './components/Footer'
import { Overlays } from './components/Overlays'
import { Intro } from './components/Intro'
import { ScrollTrigger, startSmoothScroll } from './lib/motion'
import { useI18n } from './i18n'

export default function App() {
  const { t, lang } = useI18n()
  useEffect(() => {
    startSmoothScroll()
    // late-loading fonts and images shift layout; recompute trigger positions once settled
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => clearTimeout(id)
  }, [lang])

  return (
    <>
      <a href="#finder" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
        {t.nav.finder}
      </a>
      <Intro />
      <Header />
      <main>
        <Hero />
        <Finder />
        <Categories />
        <Products />
        <Why />
        <Story />
        <Brands />
        <Cta />
      </main>
      <Footer />
      <Overlays />
    </>
  )
}
