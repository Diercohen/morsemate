// The hint sounds (dot and dash), played through Web Audio like Phaser did so they can overlap.
import { setUi } from '../ui'

type Name = 'dot' | 'dash'

const context = new AudioContext()
const output = context.createGain()
output.connect(context.destination)
const buffers: Partial<Record<Name, AudioBuffer>> = {}

// Browsers start audio suspended until the first user gesture.
for (const type of ['pointerdown', 'touchend', 'keydown']) {
  window.addEventListener(type, () => void context.resume(), { capture: true })
}

export async function loadSounds() {
  await Promise.allSettled(
    (['dot', 'dash'] as const).map(async (name) => {
      const data = await (await fetch(`assets/sounds/${name}.mp3`)).arrayBuffer()
      buffers[name] = await context.decodeAudioData(data)
    }),
  )
}

export function playSound(name: Name) {
  const buffer = buffers[name]
  if (!buffer) return
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(output)
  source.start()
}

/** Mutes the hint sounds and (through the UI store) the desktop keyboard's clicks. */
export function setMuted(muted: boolean) {
  output.gain.value = muted ? 0 : 1
  setUi({ muted })
}
