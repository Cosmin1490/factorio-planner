# Automation science pack — 0.4/s, 61 buildings

Fully self-contained: self-powered (boilers), ash-independent (burner fuel + boiler ash), no processed imports. All inputs are raw mined resources except native-flora (irreducible — no recipe exists).

Burner assemblers (assembling-machine-1) and stone-furnaces with raw-coal fuel.
Bio modules on fwf-mk01 (10x tree-mk01) and moss-farm-mk01 (15x moss).
Copper via grade-2 screening + grade-1 crush (full recycle, zero waste).
Log3 recipe consumes ash — bio loop doubles as an ash sink.
Moondrop greenhouse provides free CO2 for Moss-2.

## Recipe table

51 core + 4 copper solver-validated (simplex). 6 power buildings manually computed.

```
┌─────────────────────────┬──────────────────────────┬───────┬───────────────┐
│ Recipe                  │ Factory                  │ Count │ Modules       │
├─────────────────────────┼──────────────────────────┼───────┼───────────────┤
│ automation-science-pack │ assembling-machine-1     │     2 │               │
│ planter-box             │ assembling-machine-1     │     2 │               │
│ empty-planter-box       │ assembling-machine-1     │     1 │               │
│ small-parts-01          │ assembling-machine-1     │     1 │               │
│ iron-gear-wheel         │ assembling-machine-1     │     1 │               │
│ copper-cable            │ assembling-machine-1     │     1 │               │
│ bolts                   │ assembling-machine-1     │     1 │               │
│ iron-stick              │ assembling-machine-1     │     1 │               │
│ wood-seeds              │ assembling-machine-1     │     1 │               │
│ stone-brick             │ stone-furnace            │    11 │               │
│ low-grade-smelting-iron │ stone-furnace            │    14 │               │
│ copper-plate-4          │ stone-furnace            │     1 │               │
│ grade-1-iron-crush      │ jaw-crusher              │     5 │               │
│ grade-2-copper          │ automated-screener-mk01  │     2 │               │
│ grade-1-copper-crush    │ jaw-crusher              │     1 │               │
│ log-wood-fast           │ wpu-mk01                 │     1 │               │
│ log3                    │ fwf-mk01                 │     2 │ 10x tree-mk01 │
│ wood-seedling           │ botanical-nursery        │     1 │               │
│ Moss-2                  │ moss-farm-mk01           │     1 │ 15x moss      │
│ soil                    │ soil-extractor-mk01      │     3 │               │
│ muddy-sludge            │ washer                   │     1 │               │
│ moondrop-co2            │ moondrop-greenhouse-mk01 │     1 │               │
│ (self-power)            │ boiler                   │     4 │               │
│ (self-power)            │ steam-engine             │     2 │               │
└─────────────────────────┴──────────────────────────┴───────┴───────────────┘
```

61 buildings total (55 production + 6 power), ~7.0 MW electric (self-powered).

## Intermediate flows

All rates /s. Grouped by production chain.

**Iron chain**
| Item | /s | From | To |
|---|---|---|---|
| processed-iron-ore | 6.60 | grade-1-iron-crush | low-grade-smelting-iron |
| iron-plate | 2.20 | low-grade-smelting-iron | empty-planter-box (0.80), iron-gear-wheel (0.80), iron-stick (0.60) |
| iron-stick | 1.20 | iron-stick | bolts |
| iron-gear-wheel | 0.40 | iron-gear-wheel | small-parts-01 |
| bolts | 1.20 | bolts | small-parts-01 |
| copper-cable | 1.20 | copper-cable | small-parts-01 |
| small-parts-01 | 0.80 | small-parts-01 | automation-science-pack |

**Copper chain**
| Item | /s | From | To |
|---|---|---|---|
| grade-1-copper | 0.60 | grade-2-copper (screener) | grade-1-copper-crush |
| grade-2-copper | 1.50 | grade-2-copper (1.20) + grade-1-copper-crush (0.30) | copper-plate-4 |
| copper-plate | 0.60 | copper-plate-4 | copper-cable |

**Wood / planter chain**
| Item | /s | From | To |
|---|---|---|---|
| wood-seeds | 0.03 | wood-seeds | wood-seedling |
| wood-seedling | 0.08 | wood-seedling | log3 |
| log | 0.16 | log3 | log-wood-fast |
| wood | 1.63 | log-wood-fast | empty-planter-box (1.60), wood-seeds (0.03) |
| empty-planter-box | 0.80 | empty-planter-box | planter-box |
| planter-box | 0.80 | planter-box | automation-science-pack |

**Bio chain**
| Item | /s | From | To |
|---|---|---|---|
| carbon-dioxide | 0.85 | moondrop-co2 | Moss-2 |
| muddy-sludge | 0.85 | muddy-sludge (washer) | Moss-2 |
| moss | 0.14 | Moss-2 | wood-seedling |
| soil | 4.09 | soil (extractor) | planter-box (4.00), muddy-sludge (0.09) |

**Fuel → ash**
| Item | /s | From | To |
|---|---|---|---|
| raw-coal | 6.43 | import | burner machines (1.70), copper furnace (0.07), boilers (4.69) |
| ash | 6.43 | burner machines + boilers (see ash balance) | planter-box (2.36), log3 (0.82), void (3.25) |

Raw-coal and ash are 1:1 by burnt_result.

**Stone flows**
| Item | /s | From | To |
|---|---|---|---|
| stone | 6.57 | grade-1-iron-crush (2.20) + grade-1-copper-crush (0.60) + import (3.77) | stone-brick (6.40), Moss-2 (0.17) |
| stone-brick | 3.20 | stone-brick (furnace) | empty-planter-box |

## Imports

All raw mined resources — no processed items.

| Item | /s |
|---|---|
| iron-ore | 11.00 |
| raw-coal | 6.43 |
| stone | 3.77 |
| copper-ore | 3.00 |
| native-flora | 4.00 |
| water | ~252 |

## Exports

| Item | /s |
|---|---|
| automation-science-pack | 0.40 |

Voided: excess ash ~3.25/s.

## Key recipes

- **grade-1-iron-crush** (jaw-crusher, 2s): 5 iron-ore → 3 processed-iron-ore + 1 stone
- **low-grade-smelting-iron** (stone-furnace, 6s): 3 processed-iron-ore → 1 iron-plate
- **grade-2-copper** (screener, 3s): 5 copper-ore → 1 grade-1-copper + 2 grade-2-copper
- **grade-1-copper-crush** (jaw-crusher, 3s): 2 grade-1-copper → 2 stone + 1 grade-2-copper
- **copper-plate-4** (stone-furnace, 2s): 5 grade-2-copper → 2 copper-plate
- **log3** (fwf, 40s): 30 ash + 3 seedling + 500 water → 6 log — ash sink
- **Moss-2** (moss-farm, 80s): 20 stone + 100 muddy-sludge + 100 CO2 → 16 moss

Copper yield: 5 ore/plate (vs 8 with direct smelting). Grade-1 fully recycled → zero waste.
Stone byproduct from both crushers routed to stone-brick furnaces.

## Ash balance (manual overlay)

Ash excluded from solver (burner ash gaming). Balance computed manually from fuel consumption rates.

| Source | Ash /s |
|---|---|
| Stone-brick furnaces (11 × 200 kW) | 0.73 |
| Iron-smelting furnaces (14 × 200 kW) | 0.93 |
| Copper furnace (1 × 200 kW) | 0.04 |
| Burner assemblers (11 × 75 kW) | 0.28 |
| **Subtotal: burner machines** | **1.70** × utilization |
| Boilers (4 × 3.70 MW, 0.5 effectivity) | 4.69 |
| **Total produced** | **~6.43** |
| Consumed by planter-box | −2.36 |
| Consumed by log3 | −0.82 |
| **Net surplus (void)** | **~3.25** |

Boiler ash alone (4.69/s) exceeds total ash demand (3.18/s). Self-power is the dominant ash source.

## Power (self-contained)

| Component | MW |
|---|---|
| Solver core (51 buildings) | 6.04 |
| Copper chain (2 screeners + 1 crusher) | 1.00 |
| **Total electric demand** | **7.04** |
| 4 boilers + 2 steam engines capacity | 7.40 |
| **Headroom** | **5%** |

Steam engine effectivity = 0.5 → output per engine: 15/s × 2100 × 235 × 0.5 = 3.70 MW.
2 engines = 7.40 MW, needing 30/s steam → 4 boilers (7.5/s each).
Raw-coal for boilers: 4 × 3.70 MW / 3.0 MJ = 4.93/s at full load, ~4.69/s at actual demand.
Ash from boilers: 4.69/s.

**Without self-power (grid-connected):** burner machines alone produce 1.74/s ash; demand is 3.18/s → import 1.44/s ash. Electrically isolating the block guarantees boiler load = ash production. If grid-connected, boilers throttle when grid has surplus — ash breaks below 31% boiler utilization.

## Stone balance

| Source | /s |
|---|---|
| grade-1-iron-crush (5 crushers) | 2.20 |
| grade-1-copper-crush (1 crusher) | 0.60 |
| Imported | 3.77 |
| **Total** | **6.57** |
| Consumed by stone-brick (11 furnaces) | 6.40 |
| Consumed by Moss-2 (1 farm) | 0.17 |

## Solver commands

Power (6 buildings) computed manually — solver doesn't model electricity generation.

**Run 1: core (51 buildings)**

```bash
npx tsx src/cli.ts solve \
  --recipes "automation-science-pack,planter-box,empty-planter-box,small-parts-01,iron-gear-wheel,copper-cable,bolts,iron-stick,stone-brick,low-grade-smelting-iron,grade-1-iron-crush,log-wood-fast,log3,wood-seedling,wood-seeds,Moss-2,soil,muddy-sludge,moondrop-co2" \
  --target "automation-science-pack:24" --time 60 \
  --factory "automation-science-pack:assembling-machine-1" \
  --factory "planter-box:assembling-machine-1" \
  --factory "empty-planter-box:assembling-machine-1" \
  --factory "small-parts-01:assembling-machine-1" \
  --factory "iron-gear-wheel:assembling-machine-1" \
  --factory "copper-cable:assembling-machine-1" \
  --factory "bolts:assembling-machine-1" \
  --factory "iron-stick:assembling-machine-1" \
  --factory "stone-brick:stone-furnace" \
  --factory "low-grade-smelting-iron:stone-furnace" \
  --factory "grade-1-iron-crush:jaw-crusher" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "log3:fwf-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:assembling-machine-1" \
  --factory "Moss-2:moss-farm-mk01" \
  --factory "soil:soil-extractor-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --modules "Moss-2:moss:15" --modules "log3:tree-mk01:10" \
  --fuel "automation-science-pack:raw-coal" \
  --fuel "planter-box:raw-coal" \
  --fuel "empty-planter-box:raw-coal" \
  --fuel "small-parts-01:raw-coal" \
  --fuel "iron-gear-wheel:raw-coal" \
  --fuel "copper-cable:raw-coal" \
  --fuel "bolts:raw-coal" \
  --fuel "iron-stick:raw-coal" \
  --fuel "stone-brick:raw-coal" \
  --fuel "low-grade-smelting-iron:raw-coal" \
  --fuel "wood-seeds:raw-coal" \
  --constraint "grade-1-iron-crush:stone:exclude" \
  --constraint "automation-science-pack:ash:exclude" \
  --constraint "planter-box:ash:exclude" \
  --constraint "empty-planter-box:ash:exclude" \
  --constraint "small-parts-01:ash:exclude" \
  --constraint "iron-gear-wheel:ash:exclude" \
  --constraint "copper-cable:ash:exclude" \
  --constraint "bolts:ash:exclude" \
  --constraint "iron-stick:ash:exclude" \
  --constraint "stone-brick:ash:exclude" \
  --constraint "low-grade-smelting-iron:ash:exclude" \
  --constraint "wood-seeds:ash:exclude" \
  --solver simplex \
  --unlocked
```

**Run 2: copper chain (4 buildings)**

Separated because the grade-1 recycling loop gives the LP too many byproduct-gaming degrees of freedom in a combined run. `--max-import "copper-ore:180"` forces full grade-1 recycling (5 ore/plate yield).

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-2-copper,grade-1-copper-crush,copper-plate-4" \
  --target "copper-plate:36" --time 60 \
  --factory "grade-2-copper:automated-screener-mk01" \
  --factory "grade-1-copper-crush:jaw-crusher" \
  --factory "copper-plate-4:stone-furnace" \
  --fuel "copper-plate-4:raw-coal" \
  --constraint "copper-plate-4:ash:exclude" \
  --constraint "grade-1-copper-crush:stone:exclude" \
  --max-import "copper-ore:180" \
  --solver simplex \
  --unlocked
```

## Notes

- Design 01 (py-science-pack-1) is a different science pack — no supersession.
- Bio module base speeds: fwf-mk01 = 0.0909, moss-farm-mk01 = 0.0625. With full modules, effective speed = 1.0. Without modules: 12 FWF + 11 moss-farm (83 buildings total).
- Copper chain in separate solver run: the grade-1 recycling loop has coupled byproducts (grade-2-copper + stone) that the LP exploits in a combined run. `--max-import` on copper-ore forces the recycling behavior.
- Ash excluded from all burner recipes: prevents LP from gaming ash production. Manual overlay confirms self-sufficiency.
- v1 imported ash (0.66/s), CO2 (2.58/s), and electricity (~7.5 MW). v2 eliminates all three by self-powering with boilers (ash source) and using log3 (ash consumer) + moondrop (free CO2). Trade: +4 buildings, +4.69/s raw-coal.
- Moss-2 uses stone (vs Moss-1 which doesn't, but yields half the moss in 25% more time) — routes crusher stone byproduct into moss production.
- Solver warns tree-mk01/moss modules "not unlocked" — data limitation, modules are available in-game.
