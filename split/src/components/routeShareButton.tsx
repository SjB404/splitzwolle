import { useEffect, useRef, useState } from "react";
import Icon from "./icon.tsx";
import { builderPath } from "../data/navigation.ts";

interface RouteShareButtonProps {
  placeIds: string[];
}

export default function RouteShareButton({ placeIds }: RouteShareButtonProps) {
  const [note, setNote] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const ready = placeIds.length > 1;
  const showHint = hintOpen && !ready;
  const link = `${window.location.origin}${builderPath(placeIds)}`;

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
    if (!ready) {
      setNote("");
      setHintOpen(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setNote("Link gekopieerd. Plak hem waar je wilt.");
    } catch {
      /* some browsers deny the clipboard api; show the link to copy by hand */
      setNote(`Kopieer de link: ${link}`);
    }
  }

  return (
    /* flex-col-reverse: a note appearing after a copy grows upward, not over the button */
    <div className="flex flex-col-reverse items-end gap-2">
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

        {showHint && (
          <div
            role="alert"
            className="surface-container-highest absolute right-0 bottom-full z-30 mb-2 w-64 rounded-box border-2 border-line p-4 text-left"
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

      <p
        aria-live="polite"
        className="max-w-[16rem] text-right text-xs text-ink-muted"
      >
        {note}
      </p>
    </div>
  );
}
