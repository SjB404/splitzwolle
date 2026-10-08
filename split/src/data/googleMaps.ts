/* the key comes from VITE_GOOGLE_MAPS_API_KEY (gitignored .env.local); never hardcode it */

import type { LatLng, RouteGeometry, TravelMode } from "../types.ts";
import { AREA_CENTER, AREA_CORNERS } from "./area.ts";

const env: Record<string, string | undefined> = import.meta.env;

const API_KEY = (env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();

/* false with no key configured; every map falls back to the artwork */
export const hasGoogleMapsKey = API_KEY.length > 0;

/* static maps is a second service on the same key, off by default */
export const hasStaticMaps = env.VITE_GOOGLE_MAPS_STATIC_MAPS === "true";
/* without a cloud map id the api's DEMO_MAP_ID is used, and its styles cannot be set */
const CLOUD_MAP_ID = (env.VITE_GOOGLE_MAPS_MAP_ID ?? "").trim();
/* the api is a singleton; a second load only warns, so cache the promise */
let loadPromise: Promise<void> | null = null;

/* the routes api can be refused on a key without it; one refusal is remembered */
let routesRefused = false;

/* api is rate limited; the same request is answered from memory */
const directionsCache = new Map<string, RouteGeometry | null>();

/* the script still loads when the key is rejected, so that is tracked separately */
let authFailed = false;
const authListeners = new Set<() => void>();

/* fires at once if the key was already rejected; returns an unsubscribe */
export function onGoogleMapsAuthFailure(listener: () => void): () => void {
  authListeners.add(listener);
  if (authFailed) listener();

  return () => {
    authListeners.delete(listener);
  };
}

const CALLBACK_NAME = "__zwolleRoutesGoogleMapsReady";

type MapsWindow = Window & { __zwolleRoutesGoogleMapsReady?: () => void };

/** resolves when the api and the maps and marker libraries have loaded */
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

    /* the global must exist before the script loads; the api calls it when ready */
    (window as MapsWindow)[CALLBACK_NAME] = () => resolve();

    const query = new URLSearchParams({
      key: API_KEY,
      v: "weekly",
      /* loading=async is the api's recommendation; it warns without it */
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

/* per map, not at import: LatLngBounds cannot exist before the api has loaded */
export function mapOptions(): google.maps.MapOptions {
  return {
    center: AREA_CENTER,
    zoom: 14,
    mapId: CLOUD_MAP_ID.length > 0 ? CLOUD_MAP_ID : "DEMO_MAP_ID",
    disableDefaultUI: true,
    zoomControl: true,
    /* zoom control moves top-right: bottom-right is the share button's corner */
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP,
    },
    clickableIcons: false,
    gestureHandling: "cooperative",
    minZoom: 13,
    /* strictBounds deliberately off: it also blocks fitBounds (measured: zoomed past the places) */
    restriction: {
      latLngBounds: new google.maps.LatLngBounds(
        AREA_CORNERS.southWest,
        AREA_CORNERS.northEast,
      ),
    },
  };
}

interface RouteLineColors {
  line: string;
  casing: string;
}

export function routeLineColors(): RouteLineColors {
  return {
    line: cssToken("--color-orange-500", "#f68221"),
    /* white in both themes; an orange line alone disappears into the tiles */
    casing: "#ffffff",
  };
}

export function mapColorScheme(): "LIGHT" | "DARK" {
  return document.body.classList.contains("dark") ? "DARK" : "LIGHT";
}

function cssToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim();
  return value.length > 0 ? value : fallback;
}

export function formatLatLng(point: LatLng): string {
  return `${point.lat},${point.lng}`;
}

export function staticMapUrl(points: LatLng[]): string | null {
  if (!hasGoogleMapsKey || points.length === 0) return null;

  const coordinates = points.map(formatLatLng).join("|");
  const brand = routeLineColors().line.replace("#", "0x");

  /* 320x200 at scale 2 is 640x400: the cards' 16:10 ratio, crisp on retina */
  const query = [
    `key=${API_KEY}`,
    "size=320x200",
    "scale=2",
    "maptype=roadmap",
    "language=nl",
    "region=NL",
  ];

  if (points.length > 1) {
    query.push(`path=color:${brand}ff|weight:4|${coordinates}`);
  } else {
    query.push(`center=${coordinates}`, "zoom=16");
  }

  query.push(`markers=color:${brand}|size:small|${coordinates}`);

  /* the api wants pipes, commas and colons literal, so the query is built by hand */
  return `https://maps.googleapis.com/maps/api/staticmap?${query.join("&")}`;
}

export async function requestDirections(
  points: LatLng[],
  mode: TravelMode,
): Promise<RouteGeometry | null> {
  if (points.length < 2) return null;

  const key = `${mode}:${points.map(formatLatLng).join("|")}`;
  if (directionsCache.has(key)) return directionsCache.get(key) ?? null;
  if (routesRefused) return null;

  try {
    const { Route } = await google.maps.importLibrary("routes");

    const { routes } = await Route.computeRoutes({
      origin: points[0],
      destination: points[points.length - 1],
      intermediates: points.slice(1, -1).map((point) => ({ location: point })),
      travelMode: mode === "bicycling" ? "BICYCLING" : "WALKING",
      /* fields asked by name: the path and two numbers only, nothing else billable */
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
    /* routes api refused on this key; remembered for the session */
    routesRefused = true;
    directionsCache.set(key, null);
    return null;
  }
}
