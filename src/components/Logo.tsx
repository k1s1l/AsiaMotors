/** Text-based wordmark for the demo. Replace with the official Asia Motor logo files. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="currentColor" opacity="0.08" />
        <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" fill="none" stroke="currentColor" opacity="0.25" />
        <path d="M14 46 28 16h8l14 30h-8.5L32 25.5 22.5 46z" fill="currentColor" />
        <path d="M26 39h12l-2.6 5H28.6z" fill="#ff4b1f" />
      </svg>
      <span className="font-display text-[15px] font-semibold uppercase leading-none tracking-[-0.02em]">
        Asia<span className="text-accent">·</span>Motor
      </span>
    </span>
  )
}
