import { FIGHTERS } from '../data/fighters'
import FighterCard from './FighterCard'
export interface Sel { p1: string; p2: string; pvp: boolean }
export default function FighterSelect({ sel, setSel, onStart, onBack }: { sel: Sel; setSel: (s: Sel) => void; onStart: () => void; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-4xl p-4" style={{ paddingLeft: "max(1rem,env(safe-area-inset-left))", paddingRight: "max(1rem,env(safe-area-inset-right))" }}><div className="mb-2 text-center text-xs font-black tracking-[0.4em] text-cyan-300">ZHUU CLASH</div>
      <div className="mb-3 flex gap-2">
        {[false, true].map(p => <button key={String(p)} onClick={() => setSel({ ...sel, pvp: p })} className={`rounded px-3 py-1.5 text-xs font-bold ${sel.pvp === p ? 'bg-cyan-400 text-black' : 'bg-white/10'}`}>{p ? 'LOCAL PVP' : 'VS AI'}</button>)}
      </div>
      <h2 className="mb-2 text-lg font-black tracking-widest">SELECT YOUR FIGHTER</h2>
      <div className="grid grid-cols-1 gap-2 min-[560px]:grid-cols-3 md:gap-4">{FIGHTERS.map(d => <FighterCard key={d.id} d={d} full active={sel.p1 === d.id} onClick={() => setSel({ ...sel, p1: d.id })} />)}</div>
      <div className="my-3 text-center text-2xl font-black text-fuchsia-400">VS</div>
      <h2 className="mb-2 text-lg font-black tracking-widest">SELECT OPPONENT{sel.pvp ? ' (P2)' : ''}</h2>
      <div className="grid grid-cols-1 gap-2 min-[560px]:grid-cols-3 md:gap-4">{FIGHTERS.map(d => <FighterCard key={d.id} d={d} active={sel.p2 === d.id} onClick={() => setSel({ ...sel, p2: d.id })} />)}</div>
      <div className="mt-5 flex gap-3">
        <button onClick={onBack} className="rounded bg-white/10 px-5 py-3 font-bold">BACK</button>
        <button onClick={onStart} className="flex-1 rounded bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-black text-black">FIGHT!</button>
      </div>
    </div>
  )
}
