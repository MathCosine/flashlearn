import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Panel } from './Panel'
import { Button } from './Button'

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <Panel
        raised
        className="max-h-[85vh] w-full max-w-lg overflow-auto bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <Button onClick={onClose} variant="ghost" size="sm" aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </Panel>
    </div>
  )
}
