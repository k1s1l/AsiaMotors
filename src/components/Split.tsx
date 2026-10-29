import type { ElementType } from 'react'

/** Splits text into masked words so GSAP can raise them line by line ([data-split]). */
export function Split({ text, as: Tag = 'span', className }: { text: string; as?: ElementType; className?: string }) {
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span className="sw" aria-hidden="true" key={i}>
          <span>{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
