/* the glyph name must be in the icon_names subset in index.html */

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
