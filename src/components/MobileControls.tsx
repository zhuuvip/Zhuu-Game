import { useState } from 'react'
import type { Act, Input } from '../game/Input'
function B({ a, label, get, cls = '' }: { a: Act; label: string; get: () => Input | undefined; cls?: string }) {
  const [p, setP] = useState(false)
  const dn = (e: React.PointerEvent) => { e.preventDefault(); try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* ignore */ } setP(true); get()?.set(a, true) }
  const up = (e: React.PointerEvent) => { e.preventDefault(); setP(false); get()?.set(a, false) }
  return <button onPointerDown={dn} onPointerUp={up} onPointerCancel={up} onContextMenu={e => e.preventDefault()}
    className={`pointer-events-auto grid h-14 w-14 touch-none select-none place-items-center rounded-full border border-white/30 text-[11px] font-black backdrop-blur transition ${p ? 'scale-90 bg-cyan-400/60' : 'bg-white/15'} ${cls}`}>{label}</button>
}
export default function MobileControls({ get }: { get: () => Input | undefined }) {
  return (
    <div className="pointer-events-none mt-2 flex select-none items-end justify-between gap-2 px-2 pb-2 landscape:absolute landscape:inset-x-0 landscape:bottom-0 landscape:mt-0">
      <div className="flex gap-2"><B a="left" label="◀" get={get} /><B a="right" label="▶" get={get} /></div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2"><B a="block" label="BLOCK" get={get} /><B a="jump" label="JUMP" get={get} /></div>
        <div className="flex gap-2"><B a="s1" label="S1" get={get} /><B a="s2" label="S2" get={get} /><B a="ult" label="ULT" get={get} cls="!border-yellow-300" /><B a="atk" label="ATK" get={get} cls="!h-16 !w-16 !bg-red-500/40" /></div>
      </div>
    </div>
  )
}
