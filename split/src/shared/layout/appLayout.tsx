import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./navbar.tsx";
import Footer from "./footer.tsx";
import { LOGIN_PATH } from "../../data/navigation.ts";

export default function AppLayout() {
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