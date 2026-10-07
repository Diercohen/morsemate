import { useEffect, useState } from 'react'
import { focusInput, setUi, toggleAbout } from '../ui'
import { device } from './device'
import { checkStorageItem, setSize } from './helpers'
import { layout } from './layout'
import { Hit, RoundedRect } from './shapes'
import { Label, layoutText } from './text'

const CREAM = '#F1E4D4'

/** Desktop: big title and links. Phone: setup steps for the Gboard Morse keyboard. */
export default function Title() {
  const [introSeen, setIntroSeen] = useState(false)
  useEffect(() => {
    checkStorageItem('intro').then((seen) => setIntroSeen(seen === 'true'))
    const id = setTimeout(() => setUi({ ready: true }), 300)
    return () => clearTimeout(id)
  }, [])
  // Leaving the title screen: the "?" button, badge and about overlay go away for good.
  const start = () => {
    if (introSeen) focusInput()
    setUi({ help: false, badge: false, overlay: false, screen: introSeen ? 'game' : 'intro' })
  }
  return device.desktop ? <DesktopTitle onStart={start} /> : <PhoneTitle onStart={start} />
}

function DesktopTitle({ onStart }: { onStart: () => void }) {
  const { GLOBALS, world } = layout
  const { centerX, centerY } = world
  const dpr = GLOBALS.devicePixelRatio
  const { isTouch } = GLOBALS
  const tall = dpr >= 2 && window.innerHeight >= 1000
  const shortLowDpi = !isTouch && window.innerHeight < 850 && dpr === 1
  const shortHiDpi = !isTouch && window.innerHeight < 700 && dpr >= 2
  const mainFontSize = tall || isTouch ? 170 : shortLowDpi ? 100 : shortHiDpi ? 110 : 130
  const smallFontSize = tall || isTouch ? 35 : shortLowDpi || shortHiDpi ? 20 : 25
  const titleOffset = tall && !isTouch ? -300 : shortLowDpi ? -160 : shortHiDpi ? -170 : -230
  const ctaOffset = tall && !isTouch ? 50 : !isTouch ? 1 : 150
  const startButtonOffset = tall && !isTouch ? 300 : shortLowDpi ? 200 : !isTouch ? 220 : 350

  const titleY = centerY + setSize(titleOffset)
  const title = layoutText('Morse\nTyping\nTrainer', centerX, titleY, {
    size: setSize(mainFontSize),
    align: 'center',
    lineSpacing: -40,
    anchor: [0.5, 0.5],
  })
  const gboardY = centerY + setSize(startButtonOffset) + 30
  const gboard = layoutText('Get setup on your phone', centerX, gboardY, {
    size: setSize(smallFontSize),
    align: 'center',
    anchor: [0.5, 0.5],
  })
  const pillHeight = dpr >= 2 ? 120 : 75
  const pillWidth = gboard.width * 1.5
  const startY = centerY + setSize(startButtonOffset) + (dpr >= 2 ? 155 : 100)
  const start = layoutText('Play a demo on desktop.', centerX, startY, {
    size: setSize(smallFontSize),
    align: 'center',
    anchor: [0.5, 0.5],
  })
  const cta = layoutText(
    "We created this trainer to make\nlearning Morse code easier. It’s\nmeant to be played on Android or iOS\nusing Gboard. Here's why.",
    centerX,
    centerY + ctaOffset + 50,
    { size: setSize(smallFontSize), align: 'center', lineSpacing: -5, anchor: [0.5, 0] },
  )
  const underline = dpr >= 2 ? 3 : 1.5

  return (
    <>
      <circle className="scaled pop-late" cx={centerX} cy={titleY} r={(setSize(mainFontSize) * 3.5) / 2} opacity={0.4} />
      <Label layout={title} fill={CREAM} />
      <RoundedRect x={centerX - pillWidth / 2} y={gboardY - pillHeight / 2} width={pillWidth} height={pillHeight} radius={25} opacity={0.3} />
      <Label layout={gboard} fill={CREAM} />
      <Label layout={start} fill={CREAM} />
      <Label layout={cta} fill={CREAM} />
      {/* Underlines under "Here's why." and the start link. */}
      <rect x={centerX + cta.width * 0.04} y={cta.top + cta.height - 12} width={cta.width * 0.31} height={underline} fill={CREAM} />
      <rect
        x={centerX - start.width / 2}
        y={startY + start.height - (dpr >= 2 && window.innerHeight >= 850 ? 40 : 25)}
        width={start.width}
        height={underline}
        fill={CREAM}
      />
      <Hit x={centerX - cta.width / 2} y={cta.top} width={cta.width} height={cta.height} onClick={toggleAbout} label="About this trainer" />
      <Hit
        x={centerX - pillWidth / 2}
        y={gboardY - pillHeight / 2}
        width={pillWidth}
        height={pillHeight}
        href="https://experiments.withgoogle.com/collection/morse"
        label="Get setup on your phone"
      />
      <Hit x={centerX - start.width / 2} y={startY - 25} width={start.width} height={start.height} onClick={onStart} label="Play a demo on desktop" />
    </>
  )
}

function PhoneTitle({ onStart }: { onStart: () => void }) {
  const { world } = layout
  const { centerX, centerY } = world
  const wrap = world.width * 0.8
  const introY = device.android ? centerY + 35 : centerY
  const intro = layoutText(
    'Morse Typing Trainer\n\nThis is a companion trainer to Morse for Gboard to help you learn Morse code.\n\nYou’ll need to setup the Morse keyboard to play.\n\nStep 1:\n\nStep 2:\n\nStep 3:',
    centerX,
    introY,
    { size: 50, align: 'left', lineSpacing: -5, anchor: [0.5, 0.5], wrap, colors: [[20, '#8c2925']] },
  )
  const step = (label: string, dx: number, dy: number) => {
    const text = layoutText(label, centerX + dx, introY + dy, { size: 45, align: 'left', anchor: [0.5, 0], wrap })
    const width = text.width * 1.3
    const height = text.height * 1.5
    return { label, text, x: centerX + dx, pill: { x: centerX + dx - width / 2, y: text.top - height / 6, width, height } }
  }
  const steps = [step('Get GBoard', 30, 125), step('Enable Morse', 55, 250), step('Learn Morse!', 55, 375)]
  const links = [
    device.iOS
      ? 'https://itunes.apple.com/us/app/gboard/id1091700242?mt%3D8'
      : 'https://play.google.com/store/apps/details?id=com.google.android.inputmethod.latin',
    device.iOS
      ? 'https://support.google.com/accessibility/android/answer/9011881?co=GENIE.Platform%3DiOS&oco=0'
      : 'https://support.google.com/accessibility/android/answer/9011881',
  ]

  return (
    <>
      <Label layout={intro} fill={CREAM} />
      {steps.map(({ label, text, x, pill }, i) => {
        // The original sized step 2's tap area from step 1's pill.
        const area = steps[i === 1 ? 0 : i].pill
        return (
          <g key={label}>
            <RoundedRect x={pill.x} y={pill.y} width={pill.width} height={pill.height} radius={150} opacity={0.4} />
            <Label layout={text} fill={CREAM} />
            <Hit
              x={x - area.width / 2}
              y={text.top - 20}
              width={area.width}
              height={area.height}
              label={label}
              href={links[i]}
              onClick={i === 2 ? onStart : undefined}
            />
          </g>
        )
      })}
    </>
  )
}
