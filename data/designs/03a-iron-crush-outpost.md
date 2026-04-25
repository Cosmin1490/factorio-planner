# Iron ore crushing outpost — 9/s processed-iron-ore (on-site mining, 6 jaw-crushers)

Mining outpost: crush iron-ore on-site, export processed-iron-ore at stack 100 (vs raw ore stack 50 — doubles train throughput). Stone byproduct exported or voided.

## Recipe table

```
┌────────────────────┬─────────────┬───────┐
│ Recipe             │ Factory     │ Count │
├────────────────────┼─────────────┼───────┤
│ grade-1-iron-crush │ jaw-crusher │     6 │
└────────────────────┴─────────────┴───────┘
```

6 buildings, 6 MW electric. Solver-validated at 9/s processed-iron-ore target.

## Stations (2–3)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| processed-iron-ore | load | processed-iron-ore (item, stack 100) | 9.0 |
| stone | load | stone (item) | 3.0 |

Stone station optional — omit if voiding on-site. No unload stations (on-site mining).

## Crushing math

- grade-1-iron-crush: 5 iron-ore → 3 processed-iron-ore + 1 stone in 2s
- Per jaw-crusher (crafting_speed=1): 2.5/s iron-ore → 1.5/s processed + 0.5/s stone
- 6 jaw-crushers: 15/s iron-ore → 9.0/s processed-iron-ore + 3.0/s stone

## Mining

Iron-ore: basic-solid resource, no mining fluid required (rule 22). Electric-mining-drills. Miner count depends on ore patch mining_time — need 15/s iron-ore throughput to feed crushers.

## Byproduct classification (rule 5)

| Byproduct | Rate/s | Classification | Handling |
|---|---|---|---|
| stone | 3.0 | (b) valuable | Export to sand-casting block (03c) or water-saline block (10). Overflow: 1 py-burner on-site. |

## Power budget

| Component | MW |
|---|---|
| 6 jaw-crushers | 6.0 |
| miners | ~8.0 (depends on count) |
| 1 py-burner (overflow) | 0 (fuel-powered) |
| **Total electric** | **~14** |

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| jaw-crusher | 7×7 | 6 | 294 |
| py-burner | 3×3 | 1 | 9 |
| miners | 3×3 | ~8 | ~72 |
| **Total** | | **~15** | **~375** |

Compact mining outpost. Placement constrained by iron-ore patch location. Stampable at different patches.

## Stack size advantage

| Item | Stack | Wagon capacity (40 slots) |
|---|---|---|
| iron-ore (raw) | 50 | 2,000 |
| processed-iron-ore | 100 | 4,000 |
| iron-plate | 100 | 4,000 |

Crushing at the mine converts stack-50 ore to stack-100 processed ore — **2× items per train** on the ore→smelter leg.

## Upgrade path (rule 23)

- jaw-crusher-mk02 (speed=2): halves to 3 crushers for same output. Drop-in.
- Stamp additional outposts at other iron-ore patches to scale throughput.

## Methodology self-review

- Rule 4: only 1 unlocked recipe for processed-iron-ore (grade-1-iron-crush)
- Rule 5: stone byproduct exported or voided (1 py-burner)
- Rule 20: ~375 tiles, ~15 buildings — fits easily
- Rule 21: 5:1 ore:plate ratio at crusher level → on-site crushing saves significant train capacity
- Rule 22: iron-ore is basic-solid, no mining fluid

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "grade-1-iron-crush" --target "processed-iron-ore:9" --time 1 --unlocked --factory "grade-1-iron-crush:jaw-crusher" --export helmod`

```
eJyFkjFvwyAQhff8CsTcSHW3DiwdunXJWlUWgUtCizn3gKZW5P9eHBNMoladzL13Z753tkZmUUnLWnFaMaas9F7wF9Rg+V0SvoC8QScepiKYDkQznbZp6KMlxHAeK4NPk34eZMxowee+JitOpnm+J6lh3awNoVsriv6Q7TD0yc4FHh1QqbZD2xPqqIIIFKGIO6kC0iB20vqserQJulbUwVhN4DIqY5umHAv5BpTpIV93wd80teA0fIv7RfgnzhKJbt+ds0yLbRb1M0prwiC4Q+qkrfovMRfqwv08W1XzBexdHmceoCv372sYkx1GF+qQjHWJ1YIXp7GI4+JvQSp0lTs/c0cO6gv5K0+SAu9BzxtDAv5WBZvZf2m6XaoJ0F19nT4G8fgbhHF7Am3AhYw5ll/4LIwrghDJsXYFTv8A+wfVgg==
```
