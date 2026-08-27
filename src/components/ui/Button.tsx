import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant = 'green' | 'blue' | 'yellow' | 'neutral' | 'red'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  green: 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950',
  blue: 'bg-sky-400 hover:bg-sky-300 text-sky-950',
  yellow: 'bg-amber-300 hover:bg-amber-200 text-amber-950',
  neutral: 'bg-white hover:bg-slate-50 text-slate-900',
  red: 'bg-rose-400 hover:bg-rose-300 text-rose-950',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl border-[3px] border-black ' +
  'px-4 py-2 font-bold leading-none shadow-[4px_4px_0_0_#000] transition-all ' +
  'hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] ' +
  'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ' +
  'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'

interface CommonProps {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  className?: string
  children: ReactNode
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined }

type ButtonAsLink = CommonProps & { to: string }

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'neutral', size = 'md', className = '', children } = props
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
  const classes = `${BASE} ${VARIANT_CLASSES[variant]} ${sizeClass} ${className}`

  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    )
  }

  const { variant: _v, size: _s, className: _c, to: _to, ...rest } =
    props as ButtonAsButton
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
