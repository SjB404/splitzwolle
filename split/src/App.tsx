import { useEffect, useRef } from "react";
import { LazyMotion, MotionConfig, domMax } from "motion/react";
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

// old /routes/<id> links go to the new /routes/public/<id> url
function LegacyRouteRedirect() {
  const { routeId } = useParams<{ routeId: string }>();

  return <Navigate to={publicRoutePath(routeId ?? "")} replace />;
}

// navbar and footer around every page, the login page has no footer
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

function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  const lastPath = useRef<string | null>(null);
  // a page can change its own hash without any scrolling by navigating with { scroll: false } as state
  const keepScroll = (state as { scroll?: boolean } | null)?.scroll === false;

  useEffect(() => {
    // a new page just starts at the top, only anchors on the same page scroll smoothly
    const samePage = lastPath.current === pathname;
    lastPath.current = pathname;

    if (samePage && keepScroll) return;

    const behavior = samePage ? "smooth" : "instant";
    const target = hash ? document.getElementById(hash.slice(1)) : null;

    // an input (the navbar's search link) is centred and focused, anything else scrolls to its top
    if (target instanceof HTMLInputElement) {
      target.scrollIntoView({ behavior, block: "center" });
      target.focus({ preventScroll: true });
      return;
    }

    if (target) {
      target.scrollIntoView({ behavior });
      return;
    }

    window.scrollTo({ top: 0, behavior });
  }, [pathname, hash, keepScroll]);

  return null;
}

// domMax because the card lists use layout animations, reducedMotion="never"
// since the animations are short and functional
function App() {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="never">
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path={HOME_PATH} element={<HomePage />} />
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
