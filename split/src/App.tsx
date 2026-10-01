import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import AppLayout from "./shared/layout/appLayout.tsx";
import ScrollToTop from "./shared/layout/scrollToTop.tsx";
import HomePage from "./pages/homePage.tsx";
import NotFoundPage from "./pages/notFoundPage.tsx";
import PointsOfInterestPage from "./pages/pointsOfInterestPage.tsx";
import RoutesPage from "./pages/routesPage.tsx";
import {
  CUSTOM_ROUTE_PATH,
  HOME_PATH,
  PLANNING_PATH,
  POI_PATH,
  PUBLIC_ROUTE_PATH,
  ROUTES_PATH,
  publicRoutePath,
} from "./data/navigation.ts";

/* the shape a route's url had before it became /routes/custom and /routes/public, so an old link still lands somewhere */
function LegacyRouteRedirect() {
  const { routeId } = useParams<{ routeId: string }>();

  return <Navigate to={publicRoutePath(routeId ?? "")} replace />;
}

/* reducedMotion="user" makes every motion animation follow the OS setting, and LazyMotion + domAnimation + strict keeps the layout engine out of the bundle — hence m.div, never motion.div */
function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {/* the paths come from data/navigation.ts, so renaming one re-points the router and every link at once */}
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            <Route element={<AppLayout />}>
              <Route path={HOME_PATH} element={<HomePage />} />
              {/* one page, three urls: the builder, a built route, and a ready-made one */}
              <Route path={ROUTES_PATH} element={<RoutesPage />} />
              <Route
                path={`${CUSTOM_ROUTE_PATH}/:placeIds`}
                element={<RoutesPage />}
              />
              <Route
                path={`${PUBLIC_ROUTE_PATH}/:routeId`}
                element={<RoutesPage />}
              />
              <Route
                path={`${ROUTES_PATH}/:routeId`}
                element={<LegacyRouteRedirect />}
              />
              <Route
                path={PLANNING_PATH}
                element={<Navigate to={ROUTES_PATH} replace />}
              />
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
