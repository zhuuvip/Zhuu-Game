export type Act = 'left' | 'right' | 'jump' | 'block' | 'atk' | 's1' | 's2' | 'ult'
export const P1KEYS: Record<string, Act> = { a: 'left', d: 'right', w: 'jump', s: 'block', j: 'atk', k: 's1', l: 's2', u: 'ult' }
export const P2KEYS: Record<string, Act> = { arrowleft: 'left', arrowright: 'right', arrowup: 'jump', arrowdown: 'block', '1': 'atk', '2': 's1', '3': 's2', '4': 'ult' }
export class Input {
  held: Partial<Record<Act, boolean>> = {}
  pressed: Partial<Record<Act, boolean>> = {}
  private kd?: (e: KeyboardEvent) => void
  private ku?: (e: KeyboardEvent) => void
  set(a: Act, v: boolean) { if (v && !this.held[a]) this.pressed[a] = true; this.held[a] = v }
  take(a: Act) { const p = !!this.pressed[a]; this.pressed[a] = false; return p }
  clear() { this.held = {}; this.pressed = {} }
  attach(map: Record<string, Act>) {
    this.kd = e => { const a = map[e.key.toLowerCase()]; if (a) { e.preventDefault(); this.set(a, true) } }
    this.ku = e => { const a = map[e.key.toLowerCase()]; if (a) { e.preventDefault(); this.set(a, false) } }
    window.addEventListener('keydown', this.kd); window.addEventListener('keyup', this.ku)
  }
  detach() { if (this.kd) window.removeEventListener('keydown', this.kd); if (this.ku) window.removeEventListener('keyup', this.ku); this.clear() }
}
