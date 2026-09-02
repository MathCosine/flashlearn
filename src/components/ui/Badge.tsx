import type { ReactNode } from 'react'

export function Badge({
  children,
  className = '',
  onClick,
  active = false,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}) {
  const base =
    'inline-flex items-center gap-1 rounded-full border-2 border-black px-2.5 py-0.5 text-xs font-bold'
  const tone = active ? 'bg-ink text-white' : className || 'bg-white text-ink'

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${tone} transition-transform hover:-translate-y-0.5`}
      >
        {children}
      </button>
    )
  }

  return <span className={`${base} ${tone}`}>{children}</span>
}
