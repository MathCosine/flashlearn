import { useEffect, useState } from 'react'

type Katex = typeof import('katex')

let katexPromise: Promise<Katex> | null = null

/**
 * KaTeX plus its stylesheet is around half a megabyte, so it's only
 * fetched the first time a card actually contains math.
 */
function loadKatex(): Promise<Katex> {
  if (!katexPromise) {
    katexPromise = Promise.all([
      import('katex'),
      import('katex/dist/katex.min.css'),
    ]).then(([mod]) => {
      // katex ships as CommonJS, so the interop shape depends on the
      // bundler: it may arrive as the namespace itself or under `default`.
      const namespace = mod as unknown as { default?: Katex }
      return namespace.default ?? (mod as unknown as Katex)
    })
  }
  return katexPromise
}

const MATH_PATTERN = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/

export function hasMath(text: string): boolean {
  return MATH_PATTERN.test(text)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Renders text with LaTeX between $...$ (inline) or $$...$$ (display) as
 * real math. Everything outside the delimiters is HTML-escaped, so card
 * text can never inject markup.
 */
function renderToHtml(katex: Katex, text: string): string {
  return text
    .split(new RegExp(MATH_PATTERN.source, 'g'))
    .map((part) => {
      const isDisplay = part.startsWith('$$') && part.endsWith('$$')
      const isInline =
        !isDisplay && part.length > 2 && part.startsWith('$') && part.endsWith('$')

      if (!isDisplay && !isInline) return escapeHtml(part)

      try {
        return katex.renderToString(
          isDisplay ? part.slice(2, -2) : part.slice(1, -1),
          { displayMode: isDisplay, throwOnError: false, trust: false },
        )
      } catch {
        return escapeHtml(part)
      }
    })
    .join('')
}

export function RichText({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const containsMath = hasMath(text)
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (!containsMath) {
      setHtml(null)
      return
    }
    let active = true
    loadKatex().then((katex) => {
      if (active) setHtml(renderToHtml(katex, text))
    })
    return () => {
      active = false
    }
  }, [text, containsMath])

  // Plain text (and the brief moment before KaTeX loads) renders as-is.
  if (!containsMath || html === null) {
    return <span className={className}>{text}</span>
  }

  return (
    <span
      className={className}
      // Safe: non-math segments are escaped above, and KaTeX runs with
      // trust: false, which blocks \href and other HTML-emitting commands.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
