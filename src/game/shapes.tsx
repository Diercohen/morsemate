import type { SVGProps } from 'react'
import { sheets } from './assets'

/** An invisible clickable area (the original used invisible Phaser buttons). Links open in a new tab. */
export function Hit({
  x,
  y,
  width,
  height,
  label,
  onClick,
  href,
}: {
  x: number
  y: number
  width: number
  height: number
  label: string
  onClick?: () => void
  href?: string
}) {
  const area = <rect x={x} y={y} width={width} height={height} fill="transparent" />
  if (href) {
    return (
      <a href={href} target="_blank" aria-label={label}>
        {area}
      </a>
    )
  }
  return (
    <a role="button" tabIndex={0} aria-label={label} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      {area}
    </a>
  )
}

/** One frame of a spritesheet (frames run left to right, top to bottom), drawn `size` wide. */
export function Sprite({
  sheet: key,
  frame = 0,
  x,
  y,
  size,
  onClick,
}: {
  sheet: string
  frame?: number
  x: number
  y: number
  size: number
  onClick?: () => void
}) {
  const sheet = sheets[key]
  if (!sheet) return null
  const columns = Math.max(1, Math.floor(sheet.width / sheet.frame))
  const fx = (frame % columns) * sheet.frame
  const fy = Math.floor(frame / columns) * sheet.frame
  return (
    <svg x={x} y={y} width={size} height={size} viewBox={`${fx} ${fy} ${sheet.frame} ${sheet.frame}`} onClick={onClick}>
      <image href={sheet.url} width={sheet.width} height={sheet.height} />
    </svg>
  )
}

/** Phaser's rounded rectangle: quadratic corners, radius capped at half the shorter side. */
export function RoundedRect({
  x,
  y,
  width: w,
  height: h,
  radius,
  ...rest
}: { x: number; y: number; width: number; height: number; radius: number } & SVGProps<SVGPathElement>) {
  const max = (Math.min(w, h) / 2) | 0
  const r = radius > max ? max : radius
  const d =
    `M${x} ${y + r}L${x} ${y + h - r}Q${x} ${y + h} ${x + r} ${y + h}L${x + w - r} ${y + h}` +
    `Q${x + w} ${y + h} ${x + w} ${y + h - r}L${x + w} ${y + r}Q${x + w} ${y} ${x + w - r} ${y}` +
    `L${x + r} ${y}Q${x} ${y} ${x} ${y + r}Z`
  return <path d={d} {...rest} />
}
