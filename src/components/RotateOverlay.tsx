export default function RotateOverlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#05060f] p-6 text-center">
      <div>
        <h1 className="neon text-4xl font-black italic tracking-widest">ZHUU CLASH</h1>
        <div className="rotate-phone relative mx-auto my-10 h-24 w-14 rounded-xl border-4 border-cyan-400"><div className="absolute inset-x-3 top-1 h-1 rounded bg-cyan-400/60" /></div>
        <p className="text-xl font-black tracking-widest">PLEASE ROTATE YOUR DEVICE</p>
        <p className="mt-2 text-sm text-white/60">Landscape mode is required for gameplay.</p>
      </div>
    </div>
  )
}
