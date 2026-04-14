# Duralumin block — 3/s output

8 consumers in mall alone. Feeds locomotive (25), wagons (10), brake-mk01, inserters.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| duralumin-1 | smelter-mk01 | 12 |

120 MW electric

## Stations (3)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| aluminium-plate | unload | aluminium-plate (item) | 12 |
| copper-plate | unload | copper-plate (item) | 6 |
| duralumin | load | duralumin (item) | 3 |

## Notes

- 12 smelter-mk01. Check tile size for footprint.
- Requires aluminium-plate block (currently ~1/s, needs scaling) and copper-plate block (currently 3.16/s, needs scaling for 6/s demand).
- duralumin-1 is py-rawores-smelter category — **cannot be handcrafted or MAM'd**. Must be a dedicated block or inlined.
- Also consumed by vitreloy (1.5/s for 1/s intermetallics). Total system demand may be higher than 3/s.
