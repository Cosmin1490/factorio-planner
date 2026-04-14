# Steel plate block — 5/s output

264 consumers — highest consumer count in Pyanodon. Feeds locomotives (30 each), wagons, rail, train-stop, pipes, buildings.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| steel-plate | advanced-foundry-mk01 | 75 |

90 MW electric

## Stations (4)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| coke | unload | coke (item) | 25 |
| limestone | unload | limestone (item) | 25 |
| iron-ore | unload | iron-ore (item) | 100 |
| steel-plate | load | steel-plate (item) | 5 |

## Notes

- 75 advanced-foundry-mk01 at 6x6 = 2,700 tiles. This exceeds comfortable single city block. **Split into 2× stamps at 2.5/s each** (38 buildings per stamp, 1,368 tiles).
- Coke comes from tar refinery (phase 0 must be operational). Limestone from limestone block (phase 2).
- Iron-ore at 100/s is 6.67 yellow belts — needs multiple stations or red belt.
- 5/s steel is conservative. Locomotive needs 30 per craft but mall throughput is low. Main demand comes from rail (1 steel per 2 rail) which can spike during expansion.
- Alternative: steel-from-barrels recipe (0.5s, 1 barrel → 1 steel) exists but barrels must be sourced.
