<div align="center">

<img src="public/assets/icons/icon-512.png" width="120" alt="Morse Mate icon" />

# Morse Mate

### · — &nbsp; Learn Morse code in minutes, anywhere, even offline &nbsp; — ·

[![Live App](https://img.shields.io/badge/▶_Open_the_app-diercohen.github.io/morsemate-ef4136?style=for-the-badge)](https://diercohen.github.io/morsemate/)
[![GitHub](https://img.shields.io/badge/GitHub-Diercohen/morsemate-181717?style=for-the-badge&logo=github)](https://github.com/Diercohen/morsemate)

![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa)
![Offline](https://img.shields.io/badge/works-100%25_offline-f7941d?style=flat-square)
![React 19](https://img.shields.io/badge/React_19-TypeScript-3178c6?style=flat-square&logo=react)
![No tracking](https://img.shields.io/badge/tracking-none-555?style=flat-square)

</div>

---

**Morse Mate** is a playful Morse code trainer that installs like a real app on your phone. Every letter comes with a picture that helps you remember it: **E** is an *Eye*, **T** is a piece of *Tape*, **A** is *Archery*. Tap the dots and dashes, watch the screen fill with color, and before you know it you're typing in Morse.

<p>🔗 <b>Live demo:</b> <a href="https://diercohen.github.io/morsemate/">diercohen.github.io/morsemate</a></p>

## 📱 Screenshots

<div align="center">
  <a href="https://github.com/user-attachments/assets/e4b3f271-c5e6-41cb-97cb-f88ecbd8d4f6"><img src="screenshots/intro.gif" width="300" alt="Morse Mate demo" /></a>
</div>

## ✨ Features

- 🔤 **All of it:** the 26 letters, the numbers 0 to 9 and punctuation, each with its own animated picture
- 🎧 **Real sounds:** hear every dit and dah as you type
- 📴 **Works offline:** a service worker saves the whole app (about 4 MB) on your first visit
- 📲 **Installs like an app:** full screen, with its own home screen icon
- 🔒 **Private:** no analytics, no cookies, no outside requests
- ⚛️ **React 19 + TypeScript:** the original trainer rebuilt as a typed React app, drawn with SVG instead of a canvas game engine

## 🚀 Install it

1. Open **[diercohen.github.io/morsemate](https://diercohen.github.io/morsemate/)**
2. Add it to your home screen:
   - **Android (Chrome):** menu ⋮ → **Install app**
   - **iPhone / iPad (Safari):** Share ↑ → **Add to Home Screen**
   - **Desktop (Chrome / Edge):** click the install icon in the address bar
3. That's it. Turn on airplane mode and it still works. ✈️

> 💡 On a phone, Morse Mate is meant to be used with the **Morse keyboard in [Gboard](https://support.google.com/accessibility/android/answer/9011881)**. On a desktop, choose **"Play a demo on desktop"** and use the on-screen dot and dash keys.

## 🛠️ Run it locally

Needs Node.js 20.19+ or 22.12+.

```sh
git clone https://github.com/Diercohen/morsemate.git
cd morsemate
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve dist/ to test the offline build
```

Pushing to `main` builds and publishes the site with GitHub Actions (Settings → Pages → Source: **GitHub Actions**).

## 📂 What's inside

```
morsemate/
├── index.html                  the app page
├── src/
│   ├── main.tsx                starts React and the game
│   ├── App.tsx                 the page: game stage, About overlay, help button, messages
│   ├── MorseBoard.tsx          on-screen dot and dash keyboard (desktop)
│   ├── ui.ts                   UI state shared by the game and React
│   ├── styles.css
│   └── game/                   the trainer itself: title, intro and game screens (SVG),
│                               game logic (engine.ts), text layout, sounds, word lists
└── public/
    ├── manifest.webmanifest    PWA name, colors and icons
    ├── sw.js                   service worker that saves everything for offline use
    └── assets/                 images, sounds, videos, fonts and icons
```

> 🔄 **Updating?** Change `CACHE = "morse-v4"` in `public/sw.js` (for example to `morse-v5`) so installed copies download the new files.

## 🙏 Credits

It's an offline copy of Google's [Morse Typing Trainer](https://morse.withgoogle.com/learn/), turned into a Progressive Web App. Once it's loaded, it never needs the internet again.

The original trainer was built by **[Use All Five](https://www.useallfive.com/)** and **Google Creative Lab** as part of [Morse code for accessible communication](https://morse.withgoogle.com/). All of the original code, artwork and sounds belong to them. Morse Mate packages the trainer as an offline PWA, with its code rewritten in React and TypeScript from the original compiled bundle.

<div align="center">

---

Made with · — · by **Dier Cohen** · [github.com/Diercohen/morsemate](https://github.com/Diercohen/morsemate)

</div>
