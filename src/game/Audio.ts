export class AudioManager {
  ctx: AudioContext | null = null
  vol = 0.6
  private c() {
    if (!this.ctx) { try { const A = window.AudioContext || (window as any).webkitAudioContext; this.ctx = new A() } catch { /* no audio */ } }
    return this.ctx
  }
  tone(f: number, d: number, type: OscillatorType = 'square', v = 0.2, slide = 0) {
    const c = this.c(); if (!c || this.vol <= 0) return
    try {
      if (c.state === 'suspended') c.resume()
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime
      o.type = type; o.frequency.setValueAtTime(f, t)
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d)
      g.gain.setValueAtTime(v * this.vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d)
      o.connect(g); g.connect(c.destination); o.start(); o.stop(t + d)
    } catch { /* ignore */ }
  }
  play(n: string) {
    switch (n) {
      case 'menu': this.tone(600, .08, 'sine'); break
      case 'button': this.tone(440, .08, 'triangle'); break
      case 'punch': this.tone(180, .1, 'square', .3, -100); break
      case 'kick': this.tone(140, .12, 'square', .3, -80); break
      case 'hit': this.tone(120, .14, 'sawtooth', .35, -60); break
      case 'block': this.tone(900, .06, 'triangle', .25); break
      case 'jump': this.tone(300, .12, 'sine', .2, 300); break
      case 'skill': this.tone(500, .25, 'sawtooth', .25, 600); break
      case 'ultimate': this.tone(80, .8, 'sawtooth', .4, 400); break
      case 'ko': this.tone(200, .9, 'sawtooth', .4, -150); break
      case 'victory': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, .25, 'triangle', .3), i * 140)); break
      case 'defeat': this.tone(300, .7, 'triangle', .3, -200); break
    }
  }
}
