export type CategoryId =
  | 'engine'
  | 'transmission'
  | 'brakes'
  | 'suspension'
  | 'electrics'
  | 'body'
  | 'optics'
  | 'cooling'
  | 'maintenance'
  | 'steering'

export interface Category {
  id: CategoryId
  image: string
  /** matching section on the live store, when known */
  url?: string
}

export const categories: Category[] = [
  { id: 'brakes', image: 'media/cat-brakes.webp' },
  { id: 'engine', image: 'media/cat-engine.webp', url: 'https://asiamotor.com.ua/dvigatel/' },
  { id: 'suspension', image: 'media/cat-suspension.webp' },
  { id: 'transmission', image: 'media/cat-transmission.webp' },
  { id: 'electrics', image: 'media/cat-electrics.webp', url: 'https://asiamotor.com.ua/elektrika-i-elektronika/' },
  { id: 'optics', image: 'media/cat-optics.webp' },
  { id: 'body', image: 'media/cat-body.webp', url: 'https://asiamotor.com.ua/kuzovye-detali/' },
  { id: 'cooling', image: 'media/cat-cooling.webp' },
  { id: 'maintenance', image: 'media/cat-maintenance.webp', url: 'https://asiamotor.com.ua/zapchasti-dlya-to/' },
  { id: 'steering', image: 'media/cat-steering.webp' },
]
