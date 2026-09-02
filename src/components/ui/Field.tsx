import type { ComponentProps, ReactNode } from 'react'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-ink">{label}</span>
      {hint && (
        <span className="mb-1.5 block text-xs font-medium text-stone-500">
          {hint}
        </span>
      )}
      {children}
    </label>
  )
}

// React 19 passes `ref` through as an ordinary prop, so ComponentProps
// is enough — no forwardRef wrapper needed.
export function Input({ className = '', ...rest }: ComponentProps<'input'>) {
  return <input className={`fl-input ${className}`} {...rest} />
}

export function Textarea({
  className = '',
  ...rest
}: ComponentProps<'textarea'>) {
  return <textarea className={`fl-input ${className}`} {...rest} />
}

export function Select({ className = '', ...rest }: ComponentProps<'select'>) {
  return <select className={`fl-input ${className}`} {...rest} />
}

export function Checkbox({
  label,
  ...rest
}: { label: ReactNode } & ComponentProps<'input'>) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
      <input type="checkbox" className="h-4 w-4 accent-emerald-500" {...rest} />
      {label}
    </label>
  )
}
