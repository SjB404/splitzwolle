import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import './index.css'
import AppLayout from './components/appLayout.jsx'
import ScrollToTop from './components/scrollToTop.jsx'
import HomePage from './pages/homePage.jsx'
import LoginPage from './pages/loginPage.jsx'
import NotFoundPage from './pages/notFoundPage.jsx'
import PlanningPage from './pages/planningPage.jsx'
import PointsOfInterestPage from './pages/pointsOfInterestPage.jsx'
import RouteDetailPage from './pages/routeDetailPage.jsx'
import RoutesPage from './pages/routesPage.jsx'
import {
  HOME_PATH,
  LOGIN_PATH,
  PLANNING_PATH,
  POI_PATH,
  ROUTES_PATH,
} from './data/navigation.js'

/* two root level settings, and only here on purpose:

   reducedMotion="user" makes every motion animation follow the OS setting, the same
   way the css does: transforms are dropped, opacity fades stay.

   LazyMotion with domAnimation loads only the animation features this app uses, not
   the layout projection engine, which nothing needs because the route grid only ever
   appends rows. strict turns a full weight motion.* component into a build error, so
   the bundle cannot creep back up by accident.

   that is why components use m.div and m.article. */
function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {/* the paths come from data/navigation.js, so renaming one re-points the router
            and every link at once */}
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            {/* the account screen is the one page outside the shell: it is a single
                purpose split screen with no navigation */}
            <Route path={LOGIN_PATH} element={<LoginPage />} />

            <Route element={<AppLayout />}>
              <Route path={HOME_PATH} element={<HomePage />} />
              <Route path={ROUTES_PATH} element={<RoutesPage />} />
              <Route
                path={`${ROUTES_PATH}/:routeId`}
                element={<RouteDetailPage />}
              />
              <Route path={PLANNING_PATH} element={<PlanningPage />} />
              <Route path={POI_PATH} element={<PointsOfInterestPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  )
}

export default App
