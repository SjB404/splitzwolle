/*
applayout — the shell every page shares: the bar, the footer, and the page between
them.

beerCSS gives any element that holds a main child a full height header/main/footer
grid, so this structure is what makes the sticky bar and the full bleed bands work.
main carries p-0 on purpose, because beerCSS pads it by 0.5rem and that would inset
the hero band.

the login page lives outside this shell on purpose: it is a single purpose screen
with no navigation.
*/

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
