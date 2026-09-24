/*
scrolltotop — puts a route change back at the top of the new page.

without it, opening a card from halfway down the overview drops you halfway down the
next page. a hash wins over the top, which is what makes the top bar's "Contact" link
and the login page's "Registreren" link work from anywhere.

the effect syncs with something outside React, the window's scroll position.
*/

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
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
