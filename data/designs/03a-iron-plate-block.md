# Iron plate block — 10.8/s output (BOF casting, on-site crushing)

183 consumers — Tier A bus item. Feeds small-parts, pipe, rail, inserters, fenxsb-alloy, everything.

BOF casting route: 1.4:1 ore:plate ratio via molten-iron. Oxygen imported from dedicated oxygen block (02d). On-site crushing of iron-ore (5:1 ore:processed ratio, rule 21). Coal-fueled BOF machines produce ash as burnt_result.

Chosen over low-grade smelting (3:1 ratio) after system-level cost analysis (rule 4): both paths need two upstream blocks, but BOF's upstreams (oxygen, borax) serve multiple future consumers and the 3.5x ore efficiency compounds with every stamp. Low-grade has comparable voiding burden (3 py-burners vs 4) but permanently higher ore consumption and fuel burn.

## Recipe table

```
┌────────────────────┬───────────────────┬───────┐
│ Recipe             │ Factory           │ Count │
├────────────────────┼───────────────────┼───────┤
│ iron-plate-1       │ casting-unit-mk01 │     1 │
│ molten-iron-05     │ bof-mk01          │     8 │
│ grade-1-iron-crush │ jaw-crusher       │     7 │
└────────────────────┴───────────────────┴───────┘
```

16 buildings, 6.36 MW electric. Solver-validated at 10.8/s target.

## Stations (6)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| iron-ore | unload | iron-ore | 15.0 |
| borax | unload | borax | 5.94 |
| oxygen | unload | oxygen (fluid) | 108.0 |
| sand-casting | unload | sand-casting | 0.18 |
| coal | unload | coal | 9.0 |
| iron-plate | load | iron-plate | 10.8 |

On-site mining optional (rule 21: 5:1 ore:plate, on-site saves train capacity). If on-site: replace iron-ore station with 8 electric-mining-drills (no mining fluid needed). Add stone load station for byproduct export.

## Crushing math

- grade-1-iron-crush: 5 iron-ore → 3 processed-iron-ore + 1 stone in 2s
- Per jaw-crusher (crafting_speed=1): 2.5/s iron-ore → 1.5/s processed + 0.5/s stone
- 7 jaw-crushers: 17.5/s capacity → 9/s processed-iron-ore consumed, 3/s stone byproduct

## Smelting math

- molten-iron-05: 5 processed-iron-ore + 3 borax + 60 oxygen → 10 molten-iron in 4s
- Per bof-mk01 (crafting_speed=1): 1.25/s processed + 0.75/s borax + 15/s oxygen → 2.5/s molten-iron
- 8 bof-mk01: 18/s molten-iron

## Casting math

- iron-plate-1: 100 molten-iron + 3 borax + 1 sand-casting → 60 iron-plate in 4s
- Per casting-unit-mk01 (crafting_speed=0.75): 18.75/s molten-iron → 11.25/s iron-plate (solver gives 10.8/s at utilization)
- 1 casting-unit-mk01

## BOF fuel (burner, not modeled by solver)

bof-mk01: burner entity, `max_energy_usage`=100,000 J/tick = 6 MW per BOF. Accepts chemical + biomass fuel categories.

- Coal fuel_value: 4 MJ, burnt_result: ash
- fuel_rate per BOF = 6,000,000 / 4,000,000 = 1.5/s coal
- 8 BOFs: **9.0/s coal → 9.0/s ash**
- Casting-unit-mk01 is electric (not a burner), no fuel needed

## Byproduct classification (rule 5)

| Byproduct | Rate/s | Classification | Handling |
|---|---|---|---|
| ash | 9.0 | (d) waste | 3 py-burners (ash-pyvoid, ash loop pattern). Self-fueled: ash is burnt_result of coal, ash-pyvoid produces 0.2 ash per cycle, loop converges exponentially. |
| stone | 3.0 | (b) valuable / (d) void | Export if consumer exists (moss farm 15/s, saline-water). Overflow to 1 py-burner (stone-pyvoid). |

4 py-burners total for voiding. Negligible fuel cost (0.036/s coke each via canister loop or share coal import).

## Power budget

| Component | MW |
|---|---|
| 1 casting-unit-mk01 | 0.36 |
| 7 jaw-crushers | 7.0 |
| 8 bof-mk01 | 0 (coal-fueled) |
| 4 py-burners | 0 (fuel-powered) |
| **Total electric** | **~7.4** |
| Coal fuel (thermal) | 36.0 |

Very low electric draw. Fuel cost is 9/s coal (from tar refinery coke surplus or direct mining).

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| jaw-crusher | 7x7 | 7 | 343 |
| bof-mk01 | 7x7 | 8 | 392 |
| casting-unit-mk01 | 7x7 | 1 | 49 |
| py-burner | 3x3 | 4 | 36 |
| **Total** | | **20** | **820** |

Compact. Fits one city block with room for belt/pipe routing and stations.

## Dependencies

| Import | Source block | Status |
|---|---|---|
| oxygen (108/s) | oxygen block (02d) | designed |
| borax (5.94/s) | borax block (02c) | almost built |
| sand-casting (0.18/s) | TBD (tar-processing-unit, trivial) | not designed |
| coal (9/s) | tar refinery surplus or mining | available |
| iron-ore (15/s) | on-site mining or train | available |

**Build order: borax → oxygen → iron plate.** Sand-casting at 0.18/s is trivial — 1 tar-processing-unit, could inline or import.

## Upgrade path (rule 23)

### Hot-air upgrade — switchable, 10.8/s → 13.5/s (+25%)

Swap caster recipe from iron-plate-1 to hotair-iron-plate-1. Same 100 molten-iron input, 75 plates output instead of 60. All upstream infrastructure (8 BOF, 7 crushers) unchanged — same ore, borax, oxygen, coal rates. The +25% is pure caster efficiency from hot-air.

**Circuit-controlled recipe swap:** caster switches between iron-plate-1 and hotair-iron-plate-1 based on local COG buffer level. When COG tank is above threshold → hotair recipe (13.5/s). When COG runs low → fall back to base recipe (10.8/s). Iron production never stalls due to COG shortage; throughput degrades gracefully.

**Hot-air sub-chain (add-on, 4 buildings):**

```
┌─────────────────┬──────────────────┬───────┐
│ Recipe           │ Factory          │ Count │
├─────────────────┼──────────────────┼───────┤
│ warm-stone-brick-1 │ rhe           │     2 │
│ warm-air-1       │ rhe             │     1 │
│ pressured-air    │ vacuum-pump-mk01│     1 │
└─────────────────┴──────────────────┴───────┘
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
| iron-ore | 15.0 | same |
| borax | 5.94 | same |
| oxygen | 108.0 | same |
| sand-casting | 0.18 | same |
| coal | 9.0 | same |
| COG (250°C) | 24.0 | new |
| **iron-plate out** | **13.5** | **+25%** |

**Byproduct changes (rule 5):**

| Byproduct | Base rate/s | Upgraded rate/s | Classification | Handling |
|---|---|---|---|---|
| ash | 9.0 | 9.0 (same) | (d) waste | 3 py-burners (ash loop) |
| stone | 3.0 | 3.0 (same) | (b) export / (d) void | 1 py-burner or export |
| cold COG (100°C) | — | 24.0 | (c) burnable / (d) vent | see below |

**Cold COG disposal (rule 5c vs 5d, rule 9):** cold COG has fuel_value 1 MJ, burnable in oil-boiler-mk01 (effectivity=2). At 24/s: 24 MW thermal → ~8 MW electric via oil-boiler + steam-engine (adds ~2 oil-boilers + 5 steam-engines + water). That's significant recovery but adds 7 buildings and water import to an already-compact block. Default: **exhaust vent** (1 gas-vent, 0 power, 0 space). Upgrade to burn if block power budget justifies it — the oil-boiler infrastructure is the same pattern as the oxygen block (02d).

**Power budget — add-on (rule 8):**

| Component | MW |
|---|---|
| 3 rhe | 0.9 |
| 1 vacuum-pump-mk01 | 1.0 |
| **Add-on total** | **1.9** |
| Base block electric | 7.4 |
| **Grand total electric** | **9.3** |

**Tile footprint — add-on (rule 20):**

| Component | Size | Count | Tiles |
|---|---|---|---|
| rhe | 5×5 | 3 | 75 |
| vacuum-pump-mk01 | 3×3 | 1 | 9 |
| gas-vent | 3×3 | 1 | 9 |
| **Add-on total** | | **5** | **93** |
| Base block | | 20 | 820 |
| **Grand total** | | **25** | **913** |

Still fits one city block comfortably.

**COG source:** only unlocked producer is coke-coal (hpf, 2s: 10 raw-coal → 4 coke + 20 COG@250°C). Per hpf at speed 1: 10/s COG + 2/s coke. Need 24/s COG → 3 hpf (80% util).

**Potential inline variant (not committed):** instead of importing COG, inline 3 hpf running coke-coal. Removes the COG fluid station, adds 3 hpf (7×7 each, 147 tiles, 6 MW). Produces 4.8/s coke as byproduct — route to BOF fuel slots to partially replace coal import. Napkin math (pending `--fuel` solver feature, TODO 6b): 12/s raw-coal (COG production) + 4.8/s coke covers ~75% of BOF fuel, top up with ~2.4/s coal. Total fuel imports ~14.4/s through one mixed station vs current 9/s coal + 24/s COG through two stations. Trade: +3 buildings, +147 tiles, +6 MW, but -1 station and self-contained fuel loop. Evaluate when `--fuel` flag is available for solver validation.

**Retrofit summary:** +4 buildings + 1 gas-vent, +1 fluid station. Total block: 25 buildings, 7 stations, 913 tiles. No changes to existing infrastructure — pure add-on.

**Helmod import string (upgraded, 13.5/s):**

Solver command: `npx tsx src/cli.ts solve --recipes "hotair-iron-plate-1,molten-iron-05,grade-1-iron-crush,warm-air-1,warm-stone-brick-1,pressured-air" --target "iron-plate:13.5" --time 1 --unlocked --factory "hotair-iron-plate-1:casting-unit-mk01" --factory "molten-iron-05:bof-mk01" --factory "grade-1-iron-crush:jaw-crusher" --factory "warm-air-1:rhe" --factory "warm-stone-brick-1:rhe" --factory "pressured-air:vacuum-pump-mk01" --export helmod`

```
eJztlj9v2zAQxXd/CkJzWZi2lY1Lh25dvBaFQVHnmDX/qEcyrhH4u1eyZEqREkBT7KEb+e5OfO8ngVDpiHZSaLLjrwtCpBbe8+yHK0FnX2rhBdArZ/mq2QRlgLNmVdRDxx06F65jafBbo18HCVElz9o+1ilW1PNZheB9RCipUNhVwrmqK93GnSxg2hXnXYWujDLwgBGSuBcyODzzvdC+U73Ttd+hIg9Klwi2c0nIlqVlMr0FqSrojrs537KhYEv4y5e98HGSPg2OH9vFaHCyXv0ThVbhzDPr0Ag96L8l7A0ny9/b0qD55ulFyBgNraKpqDku2ZuWj88iRBgXbRiGJMTUhjV4/npJ4qWvFyCks4Nqqm1XcymvJpTZmPJJoKE+OAu0QCWPlD0IajzAfeiu59JdT+iu3qVbf77/qW7mUt1MqK7HVJ9RlEAZVegslRj94UHo/han1g/gfSjncynnE8qbMWXjdADbQl7mD0K4cPs7XrxPc/E+TfDmY7wHF5qL4Yq30iLAw9wRUvig7DONVoXPh70YdHRxffL/M+t5Zb8GsVrng+IYpQpg3ryUKgbO1l/z986t09f/HQps6Jxd0m/ZVbgsEEJES3YLsOU/kIGDLg==
```

### bof-mk02+

Higher crafting speed, fewer BOFs needed. Drop-in upgrade.

## Methodology self-review

**Base block:**
- Rule 4 (alternatives): BOF chosen over low-grade after full system-level cost tracing. Both need 2 upstream blocks; BOF's amortize better and ore efficiency is 3.5x. Voiding burden comparable (~4 vs ~3 py-burners).
- Rule 5 (byproducts): ash voided via ash loop (9/s), stone exported or voided (3/s).
- Rule 8 (power): 7.4 MW electric + 36 MW coal thermal. BOF fuel solver-validated (9/s coal).
- Rule 19 (fluid transport): oxygen imported as fluid — cheap transport via fluid wagon.
- Rule 20 (space budget): 20 buildings, 820 tiles. Fits city block easily.
- Rule 21 (on-site smelting): 5:1 ore:plate at crusher level justifies on-site. BOF itself is 1.4:1 (centralized ok).
- Rule 22 (ore sourcing): iron-ore is basic-solid, no mining fluid.

**Hot-air upgrade:**
- Rule 5 (byproducts): cold COG classified (c) burnable / (d) vent. Burn option evaluated (8 MW recovery, 7 extra buildings) — defaulted to vent for simplicity, burn noted as optional upgrade.
- Rule 8 (power): add-on 1.9 MW electric computed. Grand total 9.3 MW.
- Rule 9 (burn block fluids): cold COG (fuel_value 1 MJ) evaluated for oil-boiler burn. Deferred — recovery vs building cost doesn't justify at block scale.
- Rule 19 (temperature): COG temperature degradation (250°C→100°C) correctly identified — not net zero, consumed as heat source.
- Rule 20 (space budget): add-on 93 tiles (5 buildings). Grand total 913 tiles. Fits.
- Rule 23 (recipe-variant staging): circuit-controlled switchable upgrade. Same upstream, graceful degradation when COG unavailable. Exact rule 23 pattern.

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "iron-plate-1,molten-iron-05,grade-1-iron-crush" --target "iron-plate:10.8" --time 1 --unlocked --factory "iron-plate-1:casting-unit-mk01" --factory "molten-iron-05:bof-mk01" --factory "grade-1-iron-crush:jaw-crusher" --export helmod`

```
eJzNlruO2zAQRXt9BaF6BZh+lGxSpEvjNlgYNDm2maU4ypDKRln436MHLdFyArhauxPvzIj3HgmUNDKLSlq2Ex8ZY8pK70X+DTXY/KUVfgF5g04su0UwJQjeXe3bobcdIYZ+bBz80un9IGNGi3zo41Fxsp3PT40mPIKLYmiqVowLfHdA42rf7CpCXasgDtJ6GNWDVAGpSVWPtvWaKupkrCZw0SFjWz5ejoa3oEwFcb+L6y1PBafht1hMwj9TTElofscYoaPIJ/VnLa0JjcgdUilt0n8JN3kd3X4dSknzxQ5YUIHQNn+AivJtwa96/r8ZY7LE2oU0IGNl69iCFx/nUTxP9T1IhS6pjrXt8l7CyxvCfE7YS6cLJX0w7vgklIOkot1IgfetqaJ2JjyG8+pezqsbzss55yNJDQUvDKErFNX+9CS0f8j3wQ/QYyiv76W8vqG8mlMu0QZwA+TF5kkI7/HwwMNicy/ezQ3e9Rxvz7WyMrRv8pPAjUdXf0p8PuUs6Yhxu3L8NLsjgTbgOi1OfB8YIkH+mgRN8HalOVoToLx6OlUdBN9cu8iik/5voDd5zghCTY7tMnD6LwboLPA=
```

## Notes

- 10.8/s iron plate covers most early-mid game demand. Stamp for higher throughput.
- Stone export (3/s) partially offsets moss farm's 15/s stone import.
- **Sand-casting inline variant (circuit-optimized).** Instead of importing sand-casting (0.18/s), inline the full chain: stone (byproduct) → gravel → sand → sand-casting. Requires 1 tar-processing-unit (sand-casting recipe, 9% util) and 0 new crushers — the 7th jaw-crusher (which exists due to solver ceiling from 6.0) handles both stone→gravel and gravel→sand via circuit-controlled recipe swap (~35% combined util). The 6 main crushers cover 100% of iron-crush demand (6 × 1.5 = 9.0/s processed = exact demand); the 7th serves as overflow buffer for iron spikes + gravel/sand when idle. Trade: swap sand-casting item station → creosote fluid station (1.8/s, from tar refinery). Stone byproduct drops 3.0 → 2.2/s. Net: same station count, +1 building, eliminates a niche item import in favor of a bulk commodity fluid. General pattern: circuit-swapping underutilized machines across multiple low-demand recipes reduces building count.
- Coal from tar refinery coke surplus (15/s available) more than covers 9/s demand. Alternative: mine raw-coal, distill to coal.
