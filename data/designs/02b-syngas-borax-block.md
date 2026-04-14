# Syngas/borax block — 4.0/s borax output

Deep coal-cracking block: raw-coal → coal-gas → syngas, with full tar recycling (tar → pitch → coke → coal-gas loop). Syngas feeds borax miners. Borax washing inline — exports borax, not raw-borax. Half-scale — stamp 2x for full iron plate block demand.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| distilled-raw-coal | distilator | 2 |
| coal-gas | distilator | 1 |
| coal-gas-from-coke | distilator | 8 |
| syngas | gasifier | 6 |
| tar-refining | tar-processing-unit | 6 |
| pitch-refining | distilator | 9 |
| anthracene-gasoline-cracking | distilator | 11 |
| tar-refining-tops | tar-processing-unit | 2 |
| borax-mine | borax-mine | 3 |
| borax-washing | washer | 3 |
| oil-boiler-mk01 | (burner) | 12 |
| **TOTAL** | | **63** |

20.6 MW electric (oil boilers self-powered)

## Stations (2)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| raw-coal | unload | raw-coal (item) | 7.5 |
| borax | load | borax (item) | 4.0 |

Water (404/s) piped — build near water or use mk02+ fluid wagon.

## Self-power

12 oil-boiler-mk01 burn **54.2/s gasoline** + **40.4/s naphthalene-oil** → 312.6/s steam at 250°C for tar-refining, pitch-refining, and tar-refining-tops. Boiler capacity 336/s (93% utilization). Naphthalene-oil surplus: 26.8/s after fuel.

## Intermediates

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| coal | 2.25 | distilled-raw-coal | coal-gas (distilator) |
| coal-gas | 85.0 | distilled-raw-coal 44.9 + coal-gas 9.0 + coal-gas-from-coke 31.1 | syngas (gasifier) |
| tar | 115.8 | distilled-raw-coal 22.5 + coal-gas 11.2 + coal-gas-from-coke 31.1 + syngas 51.0 | tar-refining |
| coke | 31.1 | coal-gas 1.4 + pitch-refining 16.2 + anthracene-cracking 13.6 | coal-gas-from-coke |
| pitch | 162.1 | tar-refining | pitch-refining |
| anthracene-oil | 135.5 | tar-refining 86.8 + pitch-refining 48.6 | anthracene-gasoline-cracking |
| middle-oil | 34.7 | tar-refining | tar-refining-tops |
| syngas | 119.0 | gasifier | borax-mine 100.0 (19.0 surplus) |
| raw-borax | 4.0 | borax-mine | borax-washing |
| steam | 312.6 | oil-boiler-mk01 | tar-refining + pitch-refining + tar-refining-tops |

## Byproducts

| Byproduct | Rate/s | Disposition |
|---|---|---|
| creosote | 27.8 | export (iron block needs 1.8/s for sand-casting) |
| muddy-sludge | 42.9 | sinkhole |
| naphthalene-oil | 26.8 | sinkhole (after 40.4/s burned for steam) |
| carbolic-oil | 17.4 | sinkhole |
| light-oil | 49.8 | sinkhole (aromatics feedstock later) |
| hydrogen | 16.2 | gas vent |
| iron-oxide | 0.2 | pyvoid |
| ash | 3.3 | pyvoid |

## Tile footprint

3,987 tiles (31x distilator 64 + 6x gasifier 64 + 8x tar-processing-unit 121 + 3x borax-mine 81 + 3x washer 36 + 12x oil-boiler 25). Fits one city block with room for routing and voiding infrastructure.

## Scaling

- 3 miners consume 100/s of the 119/s syngas. 19/s surplus covers partial 4th miner or future expansion.
- Stamp 2x for full iron plate demand. Train network absorbs it.
- Full-scale (15/s raw-coal, 238/s syngas, 7 miners) fits a single city block at ~7,000 tiles.

## Helmod import string

```
eJztl79uwyAQxvc8BfJcS3X+tgNLh25d8gIRgXODgsEF3Naq8u7FDsXUbiNvsdRu8N2d+e6HdZaZQkJRItAOf8wQooIYg5MnxUAkN054BW24knjebCwvAGfNau+KjjutlG3LQuFDo7eFCHGGk3Ne5hVJXH1iiU415Fxy+ZxaVRoftXXpon6j3iTosNvXu1IrVlGLra4giDmhVuka50QYrxolnOdYoQcumAbpnSK0zcIyGN8C5SX4477cb7NYkAze8W0nXO6m60j3H+1babBmnfpSEcFtjROpdEFElP/VZWc62H48h6Lk2Jc7iIIxjbNKcvst6/fjECKFqqSNe0WocJ4FGPxxCuKpi++BUCWjaIht52Phzwewsz5sIu1BEwoS0mfibpq7BXXC0bU4Ee6MG8sFcdHr4F6Mxb0Y4J73cZfc0kN4u/8Bt4CXYwEvB4AXl4bHRPBOZm6sxnJeDTgv+5xNLd28mAhh54TnHK70+q7HYl0PsK76WKkiohnEaa5VkVJ1hIkgvvaM2IyFvBlAXv8G+R9ti/ZuLNq7AdpNH+25FwEs1eQtbUD/bcizKMP3aYLx8wyN+rg4WnNRcfbtBsrK4iy7/+ks96HRwDhI692cwj9GK5xmGmylJdrNQLJPdV09cA==
```
