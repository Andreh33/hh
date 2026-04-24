export function playReminderSound(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()

    function tone(freq: number, start: number, duration: number, vol: number) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration + 0.1)
    }

    // Acorde suave C mayor arpeggio
    tone(523.25, 0.0, 0.7, 0.22)
    tone(659.25, 0.2, 0.7, 0.18)
    tone(783.99, 0.4, 0.9, 0.14)
    tone(1046.5, 0.6, 1.0, 0.10)
  } catch {
    // Audio no disponible
  }
}
