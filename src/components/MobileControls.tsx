import { useState } from 'react'
import type { Act, Input } from '../game/Input'
function B({ a, label, get, cls = '', big = false }: { a: Act; label: string; get: () => Input | undefined; cls?: string; big?: boolean }) {
  const [p, setP] = useState(false)
  const dn = (e: React.PointerEvent) => { e.preventDefault(); try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* ignore */ } setP(true); get()?.set(a, true) }
  const up = (e: React.PointerEvent) => { e.preventDefault(); setP(false); get()?.set(a, false) }
  const sz = big ? 'calc(var(--b) * 1.15)' : 'var(--b)'
  return <button onPointerDown={dn} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} onTouchStart={e => e.preventDefault()} onTouchEnd={e => e.preventDefault()} onContextMenu={e => e.preventDefault()}
    style={{ width: sz, height: sz, fontSize: 'calc(var(--b) * .2)' }}
    className={`pointer-events-auto grid touch-none select-none place-items-center rounded-full border-2 border-white/40 font-black text-white backdrop-blur-sm transition-transform ${p ? 'scale-90 bg-cyan-400/70' : 'bg-white/15'} ${cls}`}>{label}</button>
}
export default function MobileControls({ get }: { get: () => Input | undefined }) {
  const gap = { gap: 'calc(var(--b) * .16)' }
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex select-none items-end justify-between p-[1.5vh]" style={{ ['--b' as any]: 'clamp(46px, 15vh, 72px)' }}>
      <div className="flex items-end" style={gap}><B a="left" label="◀" get={get} /><B a="right" label="▶" get={get} /></div>
      <div className="grid grid-cols-3 items-end" style={gap}>
        <B a="s1" label="S1" get={get} /><B a="s2" label="S2" get={get} /><B a="ult" label="ULT" get={get} cls="!border-yellow-300" />
        <B a="block" label="BLOCK" get={get} /><B a="jump" label="JUMP" get={get} /><B a="atk" label="ATK" get={get} big cls="!bg-red-500/40" />
      </div>
    </div>
  )
}
