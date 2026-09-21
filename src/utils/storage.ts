export interface Settings { sfx: number; shake: boolean; quality: number; touch: boolean }
export interface Stats { selectedFighter: string; wins: number; losses: number; totalMatches: number }
const DS: Settings = { sfx: 0.6, shake: true, quality: 1, touch: true }
const DT: Stats = { selectedFighter: 'kairo', wins: 0, losses: 0, totalMatches: 0 }
const rd = <T,>(k: string, d: T): T => { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || '{}') } } catch { return d } }
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }
export const loadSettings = () => rd('nc_settings', DS)
export const saveSettings = (s: Settings) => wr('nc_settings', s)
export const loadStats = () => rd('nc_stats', DT)
export const saveStats = (s: Stats) => wr('nc_stats', s)
