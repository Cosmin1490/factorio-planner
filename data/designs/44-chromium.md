# 44 — Chromium — 2.00 chromium/s, 37 buildings, 1,502 tiles

Two `casting-unit-mk01` is the sizing unit: `chromium-01` is 5 s for 5 chromium at speed 1, so
**one casting unit is exactly 1 chromium/s** and the block scales in whole units.

Built to a hard boundary: **the only imports are syngas and creosote.** Water comes from on-site
`water-free` pumpjacks, CO₂ from a moondrop greenhouse running on nothing, and everything else is
made from those. **Nothing leaves but chromium** — the one exception is 0.44 oxygen/s off the
muddy-sludge electrolyzer, which is on the pre-approved vent list.

```
chromium-01           [U] [casting,         5 s]  chromite-sand 15 + limestone 3
                                                  + sand-casting 1 + carbon-dioxide 150  →  5
tier-0-chromite-sand  [U] [solid-separator, 2 s]  grade-1-chromite 1                     →  3
grade-1-chromite      [U] [crusher,         1 s]  ore-chromium 5        →  1 + stone 1 (50 %)
sand-casting          [U] [tar,             1 s]  sand 5 + creosote 20                   →  2
extract-limestone-01  [U] [soil-extraction,20 s]  water 400                              →  8
moondrop-co2          [U] [moon,            5 s]  (no ingredients)                       →  200
water-free            [U] [pumpjack,        1 s]  (no ingredients)                       →  300
```

> **`grade-1-chromite`'s stone is `probability: 0.5`, not `amount: 1`.** Reading the face amount
> gives 1 stone per craft and makes the sand balance look self-closing on stone alone. It is 0.5,
> which leaves the sand chain 44 % short and is why `soil-washing` exists in this block at all.

## Block boundary

| class | items |
|---|---|
| **import — allowed** | syngas (mining fluid), creosote (`sand-casting`) |
| **made on site from nothing** | water (`water-free`), carbon-dioxide (`moondrop-co2`) |
| **must-consume-internally** | ore-chromium, grade-1-chromite, chromite-sand, limestone, sand-casting, sand, gravel, stone, soil, muddy-sludge |
| **byproduct-exclude** | oxygen 0.44/s — vent-approved, the only non-chromium output |
| **export** | chromium 2.00/s |

## Recipe table

```
┌────────────────────────────────┬──────────────────────────┬───────┬───────┬────────┬───────┬─────────┬──────────────┐
│ Recipe                         │ Factory                  │  frac │ Count │  Util  │ Size  │ MW load │ Modules      │
├────────────────────────────────┼──────────────────────────┼───────┼───────┼────────┼───────┼─────────┼──────────────┤
│ tier-0-chromite-sand           │ solid-separator          │ 4.000 │   4   │ 100.0% │ 7x7   │   6.00  │              │
│ extract-limestone-01           │ soil-extractor-mk01      │ 3.000 │   3   │ 100.0% │ 7x7   │   1.20  │              │
│ chromium-01                    │ casting-unit-mk01        │ 2.000 │   2   │ 100.0% │ 7x7   │   1.00  │              │
│ grade-1-chromite               │ jaw-crusher              │ 2.000 │   2   │ 100.0% │ 7x7   │   2.00  │              │
│ moondrop-co2                   │ moondrop-greenhouse-mk01 │ 1.500 │   2   │  75.0% │ 9x9   │   0.68  │ 16x moondrop │
│ soil                           │ soil-extractor-mk01      │ 0.547 │   1   │  54.7% │ 7x7   │   0.22  │              │
│ water-free                     │ pumpjack-mk01            │ 0.456 │   1   │  45.6% │ 6x6   │   0.11  │              │
│ stone-to-gravel                │ jaw-crusher              │ 0.250 │   1   │  25.0% │ 7x7   │   0.25  │              │
│ sand-casting                   │ tar-processing-unit      │ 0.200 │   1   │  20.0% │ 11x11 │   0.10  │              │
│ gravel-to-sand                 │ jaw-crusher              │ 0.188 │   1   │  18.8% │ 7x7   │   0.19  │              │
│ soil-washing                   │ washer                   │ 0.175 │   1   │  17.5% │ 6x6   │   0.07  │              │
│ muddy-sludge-void-electrolyzer │ electrolyzer-mk01        │ 0.132 │   1   │  13.2% │ 6x6   │   1.32  │              │
└────────────────────────────────┴──────────────────────────┴───────┴───────┴────────┴───────┴─────────┴──────────────┘
```

**Process block: 20 buildings · 1,077 tiles · 13.14 MW** *(installed 24.65 MW)*

**The three `crusher` rows share a machine type.** `grade-1-chromite` 2.000, `stone-to-gravel` 0.250
and `gravel-to-sand` 0.188 are all category `crusher` on `jaw-crusher` — 2.438 fracs across four
machines. Switched onto **three** they run at 81 % and the block is 19 buildings. The two
`soil-extraction` rows (3.000 + 0.547 = 3.547) do *not* save anything; they already round to the
four machines in the table.

## Mining annex

`ore-chromium` is `basic-with-fluid`, `mining_time 2`, **4 syngas per op** (prototype 40 ÷ 10), 1 ore
per op. With `fluid-drill-mk02` at `mining_speed 1` and the force's **20 % mining productivity**:

```
0.500 ops/s per drill  ->  0.600 ore/s  and  2.00 syngas/s
10.00 ore/s needed     ->  16.67 drills -> 17   ·  33.33 syngas/s  ·  425 tiles  ·  15.00 MW
```

| drill | count | syngas /s | tiles | MW |
|---|--:|--:|--:|--:|
| `fluid-drill-mk01`, no productivity | 40 | 40.00 | 1,000 | 16.00 |
| `fluid-drill-mk01`, 20 % productivity | 34 | 33.33 | 850 | 13.33 |
| **`fluid-drill-mk02`, 20 % productivity** | **17** | **33.33** | **425** | **15.00** |

**Productivity cuts the syngas, the mk02 cuts the drills.** They're independent — productivity means
17 % fewer mining ops for the same ore, so the fluid bill falls with it; mk02 doubles ops per drill,
which halves the building count but not the fluid. mk01 at 20 % is the cheaper-power option if
drills are free and power is not.

**37 buildings · 1,502 tiles · 28.14 MW** all in.

## Imports and exports

| | /s | note |
|---|--:|---|
| **syngas** | **33.33** | mining fluid, the only large import |
| **creosote** | **4.00** | `sand-casting`, 20 per 2 |

**Exports** (/s): **chromium 2.00** · oxygen 0.44 *(vent-approved)*

Water is **not** an import — `water-free` at 45.6 % of one pumpjack covers all 140.9/s.

## Intermediate flows

```
┌──────────────────┬───────────┬──────────────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ Item             │ Rate /s   │ Producer                                 │ Consumer                                                │
├──────────────────┼───────────┼──────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ water            │    140.94 │ water-free 136.56, electrolyzer 4.38     │ extract-limestone 60.00, soil 54.68, soil-washing 26.24 │
│ carbon-dioxide   │     60.00 │ moondrop-co2 60.00                       │ chromium-01 60.00                                       │
│ chromite-sand    │      6.00 │ tier-0-chromite-sand 6.00                │ chromium-01 6.00                                        │
│ muddy-sludge     │      4.37 │ soil-washing 4.37                        │ muddy-sludge-void-electrolyzer 4.37                     │
│ ore-chromium     │     10.00 │ (17 x fluid-drill-mk02)                  │ grade-1-chromite 10.00                                  │
│ grade-1-chromite │      2.00 │ grade-1-chromite 2.00                    │ tier-0-chromite-sand 2.00                               │
│ soil             │      1.31 │ soil 1.09, electrolyzer 0.22             │ soil-washing 1.31                                       │
│ limestone        │      1.20 │ extract-limestone-01 1.20                │ chromium-01 1.20                                        │
│ stone            │      1.00 │ grade-1-chromite 1.00  (50 % chance)     │ stone-to-gravel 1.00                                    │
│ sand             │      1.00 │ gravel-to-sand 0.56, soil-washing 0.44   │ sand-casting 1.00                                       │
│ gravel           │      0.75 │ stone-to-gravel 0.75                     │ gravel-to-sand 0.75                                     │
│ sand-casting     │      0.40 │ sand-casting 0.40                        │ chromium-01 0.40                                        │
└──────────────────┴───────────┴──────────────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

**Two closed loops carry the no-export rule.** The chromite crusher's stone goes
`stone → gravel → sand` and covers 56 % of the sand; the rest comes from
`soil → soil-washing → sand`, whose muddy-sludge returns through the electrolyzer as **soil and
water again**, leaving only oxygen. Without the electrolyzer the block exports 4.37 muddy-sludge/s.

## Terminal outputs

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| chromium | 2.00 | the product | — | — |
| oxygen | 0.44 | **vent** (`py-gas-vent`, 1×1, 25 kW) | ~0 | `sand-classification` would have taken the sand surplus instead but leaks iron-oxide and crushed-quartz — two solid exports for one gas |
| stone | 0 | **`stone-to-gravel` → `gravel-to-sand`** | 2 jaw-crusher rows at 25 % / 19 % | `stone-brick`, `landfill`, `saline-water` — all three turn stone into an export |

## Scaling

The support tier is the only thing that amortises, and it is already paid for at 2 units:

| casting units | chromium/s | process | drills | total | syngas /s |
|--:|--:|--:|--:|--:|--:|
| 1 | 1.00 | 14 | 9 | 23 | 16.67 |
| **2** | **2.00** | **20** | **17** | **37** | **33.33** |
| 4 | 4.00 | 33 | 34 | 67 | 66.67 |
| 8 | 8.00 | 60 | 67 | 127 | 133.33 |

`sand-casting`, both gravel crushers, the washer, the electrolyzer and the pumpjack are **one machine
each from 1 unit through 4** — seven buildings carrying a 4× range. Everything above 2 units is
essentially linear at ~15 buildings and 16.7 syngas/s per chromium/s.

## Risks

1. **Four rows pinned at exactly 100 %** — `tier-0-chromite-sand` (4), `extract-limestone-01` (3),
   `chromium-01` (2), `grade-1-chromite` (2). That is 11 of 20 process buildings with zero headroom,
   and the fracs are exact integers rather than near-misses, so there is no rounding slack hiding in
   them. A fifth separator and a fourth extractor are cheap insurance.
2. **`tier-0-chromite-sand` is 6.00 MW of the 13.14** — four `solid-separator` at 1.50 MW each,
   45 % of the process load for one crushing step.
3. **Syngas is the single point of failure.** 33.33/s with no local source and no substitute: lose it
   and the drills stop, which stops everything. Roughly a third of design 13's syngas output.
4. **The electrolyzer is 10 MW installed for 13 % duty.** It exists only to keep muddy-sludge from
   leaving. If the no-export rule is relaxed for muddy-sludge, drop it and the block is 19 buildings
   and 11.82 MW.
5. **Mining productivity is baked into the drill count.** At 0 % the annex is 21 mk02 drills and
   40 syngas/s. The figures here assume the force's current `mining_drill_productivity_bonus = 0.2`
   and will drift as that is researched further — in your favour.

## Solver command

`ore-chromium` is mined by a drill, not a recipe, so it enters as an import and the annex is sized
separately (§ Mining annex). Every intermediate is capped at 0 import to force the loops closed —
without those caps the LP buys gravel rather than running `soil-washing`.

```bash
npx tsx src/cli.ts solve \
  --recipes "chromium-01,tier-0-chromite-sand,grade-1-chromite,extract-limestone-01,sand-casting,stone-to-gravel,gravel-to-sand,moondrop-co2,water-free,soil,soil-washing,muddy-sludge-void-electrolyzer" \
  --target "chromium:2" --time 1 \
  --max-import "chromite-sand:0" --max-import "limestone:0" --max-import "sand-casting:0" \
  --max-import "carbon-dioxide:0" --max-import "water:0" --max-import "sand:0" \
  --max-import "gravel:0" --max-import "stone:0" --max-import "grade-1-chromite:0" \
  --max-import "soil:0" --max-import "muddy-sludge:0" \
  --max-import "ore-chromium:100000" --max-import "creosote:100000" \
  --factory "chromium-01:casting-unit-mk01" \
  --factory "tier-0-chromite-sand:solid-separator" \
  --factory "grade-1-chromite:jaw-crusher" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "sand-casting:tar-processing-unit" \
  --factory "stone-to-gravel:jaw-crusher" \
  --factory "gravel-to-sand:jaw-crusher" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "water-free:pumpjack-mk01" \
  --factory "soil:soil-extractor-mk01" \
  --factory "soil-washing:washer" \
  --factory "muddy-sludge-void-electrolyzer:electrolyzer-mk01" \
  --modules "moondrop-co2:moondrop:16" \
  --solver simplex --unlocked
```

Run at `--target "chromium:2000"` and divide by 1000 for fracs. **Three rows show the float-ceiling
artifact** — `chromium-01` reads 2.001, `tier-0-chromite-sand` 4.001 and `extract-limestone-01`
3.001, all exact integers. Cross-check against MW: `13.14` only balances at 2.000 / 4.000 / 3.000.

## Build materials

Distinct items to construct the 10 building types, separate from flow imports:

`aluminium-plate` · `burner-mining-drill` · `copper-plate` · `electric-mining-drill` ·
`electronic-circuit` · `engine-unit` · `fluid-drill-mk01` · `glass` · `inductor1` · `intermetallics` ·
`iron-plate` · `lab` · `pipe` · `py-local-radar` · `small-parts-01` · `steam-engine` ·
`steel-furnace` · `steel-plate` · `stone-brick` · `stone-furnace` · `tar-processing-unit`

Two are worth noting before siting: **`fluid-drill-mk02` is built on top of a `fluid-drill-mk01`**
(plus 2 `electric-mining-drill` and an `engine-unit` each), so the 17 drills need 17 mk01 drills
built first — and the block needs a **`tar-processing-unit` as a component** of its own
`electrolyzer-mk01`, on top of the one it runs `sand-casting` in. `py-local-radar` appears only in
`casting-unit-mk01`. Inferred from the recipe graph, not from save state.
