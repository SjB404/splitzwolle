/* the shared shell (bar + main + footer) — beerCSS grids any element holding a <main>, and main is p-0 or beerCSS insets the hero band */

import { Outlet } from "react-router-dom";
import Navbar from "./navbar.tsx";
import Footer from "./footer.tsx";

export default function AppLayout() {
  return (
    <div>
      <Navbar />
      <main className="p-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
