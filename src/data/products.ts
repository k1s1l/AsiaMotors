import type { CategoryId } from './categories'

export interface Product {
  id: string
  /** name exactly as published on asiamotor.com.ua */
  name: string
  article: string
  carBrand: string
  /** models mentioned in the product name itself */
  fits: string[]
  category: CategoryId
  price: number
  currency: 'UAH' | 'USD'
  /** CGI illustration — to be replaced with the real product photo */
  image: string
  url: string
  original?: boolean
}

// Real listings found on asiamotor.com.ua. Prices are as published there at the time
// of research and may have changed; stock status is not known, so it is never shown.
export const products: Product[] = [
  {
    id: 'generator-geely-x7',
    name: 'Генератор Geely EC8 X7 1016050468 Джилі Х7',
    article: '1016050468',
    carBrand: 'Geely',
    fits: ['Geely EC8', 'Geely X7'],
    category: 'electrics',
    price: 4700,
    currency: 'UAH',
    image: 'media/p-alternator.webp',
    url: 'https://asiamotor.com.ua/elektrika-i-elektronika/generator-starter/generator-geely-x7-1016050468',
  },
  {
    id: 'starter-great-wall-safe',
    name: 'Стартер 491Q Great Wall Safe 3708010-E00 Оригінал Сафе',
    article: '3708010-E00',
    carBrand: 'Great Wall',
    fits: ['Great Wall Safe', '491Q'],
    category: 'electrics',
    price: 3760,
    currency: 'UAH',
    image: 'media/p-starter.webp',
    url: 'https://asiamotor.com.ua/elektrika-i-elektronika/generator-starter/starter-491q-great-wall-safe-3708010-e00-original',
    original: true,
  },
  {
    id: 'crank-sensor-geely-x7',
    name: 'Датчик колінвалу Geely X7 2.4 1086000796',
    article: '1086000796',
    carBrand: 'Geely',
    fits: ['Geely X7 2.4'],
    category: 'electrics',
    price: 329,
    currency: 'UAH',
    image: 'media/p-sensor.webp',
    url: 'https://asiamotor.com.ua/elektrika-i-elektronika/datchiki/datchik-kolenvala-geely-x7-24-1086000796',
  },
  {
    id: 'tensioner-emgrand-ex7',
    name: 'Гідронатягувач ланцюга ГРМ (4G20, 4G24) Emgrand EX7 1016050429',
    article: '1016050429',
    carBrand: 'Geely',
    fits: ['Geely Emgrand EX7', '4G20', '4G24'],
    category: 'maintenance',
    price: 1309,
    currency: 'UAH',
    image: 'media/p-tensioner.webp',
    url: 'https://asiamotor.com.ua/zapchasti-dlya-to/',
  },
  {
    id: 'sprocket-emgrand-ex7',
    name: 'Зірка ланцюга колінвала ГРМ (4G20) Emgrand EX7 1016050417',
    article: '1016050417',
    carBrand: 'Geely',
    fits: ['Geely Emgrand EX7', '4G20'],
    category: 'maintenance',
    price: 467.5,
    currency: 'UAH',
    image: 'media/p-sprocket.webp',
    url: 'https://asiamotor.com.ua/zapchasti-dlya-to/',
  },
  {
    id: 'hood-jolion',
    name: 'Капот Jolion 8402120XST01A',
    article: '8402120XST01A',
    carBrand: 'Haval',
    fits: ['Haval Jolion'],
    category: 'body',
    price: 25850,
    currency: 'UAH',
    image: 'media/p-hood.webp',
    url: 'https://asiamotor.com.ua/kuzovye-detali/kapot-bagazhnik/kapot-jolion-8402120xst01a',
  },
  {
    id: 'hood-emgrand-ec7',
    name: 'Капот Geely Emgrand EC7 106200259102',
    article: '106200259102',
    carBrand: 'Geely',
    fits: ['Geely Emgrand EC7'],
    category: 'body',
    price: 6580,
    currency: 'UAH',
    image: 'media/p-hood.webp',
    url: 'https://asiamotor.com.ua/kuzovye-detali/kapot-bagazhnik/kapot-geely-emgrand-ec7-106200259102',
  },
  {
    id: 'hood-chery-jaggi',
    name: 'Капот Chery Jaggi S21-8402010-DY',
    article: 'S21-8402010-DY',
    carBrand: 'Chery',
    fits: ['Chery Jaggi'],
    category: 'body',
    price: 5170,
    currency: 'UAH',
    image: 'media/p-hood.webp',
    url: 'https://asiamotor.com.ua/kuzovye-detali/kapot-bagazhnik/kapot-chery-jaggi-s21-8402010-dy',
  },
  {
    id: 'headlight-id4-crozz',
    name: 'Фара ліва скло окремо ID4 Crozz ZRD-ID4-061',
    article: 'ZRD-ID4-061',
    carBrand: 'ID.4 Crozz',
    fits: ['ID.4 Crozz'],
    category: 'optics',
    price: 120,
    currency: 'USD',
    image: 'media/p-headlight.webp',
    url: 'https://asiamotor.com.ua/',
  },
]

export function formatPrice(p: Pick<Product, 'price' | 'currency'>) {
  const n = new Intl.NumberFormat('uk-UA', { minimumFractionDigits: p.price % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(p.price)
  return p.currency === 'USD' ? `$${n}` : `${n} грн`
}
