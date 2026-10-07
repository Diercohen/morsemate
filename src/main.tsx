import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { startGame } from './game/boot'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// The Phaser game lives for the whole page, outside React; it appends its own canvas to <body>.
startGame()

// Offline support. Dev builds skip it so the cache never serves stale modules.
if (import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js')
