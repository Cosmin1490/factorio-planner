# Sand-casting block — 2/s output (stone + creosote, 6 buildings)

Shared service block: converts stone + creosote into sand-casting for all casting-unit consumers. 5 unlocked casting recipes consume sand-casting (iron, aluminium, chromium + hot-air variants).

## Recipe table

```
┌─────────────────┬─────────────────────┬───────┐
│ Recipe          │ Factory             │ Count │
├─────────────────┼─────────────────────┼───────┤
│ sand-casting    │ tar-processing-unit │     1 │
│ stone-to-gravel │ jaw-crusher         │     3 │
│ gravel-to-sand  │ jaw-crusher         │     2 │
└─────────────────┴─────────────────────┴───────┘
```

6 buildings, 4.39 MW electric. Solver-validated at 2/s sand-casting target.

## Stations (3)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| stone | unload | stone (item) | 8.89 |
| creosote | unload | creosote (fluid) | 20.0 |
| sand-casting | load | sand-casting (item) | 2.0 |

## Production math

- stone-to-gravel: 4 stone → 3 gravel in 1s
- Per jaw-crusher (crafting_speed=1): 4/s stone → 3/s gravel
- 3 jaw-crushers: 8.89/s stone → 6.67/s gravel

- gravel-to-sand: 4 gravel → 3 sand in 1s
- Per jaw-crusher: 4/s gravel → 3/s sand
- 2 jaw-crushers: 6.67/s gravel → 5.0/s sand

- sand-casting: 5 sand + 20 creosote → 2 sand-casting in 1s
- Per tar-processing-unit (crafting_speed=1): 5/s sand + 20/s creosote → 2/s sand-casting
- 1 tar-processing-unit: 2.0/s sand-casting

## Sand-casting consumers

| Consumer | sand-casting/s | Phase | Permanent? |
|---|---|---|---|
| iron-plate-1 (1 caster, speed 0.75) | 0.1875 | Phase 3 | Yes |
| hotair-iron-plate-1 (same caster) | 0.1875 | Phase 3 upgrade | Yes |
| aluminium-plate-3 (1 caster) | 0.1875 | Future | Yes |
| hotair-aluminium-plate-3 (same caster) | 0.1875 | Future | Yes |
| chromium-01 (1 caster, speed 0.75) | 0.15 | Future | Yes |

Near-term: ~0.19/s (iron only). Medium-term with all 3 metals: ~0.53/s. 2/s provides ~4× headroom — covers multiple stamped casters without scaling this block.

## Stone sourcing

Stone is a byproduct of nearly every ore crushing chain (12 unlocked recipes produce it): iron, copper, nickel, chromium, zinc, tin, titanium, antimony crushing, coarse classification, quartz crushing. Import from any crushing outpost. Iron crush outpost (03a) produces 3/s stone — covers ~34% of demand alone. Remainder from other crushing operations.

Note: water-saline block (10) also consumes stone (30/s) — these compete for supply but stone is abundantly available.

## Creosote sourcing

Creosote block exports 36.4/s. Tar refinery produces 48/s. 20/s creosote demand is easily covered.

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| tar-processing-unit | 9×9 | 1 | 81 |
| jaw-crusher | 7×7 | 5 | 245 |
| **Total** | | **6** | **326** |

326 tiles. Compact block with room to spare.

## Recipe alternatives (rule 4)

Only 1 unlocked recipe for sand-casting: sand-casting (tar category). No alternatives to evaluate.

For intermediates: stone-to-gravel and gravel-to-sand are the only unlocked paths for gravel and sand respectively.

## Upgrade path (rule 23)

- jaw-crusher-mk02 (speed=2): halves crushers from 5 to 3. Drop-in.
- tar-processing-unit-mk02: doubles capacity to 4/s with same 1 building.
- Not expected to need scaling — 2/s serves 4× current demand.

## Methodology self-review

- Rule 4: 1 recipe per product in chain, no alternatives
- Rule 5: no byproducts (clean chain)
- Rule 14: 5 unlocked consumers (all casting recipes) → dedicated block justified
- Rule 20: 326 tiles, 6 buildings — fits easily
- Rule 24: 2/s covers ~0.53/s medium-term demand with 4× headroom for stamped casters

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "sand-casting,stone-to-gravel,gravel-to-sand" --target "sand-casting:2" --time 1 --unlocked --factory "sand-casting:tar-processing-unit" --factory "stone-to-gravel:jaw-crusher" --factory "gravel-to-sand:jaw-crusher" --export helmod`

```
eJztlDFPwzAQhff+CiszkUg6e2FgY8mKUOTa19bg2ME+t0RV/jtO4zppC6gTYmCz393l3vsSRRiiDGeK1PSwIIQr5hzNnowAld0FYQfWSaNpOVxQNkCL4bQKQ2+1NQaPY2nwYdCPg4RIQbOxr4iKZmE+21i2A5WjyR3TIpawa0MpXsxeg023VVe31gjPkaL1kMQ142hsR9dMuag6o4LhucK3UgkLOtokpCrSMbmugMsW4rqT9aqYC1rAB72fhB+iTHHs5XNjjgFoManvnimJHc20sQ1Ts/5TxMlx8vw4lmbNJ1OvbJ9z690W7Fn1+zWEsMZ4jfOAhDTBqwJHD30S+6m+AsaNnlVTrSpvJVxeES4uCTs0GgbAI+p/xCPi5a2Il1eIyyvE4dPNOXMo9eaP8EVm87CIg3PBVO61xF/lvJh1xMAuJXg+J/Yyi3YDUInQnL2T1iMtv1ocpi0ICRqjtT79eY9Cv7CA3mpSL0CLTyGxgb8=
```
