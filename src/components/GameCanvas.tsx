import { useEffect, useRef } from 'react'
import { GameEngine } from '../game/GameEngine'
import type { FighterDef } from '../data/fighters'
import type { Settings } from '../utils/storage'
interface Props { p1: FighterDef; p2: FighterDef; pvp: boolean; settings: Settings; paused: boolean; onEnd: (p1Won: boolean) => void; onEngine: (e: GameEngine | null) => void }
export default function GameCanvas({ p1, p2, pvp, settings, paused, onEnd, onEngine }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const eng = useRef<GameEngine | null>(null)
  useEffect(() => {
    const e = new GameEngine(ref.current!, { p1, p2, pvp, settings, onEnd })
    eng.current = e; onEngine(e); e.start()
    return () => { e.stop(); onEngine(null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { if (eng.current) eng.current.paused = paused }, [paused])
  return <canvas ref={ref} width={960} height={540} className="block w-full touch-none rounded-lg bg-black" style={{ maxHeight: 'calc(100dvh - 8px)', objectFit: 'contain' }} />
}
