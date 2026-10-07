import { enableAbout, getUi, setUi } from '../ui'
import { preload } from './assets'
import { device } from './device'
import { inputHandlers } from './engine'
import { layout, refreshLayout } from './layout'

/** Checks the browser, loads everything, then shows the title screen (the spinner shows until then). */
export function startGame() {
  const { browser } = layout.GLOBALS
  const version = browser.version ?? 0
  const supported =
    (browser.type === 'ie' && version > 10) ||
    (browser.type === 'ios' && version > 9) ||
    (browser.type === 'android' && version > 4) ||
    browser.type === 'safari' ||
    browser.type === 'chrome' ||
    browser.type === 'firefox'
  if (!supported) {
    setUi({ unsupported: true, help: false, overlay: false, badge: false })
    return
  }
  preload().then(() => {
    enableAbout()
    if (device.desktop) followResize()
    else followOrientation()
    setUi({ screen: 'title' })
  })
}

/** Desktop: lay the game out again after the window is resized (the original reloaded the page). */
function followResize() {
  let timer = 0
  window.addEventListener('resize', () => {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      refreshLayout()
      setUi({ layoutVersion: getUi().layoutVersion + 1 })
    }, 300)
  })
}

/** Phones are portrait only: sideways hides the game (and on the title screen the "?" and about overlay). */
function followOrientation() {
  let sideways = false
  const check = () => {
    const now = screen.orientation
      ? screen.orientation.type.startsWith('landscape')
      : matchMedia('(orientation: landscape)').matches
    if (now === sideways) return
    sideways = now
    const onTitle = getUi().screen === 'title'
    const { down, touch } = inputHandlers
    // Like the original: stop listening while sideways, and also listen to keypress/click/touchend once upright again.
    if (now) {
      setUi(onTitle ? { landscape: true, help: false, overlay: false } : { landscape: true })
      if (touch) window.removeEventListener('touchend', touch)
      if (down) for (const type of ['keypress', 'click']) document.removeEventListener(type, down)
    } else {
      setUi(onTitle ? { landscape: false, help: true, overlay: true } : { landscape: false })
      if (down) for (const type of ['keypress', 'click']) document.addEventListener(type, down)
      if (touch) window.addEventListener('touchend', touch)
    }
  }
  check()
  window.addEventListener('resize', check)
  screen.orientation?.addEventListener('change', check)
}
