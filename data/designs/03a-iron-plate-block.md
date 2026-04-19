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

- **hotair-iron-plate-1**: 75 plate per batch vs 60 (+25%) for same molten-iron + 50 hot-air. Evaluate when warm-stone-brick chain available. Same stations, add hot-air import.
- **bof-mk02+**: higher crafting speed, fewer BOFs needed. Drop-in upgrade.

## Methodology self-review

- Rule 4 (alternatives): BOF chosen over low-grade after full system-level cost tracing. Both need 2 upstream blocks; BOF's amortize better and ore efficiency is 3.5x. Voiding burden comparable (~4 vs ~3 py-burners).
- Rule 5 (byproducts): ash voided via ash loop (9/s), stone exported or voided (3/s).
- Rule 8 (power): 7.4 MW electric + 36 MW coal thermal. BOF fuel computed manually.
- Rule 19 (fluid transport): oxygen imported as fluid — cheap transport via fluid wagon.
- Rule 20 (space budget): 20 buildings, 820 tiles. Fits city block easily.
- Rule 21 (on-site smelting): 5:1 ore:plate at crusher level justifies on-site. BOF itself is 1.4:1 (centralized ok).
- Rule 22 (ore sourcing): iron-ore is basic-solid, no mining fluid.

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "iron-plate-1,molten-iron-05,grade-1-iron-crush" --target "iron-plate:10.8" --time 1 --unlocked --factory "iron-plate-1:casting-unit-mk01" --factory "molten-iron-05:bof-mk01" --factory "grade-1-iron-crush:jaw-crusher" --export helmod`

```
eJzNlruO2zAQRXt9BaF6BZh+lGxSpEvjNlgYNDm2maU4ypDKRln436MHLdFyArhauxPvzIj3HgmUNDKLSlq2Ex8ZY8pK70X+DTXY/KUVfgF5g04su0UwJQjeXe3bobcdIYZ+bBz80un9IGNGi3zo41Fxsp3PT40mPIKLYmiqVowLfHdA42rf7CpCXasgDtJ6GNWDVAGpSVWPtvWaKupkrCZw0SFjWz5ejoa3oEwFcb+L6y1PBafht1hMwj9TTElofscYoaPIJ/VnLa0JjcgdUilt0n8JN3kd3X4dSknzxQ5YUIHQNn+AivJtwa96/r8ZY7LE2oU0IGNl69iCFx/nUTxP9T1IhS6pjrXt8l7CyxvCfE7YS6cLJX0w7vgklIOkot1IgfetqaJ2JjyG8+pezqsbzss55yNJDQUvDKErFNX+9CS0f8j3wQ/QYyiv76W8vqG8mlMu0QZwA+TF5kkI7/HwwMNicy/ezQ3e9Rxvz7WyMrRv8pPAjUdXf0p8PuUs6Yhxu3L8NLsjgTbgOi1OfB8YIkH+mgRN8HalOVoToLx6OlUdBN9cu8iik/5voDd5zghCTY7tMnD6LwboLPA=
```

## Notes

- 10.8/s iron plate covers most early-mid game demand. Stamp for higher throughput.
- Stone export (3/s) partially offsets moss farm's 15/s stone import.
- Sand-casting at 0.18/s is negligible — 1 tar-processing-unit makes 0.625/s. Could inline (1 building + creosote import) or dedicate a tiny block. Decision deferred.
- Coal from tar refinery coke surplus (15/s available) more than covers 9/s demand. Alternative: mine raw-coal, distill to coal.
