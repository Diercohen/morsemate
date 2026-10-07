import { createRef, useSyncExternalStore } from 'react'
import { device } from './game/device'
import { layout } from './game/layout'

/** Page state the game changes; React renders it. Most flags replace a `style.display`/class toggle in the original. */
export interface Ui {
  screen: 'loading' | 'title' | 'intro' | 'game'
  layoutVersion: number // bumped when a desktop resize recomputes the layout
  ready: boolean // title screen is up: loader hides, red cover fades (body.ready)
  unsupported: boolean // browser check failed: fallback message instead of the game
  landscape: boolean // phone held sideways: "rotate back" message
  help: boolean // "?" button
  badge: boolean // desktop badge
  overlay: boolean // about overlay is in the page
  about: boolean // about overlay is open
  password: boolean // Android: hidden input is type=password
  muted: boolean
  keyboard: ((letter: string) => void) | null // desktop on-screen morse keyboard, and who gets its letters
}

const hidden = layout.GLOBALS.isLandscape && layout.GLOBALS.isTouch
let ui: Ui = {
  screen: 'loading',
  layoutVersion: 0,
  ready: false,
  unsupported: false,
  landscape: false,
  help: !hidden,
  badge: !hidden,
  overlay: true,
  about: false,
  password: layout.GLOBALS.isTouch && device.android,
  muted: false,
  keyboard: null,
}
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getUi = () => ui
export function setUi(patch: Partial<Ui>) {
  ui = { ...ui, ...patch }
  listeners.forEach((l) => l())
}
export const useUi = () => useSyncExternalStore(subscribe, getUi)

/** The hidden input the phone's Morse keyboard (Gboard) types into. */
export const inputRef = createRef<HTMLInputElement>()
export const focusInput = () => inputRef.current?.focus()

// The original wired "?" to a helper that only existed once the game had loaded; clicks before that did nothing.
let aboutReady = false
export function enableAbout() {
  aboutReady = true
  if (location.hash === '#about') toggleAbout()
}
export function toggleAbout() {
  if (!aboutReady) return
  const about = !ui.about
  location.hash = about ? '#about' : ''
  setUi({ about })
}
