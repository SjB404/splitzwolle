import { useEffect } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import Navbar from "./components/navbar.tsx";
import Footer from "./components/footer.tsx";
import HomePage from "./pages/homePage.tsx";
import NotFoundPage from "./pages/notFoundPage.tsx";
import PointsOfInterestPage from "./pages/pointsOfInterestPage.tsx";
import RoutesPage from "./pages/routesPage.tsx";
import LoginPage from "./pages/loginPage.tsx";
import ContactPage from "./pages/contactPage.tsx";
import {
  CUSTOM_ROUTE_PATH,
  HOME_PATH,
  PLANNING_PATH,
  POI_PATH,
  PUBLIC_ROUTE_PATH,
  ROUTES_PATH,
  LOGIN_PATH,
  CONTACT_PATH,
  publicRoutePath,
} from "./data/navigation.ts";

/* the shape a route's url had before it became /routes/custom and /routes/public, so an old link still lands somewhere */
function LegacyRouteRedirect() {
  const { routeId } = useParams<{ routeId: string }>();

  return <Navigate to={publicRoutePath(routeId ?? "")} replace />;
}

/* the shell every page wears: bar, main, footer — the account screen hides the footer, because it is a screen of its own */
function AppLayout() {
  const { pathname } = useLocation();
  const hideFooter = pathname === LOGIN_PATH;

  return (
    <div>
      <Navbar />
      <main className="p-0">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

/* puts a route change back at the top; a hash wins, so /#contact lands from anywhere */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;

    if (target) {
      /* html { scroll-behavior: smooth } decides how it travels */
      target.scrollIntoView();
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
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
              <Route path={LOGIN_PATH} element={<LoginPage />} />
              <Route path={CONTACT_PATH} element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  );
}

export default App;
