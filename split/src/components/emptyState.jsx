/*
emptystate — the card a list shows when it has nothing to show.

used by the route overview and the points of interest. the way out of the empty
state comes in as action, because only the page knows what resetting means for
its own filters.

titleLevel matters: on its own the heading is an h2, but under a SectionHeading
it has to be an h3 or the document outline skips a level.
*/

import Icon from "./icon.jsx";

export default function EmptyState({
  icon,
  title,
  description,
  titleLevel = 2,
  action,
}) {
  const Title = titleLevel === 3 ? "h3" : "h2";

  return (
    <article className="mt-10 flex flex-col items-center gap-3 p-10 text-center">
      <Icon name={icon} className="text-3xl text-ink-muted" />
      <Title className="text-xl font-bold">{title}</Title>
      <p className="max-w-md text-sm text-ink-muted">{description}</p>
      {action}
    </article>
  );
}
