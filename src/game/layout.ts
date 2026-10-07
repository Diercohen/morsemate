// The original's layout numbers, in its game pixels. Computed at load, and again after a desktop resize.

export interface Browser {
  type?: 'ie' | 'safari' | 'chrome' | 'firefox' | 'ios' | 'android'
  version?: number | null
}

const detectBrowser = (isTouch: boolean): Browser => {
  const ua = window.navigator.userAgent
  const uv = navigator.vendor
  const msie = ua.indexOf('MSIE ')
  const trident = ua.indexOf('Trident/')
  const edge = ua.indexOf('Edge/')
  const rv = ua.indexOf('rv:')
  const safari = /^((?!chrome|android).)*safari/i.test(ua)
  const chrome = /Chrome/.test(ua) && /Google Inc/.test(uv)
  const firefox = ua.toLowerCase().indexOf('firefox') > -1
  const ios = /iP(hone|od|ad)/.test(ua)
  const android = ua.toLowerCase().match(/android\s([0-9.]*)/)
  const browser: Browser = {}

  if (msie > 0 || trident > 0 || edge > 0) {
    browser.type = 'ie'
    if (msie > 0) browser.version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    else if (trident > 0) browser.version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
    else browser.version = parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
  } else if (safari && !isTouch) {
    browser.type = 'safari'
  } else if (chrome && !isTouch) {
    browser.type = 'chrome'
  } else if (firefox && !isTouch) {
    browser.type = 'firefox'
  } else if (ios && isTouch) {
    const version = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)
    browser.type = 'ios'
    browser.version = version ? parseInt(version[1], 10) : null
  } else if (android && isTouch) {
    browser.type = 'android'
    browser.version = parseInt(android[1], 10)
  }
  return browser
}

function computeLayout() {
  const isTouch = 'ontouchstart' in document.documentElement
  const isLandscape = window.innerWidth > window.innerHeight
  // Desktop drew at 1x or 2x (other ratios, e.g. browser zoom, used to get a stray 800x600 canvas); phones use the real ratio.
  const dpr = isTouch ? window.devicePixelRatio : window.devicePixelRatio >= 2 ? 2 : 1

  // Canvas pixels left above the keyboard (on-screen Morse keyboard on desktop, Gboard on phones).
  const keyboardHeight = (() => {
    const ua = navigator.userAgent
    let ratio
    if (!isTouch && dpr >= 2) ratio = 0.34
    else if (!isTouch && screen.height >= 700) ratio = 0.34
    else if (isTouch && screen.width >= 768) ratio = 0.68
    else if (isTouch && screen.height >= 900) ratio = 0.68
    else if (isTouch && screen.height <= 600 && /iPad|iPhone|iPod/.test(ua)) ratio = 0.78
    else if (isTouch && screen.height <= 675 && /iPad|iPhone|iPod/.test(ua)) ratio = 0.74
    else if (isTouch && screen.height >= 700 && screen.height < 800 && dpr > 3) ratio = 0.85
    else if (isTouch && screen.height >= 700 && screen.height < 800) ratio = 0.79
    else ratio = 0.82
    const height = !isLandscape ? ratio : isTouch ? ratio / 1.7 : ratio
    return window.innerHeight * dpr - window.innerHeight * dpr * height
  })()

  // The game's size in its own pixels (the original canvas size).
  const viewport = (isHeight: boolean) => {
    const size = isHeight ? window.innerHeight : window.innerWidth
    if (!isTouch) return dpr >= 2 ? size * 2 : size
    if (!isLandscape) return size
    const aspect = (window.innerWidth * dpr) / (window.innerHeight * dpr)
    return isHeight ? window.innerWidth * aspect - (screen.width === 375 ? 0 : 500) : window.innerHeight * aspect
  }
  const width = viewport(false)
  const height = viewport(true)

  const getSize = (size: number) => (dpr >= 2 ? size : size / 2)

  return {
    GLOBALS: {
      isTouch,
      isLandscape,
      browser: detectBrowser(isTouch),
      devicePixelRatio: dpr,
      worldCenter: keyboardHeight * 0.55,
      worldTop: keyboardHeight * (isTouch ? 0.35 : window.innerHeight <= 900 ? 0.4 : 0.45),
    },
    /** The game area: its size in game pixels, and CSS pixels per game pixel. */
    world: { width, height, centerX: width / 2, centerY: height / 2, scale: !isTouch && dpr >= 2 ? 0.5 : 1 },
    app: {
      LEARNED_THRESHOLD: 2,
      howManyWordsToStart: 2,
      wordBrickSize: getSize(isTouch ? 225 : 250),
      wordLetterSize: getSize(125),
      spaceBetweenWords: getSize(isTouch ? 250 : 750),
      inactivityTimeout: 5000,
    },
    typography: { font: 'Poppins, Helvetica, Arial, sans-serif' },
    header: {
      letterSize: getSize(42),
      circleSize: getSize(50),
      topPosition: getSize(50),
    },
    hints: {
      hintOffset: getSize(0),
      hintSize: getSize(0.45),
      hintTextSize: getSize(isTouch ? 41 : 39),
    },
    animations: {
      SLIDE_START_DELAY: 300,
      SLIDE_END_DELAY: 400,
      SLIDE_TRANSITION: 400,
    },
  }
}

export type Layout = ReturnType<typeof computeLayout>

export let layout = computeLayout()
export const refreshLayout = () => {
  layout = computeLayout()
}
