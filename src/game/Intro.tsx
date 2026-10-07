import { useCallback, useEffect, useRef, useState } from 'react'
import { focusInput, setUi } from '../ui'
import { device } from './device'
import { setSize } from './helpers'
import { layout } from './layout'
import { Hit } from './shapes'
import { Label, layoutText } from './text'

/** Plays the how-to video once, with a Skip link; after it ends, any key or tap starts the game. */
export default function Intro() {
  const { GLOBALS, world } = layout
  const k = world.scale
  const dpr = GLOBALS.devicePixelRatio
  const [loaded, setLoaded] = useState(false)
  const [ended, setEnded] = useState(false)
  const started = useRef(false)

  const start = useCallback(() => {
    if (started.current) return
    started.current = true
    focusInput()
    setUi({ screen: 'game' })
  }, [])

  useEffect(() => {
    if (!ended) return
    document.addEventListener('keypress', start)
    window.addEventListener('touchstart', start)
    return () => {
      document.removeEventListener('keypress', start)
      window.removeEventListener('touchstart', start)
    }
  }, [ended, start])

  const scale =
    dpr >= 2 && device.desktop ? 1.4 : device.desktop ? 0.6 : screen.width === 900 ? 0.67 : screen.width >= 901 ? 0.9 : 0.8
  const skip = layoutText('Skip', world.width - 75, 60, {
    size: setSize(device.desktop && dpr < 2 ? 20 : 35),
    align: 'center',
    anchor: [0.5, 0.5],
  })
  const area = { width: skip.width + 60, height: skip.height + 60 }

  return (
    <>
      <video
        className="intro-video"
        src={`assets/videos/intro${device.desktop ? '-desktop' : ''}.mp4`}
        muted
        playsInline
        autoPlay
        onLoadedData={() => setLoaded(true)}
        onEnded={() => setEnded(true)}
        onClick={ended ? start : undefined}
        style={{ left: world.centerX * k, top: world.centerY * k, scale: scale * k, opacity: loaded ? 1 : 0 }}
      />
      <svg className="world overlay" width={world.width * k} height={world.height * k} viewBox={`0 0 ${world.width} ${world.height}`}>
        <Label layout={skip} opacity={0.4} />
        <Hit x={world.width - 70 - area.width / 2} y={60 - area.height / 2} {...area} onClick={start} label="Skip" />
      </svg>
    </>
  )
}
