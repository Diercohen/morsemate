// The OS checks Phaser made (Device._checkOS). The game picks its desktop or phone layout from these.
const ua = navigator.userAgent
const windowsPhone = /Windows Phone/i.test(ua) || /IEMobile/i.test(ua)
let android = false
let iOS = false
let desktop = false

if (/Playstation Vita/.test(ua) || /Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua)) {
  // consoles and Kindles: neither
} else if (/Android/.test(ua)) android = true
else if (/CrOS/.test(ua)) desktop = true
else if (/iP[ao]d|iPhone/i.test(ua)) iOS = true
else if (/Linux/.test(ua)) desktop = !/Silk/.test(ua)
else if (/Mac OS/.test(ua) || /Windows/.test(ua)) desktop = true

if (windowsPhone) android = iOS = false
if (windowsPhone || (/Windows NT/i.test(ua) && /Touch/i.test(ua))) desktop = false

export const device = { desktop, android, iOS }
