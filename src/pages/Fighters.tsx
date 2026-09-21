import { FIGHTERS } from '../data/fighters'
import FighterCard from '../components/FighterCard'
export default function Fighters() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="neon mb-2 text-4xl font-black tracking-widest">FIGHTERS</h1>
      <p className="mb-8 text-white/60">Three original fighters, each with a basic attack, two skills and an ultimate.</p>
      <div className="grid gap-5 md:grid-cols-3">{FIGHTERS.map(d => <div key={d.id}><div className="mb-1 text-xs text-white/50">{d.theme}</div><FighterCard d={d} full /></div>)}</div>
    </main>
  )
}
