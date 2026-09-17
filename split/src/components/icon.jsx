/* ---------------------------------------------------------------------------
 * Icon — a single Material Symbols glyph.
 *
 * BeerCSS paints <i> with `font-family: var(--font-icon)`, and the glyph is
 * picked by the element's text: "search" renders the magnifier, not the word.
 * The icon font is a Google Fonts subset declared in index.html, so a new icon
 * only becomes available after its name is added to that URL.
 *
 * Sizing: use Tailwind font-size utilities (`text-base`, `text-xl`) — Material
 * Symbols are sized by font-size. Color is inherited, so an icon always matches
 * the button, chip or link it sits in.
 *
 * Usage:  <Icon name="search" className="text-base" />
 * ------------------------------------------------------------------------- */
export default function Icon({ name, className = "" }) {
  return (
    <i className={className} aria-hidden="true">
      {name}
    </i>
  );
}
