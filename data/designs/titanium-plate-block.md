# Titanium plate block — 2/s output

Feeds cargo-wagon (50 each), fluid-wagon (50 each), vitreloy (3/s for 1/s intermetallics).

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| titanium-plate-1 | steel-furnace | 8 |

Steel-furnace is fluid-burning — fuel not modeled by solver.

## Stations (2)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| ore-titanium | unload | ore-titanium (item) | 20 |
| titanium-plate | load | titanium-plate (item) | 2 |

## Notes

- 8 steel-furnaces at 2x2 = 32 tiles. Very compact.
- titanium-plate-1: 40 ore → 4 plate in 60s. Ratio 10:1.
- Upgrade: titanium-plate-2 uses grade-3-ti (5 → 10 plate in 25s) — ratio 1.9:1 after full processing chain (ore → g1 → g3 with ti-rejects recycling). Much more efficient but needs crusher + screener infrastructure.
- Fuel for steel-furnace: same as iron-plate block. Fuel rate = 6 MW / fuel_value per furnace.
- 2/s is conservative. Each wagon needs 50 titanium-plate — at 2/s that's 25s per wagon. Fine for mall throughput.
