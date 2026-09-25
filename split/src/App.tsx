import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "./index.css";
import AppLayout from "./components/appLayout.tsx";
import ScrollToTop from "./components/scrollToTop.tsx";
import HomePage from "./pages/homePage.tsx";
import LoginPage from "./pages/loginPage.tsx";
import NotFoundPage from "./pages/notFoundPage.tsx";
import PlanningPage from "./pages/planningPage.tsx";
import PointsOfInterestPage from "./pages/pointsOfInterestPage.tsx";
import RouteDetailPage from "./pages/routeDetailPage.tsx";
import RoutesPage from "./pages/routesPage.tsx";
import {
  HOME_PATH,
  LOGIN_PATH,
  PLANNING_PATH,
  POI_PATH,
  ROUTES_PATH,
} from "./data/navigation.ts";

/* reducedMotion="user" makes every motion animation follow the OS setting, and LazyMotion + domAnimation + strict keeps the layout engine out of the bundle — hence m.div, never motion.div */
function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {/* the paths come from data/navigation.ts, so renaming one re-points the router and every link at once */}
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            {/* the account screen is the one page outside the shell: a split screen with no navigation */}
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
  );
}

export default App;
