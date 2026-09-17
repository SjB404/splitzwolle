import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import './App.css'
import './index.css'
import HomePage from './pages/homePage.jsx'

/* Two root-level settings, deliberately here and nowhere else:

   - `reducedMotion="user"` makes every Motion animation honour the OS setting
     the same way the CSS in index.css does: transforms are dropped, opacity
     fades stay.
   - `LazyMotion` + `domAnimation` loads only the DOM animation features
     (enter/exit/keyframes) — not the layout-projection engine, which the page
     never needs, because the route grid only ever appends rows. `strict` makes
     using a full-weight `motion.*` component a build-time error, so the bundle
     cannot creep back up by accident.

   Components use `m.div` / `m.article` for that reason (DESIGN.md §10). */
function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <HomePage />
      </MotionConfig>
    </LazyMotion>
  )
}

export default App
