<<<<<<< HEAD
import './App.css'
import "./index.css"
import ContactPage from './pages/Contact.tsx'
// import LoginTest from './pages/login.tsx'


function App() {
=======
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./index.css";
import AppLayout from "./shared/layout/appLayout.tsx";
import ScrollToTop from "./shared/layout/scrollToTop.tsx";
import HomePage from "./pages/homePage.tsx";
import NotFoundPage from "./pages/notFoundPage.tsx";
import PlanningPage from "./pages/planningPage.tsx";
import PointsOfInterestPage from "./pages/pointsOfInterestPage.tsx";
import RouteDetailPage from "./pages/routeDetailPage.tsx";
import RoutesPage from "./pages/routesPage.tsx";
import {
  HOME_PATH,
  PLANNING_PATH,
  POI_PATH,
  ROUTES_PATH,
} from "./data/navigation.ts";
>>>>>>> main

/* reducedMotion="user" makes every motion animation follow the OS setting, and LazyMotion + domAnimation + strict keeps the layout engine out of the bundle — hence m.div, never motion.div */
function App() {
  return (
<<<<<<< HEAD
    <>

    {/* <LoginTest /> */}
    <ContactPage />
    </>
  )
=======
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {/* the paths come from data/navigation.ts, so renaming one re-points the router and every link at once */}
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
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
  );
>>>>>>> main
}

export default App;
