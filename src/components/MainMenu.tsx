import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Settings } from '../utils/storage'
export default function MainMenu({ onPlay, settings, setSettings, wins, losses, total }: { onPlay: () => void; settings: Settings; setSettings: (s: Settings) => void; wins: number; losses: number; total: number }) {
  const [open, setOpen] = useState(false)
  const btn = 'w-64 rounded border border-cyan-400/50 bg-white/5 py-3 text-center font-black tracking-widest hover:bg-cyan-400 hover:text-black'
  return (
    <div className="bg-anim grid-bg grid min-h-screen place-items-center p-4 text-center">
      <div>
        <h1 className="neon mb-1 text-5xl font-black italic tracking-widest md:text-7xl">NEON CLASH</h1>
        <p className="mb-6 text-xs text-white/60">Record {wins}W - {losses}L · {total} matches</p>
        {!open ? (
          <div className="flex flex-col items-center gap-3">
            <button className={btn} onClick={onPlay}>PLAY</button>
            <Link className={btn} to="/fighters">FIGHTERS</Link>
            <Link className={btn} to="/about">ABOUT</Link>
            <button className={btn} onClick={() => setOpen(true)}>SETTINGS</button>
          </div>
        ) : (
          <div className="mx-auto w-80 space-y-4 rounded-xl border border-white/15 bg-black/50 p-4 text-left text-sm">
            <label className="block">SFX Volume ({Math.round(settings.sfx * 100)}%)<input type="range" min={0} max={100} value={settings.sfx * 100} onChange={e => setSettings({ ...settings, sfx: +e.target.value / 100 })} className="w-full" /></label>
            <label className="flex justify-between">Screen Shake<input type="checkbox" checked={settings.shake} onChange={e => setSettings({ ...settings, shake: e.target.checked })} /></label>
            <label className="flex justify-between">Mobile Controls<input type="checkbox" checked={settings.touch} onChange={e => setSettings({ ...settings, touch: e.target.checked })} /></label>
            <label className="flex items-center justify-between">Graphics
              <select className="rounded bg-white/10 p-1" value={settings.quality} onChange={e => setSettings({ ...settings, quality: +e.target.value })}><option value={0.4}>Low</option><option value={0.7}>Medium</option><option value={1}>High</option></select></label>
            <button className="w-full rounded bg-cyan-400 py-2 font-bold text-black" onClick={() => setOpen(false)}>DONE</button>
          </div>
        )}
        <div className="mt-6 text-[11px] text-white/40">A/D move · W jump · S block · J/K/L attacks · U ultimate · ESC pause</div>
      </div>
    </div>
  )
}
