# Zhuu-05 VOID

A browser-based 2D stickman fighting game set in a dark void dimension, featuring neon-glowing stickman fighters, particle-heavy combat, and procedural audio.

## How to Run Locally

Just open `index.html` in any modern browser — no server needed.

Or for the Vite dev build:
```
npm install
npm run dev
```

## How to Deploy to Vercel

1. Run `npm run build` to generate the `dist/` folder
2. Go to vercel.com → New Project → drag and drop the project folder
3. Vercel auto-detects Vite — click Deploy

Or use Vercel CLI:
```
npm i -g vercel
vercel
```

## Controls

### Player 1 (Keyboard)
| Key | Action |
|-----|--------|
| A / D | Move Left / Right |
| W | Jump |
| S | Crouch |
| Z | Attack (combo chain) |
| X | Special Move 1 |
| C | Special Move 2 |
| Q | Block |
| X + C | Ultimate (when meter is full) |

### Player 2 (Keyboard — 2 Player mode)
| Key | Action |
|-----|--------|
| ← → | Move Left / Right |
| ↑ | Jump |
| ↓ | Crouch |
| Numpad 1 | Attack |
| Numpad 2 | Special Move 1 |
| Numpad 3 | Special Move 2 |
| Numpad 0 | Block |

### Mobile Controls
Virtual D-pad on the bottom-left, action buttons on the bottom-right. Fully touch-enabled.

## Characters

### VOID REAPER
- **Aura:** Cyan glow, black void energy
- **Special 1 — VOID TENDRIL:** Spawns anti-matter pillar at range
- **Special 2 — DARK PULSE:** Twin void pillars with energy burst
- **Ultimate — VOID COLLAPSE:** 5 successive anti-matter pillars erupt across the stage

### ZERO PHANTOM
- **Aura:** Electric blue, ice white
- **Special 1 — ICE DRAGON:** Icy spirit projectile with frost burst
- **Special 2 — FROST WAVE:** Twin ice lances and void explosion
- **Ultimate — PHANTOM SURGE:** Ice dragon charges through the entire screen

### EMBER VOID
- **Aura:** Fire-red, void orange
- **Special 1 — FLAME BURST:** Explosive fire pillar
- **Special 2 — VOID EMBER:** Dual fire-void pillars with flame burst
- **Ultimate — VOID INFERNO:** Screen-filling fire void eruption

## Game Modes

- **VS CPU** — Fight the AI at 3 difficulties: Void Initiate, Void Knight, Void God
- **2 Player** — Local co-op on the same keyboard

## Game Rules

- Best of 3 rounds, 60 seconds per round
- Combo chain up to 3 hits, special meter fills on hits
- Block reduces damage by 85%
- Ultimate requires full special meter (100%)
- Timer runout: player with more HP wins the round
