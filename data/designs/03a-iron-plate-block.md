# Iron plate block — 15/s output

183 consumers — Tier A bus item. Feeds small-parts, pipe, rail, inserters, fenxsb-alloy, everything.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| iron-plate | steel-furnace | 38 |

225 MW electric (steel-furnace is fluid-burning — solver doesn't model fuel, compute manually)

## Stations (2)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| iron-ore | unload | iron-ore (item) | 120 |
| iron-plate | load | iron-plate (item) | 15 |

## Notes

- 38 steel-furnaces at 2x2 = 152 tiles. Very compact, fits one city block easily.
- 15/s = 1 yellow belt. Stamp for more throughput.
- Steel-furnace fuel not modeled by solver. Fuel rate = 6 MW / fuel_value per furnace. At coal-gas (0.2 MJ): 30/s per furnace × 38 = 1,140/s. At coke-oven-gas (1.0 MJ): 6/s × 38 = 228/s. Choose fuel based on availability.
- Upgrade path: iron-plate recipe (8:1 ore:plate) is simplest. Crush+smelt (5:1) or BOF casting (1.4:1) give better ratios later but need extra inputs.
- Ash byproduct: stone-furnace produces ash from coal burning. Steel-furnace burns fluid, no ash. If using stone-furnace fallback: 7.5/s ash needs voiding.
