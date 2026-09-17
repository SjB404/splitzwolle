import { useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import Icon from "../components/icon.jsx";
import { HeroMapArtwork, RouteArtwork } from "../components/mapArtwork.jsx";
import ThemeToggle from "../components/themeToggle.jsx";
import { MOTION_TRANSITION } from "../motion.js";

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

/* The Material 3 standard curve as Motion wants it (a cubic-bezier array) — the
   same curve as `--ease-standard` in index.css and the same 200ms duration as
   the Tailwind default. Motion is used only where CSS cannot do the job: a
   component entering or leaving the DOM. Everything else is CSS (DESIGN.md §10).

   `m.*` (not `motion.*`) is the lightweight component that works with the
   `LazyMotion` set up in App.tsx. */

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Routes", href: "#routes" },
  { label: "Planning", href: "#planning" },
  { label: "Points of Interest", href: "#poi" },
  { label: "Contact", href: "#contact" },
];

/* The two map layers the hero can preview; `id` is the value held in state. */
const MAP_LAYERS = [
  { id: "historical", label: "Historische kaart" },
  { id: "current", label: "Actuele kaart" },
];

/* Headline figures shown under the hero search. */
const HERO_STATS = [
  { value: "248", label: "routes" },
  { value: "1.9k", label: "gebruikers" },
  { value: "700 jaar", label: "stadsgeschiedenis" },
];

/* How many routes the grid shows before "Alle routes bekijken". */
const ROUTE_PREVIEW_COUNT = 3;

/* The map slider's starting position: 35% means "mostly historic". */
const INITIAL_MAP_POSITION = 35;

const ROUTES = [
  {
    id: 1,
    title: "Hanzekwartier & Peperbus",
    area: "Binnenstad",
    distance: "3,2 km",
    duration: "45 min",
    rating: 4.9,
    reviews: 128,
    popular: true,
    theme: "Historisch",
    path: [
      [26, 58],
      [44, 36],
      [66, 52],
      [80, 30],
    ],
  },
  {
    id: 2,
    title: "Rondje Stadsgracht",
    area: "Stadsgracht",
    distance: "6,8 km",
    duration: "1 u 30",
    rating: 4.7,
    reviews: 94,
    popular: false,
    theme: "Wandel",
    path: [
      [20, 30],
      [40, 62],
      [62, 40],
      [84, 66],
    ],
  },
  {
    id: 3,
    title: "Assendorp Art Route",
    area: "Assendorp",
    distance: "4,1 km",
    duration: "55 min",
    rating: 4.8,
    reviews: 76,
    popular: true,
    theme: "Kunst",
    path: [
      [22, 66],
      [48, 44],
      [58, 68],
      [82, 38],
    ],
  },
  {
    id: 4,
    title: "IJssel & Spoolderbos",
    area: "Spooldersbos",
    distance: "8,4 km",
    duration: "2 u 05",
    rating: 4.6,
    reviews: 61,
    popular: false,
    theme: "Fiets",
    path: [
      [18, 42],
      [38, 24],
      [58, 54],
      [78, 60],
    ],
  },
  {
    id: 5,
    title: "Binnenstad Highlights",
    area: "Centrum",
    distance: "2,6 km",
    duration: "35 min",
    rating: 4.9,
    reviews: 203,
    popular: true,
    theme: "Historisch",
    path: [
      [24, 72],
      [42, 40],
      [64, 30],
      [80, 56],
    ],
  },
  {
    id: 6,
    title: "Berkum Buiten",
    area: "Berkum",
    distance: "5,5 km",
    duration: "1 u 15",
    rating: 4.5,
    reviews: 48,
    popular: false,
    theme: "Natuur",
    path: [
      [20, 34],
      [46, 52],
      [60, 26],
      [84, 48],
    ],
  },
];

/* Route drawn on the hero map. Coordinates are in the artwork's own 610 × 390
   viewBox — see components/mapArtwork.jsx. */
const HERO_ROUTE = [
  [200, 90],
  [242, 60],
  [365, 130],
  [435, 200],
  [207, 240],
];

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar({ active, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-bar sticky top-0 z-50 bg-bar text-on-bar px-0">
      {/* `gap-2 sm:gap-6` keeps the bar inside a 320px viewport; the `max`
          spacer pushes the actions to the trailing edge. `px-0` cancels
          BeerCSS's header padding so this gutter matches the page sections. */}
      <nav className="mx-auto w-full max-w-[100rem] gap-2 px-5 sm:gap-6 sm:px-8">
        <a
          href="#home"
          onClick={() => onNavigate("Home")}
          className="font-display py-1.5 text-lg font-bold tracking-tight text-on-bar sm:text-xl"
        >
          Zwolle Routes
        </a>

        {/* White on white would be flat, so the active link is marked by weight
            and an underline rather than by dimming the others — dimming text with
            opacity is the one thing this project never does (§3). */}
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => onNavigate(link.label)}
            className={`hidden py-2.5 text-sm text-on-bar lg:inline-flex ${
              active === link.label
                ? "font-semibold underline decoration-2 underline-offset-8"
                : "hover:underline hover:underline-offset-8"
            }`}
          >
            {link.label}
          </a>
        ))}

        <div className="max" />

        <ThemeToggle />

        {/* Search collapses away on phones — the hero owns the search field. */}
        <button
          type="button"
          className="circle transparent ripple tap-target hidden text-on-bar sm:inline-flex"
          aria-label="Zoeken"
        >
          <Icon name="search" />
        </button>

        {/* The avatar wears the opposite brand colour to the bar it sits on
            (`--avatar` / `--on-avatar`) — Deltion blue on the light theme's orange
            bar, Deltion orange on the dark theme's blue one. */}
        <button
          type="button"
          className="circle bg-avatar ripple tap-target text-xs font-semibold text-on-avatar"
          aria-label="Account van Jan Bakker"
        >
          JB
        </button>

        {/* `-me-2` pulls the trailing icon button back by the 8px the glyph is
            inset inside its 40px circle, so the icon — not the circle — lines up
            with the content gutter, matching the logo on the left. */}
        <button
          type="button"
          className="circle transparent ripple tap-target -me-2 text-on-bar lg:hidden"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </nav>

      {/* The mobile menu is one of the two places a real enter/exit earns its
          keep: it changes the page height, so without an animation it simply
          appears. `MotionConfig reducedMotion="user"` (App.tsx) drops the height
          animation for anyone who asked for less motion — the menu still opens,
          instantly. */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={MOTION_TRANSITION}
            className="overflow-hidden lg:hidden"
          >
            <div className="mx-auto w-full max-w-[100rem] px-5 pb-4">
              {/* The active row is a translucent state layer over the bar's own colour
                  (`bg-on-bar/20`) rather than an inverted pill: the bar's text is white
                  in light mode, so an inverted row would be orange text on a white fill,
                  which is the one pairing that is unreadable. The layer works in both
                  themes because `--on-bar` is always what contrasts with the bar. */}
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      onNavigate(link.label);
                      setMenuOpen(false);
                    }}
                    className={`button left-align min-h-12 ripple ${
                      active === link.label ? "bg-on-bar/20 text-on-bar" : "transparent text-on-bar"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero map                                                            */
/* ------------------------------------------------------------------ */

/* The hero's map panel: artwork, the historic/current slider, and the stop
   count. `position` is the slider value, where 100 means "fully present-day". */
function HeroMap() {
  const [position, setPosition] = useState(INITIAL_MAP_POSITION);

  /* The fade is a CSS custom property on the card, and the artwork reads it by
     inheritance (see mapArtwork.jsx). Dragging the slider therefore patches one
     style declaration instead of re-rendering the SVG — which is what keeps the
     drag smooth. */
  const historicOpacity = (1 - position / 100).toFixed(2);

  return (
    <div className="relative">
      {/* No shadow, on purpose: the design separates surfaces with tone and
          hairlines, and a 2px-offset blur reads as a smudged edge rather than
          depth. `surface` (not `surface-container-lowest`) is what makes the card
          stand off its band in *both* themes: paper on the light theme's white
          band, blue-900 on the dark theme's blue-950 one. */}
      <div
        className="overflow-hidden rounded-xl surface border border-line"
        style={{ "--historic-opacity": historicOpacity }}
      >
        <HeroMapArtwork stops={HERO_ROUTE} />

        {/* Historic ⇄ current switcher. On a phone this panel sits **under** the
            map (`relative`) instead of over it — an overlay covered a third of a
            350px-wide artwork, which hid the very thing it controls. From `sm` up
            there is room for it to lie across the bottom of the map again. */}
        <div className="surface px-5 py-3 sm:absolute sm:inset-x-0 sm:bottom-0 sm:pb-4 sm:pt-3">
          {/* `mx-0 w-full` cancels the inline margins BeerCSS puts on .slider, so
              the track lines up with the padding and with the labels below it.
              The input is **uncontrolled** on purpose: with a controlled range,
              React writes the value back on every render and the thumb snaps
              backwards when a render misses the pointer — that snap is the visual
              glitch you see when dragging quickly. BeerCSS's own script reads the
              input to paint the filled track. */}
          <label className="slider mx-0 w-full">
            <span className="sr-only">Schakel tussen de historische en de actuele kaart</span>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={INITIAL_MAP_POSITION}
              onChange={(event) => setPosition(Number(event.currentTarget.value))}
            />
            {/* The empty span is the filled part of the slider track. */}
            <span />
          </label>

          <div className="flex items-center justify-between text-[11px] font-medium tracking-wide text-ink-muted">
            <span>Historisch</span>
            <span aria-hidden="true">⇄</span>
            <span>Actueel</span>
          </div>
        </div>

        {/* Stop count — inside the frame so it can never spill over the card edge */}
        <div className="pointer-events-none absolute left-4 top-4">
          <span className="chip surface-container-lowest border border-line text-xs font-semibold">
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500"
              aria-hidden="true"
            />
            {HERO_ROUTE.length} stopplaatsen
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/* Left column: pitch, search, map layer switch and figures. Right column: the
   map panel. BeerCSS's 12-column grid means `s12 l6` is full width up to 993px
   and half of the row above that. */
function Hero() {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState("historical");

  return (
    <section id="home" className="inverse-surface">
      {/* BeerCSS's 12-column grid multiplies `gap` by 11, so a large gap
          overflows a phone. Row gap by default, column gutter only from `lg`.
          The padding is the *same* rhythm as every other section (`py-16
          sm:py-20`) — the hero used to run `lg:py-24`, which left a noticeable
          slab of dead space above the fold that matched nothing else. */}
      <div className="mx-auto grid max-w-[100rem] items-center gap-y-10 px-5 py-16 sm:px-8 sm:py-20 lg:gap-x-20">
        <div className="s12 l6 motion-safe:animate-rise">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Swolla <span aria-hidden="true">→</span> Zwolle
          </p>

          <h1 className="mt-5 text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-6xl">
            Ontdek Zwolle <br /> toen en nu
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Maak je eigen wandel- of fietsroute, ontdek routes van andere gebruikers en
            beleef de stad met een historische kaartlaag naast de actuele plattegrond.
          </p>

          {/* Search bar. BeerCSS's built-in slot for a control inside a field is an
              <a> around an <i> ("clickable icons" in its docs) — a <button> is not
              positioned, so that would need custom CSS. `suffix` reserves the room
              and the anchor navigates to the results list. */}
          <form onSubmit={(event) => event.preventDefault()} className="mt-8 max-w-lg">
            <div className="field round border prefix suffix text-sm">
              {/* The leading icon must be the field's first child — that is what
                  BeerCSS uses to place it as a prefix instead of a suffix. */}
              <Icon name="search" />
              <label htmlFor="hero-search" className="sr-only">
                Zoek een route, plek of wijk
              </label>
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zoek een route, plek of wijk…"
              />
              <a href="#routes" aria-label="Zoeken">
                <Icon name="arrow_forward" />
              </a>
            </div>
          </form>

          {/* Map layer switch — BeerCSS's built-in **connected button group**
              (`nav.group.connected`): one shared container, 2px dividers, rounded
              outer corners, and `.active` on the selected segment, which BeerCSS
              fills with `--primary`. `w-fit` stops the nav from stretching across
              the column. The container is what makes this read as one control, and
              the filled segment is what makes the selection obvious. */}
          <nav className="group connected mt-6 w-fit" aria-label="Kaartlaag">
            {MAP_LAYERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setLayer(id)}
                aria-pressed={layer === id}
                className={`ripple text-sm ${layer === id ? "active" : ""}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
            {HERO_STATS.map(({ value, label }) => (
              <div key={label}>
                <dt className="font-display text-2xl font-bold text-heading">{value}</dt>
                <dd className="text-xs uppercase tracking-wider text-ink-muted">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Artwork column — the 120ms delay staggers it just behind the copy, so
            the hero assembles instead of appearing all at once. */}
        <div className="s12 l6 motion-safe:animate-rise [animation-delay:120ms]">
          <HeroMap />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Route cards                                                         */
/* ------------------------------------------------------------------ */

/* A single route in the "Populaire routes" grid. BeerCSS's <article> is the
   Material 3 card; `no-padding` lets the artwork run to the card's edges. */
/* One route in the grid. It fades its own 200ms in and out; the card count is the
   only thing that changes, so there is nothing to reflow — see the grid below. */
function RouteCard({ route }) {
  return (
    <m.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={MOTION_TRANSITION}
      className="s12 m6 l4 xl:col-span-3 no-padding group flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1"
    >
      {/* The artwork frame is a fixed height and `slice` crops it, so it grows
          with the column on wide screens to keep most of the map in view. */}
      <div className="relative h-52 overflow-hidden surface-container xl:h-64">
        <RouteArtwork path={route.path} />

        {route.popular && (
          <span className="chip primary absolute left-4 top-4 text-[11px] font-bold uppercase tracking-wide">
            <Icon name="local_fire_department" className="mr-1" /> Populair
          </span>
        )}

        <span className="chip surface-container-lowest absolute right-4 top-4 text-[11px] font-semibold">
          {route.area}
        </span>

        <span className="chip surface-container-lowest absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
          {route.theme}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold">{route.title}</h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
          <Icon name="route" className="text-base" />
          {route.distance} · {route.duration}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
            <Icon name="star" className="text-base text-accent" />
            {route.rating.toFixed(1).replace(".", ",")}
          </span>
          <span className="text-xs text-ink-muted">({route.reviews} beoordelingen)</span>

          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5">
            Bekijk <Icon name="arrow_forward" className="text-base" />
          </span>
        </div>
      </div>
    </m.article>
  );
}

/* "Populaire routes" — a preview of the route cards that expands to all of
   them. BeerCSS's grid takes the columns; the cards themselves are `s12 m6 l4`. */
function PopularRoutes() {
  const [showAll, setShowAll] = useState(false);
  const visibleRoutes = useMemo(
    () => (showAll ? ROUTES : ROUTES.slice(0, ROUTE_PREVIEW_COUNT)),
    [showAll],
  );

  return (
    <section id="routes" className="py-16 sm:py-20">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Populaire routes</h2>
            <p className="mt-2 text-[15px] text-ink-muted">
              De hoogst gewaardeerde routes van deze maand, gekozen door de community.
            </p>
          </div>

          {/* `border` is BeerCSS's outlined button. It defaults to `--primary`
              text, which is too light on white (2.5:1), so the label takes the
              theme's ink colour instead — orange stays for the filled action. */}
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="border text-ink ripple"
          >
            {showAll ? "Minder routes" : "Alle routes bekijken"}
          </button>
        </div>

        {/* The grid only ever grows downwards (3 columns at desktop, 1 on a
            phone), so there is no reflow to animate — new cards simply fade in
            and removed ones fade out. No scroll animation anywhere: content that
            animates in as you scroll is noise (DESIGN.md §10). */}
        <div className="mt-10 grid gap-6">
          <AnimatePresence initial={false}>
            {visibleRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer id="contact" className="inverse-surface py-10">
      {/* `w-full` matters: BeerCSS makes <footer> a grid, and a grid item with
          `mx-auto` shrinks to its content and centres itself. */}
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-bold">Zwolle Routes</p>
          <p className="mt-1 text-sm text-ink-muted">
            Wandel en fiets door het Zwolle van toen en nu.
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-muted">
          <li>
            <a href="#routes" className="transition-colors hover:text-ink">
              Routes
            </a>
          </li>
          <li>
            <a href="#planning" className="transition-colors hover:text-ink">
              Planning
            </a>
          </li>
          <li>
            <a href="#poi" className="transition-colors hover:text-ink">
              Points of Interest
            </a>
          </li>
        </ul>

        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()} Zwolle Routes
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/* The page root is a BeerCSS app shell: any element that `:has(> main)` becomes
   a full-height grid with header / main / footer areas. `main` carries `p-0`
   because BeerCSS pads it by 0.5rem, which would inset the hero's dark band. */
export default function HomePage() {
  const [active, setActive] = useState("Home");

  return (
    <div>
      <Navbar active={active} onNavigate={setActive} />
      <main className="p-0">
        <Hero />
        <PopularRoutes />
      </main>
      <Footer />
    </div>
  );
}
