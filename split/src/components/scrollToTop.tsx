/* puts a route change back at the top; a hash wins, so /#contact lands from anywhere */

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
