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

function LegacyRouteRedirect() {
  const { routeId } = useParams<{ routeId: string }>();

  return <Navigate to={publicRoutePath(routeId ?? "")} replace />;
}

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
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;

    if (target) {
      /* scroll animates because index.css sets html { scroll-behavior: smooth } */
      target.scrollIntoView();
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/* lazyMotion strict: use m.div, never motion.div; reducedMotion="user" follows the os setting */
function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
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
