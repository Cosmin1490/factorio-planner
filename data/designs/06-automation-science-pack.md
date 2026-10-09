# Automation science pack — 0.4/s, 58 buildings

Fully self-contained: self-powered (boilers), ash-independent (burner fuel + boiler ash), no processed imports. All inputs are raw mined resources except native-flora (irreducible — no recipe exists).

Burner assemblers (assembling-machine-1) and stone-furnaces with raw-coal fuel.
Bio modules on fwf-mk01 (10x tree-mk01) and moss-farm-mk01 (15x moss).
Copper via grade-2 screening + grade-1 crush (full recycle, zero waste).
Log3 recipe consumes ash — bio loop doubles as an ash sink.
Moondrop greenhouse provides free CO2 for Moss-2.

## Recipe table

51 buildings solver-validated (simplex). 4 copper buildings + 3 power buildings manually computed.

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
│ (self-power)            │ boiler                   │     2 │               │
│ (self-power)            │ steam-engine             │     1 │               │
└─────────────────────────┴──────────────────────────┴───────┴───────────────┘
```

58 buildings total (55 production + 3 power), ~7.0 MW electric (self-powered).

## Imports

All raw mined resources — no processed items.

| Item | /s | /60s |
|---|---|---|
| iron-ore | 11.00 | 660 |
| raw-coal | 4.09 | 245 |
| stone | 3.77 | 226 |
| copper-ore | 3.00 | 180 |
| native-flora | 4.00 | 240 |
| water | ~237 | ~14,200 |

## Exports

| Item | /s | /60s |
|---|---|---|
| automation-science-pack | 0.40 | 24 |

Voided: excess ash ~0.87/s.

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
| Boilers (2 × 3.70 MW thermal) | 2.35 |
| **Total produced** | **~4.05** |
| Consumed by planter-box | −2.36 |
| Consumed by log3 | −0.82 |
| **Net surplus (void)** | **~0.87** |

Boiler ash alone (2.35/s) exceeds log3 demand (0.82/s). The combination of burner ash + boiler ash comfortably exceeds total ash demand (3.18/s).

## Power (self-contained)

| Component | MW |
|---|---|
| Solver core (51 buildings) | 6.04 |
| Copper chain (2 screeners + 1 crusher) | 1.00 |
| **Total electric demand** | **7.04** |
| 2 boilers + 1 steam engine capacity | 7.40 |
| **Headroom** | **5%** |

Raw-coal for boilers: 7.04 MW / 3.0 MJ = 2.35/s. Ash from boilers: 2.35/s.
Pyanodon water: heat_capacity 2100 J/unit/°C, ΔT = 235°C. Engine: 15/s steam → 7.4 MW.

## Stone balance

| Source | /60s |
|---|---|
| grade-1-iron-crush (5 crushers) | 132 |
| grade-1-copper-crush (1 crusher) | 36 |
| Imported | 226 |
| **Total** | **394** |
| Consumed by stone-brick (11 furnaces) | 384 |
| Consumed by Moss-2 (1 farm) | 10 |

## Solver command (core 51 buildings)

Copper chain and power excluded — computed manually.

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

## Notes

- Design 01 (py-science-pack-1) is a different science pack — no supersession.
- Bio module base speeds: fwf-mk01 = 0.0909, moss-farm-mk01 = 0.0625. With full modules, effective speed = 1.0. Without modules: 12 FWF + 11 moss-farm (83 buildings total).
- Copper chain solver-excluded: LP over-scales copper smelting to generate ash from burner fuel. Manual calculation avoids this.
- Ash excluded from all burner recipes: prevents LP from gaming ash production. Manual overlay confirms self-sufficiency.
- v1 imported ash (0.66/s), CO2 (2.58/s), and electricity (~7.5 MW). v2 eliminates all three by self-powering with boilers (ash source) and using log3 (ash consumer) + moondrop (free CO2). Trade: +1 building, +2.35/s raw-coal.
- Moss-2 uses stone (vs Moss-1 which uses sand) — avoids sand byproduct, routes stone from crushers.
- Solver warns tree-mk01/moss modules "not unlocked" — data limitation, modules are available in-game.
