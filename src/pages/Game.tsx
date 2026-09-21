import { useEffect, useRef, useState } from 'react'
import { byId } from '../data/fighters'
import { loadSettings, saveSettings, loadStats, saveStats, type Settings } from '../utils/storage'
import type { GameEngine } from '../game/GameEngine'
import GameCanvas from '../components/GameCanvas'
import MainMenu from '../components/MainMenu'
import FighterSelect, { type Sel } from '../components/FighterSelect'
import MobileControls from '../components/MobileControls'

export default function Game() {
  const [screen, setScreen] = useState<'menu' | 'select' | 'play' | 'result'>('menu')
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [stats, setStats] = useState(loadStats)
  const [sel, setSel] = useState<Sel>({ p1: stats.selectedFighter, p2: 'raven', pvp: false })
  const [paused, setPaused] = useState(false)
  const [won, setWon] = useState(false)
  const [run, setRun] = useState(0)
  const eng = useRef<GameEngine | null>(null)
  const touch = settings.touch && typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && screen === 'play') setPaused(p => !p) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [screen])

  const upd = (s: Settings) => { setSettings(s); saveSettings(s) }
  const start = () => { const s = { ...stats, selectedFighter: sel.p1 }; setStats(s); saveStats(s); setPaused(false); setRun(r => r + 1); setScreen('play') }
  const end = (p1Won: boolean) => {
    setStats(prev => { const s = { ...prev, totalMatches: prev.totalMatches + 1, wins: prev.wins + (p1Won ? 1 : 0), losses: prev.losses + (p1Won ? 0 : 1) }; saveStats(s); return s })
    setWon(p1Won); setScreen('result')
  }
  const title = sel.pvp ? (won ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS') : won ? 'VICTORY' : 'DEFEAT'

  if (screen === 'menu') return <MainMenu onPlay={() => setScreen('select')} settings={settings} setSettings={upd} wins={stats.wins} losses={stats.losses} total={stats.totalMatches} />
  if (screen === 'select') return <FighterSelect sel={sel} setSel={setSel} onStart={start} onBack={() => setScreen('menu')} />
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="relative">
        <GameCanvas key={run} p1={byId(sel.p1)} p2={byId(sel.p2)} pvp={sel.pvp} settings={settings} paused={paused} onEnd={end} onEngine={e => { eng.current = e }} />
        {paused && screen === 'play' && (
          <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/70"><div className="space-y-3 text-center">
            <div className="text-3xl font-black">PAUSED</div>
            <button className="block w-48 rounded bg-cyan-400 py-2 font-bold text-black" onClick={() => setPaused(false)}>RESUME</button>
            <button className="block w-48 rounded bg-white/15 py-2 font-bold" onClick={() => { setPaused(false); setScreen('menu') }}>MAIN MENU</button></div></div>)}
        {screen === 'result' && (
          <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/75"><div className="space-y-3 text-center">
            <div className={`text-5xl font-black ${won || sel.pvp ? 'text-yellow-300' : 'text-red-400'}`}>{title}</div>
            <button className="block w-48 rounded bg-cyan-400 py-2 font-bold text-black" onClick={start}>REMATCH</button>
            <button className="block w-48 rounded bg-white/15 py-2 font-bold" onClick={() => setScreen('menu')}>MAIN MENU</button></div></div>)}
        {touch && screen === 'play' && <MobileControls get={() => eng.current?.in1} />}
      </div>
      {touch && screen === 'play' && <div className="h-2" />}
      <div className="flex justify-between px-2 py-1 text-[11px] text-white/40"><span>ESC: pause</span>
        <button onClick={() => setPaused(p => !p)} className="underline">{paused ? 'Resume' : 'Pause'}</button></div>
    </div>
  )
}
