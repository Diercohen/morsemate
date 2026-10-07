import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { useUi } from '../ui'
import { sheets } from './assets'
import { device } from './device'
import { Engine, type Hint, type Slot, type Tween } from './engine'
import { Hit, Sprite } from './shapes'
import { Label, layoutText, textWidth } from './text'

const CREAM = '#F1E4D4'
const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`
const transition = (property: string, t: Tween<unknown>) => (t.t ? `${property} ${t.t}` : undefined)

/** The playing screen. Each mount is one run of a level. */
export default function Game({ restarted, onRestart }: { restarted: boolean; onRestart: () => void }) {
  const [engine, setEngine] = useState<Engine | null>(null)
  useEffect(() => {
    const e = new Engine(restarted, onRestart)
    setEngine(e)
    e.start()
    return () => e.dispose()
    // One engine per mount: Stage remounts this component to restart a level.
  }, [])
  return engine && <Board engine={engine} />
}

function Board({ engine }: { engine: Engine }) {
  useSyncExternalStore(engine.subscribe, () => engine.version)
  const { world } = engine.c
  const words = engine.visibleWords()
  const track: CSSProperties = { translate: `${engine.trackX.v}px 0`, transition: transition('translate', engine.trackX) }
  // Hints stay put while the track slides; only the current and previous word's can be showing.
  const hintWords = engine.words.slice(Math.max(0, engine.currentWordIndex - 1), engine.currentWordIndex + 1)
  return (
    <>
      <g style={track}>
        {words.map((w) => (
          <rect
            key={w.id}
            className="fade-in"
            x={w.background!.x}
            width={w.background!.width}
            height={world.height}
            fill={hex(w.color)}
          />
        ))}
      </g>
      {device.desktop && <MuteButton engine={engine} />}
      <Header engine={engine} />
      <g style={track}>
        {words.map((w) => w.slots.map((slot, i) => <SlotView key={`${w.id}.${i}`} slot={slot} engine={engine} />))}
      </g>
      {hintWords.map((w) => w.hints.map((hint, i) => <HintView key={`${w.id}.${i}`} hint={hint} engine={engine} />))}
      {engine.complete && <Complete engine={engine} />}
    </>
  )
}

/** One character on the track: its pill (shown for the letter to type) and the letter. */
function SlotView({ slot, engine }: { slot: Slot; engine: Engine }) {
  const { app } = engine.c
  const letter = layoutText(slot.char.toUpperCase(), 0, 0, {
    size: app.wordLetterSize,
    align: 'center',
    anchor: [0.5, 0.5],
    colors: slot.cream ? [[0, CREAM]] : undefined,
  })
  return (
    <g transform={`translate(${slot.x} 0)`}>
      <g style={{ translate: `0 ${slot.y.v}px`, transition: transition('translate', slot.y) }}>
        <g className={slot.shakes ? `shake-${slot.shakes % 2}` : undefined}>
          <g className="fade-in">
            <circle
              className="scaled"
              r={app.wordBrickSize / 2}
              opacity={0.5}
              style={{ scale: slot.pill.v, transition: transition('scale', slot.pill) }}
            />
          </g>
          <g className="fade-in">
            <Label
              layout={letter}
              fill={slot.cream ? CREAM : '#000'}
              opacity={slot.alpha.v}
              style={{ transition: transition('opacity', slot.alpha) }}
            />
          </g>
        </g>
      </g>
    </g>
  )
}

/** A character's picture (animated once when shown) and its caption, below the typing spot. */
function HintView({ hint, engine }: { hint: Hint; engine: Engine }) {
  const { GLOBALS, hints } = engine.c
  const x = engine.typingX()
  const size = 500 * hints.hintSize
  const caption = layoutText(hint.name, x, GLOBALS.worldCenter + size + (GLOBALS.isTouch ? 20 : 30), {
    size: hints.hintTextSize,
    align: 'center',
    anchor: [0.5, 0.5],
    colors: hint.firstWhite ? [[0, '#FFFFFF'], [1, '#000000']] : [[1, '#000000']],
  })
  return (
    <>
      <g style={{ opacity: hint.image.v, transition: transition('opacity', hint.image) }}>
        <HintPicture
          key={hint.plays}
          hint={hint}
          x={x - size / 2}
          y={GLOBALS.worldCenter + (GLOBALS.isTouch ? hints.hintOffset : 0)}
          size={size}
        />
      </g>
      <Label layout={caption} opacity={hint.caption.v} style={{ transition: transition('opacity', hint.caption) }} />
    </>
  )
}

/** Plays the picture's frames once at 1.6 per second, like the original; stops when the letter is typed. */
function HintPicture({ hint, x, y, size }: { hint: Hint; x: number; y: number; size: number }) {
  const frames = sheets[hint.key]?.frames ?? 1
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!hint.plays || hint.stopped) return
    const id = setInterval(() => setFrame((f) => Math.min(f + 1, frames - 1)), 625)
    return () => clearInterval(id)
  }, [hint.plays, hint.stopped, frames])
  return <Sprite sheet={hint.key} frame={frame} x={x} y={y} size={size} />
}

function MuteButton({ engine }: { engine: Engine }) {
  const { muted } = useUi()
  const hiDpi = engine.c.GLOBALS.devicePixelRatio >= 2
  const position = hiDpi ? 40 : 20
  return (
    <Sprite sheet="mute" frame={muted ? 1 : 0} x={position} y={position} size={hiDpi ? 80 : 40} onClick={engine.toggleMute} />
  )
}

/** The progress row: one character per letter of the level, brighter as it's learned. Clicking it offers a reset. */
function Header({ engine }: { engine: Engine }) {
  const { chars, level, alpha, pulse } = engine.header
  if (!chars) return null
  const { GLOBALS, header, world } = engine.c
  const dpr = GLOBALS.devicePixelRatio
  const isTouch = GLOBALS.isTouch
  const textSize = (dpr < 2 ? header.letterSize * 1.2 : header.letterSize) - 10
  const step = (dpr < 2 ? header.letterSize * 1.18 : header.letterSize) - 9.8
  // Hand-tuned gaps for wide and narrow characters.
  const nudge = (i: number) =>
    level === '1'
      ? (i === 7 || i === 8 ? 4 : 0) + (i >= 13 && i < 22 ? 7 : 0) + (i === 22 ? 15 : i >= 23 ? 20 : 0)
      : level === '3'
        ? i === 15
          ? 15
          : i >= 16
            ? 27
            : 0
        : 0
  const letters = chars.map((ch, i) =>
    layoutText(ch.toUpperCase(), i * textSize + nudge(i), 0, {
      size: header.letterSize,
      align: 'center',
      bounds: [textSize, textSize],
      colors: [[0, '#fff']],
    }),
  )
  const first = letters[0]
  const last = letters[letters.length - 1]
  const rowWidth = last.left + last.width - first.left
  // Phaser centered the row using a width taken before its last letter was laid out, when that letter
  // still sat where its default font (bold 20pt Arial) had put it. Same measurement, same position.
  const staleLeft = (textSize - textWidth(chars[chars.length - 1].toUpperCase(), 'bold 20pt Arial')) / 2
  const centeredWidth = (chars.length - 1) * textSize + nudge(chars.length - 1) + staleLeft + last.width - first.left
  const ringsWidth = (chars.length - 1) * step + nudge(chars.length - 1)
  const middle = dpr >= 2 && !isTouch ? world.centerX / 2 : world.centerX
  // On 1x screens the original never got to shift the header (it crashed first), which is what centers it there.
  const headerX = dpr === 1 ? 0 : !isTouch ? world.centerX / (dpr >= 2 ? 2 : 6) : 0
  const ringsY = header.topPosition + (dpr >= 2 && isTouch ? -5 : isTouch ? 5 : dpr >= 2 ? 20 : 10)
  const resetX = dpr >= 2 && screen.width > 900 ? world.centerX / 2 : world.centerX
  return (
    <g transform={`translate(${headerX} 0)`}>
      <g transform={`translate(${middle - centeredWidth / 2} 0)`}>
        <g className="header-in" style={{ translate: `0 ${device.desktop ? header.topPosition : header.topPosition - 25}px` }}>
          {letters.map((layout, i) => (
            <Label key={chars[i]} layout={layout} opacity={alpha[chars[i]] ?? 0.2} />
          ))}
        </g>
      </g>
      <g transform={`translate(${middle - ringsWidth / 2} ${ringsY})`}>
        {chars.map((ch, i) => (
          <circle
            key={ch}
            className={`scaled${pulse.char === ch ? ` pulse-${pulse.n % 2}` : ''}`}
            cx={i * step + nudge(i)}
            r={header.circleSize / 2}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            style={{ scale: 0, opacity: 0 }}
          />
        ))}
      </g>
      <Hit
        x={resetX - rowWidth / 2}
        y={50}
        width={rowWidth}
        height={first.height}
        onClick={engine.clearProgress}
        label="Clear progress"
      />
    </g>
  )
}

/** The level-complete card, popping in; a click anywhere starts the next level. */
function Complete({ engine }: { engine: Engine }) {
  const { world, GLOBALS } = engine.c
  const sheet = sheets[device.desktop ? `level-${engine.complete}-desktop` : `level-${engine.complete}`]
  const size = !device.desktop || GLOBALS.devicePixelRatio >= 2 ? 1 : 0.5
  return (
    <>
      {sheet && (
        <image
          className="scaled pop"
          href={sheet.url}
          x={world.centerX - sheet.width / 2}
          y={world.centerY - sheet.height / 2}
          width={sheet.width}
          height={sheet.height}
          style={{ scale: size }}
        />
      )}
      <Hit x={0} y={0} width={world.width} height={world.height} onClick={engine.nextLevel} label="Next level" />
    </>
  )
}
