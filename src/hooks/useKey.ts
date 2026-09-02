import { useEffect, useRef } from 'react'

/**
 * Runs `handler` when one of `keys` is pressed. Ignores keystrokes typed
 * into inputs so study shortcuts never fight with a text field.
 */
export function useKey(
  keys: string[],
  handler: (key: string) => void,
  enabled = true,
) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key === ' ' ? 'Space' : e.key
      if (keys.includes(key)) {
        e.preventDefault()
        handlerRef.current(key)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // keys is spread so a new array literal each render doesn't re-subscribe
    // more than necessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, keys.join('|')])
}
