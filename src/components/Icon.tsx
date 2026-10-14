import { useState } from 'react'

/** Icône de token/chain avec repli neutre si l'image ne charge pas. */
export function Icon({ src, size = 24 }: { src?: string; size?: number }) {
  const [broken, setBroken] = useState(false)
  const style = { width: size, height: size }
  if (!src || broken) return <div style={style} className="shrink-0 rounded-full bg-line" />
  return <img src={src} alt="" style={style} className="shrink-0 rounded-full" onError={() => setBroken(true)} />
}
