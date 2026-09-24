/*
textbutton — a button that looks like a link, for an action inside a sentence.

beercss has no text button. a plain <button> is a filled primary button, and
.transparent sets color: inherit !important, which would beat text-accent. so the
colour goes on a span inside the button instead of fighting the framework.

it is a real button and not a link, because it does something: the login page
uses it to switch between the login and register forms.
*/

import type { ReactNode } from "react";

interface TextButtonProps {
  children: ReactNode;
  /* optional because the login page's "Wachtwoord vergeten?" is a placeholder that
     leads nowhere yet */
  onClick?: () => void;
  className?: string;
}

export default function TextButton({
  children,
  onClick,
  className = "",
}: TextButtonProps) {
  return (
    <button type="button" onClick={onClick} className={`transparent ${className}`}>
      <span className="font-semibold text-accent transition-colors hover:underline">
        {children}
      </span>
    </button>
  );
}
