# Intermetallics block — 1/s output (inline vitreloy + fenxsb-alloy)

48 consumers — significant bus item. Feeds locomotive (5), cargo-wagon (5), fluid-wagon (5), many buildings.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| intermetallics | advanced-foundry-mk01 | 15 |
| vitreloy | smelter-mk01 | 5 |
| fenxsb-alloy-2 | smelter-mk01 | 10 |

30 buildings, 168 MW electric

## Stations (8)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| sb-oxide | unload | sb-oxide (item) | 2.0 |
| duralumin | unload | duralumin (item) | 1.5 |
| nickel-plate | unload | nickel-plate (item) | 1.5 |
| titanium-plate | unload | titanium-plate (item) | 1.5 |
| copper-plate | unload | copper-plate (item) | 1.5 |
| nexelit-plate | unload | nexelit-plate (item) | 1.0 |
| iron-plate | unload | iron-plate (item) | 3.5 |
| intermetallics | load | intermetallics (item) | 1.0 |

## Intermediates

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| fenxsb-alloy | 1.0 | fenxsb-alloy-2 (smelter) | intermetallics |
| vitreloy | 1.0 | vitreloy (smelter) | intermetallics |

## Notes

- 30 buildings is substantial. Check tile footprint for advanced-foundry-mk01 (6x6 = 540 tiles for 15) + smelter-mk01 footprint.
- 7 import stations + 1 export = 8 stations total. Tight for one city block.
- All three recipes require specialized buildings — **none can be handcrafted or MAM'd**.
- vitreloy needs 5 different plates (sb-oxide, duralumin, nickel, titanium, copper). This is why intermetallics has so many inputs.
- Upstream requirements: duralumin block, titanium block, plus nickel-plate, nexelit-plate, sb-oxide (need blocks or mining).
- fenxsb-alloy also consumed by shaft-mk01 (mall) and long-handed-inserter — 1/s here may not cover all demand.
