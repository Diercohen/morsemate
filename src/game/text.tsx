// Text laid out exactly like Phaser 2 laid out its canvas text, then drawn as SVG <text>.
// The offscreen canvas below only measures; nothing on screen is drawn with it.
import type { CSSProperties } from 'react'

export const FONT_FAMILY = 'Poppins, Helvetica, Arial, sans-serif'

const measurer = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
const metricsCache = new Map<string, { ascent: number; descent: number }>()

const measure = (s: string, font: string) => {
  measurer.font = font
  return measurer.measureText(s).width
}

/** Width of a one-line Phaser text canvas (rounded up). */
export const textWidth = (s: string, font: string) => Math.ceil(measure(s, font))

/** Phaser's font metrics: scan a rendered '|MÉq' for its ink rows; the descent gets 6px of padding. */
function fontProperties(font: string) {
  let props = metricsCache.get(font)
  if (props) return props
  const canvas = measurer.canvas
  const width = Math.ceil(measure('|MÉq', font))
  const height = 2 * width
  const baseline = (width * 1.4) | 0
  canvas.width = width
  canvas.height = height
  measurer.fillStyle = '#f00'
  measurer.fillRect(0, 0, width, height)
  measurer.font = font
  measurer.textBaseline = 'alphabetic'
  measurer.fillStyle = '#000'
  measurer.fillText('|MÉq', 0, baseline)
  const data = measurer.getImageData(0, 0, width, height).data
  const inked = (row: number) => {
    for (let j = 0; j < width * 4; j += 4) if (data[row * width * 4 + j] !== 255) return true
    return false
  }
  let top = 0
  while (top < baseline && !inked(top)) top++
  let bottom = height
  while (bottom > baseline && !inked(bottom - 1)) bottom--
  props = { ascent: baseline - top, descent: bottom - baseline + 6 }
  metricsCache.set(font, props)
  return props
}

/** Phaser's greedy word wrap (Text.basicWordWrap), trailing spaces included. */
function wrap(text: string, font: string, wrapWidth: number) {
  const space = measure(' ', font)
  return text
    .split('\n')
    .map((line) => {
      let out = ''
      let spaceLeft = wrapWidth
      line.split(' ').forEach((word, j) => {
        const w = measure(word, font)
        if (w + space > spaceLeft) {
          if (j > 0) out += '\n'
          spaceLeft = wrapWidth - w
        } else {
          spaceLeft -= w + space
        }
        out += word + ' '
      })
      return out
    })
    .join('\n')
}

export interface TextStyle {
  size: number
  align?: 'left' | 'center'
  lineSpacing?: number
  /** Phaser addColor: [character index, color], counting characters across lines. */
  colors?: [number, string][]
  wrap?: number
  anchor?: [number, number]
  /** setTextBounds(0, 0, w, h) with centered, middle alignment. */
  bounds?: [number, number]
}

export interface TextLayout {
  lines: { text: string; x: number; y: number; start: number }[]
  left: number
  top: number
  width: number
  height: number
  font: string
  colors?: [number, string][]
}

/** Where Phaser would put this text: its box (left, top, width, height) and each line's baseline. */
export function layoutText(text: string, x: number, y: number, style: TextStyle): TextLayout {
  const font = `bold ${style.size}px ${FONT_FAMILY}`
  const { ascent, descent } = fontProperties(font)
  const perChar = !!style.colors?.length
  const lines = (style.wrap ? wrap(text, font, style.wrap) : text).split(/\r\n|\r|\n/)
  const trailingSpace = style.wrap ? measure(' ', font) : 0
  const widths = lines.map((line) => {
    // With per-character colors Phaser measured and drew one character at a time.
    const w = perChar ? Math.ceil([...line].reduce((sum, ch) => sum + measure(ch, font), 0)) : measure(line, font)
    return Math.ceil(w - trailingSpace)
  })
  const width = Math.max(...widths)
  const lineHeight = ascent + descent
  let spacing = style.lineSpacing ?? 0
  if (spacing < 0 && -spacing > lineHeight) spacing = -lineHeight
  const height = lineHeight * lines.length + (spacing > 0 ? spacing * lines.length : spacing * (lines.length - 1))

  const [ax, ay] = style.anchor ?? [0, 0]
  let left = x - ax * width
  let top = y - ay * height
  if (style.bounds) {
    left = x + style.bounds[0] / 2 - width / 2
    top = y + style.bounds[1] / 2 - height / 2
  }
  let start = 0
  return {
    lines: lines.map((line, i) => {
      const placed = {
        text: line,
        x: left + (style.align === 'center' ? (width - widths[i]) / 2 : 0),
        y: top + ascent + i * (lineHeight + spacing),
        start,
      }
      start += line.length
      return placed
    }),
    left,
    top,
    width,
    height,
    font,
    colors: style.colors,
  }
}

const perCharStyle: CSSProperties = { fontKerning: 'none', fontVariantLigatures: 'none' }

/** Draws a layoutText() result. `fill` is the color until the first addColor change. */
export function Label({
  layout,
  fill = '#000',
  opacity,
  style,
}: {
  layout: TextLayout
  fill?: string
  opacity?: number
  style?: CSSProperties
}) {
  const { lines, font, colors } = layout
  const colorAt = (index: number) => {
    let color = fill
    for (const [at, c] of colors ?? []) if (at <= index) color = c
    return color
  }
  return (
    <g style={{ opacity, ...style }}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={line.x}
          y={line.y}
          style={{ font, whiteSpace: 'pre', ...(colors ? perCharStyle : null) }}
          fill={colors ? undefined : fill}
        >
          {colors
            ? runs(line.text, line.start, colorAt).map(([run, color], j) => (
                <tspan key={j} fill={color}>
                  {run}
                </tspan>
              ))
            : line.text}
        </text>
      ))}
    </g>
  )
}

/** Splits a line into same-color runs. */
function runs(text: string, start: number, colorAt: (index: number) => string) {
  const out: [string, string][] = []
  ;[...text].forEach((ch, i) => {
    const color = colorAt(start + i)
    const last = out[out.length - 1]
    if (last && last[1] === color) last[0] += ch
    else out.push([ch, color])
  })
  return out
}
