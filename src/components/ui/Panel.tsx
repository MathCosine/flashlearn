import type { HTMLAttributes, ReactNode } from 'react'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Dashed border, used for empty states and drop targets. */
  dashed?: boolean
  /** Drop the offset shadow. */
  flat?: boolean
  /** Bigger offset shadow, for hero/feature surfaces. */
  raised?: boolean
}

export function Panel({
  children,
  className = '',
  dashed = false,
  flat = false,
  raised = false,
  ...rest
}: PanelProps) {
  const shadow = flat ? '' : raised ? 'shadow-hard-xl' : 'shadow-hard-lg'
  const classes = [
    'rounded-2xl border-[3px] border-black',
    dashed ? 'border-dashed' : 'border-solid',
    shadow,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
