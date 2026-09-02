import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant =
  | 'green'
  | 'blue'
  | 'yellow'
  | 'neutral'
  | 'red'
  | 'ghost'

const VARIANTS: Record<ButtonVariant, string> = {
  green: 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 border-black',
  blue: 'bg-sky-400 hover:bg-sky-300 text-sky-950 border-black',
  yellow: 'bg-amber-300 hover:bg-amber-200 text-amber-950 border-black',
  neutral: 'bg-white hover:bg-stone-50 text-ink border-black',
  red: 'bg-rose-400 hover:bg-rose-300 text-rose-950 border-black',
  ghost:
    'bg-transparent hover:bg-black/5 text-ink border-transparent shadow-none hover:shadow-none',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2',
} as const

const BASE =
  'inline-flex items-center justify-center rounded-xl border-[3px] font-semibold leading-none ' +
  'shadow-hard transition-[transform,box-shadow,background-color] duration-100 ' +
  'hover:-translate-y-0.5 hover:shadow-hard-lg ' +
  'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ' +
  'disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none ' +
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20'

interface Common {
  variant?: ButtonVariant
  size?: keyof typeof SIZES
  full?: boolean
  className?: string
  children: ReactNode
}

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined }
type AsLink = Common & { to: string }

export function Button(props: AsButton | AsLink) {
  const {
    variant = 'neutral',
    size = 'md',
    full = false,
    className = '',
    children,
  } = props

  const classes = [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    full ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    )
  }

  const {
    variant: _v,
    size: _s,
    full: _f,
    className: _c,
    to: _t,
    ...rest
  } = props as AsButton

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
