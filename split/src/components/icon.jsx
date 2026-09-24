/*
icon — one material symbols glyph.

beerCSS paints the <i> with an icon font, and the text inside picks which glyph you
get: "search" draws a magnifier instead of the word. the font is a google fonts
subset declared in index.html, so a new icon name only works once it is added to that
url.

size it with a tailwind font size (text-base, text-xl), because these glyphs are
sized by font size. colour is inherited, so an icon always matches whatever it sits
in.

the aria-hidden matters. without it a screen reader reads the glyph's name out loud
next to the real label.

usage: <Icon name="search" className="text-base" />
*/
export default function Icon({ name, className = "" }) {
  return (
    <i className={className} aria-hidden="true">
      {name}
    </i>
  );
}
