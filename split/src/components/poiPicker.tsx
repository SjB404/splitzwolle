/* the menu that turns places into a route — the places inside the covered area, grouped by the era they belong to, plus the way of travelling */
/* the picked order is the visit order, so the number on a chip is the number on the map and in the summary beside it */

import Icon from "./icon.tsx";
import { poiCategoryIcon } from "../data/pointsOfInterest.ts";
import type { PoiEra, PointOfInterest, TravelMode } from "../types.ts";

const ERAS: { era: PoiEra; note: string }[] = [
  { era: "Toen", note: "op de historische kaart" },
  { era: "Nu", note: "wat de stad vandaag is" },
];

const MODES: { mode: TravelMode; label: string; icon: string }[] = [
  { mode: "walking", label: "Lopen", icon: "directions_walk" },
  { mode: "bicycling", label: "Fietsen", icon: "directions_bike" },
];

interface PoiPickerProps {
  /* the places a route may use: the ones inside the covered area */
  points: PointOfInterest[];
  /* the picked ids, in visit order */
  pickedIds: string[];
  mode: TravelMode;
  onToggle: (id: string) => void;
  onModeChange: (mode: TravelMode) => void;
  onReset: () => void;
}

export default function PoiPicker({
  points,
  pickedIds,
  mode,
  onToggle,
  onModeChange,
  onReset,
}: PoiPickerProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {MODES.map((item) => (
          <button
            key={item.mode}
            type="button"
            aria-pressed={mode === item.mode}
            onClick={() => onModeChange(item.mode)}
            /* `medium` lifts the chip from 32px to 40px, which is what lets `tap-target` reach material 3's 48px hit area without growing the visual past it — the same recipe the places page's category chips use, so a chip is one control in both places */
            className={`chip medium tap-target ripple ${
              mode === item.mode ? "bg-selected text-on-selected border-transparent" : ""
            }`}
          >
            <Icon name={item.icon} className="text-base" />
            {item.label}
          </button>
        ))}

        {pickedIds.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="button border text-ink ripple tap-target ml-auto"
          >
            <Icon name="close" className="text-base" />
            Selectie wissen
          </button>
        )}
      </div>

      {ERAS.map((group) => {
        const groupPoints = points.filter((point) => point.era === group.era);
        if (groupPoints.length === 0) return null;

        return (
          <div key={group.era} className="mt-5">
            <h3 className="text-sm font-bold">
              Plekken van {group.era.toLowerCase()}{" "}
              <span className="font-normal text-ink-muted">— {group.note}</span>
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {groupPoints.map((point) => {
                const order = pickedIds.indexOf(point.id);

                return (
                  <button
                    key={point.id}
                    type="button"
                    aria-pressed={order >= 0}
                    onClick={() => onToggle(point.id)}
                    /* the same 40px chip as the travel mode above it: a place is one tap on a value, and every one of them has to be as hittable as the chip beside it */
                    className={`chip medium tap-target ripple ${
                      order >= 0 ? "bg-selected text-on-selected border-transparent" : ""
                    }`}
                  >
                    <Icon
                      name={poiCategoryIcon(point.category)}
                      className="text-base"
                    />
                    {order >= 0 && <span>{order + 1}.</span>} {point.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
