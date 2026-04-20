# Fish-oil block — 2/s fish-oil output (fish farm + slaughterhouse + byproduct recycling)

Fish breeding → slaughterhouse → fish-oil. Slaughterhouse byproducts (bones, meat, skin, guts) recycled into biomass via compost, eliminating external biomass import. Fish-egg production loops back from fish output. Phytoplankton sourced from grade-1-tin (ore-tin screening). Fish-oil is a fluid — serves gearbox-mk01 (mall), construction robots, and future mechanical-parts-01.

## Recipe table

```
┌──────────────────────┬─────────────────────────┬───────┬─────────┐
│ Recipe               │ Factory                 │ Count │ Modules │
├──────────────────────┼─────────────────────────┼───────┼─────────┤
│ breed-fish-1         │ fish-farm-mk01          │     5 │ 7x fish │
│ breed-fish-egg-1     │ fish-farm-mk01          │     1 │ 7x fish │
│ phytoplankton        │ plankton-farm           │     1 │         │
│ full-render-fish     │ slaughterhouse-mk01     │     1 │         │
│ grade-1-tin          │ automated-screener-mk01 │     1 │         │
│ biomass-bones        │ compost-plant-mk01      │     1 │         │
│ biomass-meat         │ compost-plant-mk01      │     1 │         │
│ biomass-skin         │ compost-plant-mk01      │     1 │         │
│ biomass-guts         │ compost-plant-mk01      │     1 │         │
└──────────────────────┴─────────────────────────┴───────┴─────────┘
```

12 buildings, 6.3 MW electric

## Stations (5)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| ore-tin | unload | ore-tin (item) | 0.31 |
| small-lamp | unload | small-lamp (item) | 0.09 |
| oxygen | unload | oxygen (fluid) | 1.85 |
| water-saline | unload | water-saline (fluid) | 4.31 |
| fish-oil | load | fish-oil (fluid) | 2.0 |

Water (30.77/s) from local offshore pumps or a water unload station. Small-lamp demand is negligible (0.09/s = 5.4/min) — could hand-feed a chest instead of dedicating a station.

## Fish breeding math

- breed-fish-1: 3 small-lamp + 10 biomass + 10 fish-egg + 60 oxygen + 100 water-saline → 10 fish + 100 waste-water in 150s
- fish-farm-mk01: crafting_speed=0.125, 7 module slots
- fish module: +100% speed each → 7 modules = +700% → 8× base speed
- Effective speed: 0.125 × 8 = 1.0
- Per farm: 1/150 crafts/s → 0.0667 fish/s
- 5 farms: 0.333 fish/s

## Fish egg loop

- breed-fish-egg-1: 12 fish + 50 phytoplankton + 100 water-saline → 25 fish-egg + 100 waste-water in 80s
- 1 egg farm (with 7× fish modules): 1/80 crafts/s → 0.3125 eggs/s
- 5 breeding farms consume 5 × (10/150) = 0.333 eggs/s — egg farm slightly undersized, buffers absorb
- Egg farm consumes 0.15 fish/s → 0.333 - 0.15 = 0.183 fish/s to slaughterhouse

## Slaughterhouse

- full-render-fish: 8 fish → 2 bones + 2 meat + 3 skin + 5 guts + 100 fish-oil in 30s
- slaughterhouse-mk01: crafting_speed=1
- 1 slaughterhouse: 0.0333 crafts/s → 0.267 fish/s consumed, 3.33 fish-oil/s capacity
- At 0.16/s fish input: 0.02 crafts/s → 2.0/s fish-oil. Slaughterhouse at ~60% capacity.

## Byproduct recycling (rule 5a)

Slaughterhouse produces 4 solid byproducts. All recycled to biomass via compost:

| Byproduct | Rate/s | Biomass/s | Compost plants |
|---|---|---|---|
| bones | 0.04 | 0.12 | 1 |
| meat | 0.04 | 0.12 | 1 |
| skin | 0.06 | 0.18 | 1 |
| guts | 0.10 | 0.30 | 1 |
| **Total** | **0.24** | **0.72** | **4 (shared)** |

Biomass demand from breeding farms: 0.31/s. Biomass production from recycling: 0.72/s. **Surplus: 0.41/s biomass** — overflow to void or export. Block is self-sustaining on biomass.

**Alternative: export meat + guts for nexelit dig sites.** Diverting meat (0.04/s) + guts (0.10/s) leaves bones + skin → 0.30/s biomass vs 0.31/s demand. Tight but viable — add one native-flora compost plant as buffer if needed. Meat is 2× ore/feed at dig sites, making it the most valuable byproduct to export.

## Phytoplankton chain

- phytoplankton: 1 grade-1-tin + 500 water → 10 phytoplankton in 15s
- grade-1-tin: 5 ore-tin → 1 grade-1-tin + 1 grade-2-tin (50%) in 3s via screener
- 1 plankton-farm: 0.667 phytoplankton/s capacity (needs 0.62/s — 93% util)
- 1 screener: 0.333 grade-1-tin/s capacity (needs 0.06/s — 18% util)
- Ore-tin import: 0.31/s (negligible)
- Grade-2-tin byproduct: 0.03/s (void or export)

**Alternative evaluated: jerky-to-phytoplankton** (dried-meat + water → phytoplankton). Eliminates ore-tin import but creates a fully circular dependency (fish → meat → jerky → phytoplankton → eggs → fish) with no external anchor. Solver returns 0 — infeasible. Ore-tin is the necessary bootstrap input.

## Waste handling

| Waste | Rate/s | Handling |
|---|---|---|
| waste-water | 4.31 | Sinkhole (fluid) |
| surplus biomass | ~0.41 | Pyvoid or export |
| grade-2-tin | 0.03 | Pyvoid (negligible) |

## Power budget

| Building | Count | kW each | MW total |
|---|---|---|---|
| fish-farm-mk01 | 6 | 1,000 | 6.0 |
| plankton-farm | 1 | 350 | 0.35 |
| slaughterhouse-mk01 | 1 | 300 | 0.3 |
| automated-screener-mk01 | 1 | 300 | 0.3 |
| compost-plant-mk01 | 4 | 500 | 2.0 |
| **Total** | **13** | | **8.95** |

Note: solver reports 6.3 MW (excludes compost plants running below capacity). Worst-case is ~9 MW.

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| fish-farm-mk01 | 11×11 | 6 | 726 |
| compost-plant-mk01 | 11×11 | 4 | 484 |
| slaughterhouse-mk01 | 11×11 | 1 | 121 |
| plankton-farm | 7×7 | 1 | 49 |
| automated-screener-mk01 | 7×7 | 1 | 49 |
| **Total** | | **13** | **1,429** |

Tight for one city block — 11 buildings are 11×11. Consider splitting breeding farms (6) from processing (slaughterhouse + compost + plankton + screener = 7) across two blocks if layout is too cramped. Processing side is much smaller (703 tiles) and could share a block with other bio infrastructure.

## Fish-oil consumers (current + planned)

| Consumer | Recipe | Fish-oil/craft | Status |
|---|---|---|---|
| gearbox-mk01 | gearbox-mk01 | 20 (fluid) | Mall item |
| construction-robot-mk01 | py-construction-robot-mk01 | 50 (fluid) | Mall item |
| barreling | fish-oil-barrel | 50 (fluid) | Transport |

All consumers are mall/batch demand — not continuous. 2/s fish-oil fills a 25k tank in ~3.5 hours.

## Upgrade path (rule 23)

- fish-farm-mk02 (crafting_speed=0.138, 14 module slots) is a significant upgrade — more speed + double module slots. Drop-in replacement, same recipes.
- fish-mk02/03/04 modules (+150/200/250% speed) further increase throughput per farm.
- slaughterhouse-mk02 (speed=2, 2 module slots) doubles slaughter rate if fish supply increases.

## Methodology self-review

- Rule 4 (alternatives): 1 unlocked recipe each for fish, fish-egg, fish-oil, slaughterhouse. Phytoplankton has 2 — jerky path rejected (infeasible circular dependency). Biomass has 479 — byproduct recycling chosen (self-sustaining, eliminates import).
- Rule 5 (byproducts): bones/meat/skin/guts classified as (a) recyclable → biomass. Waste-water classified as (d) void. Grade-2-tin classified as (d) void.
- Rule 5a (recycling check): all 4 slaughterhouse byproducts have biomass-* compost recipes. Recycling produces 2.3× biomass demand — block is self-sustaining.
- Rule 8 (power): 6.3–9 MW electric. Low for a bio block.
- Rule 14 (inline vs dedicated): fish-oil has 3 consumers — dedicated block justified by fish farm footprint and shared infrastructure.
- Rule 20 (space budget): 1,429 tiles, 13 buildings (11 are 11×11). Tight in one city block.
- Rule 22 (bio modules): fish modules mandatory — without them, block needs 23 farms instead of 6.

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "breed-fish-1,breed-fish-egg-1,phytoplankton,full-render-fish,grade-1-tin,biomass-bones,biomass-meat,biomass-skin,biomass-guts" --target "fish-oil:2" --time 1 --unlocked --factory "breed-fish-1:fish-farm-mk01" --factory "breed-fish-egg-1:fish-farm-mk01" --factory "phytoplankton:plankton-farm" --factory "full-render-fish:slaughterhouse-mk01" --factory "grade-1-tin:automated-screener-mk01" --factory "biomass-bones:compost-plant-mk01" --factory "biomass-meat:compost-plant-mk01" --factory "biomass-skin:compost-plant-mk01" --factory "biomass-guts:compost-plant-mk01" --modules "breed-fish-1:fish:7" --modules "breed-fish-egg-1:fish:7" --export helmod`

```
eJztl7uO2zAQRXt/BaE6AlZ+7hZsUqRL4zYIDFocyYQpjsJHEmPhfw8lyxIlrRcqAtiFO/IOH3fOUCTEkUhMmSQ7+j4jJJXMGBp9Rw4y+uKF36CNQEXnVceKAmhStfZ+0nGnEW09rZ34tdLriYQITqPLuKRRFPPzo73Awg+Oc2dNE7Cn0geaDv5RoNve/rQrNXKXWmq1g1bMWGpRn2jGpGlUg9LbDZX0ICTXoBqThGyTttl63kIqSmi2uxrfJqGgOPylL51wM5EuGT1ctcmigpl06i/HpLAnGinUBZPB+GuCnd/W8bdLKBh8tZRiUaKxcSmZsnFxfEl6g27vRggr0CkbZklI4S1LMPT93IrnLr4HlqIKom1sO5+KeT7CnNzCbI5CPTH3MC+mYl6MMM9vYS6A2SfmHublVMzLEebFLcx7VPC8NfqcV1M5r0acl0POuWYc4iS2D3NpMGd96S3w2KQawD9yd0S9nop6PUK9GqLOnJSxf2W5zygT5vAgvI1kLj9Y0Ad0Bu7IejOV9WbEej1kXR5OFqvv9GjxUQ721U6cMV3cB/HrVMSvI8Sb0Q3tP05eH+QY8jxOHoRybagi/B9PcqB5V36DgRTu3Vs1WHkz1IdueuHz7KP2tCK/TS3y26jIr58U+VngOxd4FoxoSHfWf1y4oJDRz8B8gKwKDSuYSSd47xSUztL5RzsKlWvgApRtPNV6/eNaC+eZBuu0IruZf+L+AS4yzyQ=
```

## Notes

- Fish farms dominate the block — 6 of 13 buildings, 67% of power, 51% of tile footprint. Module availability (fish mk01+) is critical.
- Water demand (30.77/s) is the largest fluid input. Place near water body or plan a water train.
- Small-lamp input (0.09/s = 5.4/min) is tiny — a chest of 200 lamps lasts 37 minutes. Could hand-deliver rather than dedicate a station.
- Ore-tin input (0.31/s) is negligible but necessary — it's the only external non-circular input that bootstraps the fish→egg→fish loop.
- Block produces surplus biomass (0.41/s). If future bio infrastructure needs biomass, this block can export it.
