/* a fake google maps api, rich enough for the map component: the maps, the markers, the lines and the
   bounds it builds. it records what it was handed, so a test can look at the drawing instead of a screen.
   the stub classes are deliberately not named Map / Polyline: a class name is bound inside its own body,
   and a field like `new Map()` would then build another stub instead of the global one. */

import type { LatLng } from "../../src/types.ts";

export interface FakeMap {
  host: HTMLElement;
  options: Record<string, unknown>;
  zoom: number;
  /* what the last fitBounds was asked to frame */
  fitted: { points: LatLng[]; padding?: number } | null;
  listeners: globalThis.Map<string, (() => void)[]>;
  emit(event: string): void;
}

export interface FakeMarker {
  title: string;
  element: HTMLElement;
  map: FakeMap | null;
  emit(event: string): void;
}

export interface FakePolyline {
  options: Record<string, unknown>;
  map: FakeMap | null;
}

export interface FakeMaps {
  maps: FakeMap[];
  markers: FakeMarker[];
  polylines: FakePolyline[];
  bounds: LatLng[][];
}

/** installs the fake on globalThis.google and hands back everything it built */
export function installFakeMaps(): FakeMaps {
  const built: FakeMaps = { maps: [], markers: [], polylines: [], bounds: [] };

  class StubBounds {
    points: LatLng[] = [];

    constructor(southWest?: LatLng, northEast?: LatLng) {
      if (southWest) this.points.push(southWest);
      if (northEast) this.points.push(northEast);
    }

    extend(point: LatLng) {
      this.points.push(point);
    }

    isEmpty() {
      return this.points.length === 0;
    }
  }

  class StubMap {
    host: HTMLElement;
    options: Record<string, unknown>;
    zoom = 14;
    fitted: { points: LatLng[]; padding?: number } | null = null;
    listeners = new globalThis.Map<string, (() => void)[]>();

    constructor(host: HTMLElement, options: Record<string, unknown>) {
      this.host = host;
      this.options = options;
      built.maps.push(this as unknown as FakeMap);
    }

    addListener(event: string, listener: () => void) {
      this.listeners.set(event, [
        ...(this.listeners.get(event) ?? []),
        listener,
      ]);
    }

    getZoom() {
      return this.zoom;
    }

    setOptions() {}

    fitBounds(bounds: StubBounds, padding?: number) {
      this.fitted = { points: bounds.points, padding };
      built.bounds.push(bounds.points);
    }

    emit(event: string) {
      for (const listener of this.listeners.get(event) ?? []) listener();
    }
  }

  class StubMarker {
    title = "";
    element: HTMLElement;
    map: FakeMap | null = null;
    listeners = new globalThis.Map<string, (() => void)[]>();

    constructor(options: {
      title?: string;
      content?: HTMLElement;
      map?: FakeMap;
    }) {
      this.title = options.title ?? "";
      this.element = options.content ?? document.createElement("div");
      this.map = options.map ?? null;
      /* the api puts the marker's own element into the map's dom, which is what lets it be measured */
      this.map?.host.append(this.element);
      built.markers.push(this as unknown as FakeMarker);
    }

    addEventListener(event: string, listener: () => void) {
      this.listeners.set(event, [
        ...(this.listeners.get(event) ?? []),
        listener,
      ]);
    }

    setMap(map: FakeMap | null) {
      this.map = map;
      if (map === null) this.element.remove();
    }

    emit(event: string) {
      for (const listener of this.listeners.get(event) ?? []) listener();
    }
  }

  class StubPolyline {
    options: Record<string, unknown>;
    map: FakeMap | null;

    constructor(options: Record<string, unknown> & { map?: FakeMap }) {
      this.options = options;
      this.map = options.map ?? null;
      built.polylines.push(this as unknown as FakePolyline);
    }

    setMap(map: FakeMap | null) {
      this.map = map;
    }
  }

  vi.stubGlobal("google", {
    maps: {
      Map: StubMap,
      Polyline: StubPolyline,
      LatLngBounds: StubBounds,
      /* the api's control corners, which the app reads to pin the zoom control: the fake carries the same members, or `mapOptions` throws before a map is ever built */
      ControlPosition: {
        TOP_LEFT: 1,
        TOP_CENTER: 2,
        TOP_RIGHT: 3,
        LEFT_CENTER: 4,
        LEFT_TOP: 5,
        LEFT_BOTTOM: 6,
        RIGHT_TOP: 7,
        RIGHT_CENTER: 8,
        RIGHT_BOTTOM: 9,
        BOTTOM_LEFT: 10,
        BOTTOM_CENTER: 11,
        BOTTOM_RIGHT: 12,
      },
      marker: { AdvancedMarkerElement: StubMarker },
    },
  });

  return built;
}
