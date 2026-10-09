# Automation science pack — 0.4/s, 57 buildings

Fully inlined production. Burner assemblers (assembling-machine-1) and stone-furnaces with raw-coal fuel.
Bio modules on moss-farm-mk01 (15x moss) and fwf-mk01 (10x tree-mk01).
Copper processing via grade-2 screening + grade-1 crush (full recycle, zero waste).
Ash imported (0.66/s) — covered by stone mining kerogen block's boiler/drill ash.

## Recipe table

53 buildings solver-validated. 4 copper buildings manually computed (solver can't constrain copper chain without overscaling for stone).

```
┌─────────────────────────┬─────────────────────────┬───────┬───────────────┐
│ Recipe                  │ Factory                 │ Count │ Modules       │
├─────────────────────────┼─────────────────────────┼───────┼───────────────┤
│ automation-science-pack │ assembling-machine-1    │     2 │               │
│ planter-box             │ assembling-machine-1    │     2 │               │
│ empty-planter-box       │ assembling-machine-1    │     1 │               │
│ small-parts-01          │ assembling-machine-1    │     1 │               │
│ iron-gear-wheel         │ assembling-machine-1    │     1 │               │
│ copper-cable            │ assembling-machine-1    │     1 │               │
│ bolts                   │ assembling-machine-1    │     1 │               │
│ iron-stick              │ assembling-machine-1    │     1 │               │
│ stone-brick             │ stone-furnace           │    11 │               │
│ low-grade-smelting-iron │ stone-furnace           │    14 │               │
│ grade-1-iron-crush      │ jaw-crusher             │     5 │               │
│ grade-2-copper          │ automated-screener-mk01 │     2 │               │
│ grade-1-copper-crush    │ jaw-crusher             │     1 │               │
│ copper-plate-4          │ stone-furnace           │     1 │               │
│ log-wood-fast           │ wpu-mk01                │     1 │               │
│ log2                    │ fwf-mk01                │     3 │ 10x tree-mk01 │
│ wood-seedling           │ botanical-nursery       │     1 │               │
│ wood-seeds              │ assembling-machine-1    │     1 │               │
│ Moss-1                  │ moss-farm-mk01          │     3 │ 15x moss      │
│ soil                    │ soil-extractor-mk01     │     3 │               │
│ soil-washing            │ washer                  │     1 │               │
└─────────────────────────┴─────────────────────────┴───────┴───────────────┘
```

57 buildings, ~7.5 MW electric.

## Imports

| Item | /s | /60s |
|---|---|---|
| iron-ore | 11.00 | 660 |
| stone | 3.60 | 216 |
| copper-ore | 3.00 | 180 |
| native-flora | 4.00 | 240 |
| raw-coal | 1.74 | 104 |
| ash | 0.66 | 40 |
| water | 278.97 | 16,738 |
| CO2 | 2.58 | 155 |

## Exports

| Item | /s | /60s |
|---|---|---|
| automation-science-pack | 0.40 | 24 |
| sand | 0.26 | 15 |

## Key recipes

- **grade-1-iron-crush** (jaw-crusher, 2s): 5 iron-ore → 3 processed-iron-ore + 1 stone
- **low-grade-smelting-iron** (stone-furnace, 6s): 3 processed-iron-ore → 1 iron-plate
- **grade-2-copper** (screener, 3s): 5 copper-ore → 1 grade-1-copper + 2 grade-2-copper
- **grade-1-copper-crush** (jaw-crusher, 3s): 2 grade-1-copper → 2 stone + 1 grade-2-copper
- **copper-plate-4** (stone-furnace, 2s): 5 grade-2-copper → 2 copper-plate

Copper yield: 5 ore/plate (vs 8 with direct smelting). Grade-1 fully recycled → zero waste.
Stone byproduct from both crushers routed to stone-brick furnaces.

## Ash balance

Planter-box needs 141.60/60s ash (48 runs × 3 ash, minus planter's own 2.40/60s from fuel).

| Source | Ash /60s |
|---|---|
| stone-brick (11 furnaces) | 40.96 |
| low-grade-smelting-iron (14 furnaces) | 52.80 |
| copper-plate-4 (1 furnace) | 2.40 |
| assemblers (9 buildings) | 5.78 |
| **Total from burners** | **101.94** |
| **Imported** | **39.66** |
| **Total** | **141.60** |

## Stone balance

| Source | Stone /60s |
|---|---|
| grade-1-iron-crush (5 crushers) | 132 |
| grade-1-copper-crush (1 crusher) | 36 |
| Imported | 216 |
| **Total** | **384** |
| Consumed by stone-brick (11 furnaces) | 384 |

## Solver command (core 53 buildings)

Copper chain excluded — computed manually and added to totals.

```bash
npx tsx src/cli.ts solve \
  --recipes "automation-science-pack,planter-box,empty-planter-box,small-parts-01,iron-gear-wheel,copper-cable,bolts,iron-stick,stone-brick,low-grade-smelting-iron,grade-1-iron-crush,log-wood-fast,log2,wood-seedling,wood-seeds,Moss-1,soil,soil-washing" \
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
  --factory "log2:fwf-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:assembling-machine-1" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "soil:soil-extractor-mk01" \
  --factory "soil-washing:washer" \
  --modules "Moss-1:moss:15" --modules "log2:tree-mk01:10" \
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
  --unlocked
```

## Notes

- Design 01 (py-science-pack-1) is a different science pack — no supersession. Both are mk01 tier with burner assemblers.
- Bio module base speeds: fwf-mk01 = 0.0909, moss-farm-mk01 = 0.0625. With modules, both reach effective speed 1.0.
- Copper processing saves 37% copper-ore vs direct smelting (3.0/s vs 4.8/s) and provides bonus stone (0.6/s).
- Ash import (0.66/s) is a small amount easily covered by the stone mining kerogen block or any other block with burner buildings.
- Sand byproduct (0.26/s from soil-washing) needs a void or downstream consumer.
