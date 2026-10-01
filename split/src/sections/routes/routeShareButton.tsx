/* the share action in the map's corner — the route is already in the url, so sharing is copying it.
   There is no account yet, so a copied link is the whole feature (see docs/BACKEND.md) */

import { useState } from "react";
import Icon from "../../shared/primitives/icon.tsx";
import { builderPath } from "../../data/navigation.ts";

interface RouteShareButtonProps {
  placeIds: string[];
}

export default function RouteShareButton({ placeIds }: RouteShareButtonProps) {
  const [note, setNote] = useState("");
  /* a route needs two places before it is a route, so the button waits for the second click */
  const ready = placeIds.length > 1;
  const link = `${window.location.origin}${builderPath(placeIds)}`;

  async function share() {
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
      <button
        type="button"
        disabled={!ready}
        onClick={() => void share()}
        aria-label="Deel deze route"
        title={
          ready ? "Kopieer een link naar deze route" : "Kies eerst twee plekken"
        }
        className="button circle surface border ripple tap-target text-accent"
      >
        <Icon name="share" />
      </button>

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
