/* our whole use of the google maps javascript api: the one script tag, the key, the colours and the options — the routes themselves are drawn by sections/routes/routeMap.tsx */
/* the key comes from VITE_GOOGLE_MAPS_API_KEY (split/split/.env.local, gitignored by the `*.local` rule); a key written into a source file is a key someone else spends (docs/DESIGN.md §15) */

import type { LatLng, RouteGeometry, TravelMode } from "../../types.ts";
import { AREA_CENTER, AREA_CORNERS } from "../../data/area.ts";

const env: Record<string, string | undefined> = import.meta.env;

const API_KEY = (env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();

/** false in a checkout without .env.local, which is what sends every map back to the artwork */
export const hasGoogleMapsKey = API_KEY.length > 0;

/* the static maps api is a second service on the same key and is not switched on by default — see shared/map/mapPreview.tsx */
export const hasStaticMaps = env.VITE_GOOGLE_MAPS_STATIC_MAPS === "true";
/* an optional map id from the cloud console: with one, google's own place dots can be styled away and the map can wear the brand palette; without one the api's DEMO_MAP_ID is used, which cannot be styled (measured: "A Map's styles property cannot be set when a mapId is present") */
const CLOUD_MAP_ID = (env.VITE_GOOGLE_MAPS_MAP_ID ?? "").trim();
/* the api is a singleton: a second load only warns, so one promise answers every caller */
let loadPromise: Promise<void> | null = null;

/* the routes api is a service of its own and is refused on a key that does not have it; one refusal is remembered for the session */
let routesRefused = false;

/* the same request is answered out of memory: the api is rate limited, and a reader who comes back to a page should not be charged for the same route twice */
const directionsCache = new Map<string, RouteGeometry | null>();

/* the script still loads when the api rejects the key (wrong referrer, no billing), so that failure is reported separately from "the script did not load" */
let authFailed = false;
const authListeners = new Set<() => void>();

/** calls the listener if the key was rejected, at once or when it happens later; the return value unsubscribes */
export function onGoogleMapsAuthFailure(listener: () => void): () => void {
  authListeners.add(listener);
  if (authFailed) listener();

  return () => {
    authListeners.delete(listener);
  };
}

const CALLBACK_NAME = "__zwolleRoutesGoogleMapsReady";

type MapsWindow = Window & { __zwolleRoutesGoogleMapsReady?: () => void };

/** resolves once the api and the maps and marker libraries are on the page, and rejects when they cannot get there */
export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (!hasGoogleMapsKey) {
      reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"));
      return;
    }

    window.gm_authFailure = () => {
      authFailed = true;
      authListeners.forEach((listener) => listener());
    };

    /* the global has to exist before the script runs, because that is how the api announces itself */
    (window as MapsWindow)[CALLBACK_NAME] = () => resolve();

    const query = new URLSearchParams({
      key: API_KEY,
      v: "weekly",
      /* async is the api's own recommendation and the reason it warns in the console without it */
      loading: "async",
      libraries: "maps,marker",
      language: "nl",
      region: "NL",
      callback: CALLBACK_NAME,
    });

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${query.toString()}`;
    script.async = true;
    script.onerror = () =>
      reject(new Error("the google maps script did not load"));
    document.head.append(script);
  });

  return loadPromise;
}

/** Zwolle's binnenstad, for the first paint — the map never leaves the covered area (data/area.ts) */
export const MAP_CENTER: LatLng = AREA_CENTER;

/* built per map rather than once at import: a LatLngBounds can only exist after the api has loaded */
export function mapOptions(): google.maps.MapOptions {
  return {
    center: MAP_CENTER,
    zoom: 14,
    /* advanced markers need a map id: the cloud one when the project has one, and the api's own development id otherwise */
    mapId: CLOUD_MAP_ID.length > 0 ? CLOUD_MAP_ID : "DEMO_MAP_ID",
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: "cooperative",
    minZoom: 13,
    /* the map covers the binnenstad and the noorder eiland and may not be panned out of it; strictBounds is deliberately not set, because it also stops fitBounds from framing the places (measured: the map zoomed past them) */
    restriction: {
      latLngBounds: new google.maps.LatLngBounds(
        AREA_CORNERS.southWest,
        AREA_CORNERS.northEast,
      ),
    },
  };
}

/** the two colours one route is drawn with, so javascript never holds a second palette */
export interface RouteLineColors {
  line: string;
  casing: string;
}

export function routeLineColors(): RouteLineColors {
  return {
    line: cssToken("--color-orange-500", "#f68221"),
    /* white in both themes, exactly like the artwork's stroke-white: one orange line disappears into the tiles (docs/DESIGN.md §8) */
    casing: "#ffffff",
  };
}

/** the tiles paint themselves, so the app's theme is read off the <body> class and handed to the map */
export function mapColorScheme(): "LIGHT" | "DARK" {
  return document.body.classList.contains("dark") ? "DARK" : "LIGHT";
}

/* reads a design token as the api needs it: a colour, not a class or a variable reference */
function cssToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim();
  return value.length > 0 ? value : fallback;
}

/** one map image of these places, drawn by the static maps api — a card wants a picture, not a second map instance */
export function staticMapUrl(points: LatLng[]): string | null {
  if (!hasGoogleMapsKey || points.length === 0) return null;

  const coordinates = points.map(({ lat, lng }) => `${lat},${lng}`).join("|");
  const brand = routeLineColors().line.replace("#", "0x");

  /* 320 x 200 at scale 2 is an image of 640 x 400: the cards' own 16:10 ratio, and crisp on a retina screen */
  const query = [
    `key=${API_KEY}`,
    "size=320x200",
    "scale=2",
    "maptype=roadmap",
    "language=nl",
    "region=NL",
  ];

  /* a line needs two points; a single place is only a marker, and needs a frame of its own because there is nothing to fit */
  if (points.length > 1) {
    query.push(`path=color:${brand}ff|weight:4|${coordinates}`);
  } else {
    query.push(`center=${coordinates}`, "zoom=16");
  }

  query.push(`markers=color:${brand}|size:small|${coordinates}`);

  /* the api's own parser wants the pipes, commas and colons literally, so the query is built by hand rather than by URLSearchParams */
  return `https://maps.googleapis.com/maps/api/staticmap?${query.join("&")}`;
}

/** the road-following line between these places, or null when the api will not answer — the caller draws its own estimate then */
export async function requestDirections(
  points: LatLng[],
  mode: TravelMode,
): Promise<RouteGeometry | null> {
  if (points.length < 2) return null;

  const key = `${mode}:${points.map((point) => `${point.lat},${point.lng}`).join("|")}`;
  if (directionsCache.has(key)) return directionsCache.get(key) ?? null;
  if (routesRefused) return null;

  try {
    const { Route } = await google.maps.importLibrary("routes");

    const { routes } = await Route.computeRoutes({
      origin: points[0],
      destination: points[points.length - 1],
      intermediates: points.slice(1, -1).map((point) => ({ location: point })),
      travelMode: mode === "bicycling" ? "BICYCLING" : "WALKING",
      /* asked for by name: the line and the two numbers, and nothing else to pay for */
      fields: ["path", "distanceMeters", "durationMillis"],
    });

    const route = routes?.[0];
    const path = route?.path ?? [];

    if (path.length < 2) {
      directionsCache.set(key, null);
      return null;
    }

    const geometry: RouteGeometry = {
      path: path.map((position) => position.toJSON()),
      distanceKm: (route?.distanceMeters ?? 0) / 1000,
      durationMinutes: Math.max(
        1,
        Math.round((route?.durationMillis ?? 0) / 60000),
      ),
      followsStreets: true,
    };

    directionsCache.set(key, geometry);
    return geometry;
  } catch {
    /* the key does not have the routes api: remember it for the session, so every page after this one draws its estimate without asking again */
    routesRefused = true;
    directionsCache.set(key, null);
    return null;
  }
}
