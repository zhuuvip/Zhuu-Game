import { useEffect, useState } from 'react'
const Q = '(orientation: portrait) and (pointer: coarse)'
export function usePortraitBlock() {
  const [b, setB] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(Q).matches)
  useEffect(() => {
    const m = window.matchMedia?.(Q); if (!m) return
    const h = () => setB(m.matches); h()
    if (m.addEventListener) m.addEventListener('change', h); else (m as any).addListener(h)
    window.addEventListener('orientationchange', h); window.addEventListener('resize', h)
    return () => { if (m.removeEventListener) m.removeEventListener('change', h); else (m as any).removeListener(h); window.removeEventListener('orientationchange', h); window.removeEventListener('resize', h) }
  }, [])
  return b
}
