import { useState } from 'react'
import { useUi } from '../ui'
import Game from './Game'
import Intro from './Intro'
import { layout } from './layout'
import Title from './Title'

/** The game area: SVG in the original's game pixels, scaled to the window like its canvas was. */
export default function Stage() {
  const ui = useUi()
  const [run, setRun] = useState(0) // bumped by "next level"
  if (ui.screen === 'loading') return null
  const { world } = layout
  const k = world.scale
  return (
    // Hidden while a phone is held sideways.
    <div className="stage" style={{ opacity: ui.landscape ? 0 : 1 }}>
      <svg className="world" width={world.width * k} height={world.height * k} viewBox={`0 0 ${world.width} ${world.height}`}>
        <rect width={world.width} height={world.height} fill="#ef4136" />
        {ui.screen === 'title' && <Title key={ui.layoutVersion} />}
        {ui.screen === 'game' && (
          <Game key={`${ui.layoutVersion}.${run}`} restarted={run > 0} onRestart={() => setRun((r) => r + 1)} />
        )}
      </svg>
      {ui.screen === 'intro' && <Intro key={ui.layoutVersion} />}
    </div>
  )
}
