import { useEffect, useRef } from 'react'
import { GameEngine } from '../game/GameEngine'
import type { FighterDef } from '../data/fighters'
import type { Settings } from '../utils/storage'
interface Props { p1: FighterDef; p2: FighterDef; pvp: boolean; settings: Settings; paused: boolean; onEnd: (p1Won: boolean) => void; onEngine: (e: GameEngine | null) => void }
export default function GameCanvas({ p1, p2, pvp, settings, paused, onEnd, onEngine }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLCanvasElement>(null)
  const eng = useRef<GameEngine | null>(null)
  useEffect(() => {
    const cv = ref.current!, bx = box.current!
    const e = new GameEngine(cv, { p1, p2, pvp, settings, onEnd })
    const fit = () => {
      const cw = bx.clientWidth, ch = bx.clientHeight; if (!cw || !ch) return
      const w = Math.min(cw, ch * 2.4)
      cv.style.width = w + 'px'; cv.style.height = ch + 'px'; e.resize(w, ch)
    }
    const late = () => { fit(); setTimeout(fit, 300) }
    fit(); eng.current = e; onEngine(e); e.start()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null
    ro?.observe(bx)
    window.addEventListener('resize', fit); window.addEventListener('orientationchange', late)
    document.addEventListener('fullscreenchange', late); document.addEventListener('webkitfullscreenchange', late)
    return () => {
      ro?.disconnect(); window.removeEventListener('resize', fit); window.removeEventListener('orientationchange', late)
      document.removeEventListener('fullscreenchange', late); document.removeEventListener('webkitfullscreenchange', late)
      e.stop(); onEngine(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { if (eng.current) { eng.current.paused = paused; eng.current.in1.clear() } }, [paused])
  return <div ref={box} className="absolute inset-0 grid place-items-center"><canvas ref={ref} className="block touch-none" /></div>
}
