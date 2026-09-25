/* sets document.title per page (tab, history, screen readers); it renders nothing, which is why it is an effect */

import { useEffect } from "react";

const TITLE_SUFFIX = "Zwolle Routes";

interface PageTitleProps {
  /* the page's own name; the brand is added here, so no page repeats it */
  title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    document.title = `${title} · ${TITLE_SUFFIX}`;
  }, [title]);

  return null;
}
