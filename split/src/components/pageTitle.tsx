import { useEffect } from "react";

const TITLE_SUFFIX = "Zwolle Routes";

interface PageTitleProps {
  title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    document.title = `${title} · ${TITLE_SUFFIX}`;
  }, [title]);

  return null;
}
