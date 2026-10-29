// Business facts used on the page. Everything here was taken from public pages of
// asiamotor.com.ua (and directory listings that repeat them) — see README → "Джерела даних".
export const company = {
  name: 'Asia Motor',
  site: 'https://asiamotor.com.ua/',
  since: 2005,
  city: { ua: 'Запоріжжя', ru: 'Запорожье' },
  address: { ua: 'м. Запоріжжя, вул. Крива Бухта, 2', ru: 'г. Запорожье, ул. Кривая Бухта, 2' },
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=%D0%97%D0%B0%D0%BF%D0%BE%D1%80%D1%96%D0%B6%D0%B6%D1%8F%2C+%D0%B2%D1%83%D0%BB.+%D0%9A%D1%80%D0%B8%D0%B2%D0%B0+%D0%91%D1%83%D1%85%D1%82%D0%B0%2C+2',
  phones: [
    { display: '050 641 04 10', href: 'tel:+380506410410' },
    { display: '097 412 29 25', href: 'tel:+380974122925' },
  ],
  email: 'info@asiamotor.com.ua',
  pages: {
    about: 'https://asiamotor.com.ua/about_us',
    delivery: 'https://asiamotor.com.ua/delivery',
  },
  carriers: ['Нова пошта', 'Delivery'],
}

/** Car brands named on asiamotor.com.ua; models are only those that appear in the store's product names. */
export const brands: { name: string; models: string[] }[] = [
  { name: 'Chery', models: ['Jaggi'] },
  { name: 'Geely', models: ['Emgrand EC7', 'Emgrand X7', 'Emgrand EX7', 'EC8'] },
  { name: 'Great Wall', models: ['Safe'] },
  { name: 'Haval', models: ['Jolion'] },
  { name: 'BYD', models: [] },
  { name: 'Lifan', models: [] },
]
