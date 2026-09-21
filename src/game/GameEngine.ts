import type { FighterDef, Move } from '../data/fighters'
import { Input, P1KEYS, P2KEYS } from './Input'
import { Particles } from './Particles'
import { AudioManager } from './Audio'
import type { Settings } from '../utils/storage'

export const H = 540
const WORLD = 1300, FLOOR = 390, GRAV = 1900
type K = 'atk' | 's1' | 's2' | 'ult'
type Ctl = { left: boolean; right: boolean; jump: boolean; block: boolean; atk: boolean; s1: boolean; s2: boolean; ult: boolean }
interface Fx { def: FighterDef; x: number; y: number; vx: number; vy: number; face: 1 | -1; hp: number; ult: number; state: string; move: Move | null; mk: string; st: number; mt: number; hit: boolean; cd: Record<string, number>; stun: number; block: boolean; ground: boolean; combo: number; comboT: number; wins: number; ko: boolean; ai: { t: number; act: string } }
export interface Cfg { p1: FighterDef; p2: FighterDef; pvp: boolean; settings: Settings; onEnd: (p1Won: boolean) => void }
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const mkF = (def: FighterDef, x: number, face: 1 | -1): Fx => ({ def, x, y: FLOOR, vx: 0, vy: 0, face, hp: def.hp, ult: 0, state: 'idle', move: null, mk: '', st: 0, mt: 0, hit: false, cd: { atk: 0, s1: 0, s2: 0 }, stun: 0, block: false, ground: true, combo: 0, comboT: 0, wins: 0, ko: false, ai: { t: .5, act: 'approach' } })
const NEUTRAL = (): Ctl => ({ left: false, right: false, jump: false, block: false, atk: false, s1: false, s2: false, ult: false })

export class GameEngine {
  in1 = new Input(); in2 = new Input(); parts = new Particles(); audio = new AudioManager()
  paused = false
  private vw = 960; private s = 1; private ox = 0; private oy = 0; private q = 1
  private g: CanvasRenderingContext2D
  private f: [Fx, Fx]
  private phase: 'intro' | 'fight' | 'ko' | 'round' | 'done' = 'intro'
  private pt = 3.8; private timer = 60; private round = 1; private t = 0; private raf = 0; private last = 0
  private winner: Fx | null = null
  private cam = { x: (WORLD - 960) / 2, zoom: 1, shake: 0 }
  private zoomT = 0; private hitstop = 0; private flash = 0
  private texts: { x: number; y: number; s: string; life: number; c: string }[] = []
  private rings: { x: number; y: number; r: number; life: number; c: string }[] = []
  private bg: { f: number; c: string; n: string; b: { x: number; w: number; h: number; win: number[][] }[] }[] = []

  constructor(private cv: HTMLCanvasElement, private cfg: Cfg) {
    this.g = cv.getContext('2d')!
    this.audio.vol = cfg.settings.sfx
    this.q = cfg.settings.quality * ((navigator.hardwareConcurrency || 8) <= 4 ? .6 : 1)
    this.f = [mkF(cfg.p1, 450, 1), mkF(cfg.p2, 850, -1)]
    let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647
    for (const [f, c, n, mh] of [[.15, '#0d0b24', '#7c3aed', 200], [.35, '#0a0a1c', '#22d3ee', 150], [.6, '#06060f', '#f0abfc', 100]] as [number, string, string, number][]) {
      const b: { x: number; w: number; h: number; win: number[][] }[] = []; let x = -150
      while (x < WORLD + 300) {
        const w = 60 + r() * 90, h = mh + r() * 160, win: number[][] = []
        for (let wy = 20; wy < h - 10; wy += 22) for (let wx = 8; wx < w - 14; wx += 18) if (r() < .3) win.push([wx, wy])
        b.push({ x, w, h, win }); x += w + r() * 20
      }
      this.bg.push({ f, c, n, b })
    }
    this.reset()
  }

  start() {
    this.in1.attach(P1KEYS); if (this.cfg.pvp) this.in2.attach(P2KEYS)
    this.last = performance.now()
    const loop = (n: number) => {
      const dt = Math.min(.033, (n - this.last) / 1000); this.last = n
      if (!this.paused) this.update(dt)
      this.render(); this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }
  resize(cw: number, ch: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, this.q < 1 ? 1.5 : 2)
    const pw = Math.max(1, Math.round(cw * dpr)), ph = Math.max(1, Math.round(ch * dpr))
    if (this.cv.width !== pw || this.cv.height !== ph) { this.cv.width = pw; this.cv.height = ph }
    this.vw = clamp(H * pw / ph, 720, WORLD)
    this.s = Math.min(pw / this.vw, ph / H)
    this.ox = (pw - this.vw * this.s) / 2; this.oy = (ph - H * this.s) / 2
    this.cam.x = clamp(this.cam.x, 0, WORLD - this.vw)
  }
  stop() { cancelAnimationFrame(this.raf); this.in1.detach(); this.in2.detach() }

  private reset() {
    const [a, b] = this.f
    for (const [f, x, fc] of [[a, 450, 1], [b, 850, -1]] as [Fx, number, 1 | -1][]) {
      f.x = x; f.y = FLOOR; f.vx = 0; f.vy = 0; f.face = fc; f.hp = f.def.hp; f.state = 'idle'; f.move = null; f.stun = 0
      f.ko = false; f.ground = true; f.combo = 0; f.cd = { atk: 0, s1: 0, s2: 0 }
    }
    this.phase = 'intro'; this.pt = 3.8; this.timer = 60; this.winner = null; this.in1.clear(); this.in2.clear()
  }

  private ctl(i: Input): Ctl {
    return { left: !!i.held.left, right: !!i.held.right, block: !!i.held.block, jump: i.take('jump'), atk: i.take('atk'), s1: i.take('s1'), s2: i.take('s2'), ult: i.take('ult') }
  }

  private update(dt: number) {
    this.t += dt
    if (this.hitstop > 0) { this.hitstop -= dt; this.fx(dt); return }
    const [a, b] = this.f
    const d = dt * (this.phase === 'ko' ? .3 : 1)
    this.pt -= dt
    let c1 = NEUTRAL(), c2 = NEUTRAL()
    if (this.phase === 'intro' && this.pt <= 0) { this.phase = 'fight'; this.in1.clear(); this.in2.clear() }
    if (this.phase === 'fight') {
      c1 = this.ctl(this.in1); c2 = this.cfg.pvp ? this.ctl(this.in2) : this.ai(b, a, d)
      this.timer -= dt
      if (this.timer <= 0) { const lo = a.hp <= b.hp ? a : b; this.koFn(lo === a ? b : a, lo) }
    }
    this.step(a, b, c1, d); this.step(b, a, c2, d)
    if (this.phase === 'ko' && this.pt <= 0) { this.phase = 'round'; this.pt = 2.2 }
    else if (this.phase === 'round' && this.pt <= 0 && this.winner) {
      if (this.winner.wins >= 2) { this.phase = 'done'; const w = this.winner === a; this.audio.play(w || this.cfg.pvp ? 'victory' : 'defeat'); this.cfg.onEnd(w) }
      else { this.round++; this.reset() }
    }
    if ((this.phase === 'round' || this.phase === 'done') && this.winner) this.winner.state = 'victory'
    this.fx(dt)
  }

  private fx(dt: number) {
    this.parts.update(dt)
    this.texts.forEach(t => { t.y -= 45 * dt; t.life -= dt }); this.texts = this.texts.filter(t => t.life > 0)
    this.rings.forEach(r => { r.r += 700 * dt; r.life -= dt }); this.rings = this.rings.filter(r => r.life > 0)
    const [a, b] = this.f
    this.cam.x += (clamp((a.x + b.x) / 2 - this.vw / 2, 0, WORLD - this.vw) - this.cam.x) * Math.min(1, dt * 6)
    this.zoomT -= dt
    const tz = this.zoomT > 0 ? 1.18 : this.phase === 'ko' ? 1.1 : 1
    this.cam.zoom += (tz - this.cam.zoom) * Math.min(1, dt * 8)
    this.cam.shake *= Math.pow(.001, dt); this.flash = Math.max(0, this.flash - dt * 1.5)
    if (Math.random() < .25 * this.q) this.parts.emit(this.cam.x + Math.random() * this.vw, FLOOR - Math.random() * 300, 1, { color: ['#22d3ee', '#e879f9'], speed: 12, life: 3, size: 2, g: -8 })
  }

  private em(f: Fx, x: number, y: number, n: number, speed: number, extra: { dir?: number; spread?: number } = {}) {
    const id = f.def.id, cols = id === 'titan' ? ['#a8a29e', '#78716c', '#d6b77a'] : id === 'raven' ? [f.def.c1, f.def.c2, '#1e1b4b'] : [f.def.c1, f.def.c2, '#fde047']
    this.parts.emit(x, y, Math.max(1, Math.round(n * this.q)), { color: cols, speed, size: id === 'titan' ? 8 : 6, life: .7, g: id === 'titan' ? 900 : id === 'kairo' ? -150 : 0, ...extra })
  }
  private shake(v: number) { this.cam.shake = Math.max(this.cam.shake, v) }

  private start_(f: Fx, k: K) {
    const m = f.def.moves[k]
    f.move = m; f.mk = k; f.st = f.mt = m.dur; f.hit = false
    f.state = k === 'atk' ? 'attack' : k === 's1' ? 'skill1' : k === 's2' ? 'skill2' : 'ultimate'
    if (k === 'ult') { f.ult = 0; this.flash = .5; this.zoomT = 1; this.shake(16) } else f.cd[k] = m.cd
    if (m.launch) { f.vy = -m.launch; f.ground = false }
    f.vx = m.dash ? f.face * m.dash : f.face * 60
    this.audio.play(k === 'atk' ? (Math.random() < .5 ? 'punch' : 'kick') : k === 'ult' ? 'ultimate' : 'skill')
    const h = f.def.h
    if (k === 's2') this.em(f, f.x + f.face * 40, f.y, 24, 320, { dir: -Math.PI / 2, spread: 1.2 })
    if (k === 'ult') { this.em(f, f.x, f.y - h / 2, 80, 520); this.rings.push({ x: f.x, y: f.y, r: 10, life: .6, c: f.def.c1 }) }
    if (f.def.id === 'titan' && k === 's1') { this.em(f, f.x + f.face * m.range * .8, f.y, 30, 350, { dir: -Math.PI / 2, spread: 2 }); this.rings.push({ x: f.x + f.face * 100, y: f.y, r: 10, life: .45, c: '#d6b77a' }); this.shake(8) }
  }

  private step(f: Fx, o: Fx, c: Ctl, d: number) {
    for (const k in f.cd) f.cd[k] = Math.max(0, f.cd[k] - d)
    f.comboT -= d; if (f.comboT <= 0) f.combo = 0
    if (f.stun > 0) f.stun -= d
    f.block = false
    const spd = f.def.spd * 3.4
    if (!f.ko && f.stun <= 0) {
      if (f.move) {
        const m = f.move; f.st -= d
        if (m.dash && f.st > f.mt * .3) { f.vx = f.face * m.dash; this.em(f, f.x, f.y - f.def.h * .5, 2, 60) }
        if (!f.hit && f.st < f.mt * .75) this.tryHit(f, o, m)
        if (f.st <= 0) { f.move = null; f.state = 'idle' }
      } else {
        if (c.block && f.ground) { f.block = true; f.state = 'block'; f.vx *= .8 }
        else {
          const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0)
          if (f.ground) f.vx = dir * spd; else if (dir) f.vx = dir * spd * .9
          f.state = !f.ground ? (f.vy < 0 ? 'jump' : 'fall') : dir ? 'walk' : 'idle'
          if (c.jump && f.ground) { f.vy = -760; f.ground = false; this.audio.play('jump'); this.em(f, f.x, f.y, 6, 120, { dir: -Math.PI / 2, spread: 3 }) }
          if (this.phase === 'fight') {
            if (c.ult && f.ult >= 100) this.start_(f, 'ult')
            else if (c.s1 && f.cd.s1 <= 0) this.start_(f, 's1')
            else if (c.s2 && f.cd.s2 <= 0) this.start_(f, 's2')
            else if (c.atk && f.cd.atk <= 0) this.start_(f, 'atk')
          }
        }
        if (!f.move) f.face = o.x >= f.x ? 1 : -1
      }
    } else if (!f.ko) { f.state = 'hit'; f.vx *= Math.pow(.02, d) }
    if (f.ko) f.vx *= Math.pow(.05, d)
    f.vy += GRAV * d; f.x += f.vx * d; f.y += f.vy * d
    if (f.y >= FLOOR) { if (!f.ground && f.vy > 400) this.em(f, f.x, FLOOR, 5, 100, { dir: -Math.PI / 2, spread: 3 }); f.y = FLOOR; f.vy = 0; f.ground = true }
    f.x = clamp(f.x, Math.max(50, this.cam.x + 40), Math.min(WORLD - 50, this.cam.x + this.vw - 40))
    const dx = o.x - f.x, min = (f.def.w + o.def.w) / 2
    if (Math.abs(dx) < min && Math.abs(o.y - f.y) < 80) f.x -= Math.sign(dx || 1) * (min - Math.abs(dx)) * .5
    f.x = clamp(f.x, Math.max(50, this.cam.x + 40), Math.min(WORLD - 50, this.cam.x + this.vw - 40))
  }

  private tryHit(f: Fx, o: Fx, m: Move) {
    if (o.ko) return
    const x0 = Math.min(f.x, f.x + f.face * m.range), x1 = Math.max(f.x, f.x + f.face * m.range)
    const y0 = m.h ? f.y - m.h : f.y - f.def.h * .85, y1 = m.h ? f.y : f.y - f.def.h * .1
    if (x0 < o.x + o.def.w / 2 && x1 > o.x - o.def.w / 2 && y0 < o.y && y1 > o.y - o.def.h) { f.hit = true; this.hitFn(f, o, m) }
  }

  private hitFn(a: Fx, d: Fx, m: Move) {
    const crit = Math.random() < .12
    let dmg = m.dmg * (a.def.atk / 75) * (crit ? 1.7 : 1)
    const blk = d.block && d.face === -a.face
    const cx = d.x, cy = d.y - d.def.h * .6
    if (blk) { dmg *= .12; d.vx = a.face * m.kb * .35; this.audio.play('block'); this.parts.emit(cx + -a.face * 20, cy, 8, { color: '#ffffff', speed: 300, size: 3, life: .3 }); this.texts.push({ x: cx, y: cy - 60, s: 'BLOCK', life: .8, c: '#93c5fd' }) }
    else {
      dmg *= 1 - d.def.def / 250
      d.stun = Math.min(.7, .22 + m.dmg * .012); d.move = null; d.vx = a.face * m.kb
      if (m.launch || m.kb >= 400) { d.vy = -(m.launch ? 520 : 300); d.ground = false }
      a.combo++; a.comboT = 1.3
      this.audio.play('hit'); this.em(a, cx, cy, 16, 320); this.shake(m.kb >= 400 ? 18 : 6)
      if (a.def.id === 'titan') this.rings.push({ x: d.x, y: FLOOR, r: 10, life: .35, c: '#a8a29e' })
      this.texts.push({ x: cx, y: cy - 50, s: (crit ? 'CRITICAL! -' : '-') + Math.round(dmg), life: 1, c: crit ? '#fde047' : '#ffffff' })
    }
    dmg = Math.round(dmg); d.hp = Math.max(0, d.hp - dmg)
    a.ult = Math.min(100, a.ult + dmg * .9 + 3); d.ult = Math.min(100, d.ult + dmg * .6)
    this.hitstop = blk ? .03 : .06
    if (d.hp <= 0) this.koFn(a, d)
  }

  private koFn(a: Fx, d: Fx) {
    if (this.phase !== 'fight') return
    d.ko = true; d.state = 'ko'; d.vy = -400; d.ground = false; d.vx = a.face * 350; d.move = null
    a.wins++; this.winner = a; this.phase = 'ko'; this.pt = 1.8
    this.audio.play('ko'); this.shake(24); this.flash = .4; this.em(d, d.x, d.y - 80, 50, 500)
  }

  private ai(f: Fx, o: Fx, d: number): Ctl {
    const s = f.ai, c = NEUTRAL(), dx = o.x - f.x, dist = Math.abs(dx)
    const toward = dx > 0 ? 'right' : 'left', away = dx > 0 ? 'left' : 'right'
    const reach = f.def.moves.atk.range + o.def.w / 2 - 10
    s.t -= d
    if (o.move && dist < 170 && s.act !== 'block' && Math.random() < .03) { s.act = 'block'; s.t = .5 }
    if (s.t <= 0) {
      const r = Math.random(), low = f.hp < f.def.hp * .25
      s.t = .15 + Math.random() * .35
      if (f.ult >= 100 && dist < 240) s.act = 'ult'
      else if (low && r < .45) s.act = 'retreat'
      else if (dist > reach) s.act = r < .1 ? 'jump' : r < .22 && f.cd.s1 <= 0 ? 's1' : r < .28 && f.cd.s2 <= 0 ? 's2' : 'approach'
      else s.act = r < .38 ? 'atk' : r < .52 && f.cd.s1 <= 0 ? 's1' : r < .66 && f.cd.s2 <= 0 ? 's2' : r < .8 ? 'block' : r < .9 ? 'retreat' : 'jump'
    }
    switch (s.act) {
      case 'approach': c[toward] = true; break
      case 'retreat': c[away] = true; break
      case 'block': c.block = true; break
      case 'jump': c.jump = true; c[toward] = true; s.act = 'approach'; break
      case 'atk': case 's1': case 's2': case 'ult': (c as any)[s.act] = true; s.act = 'idle'; s.t = .2; break
    }
    return c
  }

  // ---------- rendering ----------
  private tx(s: string, x: number, y: number, size: number, col = '#fff', al: CanvasTextAlign = 'center') {
    const g = this.g; g.font = `900 ${size}px system-ui,sans-serif`; g.textAlign = al; g.lineWidth = Math.max(2, size / 8); g.strokeStyle = '#000'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y)
  }

  private render() {
    const g = this.g
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cv.width, this.cv.height); g.save(); g.setTransform(this.s, 0, 0, this.s, this.ox, this.oy); g.beginPath(); g.rect(0, 0, this.vw, H); g.clip()
    const sk = this.cfg.settings.shake ? this.cam.shake : 0
    g.translate(this.vw / 2, H / 2); g.scale(this.cam.zoom, this.cam.zoom); g.translate(-this.vw / 2 + (Math.random() - .5) * sk, -H / 2 + (Math.random() - .5) * sk)
    const sky = g.createLinearGradient(0, 0, 0, FLOOR); sky.addColorStop(0, '#04040c'); sky.addColorStop(.6, '#1a0b3b'); sky.addColorStop(1, '#4a1250')
    g.fillStyle = sky; g.fillRect(-60, -60, this.vw + 120, FLOOR + 60)
    g.fillStyle = '#f0abfc33'; g.beginPath(); g.arc(720 - this.cam.x * .05, 120, 60, 0, 7); g.fill(); g.fillStyle = '#fbcfe8'; g.beginPath(); g.arc(720 - this.cam.x * .05, 120, 40, 0, 7); g.fill()
    for (const L of this.bg) {
      const ox = -this.cam.x * L.f
      for (const b of L.b) {
        const bx = b.x + ox; if (bx > this.vw + 20 || bx + b.w < -20) continue
        g.fillStyle = L.c; g.fillRect(bx, FLOOR - b.h, b.w, b.h)
        g.fillStyle = L.n; g.globalAlpha = .9; g.fillRect(bx, FLOOR - b.h, b.w, 2); g.globalAlpha = .55
        for (const [wx, wy] of b.win) g.fillRect(bx + wx, FLOOR - b.h + wy, 6, 8)
        g.globalAlpha = 1
      }
    }
    g.save(); g.translate(-this.cam.x, 0)
    const fl = g.createLinearGradient(0, FLOOR, 0, H); fl.addColorStop(0, '#1b1233'); fl.addColorStop(1, '#05050c')
    g.fillStyle = fl; g.fillRect(-10, FLOOR, WORLD + 20, H - FLOOR)
    g.strokeStyle = '#22d3ee55'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, FLOOR); g.lineTo(WORLD, FLOOR); g.stroke()
    g.strokeStyle = '#67e8f9'; g.lineWidth = 2; g.stroke()
    g.strokeStyle = '#a855f733'; g.lineWidth = 1; g.beginPath()
    for (let x = 0; x <= WORLD; x += 60) { g.moveTo(x, FLOOR); g.lineTo(x + (x - WORLD / 2) * .6, H) }
    g.stroke()
    for (const f of this.f) this.drawF(g, f)
    for (const r of this.rings) { g.globalAlpha = Math.max(0, r.life * 2); g.strokeStyle = r.c; g.lineWidth = 5; g.beginPath(); g.ellipse(r.x, r.y, r.r, r.r * .25, 0, 0, 7); g.stroke() }
    g.globalAlpha = 1
    this.parts.draw(g)
    for (const t of this.texts) { g.globalAlpha = Math.min(1, t.life * 2); this.tx(t.s, t.x, t.y, 22, t.c) }
    g.globalAlpha = 1
    g.restore()
    const ox = -this.cam.x * 1.4
    for (const x of [60, 620, 1180, 1700]) { g.fillStyle = '#04040a'; g.fillRect(x + ox, H - 46, 90, 46); g.fillStyle = '#22d3ee88'; g.fillRect(x + ox, H - 46, 90, 2) }
    g.restore()
    g.save(); g.setTransform(this.s, 0, 0, this.s, this.ox, this.oy); this.hud(); g.restore()
  }

  private drawF(g: CanvasRenderingContext2D, f: Fx) {
    const { w, h, c1, c2, id } = f.def, t = this.t, st = f.state
    g.save(); g.translate(f.x, f.y)
    g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(0, 3, w * .7, 8, 0, 0, 7); g.fill()
    g.scale(f.face, 1)
    if (f.ko) g.rotate(-1.35); else if (st === 'hit') g.rotate(-.18)
    const m = f.move, ph = f.mt ? clamp(1 - f.st / f.mt, 0, 1) : 0, ext = m ? Math.sin(ph * Math.PI) : 0
    const stride = st === 'walk' ? Math.sin(t * 14) * w * .3 : 0, bob = st === 'idle' ? Math.sin(t * 5) * 2 : 0, air = !f.ground
    const hipY = -h * .42, shY = -h * .78 + bob, headY = -h * .9 + bob
    if (st === 'ultimate') { g.fillStyle = c1 + '44'; g.beginPath(); g.arc(0, -h / 2, h * .8 + Math.sin(t * 30) * 6, 0, 7); g.fill() }
    g.lineCap = 'round'; g.strokeStyle = id === 'titan' ? '#4b5563' : '#161829'; g.lineWidth = w * .28
    g.beginPath(); g.moveTo(-w * .12, hipY); g.lineTo(-w * .12 - stride * .6 - (air ? w * .2 : 0), air ? -h * .18 : 0); g.moveTo(w * .12, hipY); g.lineTo(w * .12 + stride + (air ? w * .3 : 0), air ? -h * .24 : 0); g.stroke()
    g.fillStyle = id === 'titan' ? '#6b7280' : id === 'raven' ? '#1e1b3a' : '#27272a'; g.fillRect(-w * .4, shY, w * .8, hipY - shY + 8)
    g.fillStyle = c1; g.fillRect(-w * .4, hipY - 4, w * .8, 7)
    if (id === 'titan') { g.fillStyle = c2; g.fillRect(-w * .45, shY - 2, w * .25, 14); g.fillRect(w * .2, shY - 2, w * .25, 14) }
    g.strokeStyle = c2; g.lineWidth = w * .2
    g.beginPath(); g.moveTo(-w * .3, shY + 10); g.lineTo(-w * .5 - stride * .2, shY + h * .2); g.stroke()
    let fx = w * .5 + stride * .2, fy = shY + h * .22
    if (m) { fx = w * .3 + ext * m.range * .9; fy = shY + 12 - (f.mk === 's2' ? ext * h * .4 : 0) }
    else if (f.block) { fx = w * .55; fy = shY - 8 }
    else if (st === 'victory') { fx = w * .3; fy = -h * 1.1 + Math.sin(t * 8) * 8 }
    g.beginPath(); g.moveTo(w * .3, shY + 10); g.lineTo(fx, fy); g.stroke()
    g.fillStyle = c1; g.beginPath(); g.arc(fx, fy, w * .14 + (m ? ext * 8 : 0), 0, 7); g.fill()
    g.fillStyle = id === 'raven' ? '#0f0f1a' : '#e8b98f'; g.beginPath(); g.arc(w * .05, headY, w * .27, 0, 7); g.fill()
    if (id === 'kairo') { g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(w * .05, headY - 4, w * .28, Math.PI, 0); g.fill(); g.fillRect(-w * .24, headY - 4, w * .14, 14) }
    if (id === 'raven') { g.fillStyle = c1; g.fillRect(-w * .2, headY - 4, w * .5, 7) }
    if (id === 'titan') { g.fillStyle = '#78716c'; g.fillRect(-w * .24, headY - w * .3, w * .6, w * .22) }
    g.fillStyle = c2; g.fillRect(w * .15, headY - 2, 7, 4)
    g.restore()
  }

  private hud() {
    const g = this.g, [a, b] = this.f
    const BW = Math.min(400, (this.vw - 250) / 2)
    const bar = (f: Fx, x: number, right: boolean) => {
      const bw = BW, k = f.hp / f.def.hp
      this.tx(f.def.name, right ? x + bw : x, 20, 18, '#fff', right ? 'right' : 'left')
      g.fillStyle = '#000a'; g.fillRect(x, 26, bw, 20)
      const gr = g.createLinearGradient(x, 0, x + bw, 0); gr.addColorStop(0, f.def.c1); gr.addColorStop(1, f.def.c2); g.fillStyle = gr
      g.fillRect(right ? x + bw * (1 - k) : x, 26, bw * k, 20)
      g.strokeStyle = '#fff6'; g.strokeRect(x, 26, bw, 20)
      g.fillStyle = '#000a'; g.fillRect(x, 52, bw, 8); g.fillStyle = f.ult >= 100 ? (Math.sin(this.t * 12) > 0 ? '#fde047' : '#f97316') : '#38bdf8'
      g.fillRect(right ? x + bw * (1 - f.ult / 100) : x, 52, bw * f.ult / 100, 8)
      const cd = (n: number) => n > 0 ? n.toFixed(1) : 'OK'
      this.tx(`K ${cd(f.cd.s1)}   L ${cd(f.cd.s2)}${f.ult >= 100 ? '   ULT READY' : ''}`, right ? x + bw : x, 78, 13, '#cbd5e1', right ? 'right' : 'left')
      if (f.combo >= 2) this.tx(`${f.combo} HIT COMBO`, right ? x + bw : x, 130, 26, '#fde047', right ? 'right' : 'left')
    }
    bar(a, 30, false); bar(b, this.vw - 30 - BW, true)
    this.tx('ZHUU CLASH', this.vw / 2, 12, 11, '#67e8f9')
    this.tx(String(Math.max(0, Math.ceil(this.timer))), this.vw / 2, 50, 30)
    for (let i = 0; i < 2; i++) { g.fillStyle = a.wins > i ? a.def.c1 : '#fff3'; g.beginPath(); g.arc(this.vw / 2 - 24 - i * 18, 70, 6, 0, 7); g.fill(); g.fillStyle = b.wins > i ? b.def.c1 : '#fff3'; g.beginPath(); g.arc(this.vw / 2 + 24 + i * 18, 70, 6, 0, 7); g.fill() }
    const cy = H / 2 - 20
    if (this.phase === 'intro') {
      this.tx(`ROUND ${this.round}`, this.vw / 2, cy - 50, 34, '#67e8f9')
      this.tx(this.pt > .8 ? String(Math.ceil(this.pt - .8)) : 'FIGHT!', this.vw / 2, cy + 20, 80, '#fde047')
    } else if (this.phase === 'ko') this.tx('KO!', this.vw / 2, cy + 20, 110, '#ef4444')
    else if (this.phase === 'round' || this.phase === 'done') {
      this.tx('ROUND WIN', this.vw / 2, cy, 64, '#fde047'); this.tx(`${a.def.name} ${a.wins} - ${b.wins} ${b.def.name}`, this.vw / 2, cy + 44, 26)
    }
    if (this.flash > 0) { g.fillStyle = `rgba(255,255,255,${this.flash * .6})`; g.fillRect(0, 0, this.vw, H) }
  }
}
