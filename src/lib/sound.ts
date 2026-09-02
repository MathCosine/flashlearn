/**
 * Tiny synthesized sound effects — no audio files to host, and muting is
 * remembered per browser.
 */

const STORAGE_KEY = 'flashlearn:muted'

let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    context = new Ctor()
  }
  return context
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
  } catch {
    // Storage can be unavailable (private mode); sound just won't persist.
  }
}

function tone(frequency: number, startAt: number, duration: number, gain = 0.06) {
  const ctx = getContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  amp.gain.setValueAtTime(0, ctx.currentTime + startAt)
  amp.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.01)
  amp.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + startAt + duration,
  )
  osc.connect(amp).connect(ctx.destination)
  osc.start(ctx.currentTime + startAt)
  osc.stop(ctx.currentTime + startAt + duration + 0.02)
}

function play(notes: [number, number, number][]) {
  if (isMuted()) return
  const ctx = getContext()
  if (!ctx) return
  // Browsers start the context suspended until a user gesture.
  if (ctx.state === 'suspended') void ctx.resume()
  notes.forEach(([freq, start, dur]) => tone(freq, start, dur))
}

export const sounds = {
  correct: () => play([[660, 0, 0.1], [880, 0.07, 0.12]]),
  wrong: () => play([[220, 0, 0.16]]),
  flip: () => play([[440, 0, 0.05]]),
  match: () => play([[784, 0, 0.08], [1047, 0.06, 0.1]]),
  finish: () =>
    play([
      [523, 0, 0.1],
      [659, 0.09, 0.1],
      [784, 0.18, 0.18],
    ]),
  tick: () => play([[330, 0, 0.04]]),
}
