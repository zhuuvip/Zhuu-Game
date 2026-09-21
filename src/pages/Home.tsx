import { Link } from 'react-router-dom'
import { Gamepad2, Smartphone, Swords, Zap } from 'lucide-react'
import { FIGHTERS } from '../data/fighters'
import FighterCard from '../components/FighterCard'
const features = [[Swords, 'Real combat', 'Hitboxes, combos, blocking, crits and ultimates.'], [Gamepad2, 'Smart AI', 'An opponent that approaches, blocks, retreats and uses skills.'], [Smartphone, 'Mobile ready', 'Touch controller built for phones.'], [Zap, '60 FPS', 'Canvas engine running outside React.']] as const
export default function Home() {
  return (
    <main>
      <section className="bg-anim grid-bg px-4 py-24 text-center">
        <Zap className="mx-auto mb-3 text-cyan-400" size={40} />
        <div className="text-xs tracking-[0.4em] text-white/50">VOLTRIFT STUDIO</div>
        <h1 className="neon my-3 text-5xl font-black italic tracking-widest md:text-7xl">NEON CLASH</h1>
        <p className="mx-auto mb-8 max-w-md text-white/70">Fast 1V1 fighting in a ruined neon city. Pick a fighter. Win two rounds.</p>
        <div className="flex justify-center gap-3">
          <Link to="/game" className="rounded bg-cyan-400 px-6 py-3 font-black text-black">PLAY GAME</Link>
          <Link to="/fighters" className="rounded border border-white/30 px-6 py-3 font-black">OUR FIGHTERS</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-2 text-2xl font-black tracking-widest">FEATURED GAME</h2>
        <p className="mb-6 text-white/60">Neon Clash — best of 3 rounds in the Neon Ruins arena.</p>
        <div className="grid gap-4 md:grid-cols-3">{FIGHTERS.map(d => <FighterCard key={d.id} d={d} />)}</div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-14 sm:grid-cols-2 md:grid-cols-4">
        {features.map(([Icon, t, s]) => <div key={t} className="rounded-xl border border-white/10 bg-white/5 p-4"><Icon className="mb-2 text-fuchsia-400" /><div className="font-bold">{t}</div><div className="text-xs text-white/60">{s}</div></div>)}
      </section>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/40">© Voltrift Studio · Neon Clash</footer>
    </main>
  )
}
