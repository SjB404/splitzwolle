/* the share action in the map's corner — the route is already in the url, so sharing is copying it.
   There is no account yet, so a copied link is the whole feature (see docs/BACKEND.md).
   With fewer than two places there is nothing to share: instead of a dead button, the click opens a
   small popup that says so. It is a popup and not a modal, so the map behind it stays usable */

import { useEffect, useRef, useState } from "react";
import Icon from "../../shared/primitives/icon.tsx";
import { builderPath } from "../../data/navigation.ts";

interface RouteShareButtonProps {
  placeIds: string[];
}

export default function RouteShareButton({ placeIds }: RouteShareButtonProps) {
  const [note, setNote] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  /* a route needs two places before it is a route, so the button waits for the second click */
  const ready = placeIds.length > 1;
  /* the popup is only about the missing route, so a second place hides it with no extra state */
  const showHint = hintOpen && !ready;
  const link = `${window.location.origin}${builderPath(placeIds)}`;

  /* the popup is dismissed by escape or by a click outside it; picking a second place makes it moot */
  useEffect(() => {
    if (!showHint) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setHintOpen(false);
    }
    function closeOnOutside(event: MouseEvent) {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) {
        setHintOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutside);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutside);
    };
  }, [showHint]);

  async function share() {
    /* nothing to share yet: the popup explains the wait rather than the button going dead */
    if (!ready) {
      setNote("");
      setHintOpen(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setNote("Link gekopieerd. Plak hem waar je wilt.");
    } catch {
      /* a browser that will not give the clipboard still gets the link, to copy by hand */
      setNote(`Kopieer de link: ${link}`);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div ref={wrapper} className="relative">
        <button
          type="button"
          onClick={() => void share()}
          aria-label="Deel deze route"
          aria-expanded={showHint}
          title={
            ready ? "Kopieer een link naar deze route" : "Kies eerst twee plekken"
          }
          className="button circle surface border ripple tap-target text-accent"
        >
          <Icon name="share" />
        </button>

        {/* a small popup, not a modal: the map stays visible and usable behind it */}
        {showHint && (
          <div
            role="alert"
            className="surface-container-highest absolute right-0 top-full z-30 mt-2 w-64 rounded-box border-2 border-line p-4 text-left"
          >
            <p className="text-sm text-ink">
              Kies eerst twee plekken op de kaart. Een route heeft minstens
              twee stopplaatsen.
            </p>
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              className="button border text-ink ripple tap-target mt-3"
            >
              Sluiten
            </button>
          </div>
        )}
      </div>

      {/* the answer is announced, because the button itself does not change after a copy */}
      <p
        aria-live="polite"
        className="max-w-[16rem] text-right text-xs text-ink-muted"
      >
        {note}
      </p>
    </div>
  );
}
