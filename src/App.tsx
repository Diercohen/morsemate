import { useEffect } from 'react'
import { layout } from './game/layout'
import Stage from './game/Stage'
import MorseBoard from './MorseBoard'
import { inputRef, toggleAbout, useUi } from './ui'

const show = (visible: boolean) => ({ display: visible ? 'block' : 'none' })

/** The page: the game stage, and the original's HTML around it. */
export default function App() {
  const ui = useUi()
  const { isTouch } = layout.GLOBALS

  // The loader is static markup in index.html.
  useEffect(() => {
    document.body.classList.toggle('ready', ui.ready)
    if (ui.unsupported) document.getElementById('loader')!.style.display = 'none'
  }, [ui.ready, ui.unsupported])

  return (
    <>
      {/* First, so everything after it paints on top, as the page did over the original canvas. */}
      <Stage />
      <input
        id="input"
        ref={inputRef}
        type={ui.password ? 'password' : undefined}
        aria-label="morse code input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={ui.unsupported ? { display: 'none' } : undefined}
      />
      <div id="landscape" style={show(ui.landscape)}>
        Please rotate back to portrait mode.
      </div>
      <div id="fallback" style={show(ui.unsupported && !isTouch)}>
        This experiment is not availble on this browser. Try it on{' '}
        <a href="https://www.google.com/chrome/" target="_blank">
          Google Chrome
        </a>
        .
      </div>
      <div id="fallback-mobile" style={show(ui.unsupported && isTouch)}>
        Sorry, this experiment is not availble on this device or OS version.
      </div>
      <a id="button" style={show(ui.help)} onClick={toggleAbout}>
        {ui.about ? <img src="assets/images/close.svg" /> : '?'}
      </a>
      {ui.overlay && (
        <div id="overlay" className={ui.about ? 'open' : undefined}>
          <div className="wrapper">
            <div className="title">About</div>
            <p>
              We created this trainer to make the process of learning Morse code more fun and to encourage people to
              keep at it. Give it a try if you’ve set up Morse code for Gboard and are ready to learn Morse.
            </p>
            <p>
              This experiment is part of a larger project to support Morse code for accessible communication. Learn more
              about it at{' '}
              <a href="http://morse.withgoogle.com/" target="_blank">
                g.co/morse
              </a>
              .
            </p>
            <p>
              Built by Use All Five and
              <br />
              Google Creative Lab.
            </p>
            <img src="assets/images/badge.svg" />
          </div>
        </div>
      )}
      {ui.badge && <img className="desktop-badge" src="assets/images/badge.svg" />}
      {ui.keyboard && <MorseBoard onCommit={ui.keyboard} muted={ui.muted} />}
    </>
  )
}
