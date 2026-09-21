import { useEffect, useRef, useState } from 'react'
import { Maximize, Pause } from 'lucide-react'
import { byId } from '../data/fighters'
import { loadSettings, saveSettings, loadStats, saveStats, type Settings } from '../utils/storage'
import type { GameEngine } from '../game/GameEngine'
import GameCanvas from '../components/GameCanvas'
import MainMenu from '../components/MainMenu'
import FighterSelect, { type Sel } from '../components/FighterSelect'
import MobileControls from '../components/MobileControls'
import RotateOverlay from '../components/RotateOverlay'
import { usePortraitBlock } from '../hooks/usePortraitBlock'
import { canFs, toggleFs } from '../utils/fullscreen'

export default function Game() {
  const [screen, setScreen] = useState<'menu' | 'select' | 'play' | 'result'>('menu')
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [stats, setStats] = useState(loadStats)
  const [sel, setSel] = useState<Sel>({ p1: stats.selectedFighter, p2: 'raven', pvp: false })
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [won, setWon] = useState(false)
  const [run, setRun] = useState(0)
  const eng = useRef<GameEngine | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const portrait = usePortraitBlock()
  const [touch] = useState(() => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0))
  const inGame = screen === 'play' || screen === 'result'

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && screen === 'play') setPaused(p => !p) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [screen])
  useEffect(() => {
    if (!inGame) return
    const el = root.current, h = (e: TouchEvent) => e.preventDefault(), prev = document.body.style.overflow
    el?.addEventListener('touchmove', h, { passive: false }); document.body.style.overflow = 'hidden'
    return () => { el?.removeEventListener('touchmove', h); document.body.style.overflow = prev }
  }, [inGame])

  const upd = (s: Settings) => { setSettings(s); saveSettings(s) }
  const start = () => {
    const s = { ...stats, selectedFighter: sel.p1 }; setStats(s); saveStats(s)
    setPaused(false); setLoading(true); setRun(r => r + 1); setScreen('play'); setTimeout(() => setLoading(false), 700)
  }
  const end = (p1Won: boolean) => {
    setStats(prev => { const s = { ...prev, totalMatches: prev.totalMatches + 1, wins: prev.wins + (p1Won ? 1 : 0), losses: prev.losses + (p1Won ? 0 : 1) }; saveStats(s); return s })
    setWon(p1Won); setScreen('result')
  }
  const title = sel.pvp ? (won ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS') : won ? 'VICTORY' : 'DEFEAT'
  const sm = 'grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black/40 text-white'

  return (
    <>
      {portrait && <RotateOverlay />}
      {screen === 'menu' && <MainMenu onPlay={() => setScreen('select')} settings={settings} setSettings={upd} wins={stats.wins} losses={stats.losses} total={stats.totalMatches} />}
      {screen === 'select' && <FighterSelect sel={sel} setSel={setSel} onStart={start} onBack={() => setScreen('menu')} />}
      {inGame && (
        <div ref={root} className="fixed inset-0 select-none bg-black" style={{ paddingTop: 'env(safe-area-inset-top)', paddingRight: 'env(safe-area-inset-right)', paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', touchAction: 'none', WebkitTouchCallout: 'none' }}>
          <div className="relative h-full w-full">
            <GameCanvas key={run} p1={byId(sel.p1)} p2={byId(sel.p2)} pvp={sel.pvp} settings={settings} paused={paused || portrait || loading} onEnd={end} onEngine={e => { eng.current = e }} />
            {screen === 'play' && (
              <div className="absolute bottom-[1.5vh] left-1/2 z-10 flex -translate-x-1/2 gap-2">
                <button aria-label="Pause" className={sm} onClick={() => setPaused(p => !p)}><Pause size={16} /></button>
                {canFs() && <button aria-label="Fullscreen" className={sm} onClick={() => toggleFs(root.current)}><Maximize size={16} /></button>}
              </div>
            )}
            {settings.touch && touch && screen === 'play' && <MobileControls get={() => eng.current?.in1} />}
            {paused && screen === 'play' && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/70"><div className="space-y-3 text-center">
                <div className="text-3xl font-black">PAUSED</div>
                <button className="block w-48 rounded bg-cyan-400 py-2 font-bold text-black" onClick={() => setPaused(false)}>RESUME</button>
                <button className="block w-48 rounded bg-white/15 py-2 font-bold" onClick={() => { setPaused(false); setScreen('menu') }}>MAIN MENU</button></div></div>)}
            {screen === 'result' && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-black/75"><div className="space-y-3 text-center">
                <div className="text-xs font-black tracking-[0.4em] text-cyan-300">ZHUU CLASH</div>
                <div className={`text-[clamp(2rem,9vh,3.5rem)] font-black ${won || sel.pvp ? 'text-yellow-300' : 'text-red-400'}`}>{title}</div>
                <button className="block w-48 rounded bg-cyan-400 py-2 font-bold text-black" onClick={start}>REMATCH</button>
                <button className="block w-48 rounded bg-white/15 py-2 font-bold" onClick={() => setScreen('menu')}>MAIN MENU</button></div></div>)}
            {loading && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-[#05060f]"><div className="text-center">
                <div className="neon text-4xl font-black italic tracking-widest">ZHUU CLASH</div>
                <div className="mx-auto mt-4 h-1 w-40 overflow-hidden rounded bg-white/10"><div className="h-full w-1/3 bg-cyan-400" style={{ animation: 'load 0.9s linear infinite' }} /></div>
                <div className="mt-2 text-[10px] tracking-[0.3em] text-white/50">LOADING</div></div></div>)}
          </div>
        </div>
      )}
    </>
  )
}
