import type { HTMLAttributes, ReactNode } from 'react'

export function Panel({
  children,
  className = '',
  dashed = false,
  flat = false,
  ...rest
}: {
  children: ReactNode
  dashed?: boolean
  flat?: boolean
} & HTMLAttributes<HTMLDivElement>) {
  const borderStyle = dashed ? 'border-dashed' : 'border-solid'
  const shadow = flat ? '' : 'shadow-[6px_6px_0_0_#000]'
  return (
    <div
      className={`rounded-2xl border-[3px] border-black ${borderStyle} ${shadow} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
