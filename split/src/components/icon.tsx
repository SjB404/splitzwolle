/* one material symbols glyph; the name must be in the subset url in index.html, font size sets the size, and aria-hidden keeps the glyph name out of screen readers */

/* name is a plain string, not a union: the icon list lives in index.html's font subset, outside this project */
interface IconProps {
  name: string;
  className?: string;
}

export default function Icon({ name, className = "" }: IconProps) {
  return (
    <i className={className} aria-hidden="true">
      {name}
    </i>
  );
}
