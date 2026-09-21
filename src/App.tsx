import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'
import Home from './pages/Home'
import Game from './pages/Game'
import Fighters from './pages/Fighters'
import About from './pages/About'

function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05060f]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-black tracking-widest"><Zap className="text-cyan-400" size={20} />VOLTRIFT</Link>
        <nav className="flex items-center gap-4 text-sm text-white/70">
          <Link to="/fighters" className="hover:text-white">Fighters</Link>
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/game" className="rounded bg-cyan-400 px-3 py-1.5 font-bold text-black">PLAY</Link>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-[#05060f] text-white">
      {pathname !== '/game' && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/fighters" element={<Fighters />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}
