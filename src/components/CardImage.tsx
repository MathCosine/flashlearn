import { useEffect, useState } from 'react'
import { signedImageUrl } from '../lib/api'

// Signed URLs are valid for an hour, so cache them with an expiry rather
// than re-signing on every render (or serving a dead link to a long session).
const SIGNED_URL_TTL_MS = 55 * 60 * 1000
const cache = new Map<string, { url: string; expiresAt: number }>()

function cached(path: string): string | null {
  const hit = cache.get(path)
  if (!hit || hit.expiresAt < Date.now()) return null
  return hit.url
}

export function CardImage({
  path,
  className = '',
  alt = '',
}: {
  path: string
  className?: string
  alt?: string
}) {
  const [url, setUrl] = useState<string | null>(() => cached(path))

  useEffect(() => {
    const hit = cached(path)
    if (hit) {
      setUrl(hit)
      return
    }
    let active = true
    signedImageUrl(path).then((signed) => {
      if (!active || !signed) return
      cache.set(path, { url: signed, expiresAt: Date.now() + SIGNED_URL_TTL_MS })
      setUrl(signed)
    })
    return () => {
      active = false
    }
  }, [path])

  if (!url) {
    return (
      <div
        className={`animate-pulse rounded-lg border-2 border-black bg-stone-100 ${className}`}
      />
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`rounded-lg border-2 border-black object-contain ${className}`}
    />
  )
}
