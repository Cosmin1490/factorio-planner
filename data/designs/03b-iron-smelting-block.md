# Iron smelting block — 10.8/s output (BOF casting, centralized)

183 consumers — Tier A bus item. Feeds small-parts, pipe, rail, inserters, fenxsb-alloy, everything.

BOF casting route: imports processed-iron-ore (pre-crushed at mining outpost 03a), borax, oxygen, sand-casting. Oxygen from dedicated oxygen block (02d). Coal-fueled BOF machines produce ash as burnt_result.

Chosen over low-grade smelting (3:1 ratio) after system-level cost analysis (rule 4): both paths need two upstream blocks, but BOF's upstreams (oxygen, borax) serve multiple future consumers and the 3.5x ore efficiency compounds with every stamp. Low-grade has comparable voiding burden (3 py-burners vs 4) but permanently higher ore consumption and fuel burn.

## Recipe table

```
┌────────────────┬───────────────────┬───────┐
│ Recipe         │ Factory           │ Count │
├────────────────┼───────────────────┼───────┤
│ iron-plate-1   │ casting-unit-mk01 │     1 │
│ molten-iron-05 │ bof-mk01          │     8 │
└────────────────┴───────────────────┴───────┘
```

9 buildings, 0.36 MW electric. Solver-validated at 10.8/s target.

## Stations (6)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| processed-iron-ore | unload | processed-iron-ore | 9.0 |
| borax | unload | borax | 5.94 |
| oxygen | unload | oxygen (fluid) | 108.0 |
| sand-casting | unload | sand-casting | 0.18 |
| coal | unload | coal | 10.0 |
| iron-plate | load | iron-plate | 10.8 |

Processed-iron-ore imported from crushing outpost (03a) at stack 100 — same density as plates.

## Smelting math

- molten-iron-05: 5 processed-iron-ore + 3 borax + 60 oxygen → 10 molten-iron in 4s
- Per bof-mk01 (crafting_speed=1): 1.25/s processed + 0.75/s borax + 15/s oxygen → 2.5/s molten-iron
- 8 bof-mk01: 18/s molten-iron

## Casting math

- iron-plate-1: 100 molten-iron + 3 borax + 1 sand-casting → 60 iron-plate in 4s
- Per casting-unit-mk01 (crafting_speed=0.75): 18.75/s molten-iron → 11.25/s iron-plate (solver gives 10.8/s at utilization)
- 1 casting-unit-mk01

## BOF fuel (burner, not modeled by solver)

bof-mk01: burner entity, `max_energy_usage`=83,333 J/tick = 5.0 MW per BOF. Accepts chemical + biomass fuel categories.

- Coal fuel_value: 4 MJ, burnt_result: ash
- fuel_rate per BOF = 5,000,000 / 4,000,000 = 1.25/s coal
- 8 BOFs: **10.0/s coal → 10.0/s ash**
- Casting-unit-mk01 is electric (not a burner), no fuel needed

## Byproduct classification (rule 5)

| Byproduct | Rate/s | Classification | Handling |
|---|---|---|---|
| ash | 10.0 | (d) waste | 3 py-burners (ash-pyvoid, ash loop pattern). Self-fueled: ash is burnt_result of coal, ash-pyvoid produces 0.2 ash per cycle, loop converges exponentially. |

3 py-burners total for voiding. Negligible fuel cost (0.036/s coke each via canister loop or share coal import).

## Power budget

| Component | MW |
|---|---|
| 1 casting-unit-mk01 | 0.36 |
| 8 bof-mk01 | 0 (coal-fueled) |
| 3 py-burners | 0 (fuel-powered) |
| **Total electric** | **~0.4** |
| Coal fuel (thermal) | 40.0 |

Very low electric draw. Fuel cost is 10/s coal (from tar refinery coke surplus or direct mining).

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| bof-mk01 | 7×7 | 8 | 392 |
| casting-unit-mk01 | 7×7 | 1 | 49 |
| py-burner | 3×3 | 3 | 27 |
| **Total** | | **12** | **468** |

Very compact — plenty of room for belt/pipe routing, stations, and hot-air add-on.

## Dependencies

| Import | Source block | Status |
|---|---|---|
| processed-iron-ore (9/s) | iron crush outpost (03a) | designed |
| oxygen (108/s) | oxygen block (02d) | designed |
| borax (5.94/s) | borax block (02c) | almost built |
| sand-casting (0.18/s) | sand-casting block (03c) | designed |
| coal (10/s) | tar refinery surplus or mining | available |

**Build order: borax → oxygen → sand-casting → iron crush → iron smelting.**

## Upgrade path (rule 23)

### Hot-air upgrade — switchable, 10.8/s → 13.5/s (+25%)

Swap caster recipe from iron-plate-1 to hotair-iron-plate-1. Same 100 molten-iron input, 75 plates output instead of 60. All upstream infrastructure (8 BOF) unchanged — same ore, borax, oxygen, coal rates. The +25% is pure caster efficiency from hot-air.

**Circuit-controlled recipe swap:** caster switches between iron-plate-1 and hotair-iron-plate-1 based on local COG buffer level. When COG tank is above threshold → hotair recipe (13.5/s). When COG runs low → fall back to base recipe (10.8/s). Iron production never stalls due to COG shortage; throughput degrades gracefully.

**Hot-air sub-chain (add-on, 4 buildings):**

```
┌─────────────────────┬──────────────────┬───────┐
│ Recipe              │ Factory          │ Count │
├─────────────────────┼──────────────────┼───────┤
│ warm-stone-brick-1  │ rhe              │     2 │
│ warm-air-1          │ rhe              │     1 │
│ pressured-air       │ vacuum-pump-mk01 │     1 │
└─────────────────────┴──────────────────┴───────┘
```

- 2 rhe (warm-stone-brick-1): 5 stone-brick + 100 COG(250°C) → 5 warm-stone-brick + 100 COG(100°C). Heat transfer — COG is consumed (250°C in, 100°C out, rule 19 temperature warning).
- 1 rhe (warm-air-1): 20 warm-stone-brick + 150 pressured-air → 20 stone-brick + 150 hot-air. Stone-brick circulates net zero (seed ~50 to bootstrap).
- 1 vacuum-pump-mk01 (pressured-air): no inputs, 200/s pressured-air. Electric only (~1 MW).

**Retrofit stations (add 1):**

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| coke-oven-gas | unload | coke-oven-gas (fluid, 250°C) | 24.0 |

**Solver-validated rates at 13.5/s (upgraded mode):**

| Import | Rate/s | vs base |
|---|---|---|
| processed-iron-ore | 9.0 | same |
| borax | 5.94 | same |
| oxygen | 108.0 | same |
| sand-casting | 0.18 | same |
| coal | 10.0 | same |
| COG (250°C) | 24.0 | new |
| **iron-plate out** | **13.5** | **+25%** |

**Byproduct changes (rule 5):**

| Byproduct | Base rate/s | Upgraded rate/s | Classification | Handling |
|---|---|---|---|---|
| ash | 10.0 | 10.0 (same) | (d) waste | 3 py-burners (ash loop) |
| cold COG (100°C) | — | 24.0 | (c) burnable / (d) vent | see below |

**Cold COG disposal (rule 5c vs 5d, rule 9):** cold COG has fuel_value 1 MJ, burnable in oil-boiler-mk01 (effectivity=2). At 24/s: 24 MW thermal → ~8 MW electric via oil-boiler + steam-engine (adds ~2 oil-boilers + 5 steam-engines + water). That's significant recovery but adds 7 buildings and water import to an already-compact block. Default: **exhaust vent** (1 gas-vent, 0 power, 0 space). Upgrade to burn if block power budget justifies it — the oil-boiler infrastructure is the same pattern as the oxygen block (02d).

**Power budget — add-on (rule 8):**

| Component | MW |
|---|---|
| 3 rhe | 0.9 |
| 1 vacuum-pump-mk01 | 1.0 |
| **Add-on total** | **1.9** |
| Base block electric | 0.4 |
| **Grand total electric** | **2.3** |

**Tile footprint — add-on (rule 20):**

| Component | Size | Count | Tiles |
|---|---|---|---|
| rhe | 5×5 | 3 | 75 |
| vacuum-pump-mk01 | 3×3 | 1 | 9 |
| gas-vent | 3×3 | 1 | 9 |
| **Add-on total** | | **5** | **93** |
| Base block | | 12 | 468 |
| **Grand total** | | **17** | **561** |

Plenty of room in one city block.

**COG source:** only unlocked producer is coke-coal (hpf, 2s: 10 raw-coal → 4 coke + 20 COG@250°C). Per hpf at speed 1: 10/s COG + 2/s coke. Need 24/s COG → 3 hpf (80% util).

**Inline variant (committed):** inline 3 hpf running coke-coal for COG production. BOF fuel: prioritize internal coke from hpf, import coke to cover deficit.

Fuel budget (lab-verified):
- 3 hpf coke-coal: 15/s raw-coal → 6/s coke + 30/s COG (need 24, 6/s excess)
- BOF fuel (coke, 5 MJ): 8 × 1.0/s = 8/s coke total
- Internal coke from hpf: 6/s (30 MW, covers 75%)
- Imported coke: 2/s (10 MW, covers deficit)
- Ash from burning coke: 8/s (burnt_result), voided via py-burners

Stations (replace base coal + add-on COG with raw-coal + coke):
- raw-coal unload: 15/s (feeds hpf only, at belt limit)
- coke unload: 2/s (deficit top-up from tar refinery surplus)
- Internal coke prioritized over imported via inserter circuit control

Additional buildings: +3 hpf (7×7, 147 tiles, 6 MW). No secondary-crusher or solid-separator needed — straight coke import is simpler.

**Retrofit summary:** +4 buildings + 1 gas-vent, +1 fluid station. Total block: 17 buildings, 7 stations, 561 tiles. No changes to existing infrastructure — pure add-on.

**Helmod import string (upgraded, 13.5/s):**

Solver command: `npx tsx src/cli.ts solve --recipes "hotair-iron-plate-1,molten-iron-05,warm-air-1,warm-stone-brick-1,pressured-air" --target "iron-plate:13.5" --time 1 --unlocked --factory "hotair-iron-plate-1:casting-unit-mk01" --factory "molten-iron-05:bof-mk01" --factory "warm-air-1:rhe" --factory "warm-stone-brick-1:rhe" --factory "pressured-air:vacuum-pump-mk01" --export helmod`

```
eJztlruO2zAQRXt/BaE6DEw/SjYp0qVxGwQGRY1jwnwo5HA3xsL/HsqmKa68C7jKuthOvDMj3ntESOoc0U4KTbb8ZUaI1CIE3vxwHejmSxKewAflLF8MC1QGOBuu2jR02Hrn8DxWBr8N+nmQENXx5tLHsmJFmm96DyFEDx0VyucKHvtUyQv3bMGXVXvc9t51USJHH6GIOyHR+SPfCR2yGpxOfmtF7pXuPNjskpANK5fF9Aak6iFvd3W+YbVgO/jL56PwfpIxjZ/eNscYcLJR/ROFVnjkjXXeCF31XxOOhovl75dS1Xz19CRkjIb20fTUHObsVcv7exEijIsW65CEmGRYQ+AvpyKexnoLQjpbVUtts7iX8uKGMptSfhbe0IDOAm29kgfKHgS138PH0F3eS3d5Q3fxJt10fD+pru6lurqhupxSNU4jWKq8s3S+fhCyrdt94CthfS/e9Q3e1RTv3uFwZM94ey0QHub0ShFQ2d80WoX/H/as6shxQ/H/sxl5Nb+qWBfnVXGKUiGYVw+lj8jZ8uv6rX1T+vRFVGAxOzuVH4azcJp5wOgt2c7Adv8AdSspxA==
```

### bof-mk02+

Higher crafting speed, fewer BOFs needed. Drop-in upgrade.

## Methodology self-review

**Base block:**
- Rule 4 (alternatives): BOF chosen over low-grade after full system-level cost tracing. Both need 2 upstream blocks; BOF's amortize better and ore efficiency is 3.5x. Voiding burden comparable (~4 vs ~3 py-burners).
- Rule 5 (byproducts): ash voided via ash loop (10/s).
- Rule 8 (power): 0.4 MW electric + 40 MW coal thermal. BOF fuel manually computed (10/s coal).
- Rule 19 (fluid transport): oxygen imported as fluid — cheap transport via fluid wagon.
- Rule 20 (space budget): 12 buildings, 468 tiles. Fits city block easily.

**Hot-air upgrade:**
- Rule 5 (byproducts): cold COG classified (c) burnable / (d) vent. Burn option evaluated (8 MW recovery, 7 extra buildings) — defaulted to vent for simplicity, burn noted as optional upgrade.
- Rule 8 (power): add-on 1.9 MW electric computed. Grand total 2.3 MW.
- Rule 9 (burn block fluids): cold COG (fuel_value 1 MJ) evaluated for oil-boiler burn. Deferred — recovery vs building cost doesn't justify at block scale.
- Rule 19 (temperature): COG temperature degradation (250°C→100°C) correctly identified — not net zero, consumed as heat source.
- Rule 20 (space budget): add-on 93 tiles (5 buildings). Grand total 561 tiles. Fits.
- Rule 23 (recipe-variant staging): circuit-controlled switchable upgrade. Same upstream, graceful degradation when COG unavailable. Exact rule 23 pattern.

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "iron-plate-1,molten-iron-05" --target "iron-plate:10.8" --time 1 --unlocked --factory "iron-plate-1:casting-unit-mk01" --factory "molten-iron-05:bof-mk01" --export helmod`

```
eJzNVLFOwzAQ3fMVVmaC4kpILF4Y2FiyIhQ59hWsOr5gO0BU5d9JUtdxW0BMiM333p3vvWfJEolGwTWp2T4jRGjuHMsfUILOrybgDaxTaNhmLrxqgdH51ExDu9oi+mUsDt7N+DJIiJIsP/TRgBg+zectag+mUBZNUd4Eyg/dRIUC3w3YWDVD3VmUvfDM2x4iuOXCox3YlmsXUId6Epwi4kVpacFE2QSUtF4jKorEKqDsO4qvaAoYCR+sXIEfrKx27Pm9wcccKF3R155r5QeWG7Qt10n/0eKqOGq+P1BJ81FUg9ui3ZX0hPp+ByG8xd741B0h7SRUg2P7MYLjyjfABZqEjVy1+W28m4t46Xm8S66d5h4K+k/CFdx5ZZ6L3ij/9ylnSUew66L+xySv/CmxdR7mRZTKQ3vyGl3vGS2vb7/aO7m3IBUYH5SN8UNYgDGz4HtrSJ2BkZ/5UCPT
```

## Notes

- 10.8/s iron plate covers most early-mid game demand. Stamp for higher throughput.
- Coal from tar refinery coke surplus (15/s available) covers 10/s demand. Alternative: mine raw-coal, distill to coal.
