import { loadSounds } from './sound'

// Picture hints are 500x500 frames: [character, file, frames].
const hintSheets: [string, string, number][] = [
  ['a', 'letters/Archery', 3], ['b', 'letters/Banjo', 5], ['c', 'letters/Candy', 5], ['d', 'letters/Dog', 4],
  ['e', 'letters/Eye', 2], ['f', 'letters/Firetruck', 5], ['g', 'letters/Giraffe', 4], ['h', 'letters/Hippo', 5],
  ['i', 'letters/Insect', 3], ['j', 'letters/Jet', 5], ['k', 'letters/Kite', 4], ['l', 'letters/Laboratory', 5],
  ['m', 'letters/Mustache', 3], ['n', 'letters/Net', 3], ['o', 'letters/Orchestra', 4], ['p', 'letters/Paddle', 5],
  ['q', 'letters/Quarterback', 5], ['r', 'letters/Robot', 4], ['s', 'letters/Submarine', 4], ['t', 'letters/Tape', 2],
  ['u', 'letters/Unicorn', 4], ['v', 'letters/Vacuum', 5], ['w', 'letters/Wand', 4], ['x', 'letters/X-ray', 5],
  ['y', 'letters/Yard', 5], ['z', 'letters/Zebra', 5],
  ['0', 'numbers/Zero', 6], ['1', 'numbers/One', 6], ['2', 'numbers/Two', 6], ['3', 'numbers/Three', 6],
  ['4', 'numbers/Four', 6], ['5', 'numbers/Five', 6], ['6', 'numbers/Six', 6], ['7', 'numbers/Seven', 6],
  ['8', 'numbers/Eight', 6], ['9', 'numbers/Nine', 6],
  ['.', 'punctuation/AAA', 7], [',', 'punctuation/GW', 7], ['?', 'punctuation/UD', 7], ["'", 'punctuation/JN', 7],
  ['!', 'punctuation/CM', 7], ['/', 'punctuation/DN', 6], ['&', 'punctuation/AS', 6], [':', 'punctuation/OS', 7],
  [';', 'punctuation/NNN', 7], ['=', 'punctuation/DA', 6], ['+', 'punctuation/AR', 6], ['-', 'punctuation/DU', 7],
  ['_', 'punctuation/UK', 7], ['@', 'punctuation/AC', 7], ['(', 'punctuation/KN', 6], [')', 'punctuation/KK', 7],
  ['"', 'punctuation/RR', 7],
]

export interface Sheet {
  url: string
  frame: number // frame width and height
  frames: number
  width: number // whole image
  height: number
}

/** Spritesheets and images by key; sizes are filled in by preload(). */
export const sheets: Record<string, Sheet> = {}
const sheet = (key: string, url: string, frame: number, frames: number) =>
  (sheets[key] = { url, frame, frames, width: frame, height: frame })

for (const [key, file, frames] of hintSheets) sheet(key, `assets/images/icons/${file}.png`, 500, frames)
sheet('mute', 'assets/images/mute.png', 80, 2)
for (const level of ['1', '2', '3']) {
  sheet(`level-${level}`, `assets/images/level-${level}.png`, 0, 1)
  sheet(`level-${level}-desktop`, `assets/images/level-${level}-desktop.png`, 0, 1)
}

/** The caption under a hint picture is its file name: "X-ray" reads "X ray". */
export const hintName = (char: string) => {
  const file = hintSheets.find(([key]) => key === char)?.[1] ?? ''
  return file.slice(file.lastIndexOf('/') + 1).replace('-', ' ').replace('-', ' ')
}

/** Loads everything the game shows, like the original's preload, so nothing pops in later. */
export async function preload() {
  await Promise.allSettled([
    ...Object.values(sheets).map(async (s) => {
      const img = new Image()
      img.src = s.url
      await img.decode()
      s.width = img.naturalWidth
      s.height = img.naturalHeight
      if (!s.frame) s.frame = img.naturalWidth
    }),
    ...['assets/images/close.svg', 'assets/images/badge.svg', 'assets/videos/intro.mp4', 'assets/videos/intro-desktop.mp4'].map(
      (url) => fetch(url).then((r) => r.blob()),
    ),
    loadSounds(),
    document.fonts.load(`bold 50px Poppins`),
    document.fonts.load(`600 50px Poppins`),
  ])
}
