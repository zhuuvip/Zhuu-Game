import type { FighterDef } from '../data/fighters'
export default function FighterCard({ d, active, onClick, full }: { d: FighterDef; active?: boolean; onClick?: () => void; full?: boolean }) {
  const bar = (l: string, v: number, m: number) => (
    <div className="flex items-center gap-2 text-[10px]"><span className="w-7 text-white/60">{l}</span>
      <div className="h-1.5 flex-1 rounded bg-white/10"><div className="h-full rounded" style={{ width: `${(v / m) * 100}%`, background: d.c1 }} /></div></div>
  )
  return (
    <div role={onClick ? 'button' : undefined} onClick={onClick} className={`rounded-xl border p-3 text-left transition ${onClick ? 'cursor-pointer' : ''} ${active === false ? 'opacity-60 hover:opacity-100' : ''} ${active ? 'scale-[1.03]' : ''}`}
      style={{ borderColor: active ? d.c1 : '#ffffff20', boxShadow: active ? `0 0 26px ${d.c1}88` : 'none', background: `linear-gradient(160deg,${d.c1}26,#0b0d1a)` }}>
      <div className="mb-2 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-lg text-2xl font-black text-black" style={{ background: `linear-gradient(135deg,${d.c1},${d.c2})` }}>{d.name[0]}</div>
        <div><div className="font-black tracking-widest">{d.name}</div><div className="text-[11px] text-white/60">{d.role}</div></div>
      </div>
      <div className="space-y-1">{bar('HP', d.hp, 130)}{bar('ATK', d.atk, 100)}{bar('DEF', d.def, 100)}{bar('SPD', d.spd, 100)}</div>
      {full && (<div className="mt-3 text-xs text-white/70"><p className="mb-2">{d.desc}</p>
        <ul className="space-y-0.5"><li>J · {d.moves.atk.name}</li><li>K · {d.moves.s1.name}</li><li>L · {d.moves.s2.name}</li><li>U · {d.moves.ult.name}</li></ul></div>)}
    </div>
  )
}
