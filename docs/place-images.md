# Pictures for the places

Every place in `src/data/pointsOfInterest.ts` takes an optional `image`. Drop a file in
`split/split/src/assets/places/`, import it, and set it on the place — the preview card (hover a dot on the
map) and the home strip show it straight away. Until then both draw the category glyph instead.

```ts
import peperbus from "../assets/places/de-peperbus.jpg";

export const RESOLVED_PLACES = [
  { id: "peperbus", …, image: peperbus },
];
```

Use a picture that is at least 600px wide and roughly 4:3 (the preview card crops to 16:10, the home
strip crops to a circle). The `alt` is empty on purpose: the place's name is already beside it.

## The list

The coordinates and addresses below came from Google's Places API, not from anyone's memory, and the
`placeId` is what keeps a re-resolve pointing at the same place.

| #   | Place                     | Category   | Era  | Address                                         | Place ID                      | Where to look                                                 |
| --- | ------------------------- | ---------- | ---- | ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------- |
| 1   | De Peperbus               | Monumenten | Toen | Ossenmarkt 40, 8011 MS Zwolle                   | `ChIJIS7KXC7fx0cRvWB4rIIhgMs` | the tower from the Ossenmarkt, or the view from the top       |
| 2   | Sassenpoort               | Monumenten | Toen | Sassenstraat 53, 8011 PB Zwolle                 | `ChIJZ835lCXfx0cRnFqiEL3qY84` | the gate from the city side, with the bridge                  |
| 3   | Grote Kerk (Academiehuis) | Monumenten | Toen | Grote Markt 18, 8011 LW Zwolle                  | `ChIJqZQ6pC_fx0cRQUcrDmBkiho` | the tower over the Grote Markt, or the organ                  |
| 4   | Museum de Fundatie        | Musea      | Nu   | Blijmarkt 20, 8011 NE Zwolle                    | `ChIJsWzGGS_fx0cRktQ6qRlnZ0c` | the palace with the egg on the roof                           |
| 5   | ANNO Stadsmuseum Zwolle   | Musea      | Nu   | Melkmarkt 41, 8011 MB Zwolle                    | `ChIJZbvtYZzfx0cRdZR2UoXA4hk` | the museum's own facade, or the old city model inside         |
| 6   | Park Eekhout              | Parken     | Nu   | Burgemeester van Roijensingel 4, 8011 CH Zwolle | `ChIJm7WGti7fx0cRRbF2N7FHpoI` | the pond and the old trees                                    |
| 7   | De Librije                | Culinair   | Nu   | Spinhuisplein 1, 8011 ZZ Zwolle                 | `ChIJZTzQ4y_fx0cR4m292pUWJyM` | the courtyard entrance of the old prison                      |
| 8   | Thorbeckegracht           | Culinair   | Nu   | Thorbeckegracht, 8011 Zwolle                    | `ChIJ5UcPBjDfx0cRIOYsWSZBdac` | the canal with its terraces and the old warehouses            |
| 9   | Melkmarkt                 | Culinair   | Toen | Melkmarkt, 8011 MB Zwolle                       | `ChIJ-S5tNS7fx0cRlm2tsYMtJc4` | the square with its terraces, looking towards the Grote Markt |

Two of these came out of the first resolve pass as _places that did not exist_:
`IJsselkade` (which is in Kampen) became **Thorbeckegracht**, and `Rijsterborgherpark` (which is in
Deventer) became **Park Eekhout**. `Stedelijk Museum Zwolle` had been renamed to
**ANNO Stadsmuseum Zwolle**.
