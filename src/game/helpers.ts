// Helpers the original attached to its Phaser game object.
import { device } from './device'
import { layout } from './layout'

export const setStorageItem = (key: string, value: string | boolean) =>
  localStorage.setItem(key, String(value))

/** Resolves to the stored string, or false when it is missing or empty. Async on purpose: callers rely on the ordering. */
export const checkStorageItem = (key: string) =>
  new Promise<string | false>((resolve) => resolve(localStorage.getItem(key) || false))

export const clearStorageItems = (keys: string | string[]) =>
  new Promise<void>((resolve) => {
    for (const key of [keys].flat()) localStorage.removeItem(key)
    resolve()
  })

export const getQueryParam = (name: string) => new URLSearchParams(location.search).get(name)

/** Title and intro sizes grow on high-density desktop screens. */
export const setSize = (size: number) =>
  device.desktop && layout.GLOBALS.devicePixelRatio >= 2 ? size * (screen.height > 700 ? 1.5 : 1.3) : size
