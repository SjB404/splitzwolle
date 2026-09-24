/*
pagetitle — sets document.title for the page being rendered.

a single page app keeps one index.html, so each page has to say what it is. the tab,
the history entry and a screen reader's page announcement all read this string. the
component renders nothing.

the title lives outside React, so writing it is syncing with something external. that
is the same reason ThemeToggle and ScrollToTop use an effect. index.html holds the
home page's title until React takes over.
*/

import { useEffect } from "react";

const TITLE_SUFFIX = "Zwolle Routes";

export default function PageTitle({ title }) {
  useEffect(() => {
    document.title = title ? `${title} · ${TITLE_SUFFIX}` : TITLE_SUFFIX;
  }, [title]);

  return null;
}
