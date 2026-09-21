export interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; g: number; rot: number; vr: number; on: boolean }
export interface EmitOpts { color: string | string[]; speed?: number; life?: number; size?: number; g?: number; dir?: number; spread?: number }
export class Particles {
  pool: P[] = []
  private cur = 0
  constructor(n = 600) { for (let i = 0; i < n; i++) this.pool.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, color: '#fff', g: 0, rot: 0, vr: 0, on: false }) }
  emit(x: number, y: number, n: number, o: EmitOpts) {
    for (let i = 0; i < n; i++) {
      const p = this.pool[this.cur]; this.cur = (this.cur + 1) % this.pool.length
      const a = o.dir !== undefined ? o.dir + (Math.random() - .5) * (o.spread ?? 1) : Math.random() * Math.PI * 2
      const s = (o.speed ?? 200) * (.3 + Math.random() * .7)
      p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s
      p.max = p.life = (o.life ?? .6) * (.6 + Math.random() * .6); p.size = (o.size ?? 4) * (.5 + Math.random())
      p.color = Array.isArray(o.color) ? o.color[(Math.random() * o.color.length) | 0] : o.color
      p.g = o.g ?? 0; p.rot = Math.random() * 6; p.vr = (Math.random() - .5) * 10; p.on = true
    }
  }
  update(dt: number) {
    for (const p of this.pool) {
      if (!p.on) continue
      p.life -= dt; if (p.life <= 0) { p.on = false; continue }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt
    }
  }
  draw(g: CanvasRenderingContext2D) {
    g.globalCompositeOperation = 'lighter'
    for (const p of this.pool) {
      if (!p.on) continue
      const k = p.life / p.max
      g.globalAlpha = k; g.fillStyle = p.color
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot)
      const s = p.size * (0.4 + k * .6); g.fillRect(-s / 2, -s / 2, s, s); g.restore()
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
  }
}
