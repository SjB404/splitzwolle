/* a button that looks like a link — .transparent sets color: inherit !important, so the accent sits on a span inside it */

import type { ReactNode } from "react";

interface TextButtonProps {
  children: ReactNode;
  /* optional: the login page's "Wachtwoord vergeten?" leads nowhere yet */
  onClick?: () => void;
  className?: string;
}

export default function TextButton({
  children,
  onClick,
  className = "",
}: TextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`transparent ${className}`}
    >
      <span className="font-semibold text-accent transition-colors hover:underline">
        {children}
      </span>
    </button>
  );
}
