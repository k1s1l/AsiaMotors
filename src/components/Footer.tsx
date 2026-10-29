import { ArrowUp, ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { company } from '../data/company'
import { categories } from '../data/categories'
import { scrollToTarget } from '../lib/motion'
import { Logo } from './Logo'

export function Footer() {
  const { t, lang } = useI18n()
  const { setFilter, open } = useStore()
  const sections: [string, () => void][] = [
    [t.nav.catalog, () => scrollToTarget('categories')],
    [t.nav.finder, () => scrollToTarget('finder')],
    [t.products.title, () => scrollToTarget('products')],
    [t.nav.about, () => scrollToTarget('about')],
    [t.nav.delivery, () => open('delivery')],
  ]
  return (
    <footer id="contacts" className="relative overflow-hidden bg-ink pt-24 text-white">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 border-b border-white/10 pb-16 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-white/55">{t.footer.tagline}</p>
            <div className="mt-8 space-y-2">
              {company.phones.map((p) => (
                <a key={p.href} href={p.href} className="group flex items-center gap-3 font-display text-[clamp(22px,2.4vw,32px)] font-semibold tracking-tight tabular-nums">
                  <Phone size={18} className="text-accent" />
                  <span className="link-u">{p.display}</span>
                </a>
              ))}
            </div>
          </div>
          <nav className="lg:col-span-2" aria-label={t.footer.sections}>
            <p className="eyebrow text-white/40">{t.footer.sections}</p>
            <ul className="mt-5 space-y-3 text-[15px] text-white/75">
              {sections.map(([l, fn]) => (
                <li key={l}>
                  <button onClick={fn} className="link-u text-left hover:text-white">
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="lg:col-span-3" aria-label={t.footer.categories}>
            <p className="eyebrow text-white/40">{t.footer.categories}</p>
            <ul className="mt-5 grid grid-cols-1 gap-3 text-[15px] text-white/75">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setFilter({ category: c.id, car: null, query: '' })
                      scrollToTarget('products')
                    }}
                    className="link-u text-left hover:text-white"
                  >
                    {t.cats.names[c.id]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="col-span-2 lg:col-span-3">
            <p className="eyebrow text-white/40">{t.footer.contacts}</p>
            <ul className="mt-5 space-y-4 text-[15px] text-white/75">
              <li>
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-white">
                  <Mail size={16} className="text-accent" /> <span className="link-u">{company.email}</span>
                </a>
              </li>
              <li>
                <a href={company.mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-white">
                  <MapPin size={16} className="mt-1 shrink-0 text-accent" /> <span className="link-u">{company.address[lang]}</span>
                </a>
              </li>
              <li className="pl-7 text-[13px] text-white/45">{t.footer.schedule}</li>
            </ul>
            <p className="eyebrow mt-10 text-white/40">{t.footer.info}</p>
            <ul className="mt-5 space-y-3 text-[14px] text-white/75">
              <li>
                <a href={company.pages.about} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                  <span className="link-u">{t.footer.aboutLink}</span> <ExternalLink size={13} />
                </a>
              </li>
              <li>
                <a href={company.pages.delivery} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                  <span className="link-u">{t.footer.deliveryLink}</span> <ExternalLink size={13} />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 py-8 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">
            © {new Date().getFullYear()} Asia Motor · {t.footer.demo}
          </p>
          <button onClick={() => scrollToTarget('top', 0)} className="flex items-center gap-2 self-start text-white/70 hover:text-white sm:self-auto">
            {t.footer.top} <ArrowUp size={14} />
          </button>
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="translate-y-[18%] whitespace-nowrap text-center font-display text-[10.6vw] font-bold uppercase leading-[0.8] tracking-[-0.06em] text-white/[0.06]">
          Asia Motor
        </p>
      </div>
    </footer>
  )
}
