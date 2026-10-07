import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { morseToEnglish } from './game/morse'

const DEBOUNCE = 2000 // ms of quiet before the typed symbol is committed
const DOT_KEYS = [190] // .
const DASH_KEYS = [189, 173, 16, 191] // - (Chrome), - (Firefox), Shift, /
const INK = '#231F20'
const WRONG = 'rgba(255, 65, 54, 0.8)'

const board: CSSProperties = {
  alignItems: 'stretch',
  background: '#E6E7E8',
  bottom: '0',
  display: 'flex',
  flexDirection: 'column',
  height: '25vh',
  left: '0',
  position: 'fixed',
  width: '100%',
}
const output: CSSProperties = {
  appearance: 'none',
  background: '#E6E7E8',
  border: 'none',
  bottom: '25vh',
  color: INK,
  fontSize: '4vh',
  fontWeight: '700',
  padding: '5px 0 0',
  textAlign: 'center',
  textTransform: 'uppercase',
  width: '100%',
  visibility: 'visible',
  verticalAlign: 'middle',
  pointerEvents: 'auto',
}
const buttonBox: CSSProperties = {
  background: '#E6E7E8',
  alignItems: 'flex-end',
  justifyContent: 'center',
  display: 'flex',
  height: '100%',
  padding: '15px 20px 25px 20px',
  width: 'calc(100% - 40px)',
}
const key: CSSProperties = {
  appearance: 'none',
  alignItems: 'center',
  background: '#fff',
  border: 'none',
  borderRadius: '10px',
  boxShadow: '0px 4px 0px #A1A2A2',
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
  fontSize: '7vh',
  outline: 'none',
  maxWidth: '100%',
  width: '250px',
}
const dotKey = { ...key, marginRight: '10px' }
const dashKey = { ...key, marginLeft: '10px' }
const dotMark: CSSProperties = { display: 'block', width: 36, height: 36, background: INK, borderRadius: '50%', pointerEvents: 'none' }
const dashMark: CSSProperties = { display: 'block', width: 55, height: 23, background: INK, pointerEvents: 'none' }

/**
 * Desktop stand-in for the phone's Morse keyboard: click the keys or press . and -.
 * After 2s without input the symbol is decoded, shown in the bar (∅ if unknown) and sent to onCommit.
 */
export default function MorseBoard({ onCommit, muted }: { onCommit: (letter: string) => void; muted: boolean }) {
  const [sounds] = useState(() => ({
    dot: new Audio('./assets/sounds/dot.mp3'),
    dash: new Audio('./assets/sounds/dash.mp3'),
  }))
  const out = useRef<HTMLInputElement>(null)
  const dot = useRef<HTMLButtonElement>(null)
  const dash = useRef<HTMLButtonElement>(null)
  const timers = useRef({ commit: 0, show: 0, hide: 0 })

  useEffect(() => {
    sounds.dot.muted = muted
    sounds.dash.muted = muted
  }, [sounds, muted])

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (DOT_KEYS.includes(e.keyCode)) dot.current?.click()
      else if (DASH_KEYS.includes(e.keyCode)) dash.current?.click()
    }
    window.addEventListener('keydown', onKeydown, false)
    const t = timers.current
    return () => {
      window.removeEventListener('keydown', onKeydown, false)
      clearTimeout(t.commit)
      clearTimeout(t.show)
      clearTimeout(t.hide)
    }
  }, [])

  // The bar is driven imperatively, as in the original: it shows the symbol being typed, then the result.
  const press = (e: MouseEvent<HTMLButtonElement>) => {
    const bar = out.current!
    const t = timers.current
    for (const sound of [sounds.dot, sounds.dash]) {
      sound.pause()
      sound.currentTime = 0
    }
    if (t.show) {
      // A result is showing: start a fresh symbol.
      bar.style.color = INK
      clearTimeout(t.show)
      clearTimeout(t.hide)
      t.show = t.hide = 0
      bar.value = ''
    }
    const button = e.currentTarget
    const isDot = button.id === 'dot'
    bar.value += isDot ? '•' : '-'
    void (isDot ? sounds.dot : sounds.dash).play()
    button.style.boxShadow = '0px 2px 0px #A1A2A2'
    button.style.background = '#F7F7F7'
    setTimeout(() => {
      button.style.boxShadow = '0px 4px 0px #A1A2A2'
      button.style.background = '#FFFFFF'
    }, 100)

    clearTimeout(t.commit)
    t.commit = setTimeout(() => {
      const symbol = bar.value
      if (!symbol) return
      const letter = morseToEnglish[symbol.replaceAll('•', '.')]
      t.show = setTimeout(() => {
        bar.style.color = letter ? INK : WRONG
        bar.value = letter || '∅'
        t.hide = setTimeout(() => (bar.value = ''), DEBOUNCE - 300)
      }, 0)
      bar.value = ''
      onCommit(letter || '')
    }, DEBOUNCE)
  }

  return (
    <div id="morseboard" style={board}>
      <input id="output" ref={out} style={output} readOnly tabIndex={-1} />
      <div id="button-box" style={buttonBox}>
        <button id="dot" ref={dot} style={dotKey} tabIndex={0} onClick={press}>
          <span style={dotMark} />
        </button>
        <button id="dash" ref={dash} style={dashKey} tabIndex={0} onClick={press}>
          <span style={dashMark} />
        </button>
      </div>
    </div>
  )
}
