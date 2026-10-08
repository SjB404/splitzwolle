# Pictures for the places

The nine places' pictures live in `split/src/assets/place_images/` and are imported by
`src/data/placeImages.ts`, keyed by place id. A component reads `point.image` first — the
collaborator's api can still answer with a url — and `PLACE_IMAGES[point.id]` second, so the home
strip, the place cards on the places page and the map's hover card all show the picture while the
place data itself stays free of asset imports: the e2e suite reads `src/data/pointsOfInterest.ts`
with plain node, and plain node cannot import a `.jpg`. A place without either draws its category
glyph instead.

To picture a new place, drop a file in and add it to the map:

```ts
import peperbus from "../assets/place_images/peperbus.png";

export const PLACE_IMAGES: Record<string, string> = {
  peperbus,
  …
};
```

Use a picture that is at least 600px wide and roughly 4:3 (the preview card crops to a wide 2:1
band, the home strip crops to a circle). The `alt` is empty and the `<img>` is `aria-hidden`: the
place's name is already beside it, and the accessibility sweep only accepts a picture as decorative
when it says so.

## The list

The coordinates and addresses below came from Google's Places API, not from anyone's memory, and the
`placeId` is what keeps a re-resolve pointing at the same place.

| #   | Place                       | Category   | Era  | Address                               | Place ID                      | File                   |
| --- | --------------------------- | ---------- | ---- | ------------------------------------- | ----------------------------- | ---------------------- |
| 1   | De Peperbus                 | Monumenten | Toen | Ossenmarkt 40, 8011 MS Zwolle         | `ChIJIS7KXC7fx0cRvWB4rIIhgMs` | `peperbus.png`         |
| 2   | Sassenpoort                 | Monumenten | Toen | Sassenstraat 53, 8011 PB Zwolle       | `ChIJZ835lCXfx0cRnFqiEL3qY84` | `sassenpoort.png`      |
| 3   | Academiehuis de Grote Kerk  | Monumenten | Toen | Grote Markt 18, 8011 LW Zwolle        | `ChIJqZQ6pC_fx0cRQUcrDmBkiho` | `grotekerk.jpg`        |
| 4   | Het Zwolse Balletjeshuis    | Culinair   | Nu   | Grote Kerkplein 13, 8011 PK Zwolle    | `ChIJq4LGCy_fx0cRSVfXheD08ic` | `balletjeshuis.jpg`    |
| 5   | Museum de Fundatie          | Musea      | Nu   | Blijmarkt 20, 8011 NE Zwolle          | `ChIJsWzGGS_fx0cRktQ6qRlnZ0c` | `museumdefundatie.webp` |
| 6   | ANNO Stadsmuseum Zwolle     | Musea      | Nu   | Melkmarkt 41, 8011 MB Zwolle          | `ChIJZbvtYZzfx0cRdZR2UoXA4hk` | `annostadsmuseum.jpg`  |
| 7   | Thorbeckegracht & Stadsmuren | Culinair  | Nu   | Thorbeckegracht, 8011 Zwolle          | `ChIJ5UcPBjDfx0cRIOYsWSZBdac` | `thorbeckegracht.webp` |
| 8   | Het Vrouwenhuis             | Musea      | Toen | Voorstraat 46, 8011 ML Zwolle         | `ChIJ6b4TQC7fx0cRYdBotZ6rUsc` | `vrouwenhuis.jpg`      |
| 9   | Van der Velde in de Broeren | Monumenten | Nu   | Achter de Broeren 1-3, 8011 VA Zwolle | `ChIJ3fBwNSXfx0cRngG_gUnrhtU` | `vandervelde.jpg`      |

Two of these came out of the first resolve pass as _places that did not exist_:
`IJsselkade` (which is in Kampen) became **Thorbeckegracht**, and `Rijsterborgherpark` (which is in
Deventer) never made it past the resolve. `Stedelijk Museum Zwolle` had been renamed to
**ANNO Stadsmuseum Zwolle**.
