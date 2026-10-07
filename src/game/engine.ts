// The game's logic (word picking, scoring, hints, levels), ported from the original's GameSpace, Word
// and HeaderSpace. Instead of moving Phaser objects it updates a view model that Game.tsx renders.
import { focusInput, getUi, inputRef, setUi } from '../ui'
import { hintName } from './assets'
import { device } from './device'
import { EASE, type Ease } from './ease'
import { checkStorageItem, clearStorageItems, getQueryParam, setStorageItem } from './helpers'
import { layout } from './layout'
import { englishToMorse } from './morse'
import { playSound, setMuted } from './sound'
import { words1, words2, words3 } from './words'

/** A value the view animates to with a CSS transition; `t` is that transition's duration and easing ('' = jump). */
export interface Tween<T> {
  v: T
  t: string
}
const still = <T>(v: T): Tween<T> => ({ v, t: '' })

/** One character on the word track. */
export interface Slot {
  char: string
  x: number // position along the track
  y: Tween<number> // worldCenter, or worldTop while its hint shows below
  pill: Tween<number> // scale of the black circle behind the letter to type
  alpha: Tween<number> // letter opacity
  cream: boolean // the letter to type turns cream
  shakes: number // bumped to replay the wrong-key shake
}

/** A character's picture hint and its caption. */
export interface Hint {
  key: string // spritesheet: the lowercase character
  name: string
  firstWhite: boolean // level 1 captions start with a white letter
  image: Tween<number> // opacity
  caption: Tween<number> // opacity
  plays: number // bumped to (re)start the picture's frame animation
  stopped: boolean
}

/** Phone input handlers. Stage's orientation handling detaches and reattaches them, as the original did. */
export const inputHandlers: { touch?: () => void; down?: (e: Event) => void } = {}

/** Header letter brightness by score; other positive scores get 0.3. */
const LIGHT: Record<number, number> = { 1: 0.4, 2: 0.6, 3: 0.8, 4: 1 }

/** lodash's shuffle: Fisher-Yates on a copy. */
const shuffle = <T>(list: readonly T[]) => {
  const a = [...list]
  for (let i = 0; i < a.length; i++) {
    const r = i + Math.floor(Math.random() * (a.length - i))
    ;[a[i], a[r]] = [a[r], a[i]]
  }
  return a
}

/** One word on the track: a colored background, a pill and letter per character, and their hints. */
export class Word {
  engine: Engine
  id: number
  color: number
  myLetters: string[]
  myStartX = 0
  currentLetterIndex = 0
  slots: Slot[] = []
  hints: Hint[] = []
  background: { x: number; width: number } | null = null
  hintTimeout?: number
  preSoundTimeout?: number
  soundTimeout?: number
  hintUpTimeout?: number

  constructor(engine: Engine, id: number, myWord: string, color: number) {
    this.engine = engine
    this.id = id
    this.myLetters = myWord.split('')
    this.color = color
  }

  setPosition(startX: number) {
    const { app, GLOBALS } = this.engine.c
    const brick = app.wordBrickSize
    const rectWidth = brick * this.myLetters.length + brick * (GLOBALS.isTouch ? 1 : 3)
    this.background = {
      x: startX - brick * (GLOBALS.isTouch ? 1 : 2),
      width: rectWidth >= window.innerWidth ? rectWidth : window.innerWidth,
    }
    this.myStartX = startX
    this.slots = this.myLetters.map((char, i) => ({
      char,
      x: startX + i * brick,
      y: still(GLOBALS.worldCenter),
      pill: still(0),
      alpha: still(0.3),
      cream: false,
      shakes: 0,
    }))
    this.hints = this.myLetters.map((char) => ({
      key: char.toLowerCase(),
      name: hintName(char.toLowerCase()),
      firstWhite: this.engine.currentLevel === '1',
      image: still(0),
      caption: still(0),
      plays: 0,
      stopped: false,
    }))
    this.engine.emit()
  }

  /** Wrong key: wiggle the letter and its pill. */
  shake(i: number) {
    this.slots[i].shakes++
    this.engine.emit()
  }

  /** Fade in the hint caption, or the picture too (and then play the letter's sound). */
  updateHint(textOnly?: boolean) {
    if (this.hints.length === 0) return
    const e = this.engine
    this.hintTimeout = e.later(
      () => {
        const hint = this.hints[this.currentLetterIndex]
        if (!hint) return
        if (!textOnly) e.tween(hint.image, 1, 200, 'linear')
        e.tween(hint.caption, 0.5, 200, 'linear')
        if (!textOnly) {
          this.preSoundTimeout = e.later(
            () => this.playSounds(this.myLetters[this.currentLetterIndex]),
            e.c.animations.SLIDE_END_DELAY,
          )
        }
      },
      !textOnly ? e.c.animations.SLIDE_END_DELAY + 400 : 0,
    )
  }

  playSounds(char: string | undefined) {
    const morse = (char && englishToMorse[char.toLowerCase()]) || ''
    for (let i = 0; i < morse.length; i++) {
      this.soundTimeout = this.engine.later(() => playSound(morse[i] === '-' ? 'dash' : 'dot'), i * 601)
    }
  }

  /** Light up the letter that is up next. */
  setStyle(i: number) {
    const e = this.engine
    e.tween(this.slots[i].alpha, 1, 200, 'linear', e.c.animations.SLIDE_END_DELAY)
    e.later(() => {
      this.slots[i].cream = true
      e.emit()
    }, e.c.animations.SLIDE_END_DELAY)
  }

  /** Lift the letter so its picture shows underneath, and animate the picture. */
  applyHint(i: number, isInactive?: boolean) {
    const e = this.engine
    if (!(isInactive || e.letterScoreDict[this.myLetters[i].toLowerCase()] < e.c.app.LEARNED_THRESHOLD)) return
    this.hintUpTimeout = e.later(() =>
      e.tween(this.slots[i].y, e.c.GLOBALS.worldTop, 400, 'expoOut', e.c.animations.SLIDE_END_DELAY),
    )
    e.later(() => e.play(this.hints[i]), e.c.animations.SLIDE_END_DELAY + 200)
  }

  /** Typed correctly: drop the letter back down and hide its hint. */
  pushDown(i: number) {
    const e = this.engine
    const delay = e.c.animations.SLIDE_START_DELAY
    for (const id of [this.preSoundTimeout, this.soundTimeout, this.hintTimeout, this.hintUpTimeout]) clearTimeout(id)
    this.hints[i].stopped = true
    e.tween(this.slots[i].y, e.c.GLOBALS.worldCenter, 200, 'expoOut', delay)
    e.tween(this.hints[i].image, 0, 200, 'expoOut', delay)
    e.tween(this.hints[i].caption, 0, 200, 'linear')
  }
}

/** One game run (one level). A level-up or a resize starts a fresh Engine. */
export class Engine {
  c = layout
  version = 0
  restarted: boolean
  onRestart: () => void

  // View model
  words: Word[] = []
  trackX = still(0)
  header = {
    level: null as string | false | null,
    chars: null as string[] | null, // the level's characters, once known
    alpha: {} as Record<string, number>,
    pulse: { char: '', n: 0 }, // ring around the character just typed
  }
  complete: string | null = null // level just finished

  // Game state
  lettersToLearn = ['e', 't', 'a', 'i', 'm', 's', 'o', 'h', 'n', 'c', 'r', 'd', 'u', 'k', 'l', 'f', 'b', 'p', 'g', 'j', 'v', 'q', 'w', 'x', 'y', 'z']
  numbersToLearn = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  puncToLearn = ['.', ',', '?', "'", '!', '/', '&', ':', ';', '+', '-', '=', '_', '@', '(', ')', '"']
  letterScoreDict: Record<string, number> = {}
  newLetterArray: string[] = []
  currentLettersInPlay: string[] = []
  currentWordIndex = 0
  currentLevel = '1'
  mistakeCount = 0
  inputReady = false
  leveledUp = false
  inactivityTimeout?: number
  circleTimeout?: number
  allBgColors = [0xef4136, 0xf7941e, 0x662d91, 0x00a651]

  private nextWordId = 0
  private disposed = false
  private listeners = new Set<() => void>()
  private timers = new Set<number>()
  private cleanups: (() => void)[] = []

  constructor(restarted: boolean, onRestart: () => void) {
    this.restarted = restarted
    this.onRestart = onRestart
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  emit() {
    this.version++
    this.listeners.forEach((l) => l())
  }

  /** setTimeout that dispose() cancels. */
  later(fn: () => void, ms = 0) {
    const id = window.setTimeout(() => {
      this.timers.delete(id)
      fn()
    }, ms)
    this.timers.add(id)
    return id
  }

  /** A Phaser tween as a CSS transition: after `delay`, move `p` to `v` over `ms`. */
  tween<T>(p: Tween<T>, v: T, ms: number, ease: Ease, delay = 0) {
    const go = () => {
      p.v = v
      p.t = `${ms}ms ${EASE[ease]}`
      this.emit()
    }
    if (delay) this.later(go, delay)
    else go()
  }

  play(hint: Hint) {
    hint.plays++
    hint.stopped = false
    this.emit()
  }

  start() {
    this.loadLetters().then((loaded) => {
      if (this.disposed) return
      if (loaded) this.letterScoreDict = loaded
      this.createSpace()
      this.createHeader()
    })
  }

  dispose() {
    this.disposed = true
    this.timers.forEach((id) => clearTimeout(id))
    this.cleanups.forEach((f) => f())
    setUi({ keyboard: null })
  }

  /** Saved scores, or false after seeding every character with 0. ?level=N picks the level. */
  loadLetters() {
    const level = getQueryParam('level')
    return new Promise<Record<string, number> | false>((resolve) => {
      if (level && !this.restarted) localStorage.setItem('level', level)
      const saved = localStorage.getItem('savedLetters')
      if (saved) return resolve(JSON.parse(saved))
      for (const key of [...this.lettersToLearn, ...this.numbersToLearn, ...this.puncToLearn]) this.letterScoreDict[key] = 0
      if (!level) localStorage.setItem('level', '1')
      resolve(false)
    })
  }

  /** Where the letter to type sits. */
  typingX() {
    return !device.desktop ? this.c.app.wordBrickSize * (this.c.GLOBALS.isTouch ? 1 : 2) : this.c.world.centerX
  }

  private createSpace() {
    const { app, animations, GLOBALS } = this.c
    this.checkLevel(null, true)
    focusInput()

    if (device.desktop) {
      setUi({ keyboard: (letter) => this.checkMatch(letter) })
      const onKey = () => clearTimeout(this.inactivityTimeout)
      document.addEventListener('keydown', onKey)
      this.cleanups.push(() => document.removeEventListener('keydown', onKey))
    } else if (!GLOBALS.isLandscape) {
      const down = (e: Event) => {
        if (this.inputReady && e.type !== 'click') this.checkMatch(e)
      }
      const touch = () => focusInput()
      inputHandlers.down = down
      inputHandlers.touch = touch
      document.addEventListener('textInput', down)
      window.addEventListener('touchstart', touch)
      this.cleanups.push(() => {
        for (const type of ['textInput', 'click', 'keypress']) document.removeEventListener(type, down)
        for (const type of ['touchstart', 'touchend']) window.removeEventListener(type, touch)
        if (inputHandlers.down === down) inputHandlers.down = inputHandlers.touch = undefined
      })
    }

    this.later(() => {
      for (let i = 0; i < app.howManyWordsToStart; i++) this.makeWordObject()
      this.words.forEach((word, i) => {
        if (i > 0) {
          const prev = this.words[i - 1]
          word.setPosition(prev.myStartX + prev.slots.length * app.wordBrickSize + app.spaceBetweenWords)
          return
        }
        word.setPosition(this.typingX())
        const slot = word.slots[0]
        this.tween(slot.pill, 1, 250, 'expoOut', animations.SLIDE_START_DELAY)
        this.tween(slot.y, GLOBALS.worldTop, 400, 'expoOut', animations.SLIDE_END_DELAY + 200)
        this.later(() => this.play(word.hints[0]), animations.SLIDE_END_DELAY + 200)
        this.later(() => (this.inputReady = true), animations.SLIDE_END_DELAY + 200)
      })
      this.words[0].setStyle(0)
      this.words[0].updateHint()
    }, 300)
  }

  checkLevel(letter: string | null, initial?: boolean) {
    this.later(() => {
      checkStorageItem('level').then((res) => {
        if (this.disposed) return
        const { lettersToLearn, numbersToLearn, puncToLearn } = this
        this.newLetterArray = (res === '2' ? numbersToLearn : res === '3' ? puncToLearn : lettersToLearn).slice(0)
        if (!res) {
          setStorageItem('level', '1')
        } else {
          this.currentLevel = res
          if (
            letter === this.newLetterArray[this.newLetterArray.length - 1] &&
            this.letterScoreDict[letter] >= this.c.app.LEARNED_THRESHOLD
          ) {
            this.levelUp(res)
          }
        }
        this.checkLettersInPlay(initial)
      })
      // ?complete=true jumps straight to the level-complete screen.
      if (getQueryParam('complete')) this.later(() => this.levelUp(this.currentLevel), 300)
    })
  }

  checkLettersInPlay(initial?: boolean) {
    const T = this.c.app.LEARNED_THRESHOLD
    let letterCount = 0
    for (const key in this.letterScoreDict) {
      const hasNumbers = /^\d+$/.test(key)
      const hasLetters = /^[a-zA-Z]+$/.test(key)
      const inLevel =
        this.currentLevel === '1'
          ? hasLetters
          : this.currentLevel === '2'
            ? hasNumbers
            : this.currentLevel === '3' && !hasLetters && !hasNumbers
      if (this.letterScoreDict[key] >= T && inLevel) letterCount++
      if (this.letterScoreDict[key] <= T && inLevel) {
        this.currentLettersInPlay.push(key)
        break
      }
    }
    const lettersInPlay =
      !initial || (this.currentLevel !== '3' ? letterCount <= 2 : letterCount < 2)
        ? this.currentLevel !== '3'
          ? 3
          : 2
        : letterCount === 1
          ? 2
          : letterCount
    if (this.currentLettersInPlay.length < lettersInPlay) {
      this.currentLettersInPlay = this.newLetterArray.slice(0, lettersInPlay)
    }
  }

  /** A random word made only of letters in play; while the newest letter is unlearned, it must contain it. */
  findAWord() {
    const wordList =
      this.currentLevel === '1' ? words1 : this.currentLevel === '2' ? words2 : this.currentLevel === '3' ? words3 : []
    const newestLetter = this.currentLettersInPlay[this.currentLettersInPlay.length - 1]
    for (const word of shuffle(wordList)) {
      let onlyTheseLetters = true
      for (const char of word) {
        // Level 3 practices punctuation; letters and digits in its words are free.
        const counts = this.currentLevel === '3' ? !/^[a-zA-Z]+$/.test(char) && !/^\d+$/.test(char) : true
        if (counts && !this.currentLettersInPlay.includes(char)) onlyTheseLetters = false
      }
      if (onlyTheseLetters) {
        if (this.letterScoreDict[newestLetter] <= this.c.app.LEARNED_THRESHOLD) {
          if (word.includes(newestLetter)) return word
        } else {
          return word
        }
      }
    }
  }

  /** Dedupe the letters in play and keep only this level's. */
  checkAddLetters() {
    this.later(() => {
      this.currentLettersInPlay = [...new Set(this.currentLettersInPlay)].filter((l) => this.newLetterArray.includes(l))
    })
  }

  makeWordObject() {
    const myWord = this.findAWord()! // like the original, this throws if no word fits
    const color = this.allBgColors[this.words.length % this.allBgColors.length]
    const word = new Word(this, this.nextWordId++, myWord, color)
    this.checkAddLetters()
    this.words.push(word)
  }

  addAWord() {
    const { app } = this.c
    this.makeWordObject()
    const prior = this.words[this.words.length - 2]
    this.words[this.words.length - 1].setPosition(
      prior.slots[0].x + prior.myLetters.length * app.wordBrickSize + app.spaceBetweenWords,
    )
  }

  /** Desktop passes the decoded letter; phones pass the textInput/keypress event. */
  checkMatch(e: string | Event) {
    const T = this.c.app.LEARNED_THRESHOLD
    const data = typeof e === 'string' ? e : (e as TextEvent).data || (e as KeyboardEvent).key
    let word = this.words[this.currentWordIndex]
    let letter = word.myLetters[word.currentLetterIndex]
    let typedLetter: string | undefined
    this.inputReady = false
    clearTimeout(this.inactivityTimeout)
    if (data === ' ') {
      // A bare space: score the last character in the hidden input instead.
      typedLetter = inputRef.current!.value.trim()
      typedLetter = typedLetter[typedLetter.length - 1]
    } else {
      typedLetter = data
    }
    typedLetter = typedLetter?.toLowerCase()
    letter = letter.toLowerCase()
    if (typedLetter === undefined) return

    if (typedLetter === letter) {
      this.mistakeCount = 0
      this.tween(word.slots[word.currentLetterIndex].pill, 0, 500, 'backIn')
      word.pushDown(word.currentLetterIndex)
      word.currentLetterIndex++
      this.letterScoreDict[letter] += 1
      if (this.letterScoreDict[letter] > T + 2) this.letterScoreDict[letter] = T + 2
      if (word.currentLetterIndex >= word.myLetters.length) {
        this.currentWordIndex++
        word.currentLetterIndex = 0
        this.addAWord()
      }
      word = this.words[this.currentWordIndex]
      letter = word.myLetters[word.currentLetterIndex]
      if (this.letterScoreDict[letter] < T) {
        this.tween(word.slots[word.currentLetterIndex].pill, 0, 500, 'backIn')
        word.updateHint()
        word.applyHint(word.currentLetterIndex)
      }
      this.slideLetters()
      this.checkLevel(typedLetter)
      this.updateProgressLights(this.letterScoreDict, typedLetter)
    } else {
      this.mistakeCount++
      this.letterScoreDict[letter] -= 1
      word.shake(word.currentLetterIndex)
      this.startInactivity(word)
      this.updateProgressLights(this.letterScoreDict, null)
      if (this.letterScoreDict[letter] < -T - 2) this.letterScoreDict[letter] = -T - 2
      // Third miss in a row shows the caption, the fourth the picture and sound.
      if (this.mistakeCount === 3) word.updateHint(true)
      if (this.mistakeCount === 4) {
        word.updateHint()
        word.applyHint(word.currentLetterIndex)
      }
      this.later(() => (this.inputReady = true), 600)
    }
  }

  /** On a learned letter, show the hint after a few idle seconds and count it as a miss. */
  startInactivity(word: Word) {
    const currLetter = word.myLetters[word.currentLetterIndex]
    this.inputReady = false
    if (this.letterScoreDict[currLetter] >= this.c.app.LEARNED_THRESHOLD) {
      this.inactivityTimeout = this.later(() => {
        this.letterScoreDict[currLetter] -= 1
        word.updateHint()
        word.applyHint(word.currentLetterIndex, true)
        this.updateProgressLights(this.letterScoreDict, null)
        this.inputReady = true
      }, this.c.app.inactivityTimeout)
    }
  }

  levelUp(level: string) {
    if (this.leveledUp) return // the original overwrote this method with `true` here, so later calls threw
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    this.leveledUp = true
    setUi({ keyboard: null })
    clearTimeout(this.inactivityTimeout)
    this.complete = level
    this.emit()
  }

  /** Click on the level-complete screen: on to the next level (3 wraps to 1). */
  nextLevel = () => {
    const level = this.complete!
    setStorageItem('level', level === '1' ? '2' : level === '2' ? '3' : level === '3' ? '1' : level)
    this.onRestart()
  }

  /** Slide the track so the next letter sits at the typing spot. */
  slideLetters() {
    const { animations } = this.c
    const word = this.words[this.currentWordIndex]
    const slot = word.slots[word.currentLetterIndex]
    this.tween(this.trackX, this.typingX() - slot.x, animations.SLIDE_TRANSITION, 'expoOut', animations.SLIDE_END_DELAY)
    if (this.currentWordIndex > 0) setStorageItem('intro', true)
    this.tween(slot.pill, 1, 250, 'expoOut', animations.SLIDE_END_DELAY)
    this.later(() => (this.inputReady = true), animations.SLIDE_END_DELAY + 150)
    word.setStyle(word.currentLetterIndex)
    this.startInactivity(word)
  }

  /** Words that can be on screen: the rest have slid more than a screen off to the left. */
  visibleWords() {
    const brick = this.c.app.wordBrickSize
    return this.words.filter(
      (w) =>
        w.background &&
        Math.max(w.background.x + w.background.width, w.myStartX + w.slots.length * brick) + this.trackX.v >
          -this.c.world.width,
    )
  }

  private createHeader() {
    checkStorageItem('level').then((level) => {
      if (this.disposed) return
      this.header.level = level
      const chars = level === '2' ? this.numbersToLearn : level === '3' ? this.puncToLearn : this.lettersToLearn
      this.header.chars = chars.slice(0).sort()
      this.emit()
      // On 1x screens the original crashed right here (a Phaser group has no anchor) and skipped this refresh.
      if (this.c.GLOBALS.devicePixelRatio !== 1) this.updateProgressLights(this.letterScoreDict)
    })
    if (device.desktop) {
      checkStorageItem('muted').then((res) => {
        if (res === 'true' && !this.disposed) setMuted(true)
      })
    }
    this.updateProgressLights(this.letterScoreDict)
  }

  /** Saves the scores, brightens each header character by score, and pulses a ring around the one just typed. */
  updateProgressLights(score: Record<string, number>, letter?: string | null) {
    setStorageItem('savedLetters', JSON.stringify(score))
    clearTimeout(this.circleTimeout)
    for (const key of Object.keys(score)) {
      if (score[key] && score[key] > 0 && score[key] <= this.c.app.LEARNED_THRESHOLD * 2) {
        const alpha = LIGHT[score[key]] ?? 0.3
        this.later(() => {
          if (!this.header.chars?.includes(key)) return
          this.header.alpha[key] = alpha
          this.emit()
        })
      }
    }
    if (letter != null && this.header.chars?.includes(letter)) {
      this.circleTimeout = this.later(() => {
        this.header.pulse = { char: letter, n: this.header.pulse.n + 1 }
        this.emit()
      })
    }
  }

  toggleMute = () => {
    const muted = !getUi().muted
    setMuted(muted)
    if (muted) setStorageItem('muted', 'true')
    else clearStorageItems('muted')
  }

  clearProgress = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear your progress? This will restart your current game and put you back at Level 1.',
    )
    if (confirmed) clearStorageItems(['savedLetters', 'intro', 'level']).then(() => window.location.reload())
  }
}
