// Phaser 2's easing curves, sampled into CSS linear() timing functions.

type Curve = (k: number) => number

const bounceOut: Curve = (k) => {
  if (k < 1 / 2.75) return 7.5625 * k * k
  if (k < 2 / 2.75) return 7.5625 * (k - 1.5 / 2.75) ** 2 + 0.75
  if (k < 2.5 / 2.75) return 7.5625 * (k - 2.25 / 2.75) ** 2 + 0.9375
  return 7.5625 * (k - 2.625 / 2.75) ** 2 + 0.984375
}

const curves = {
  linear: (k: number) => k,
  expoOut: (k: number) => (k === 1 ? 1 : 1 - 2 ** (-10 * k)),
  backIn: (k: number) => k * k * (2.70158 * k - 1.70158),
  bounceIn: (k: number) => 1 - bounceOut(1 - k),
  elasticOut: (k: number) => (k === 0 || k === 1 ? k : 2 ** (-10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1),
} satisfies Record<string, Curve>

export type Ease = keyof typeof curves

const sample = (f: Curve, n = 100) =>
  `linear(${Array.from({ length: n + 1 }, (_, i) => +f(i / n).toFixed(4)).join(', ')})`

export const EASE = Object.fromEntries(
  Object.entries(curves).map(([name, f]) => [name, name === 'linear' ? 'linear' : sample(f)]),
) as Record<Ease, string>

// Keyframes in styles.css use these as var(--ease-*).
for (const [name, value] of Object.entries(EASE)) document.documentElement.style.setProperty(`--ease-${name}`, value)
