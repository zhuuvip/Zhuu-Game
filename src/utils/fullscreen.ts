export const canFs = () => typeof document !== 'undefined' && !!((document as any).fullscreenEnabled || (document as any).webkitFullscreenEnabled)
export const toggleFs = (el?: HTMLElement | null) => {
  try {
    const d: any = document
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen)?.call(d) }
    else if (el) { const r: any = el; const p = (r.requestFullscreen || r.webkitRequestFullscreen)?.call(r); p?.catch?.(() => { /* ignore */ }) }
  } catch { /* unsupported */ }
}
