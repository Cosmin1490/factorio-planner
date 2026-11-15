# 45 — Refined concrete — 2.667/s, 14 buildings, 549 tiles

Sized in whole `assembling-machine-2`: `refined-concrete` is 15 s for 10 and the machine is speed 2,
so **one 3×3 machine is 1.333 refined-concrete/s** and the block scales in whole units. Two is the
build here.

Feeds elevated rail. `rail-ramp` is **100 refined-concrete** each and `rail-support` **20**, so
2.667/s is **96 ramps or 480 supports per hour**.

Coke and steel-plate are bought rather than made — see § Why steel is imported. Water is on-site from
a `water-free` pumpjack.

```
refined-concrete      [U] [crafting-with-fluid, 15 s]  concrete 5 + iron-stick 8
                                                       + steel-plate 1 + water 100   →  10
concrete              [U] [crafting-with-fluid, 0.5 s] lime 5 + gravel 10 + sand 10
                                                       + water 100                   →   5
lime                  [U] [hpf,                 5 s]   coke 15 + limestone 10        →  10 + CO₂ 100
iron-stick            [U] [crafting,           0.5 s]  iron-plate 1                  →   2
extract-limestone-01  [U] [soil-extraction,     20 s]  water 400                     →   8
stone-to-gravel       [U] [crusher,              1 s]  stone 4                       →   3
gravel-to-sand        [U] [crusher,              1 s]  gravel 4                       →   3
water-free            [U] [pumpjack,             1 s]  (no ingredients)              → 300
```

## Block boundary

| class | items |
|---|---|
| **import — bulk, local** | stone (mined on site, § Mining annex) |
| **import — bus** | coke, iron-plate, steel-plate |
| **made on site from nothing** | water (`water-free`) |
| **must-consume-internally** | concrete, lime, limestone, gravel, sand, iron-stick |
| **byproduct-exclude** | carbon-dioxide 13.33/s — vent-approved, and wanted elsewhere |
| **export** | refined-concrete 2.667/s |

## Recipe table

```
┌──────────────────────┬──────────────────────┬───────┬───────┬────────┬───────┬─────────┐
│ Recipe               │ Factory              │  frac │ Count │  Util  │ Size  │ MW load │
├──────────────────────┼──────────────────────┼───────┼───────┼────────┼───────┼─────────┤
│ extract-limestone-01 │ soil-extractor-mk01  │ 3.334 │   4   │  83.4% │ 7x7   │   1.33  │
│ stone-to-gravel      │ jaw-crusher          │ 2.075 │   3   │  69.2% │ 7x7   │   2.08  │
│ refined-concrete     │ assembling-machine-2 │ 2.000 │   2   │ 100.0% │ 3x3   │ (jerry) │
│ gravel-to-sand       │ jaw-crusher          │ 0.889 │   1   │  88.9% │ 7x7   │   0.89  │
│ lime                 │ hpf                  │ 0.667 │   1   │  66.7% │ 7x7   │   1.33  │
│ water-free           │ pumpjack-mk01        │ 0.401 │   1   │  40.1% │ 6x6   │   0.10  │
│ iron-stick           │ assembling-machine-2 │ 0.267 │   1   │  26.7% │ 3x3   │ (jerry) │
│ concrete             │ assembling-machine-2 │ 0.067 │   1   │   6.7% │ 3x3   │ (jerry) │
└──────────────────────┴──────────────────────┴───────┴───────┴────────┴───────┴─────────┘
```

**14 buildings · 513 tiles · 5.73 MW electric** *(+ four `assembling-machine-2` on canisters, 0.04/s)*

**`concrete` and `iron-stick` fit on one machine.** 0.067 + 0.267 = **0.334 on a single
`assembling-machine-2`** — same machine type, both sub-second crafts, a third of capacity. That is
the guide's circuit-swap case exactly, and it takes the block to **13 buildings / 504 tiles**.

## Mining annex

`stone` is `basic-solid`, `mining_time 1`, 1 stone per op — a plain `electric-mining-drill` works.
With the force's 20 % mining productivity:

```
2.00 ops/s per drill  ->  2.40 stone/s  (and 2.40 kerogen/s)
8.30 stone/s needed   ->  3.458 drills -> 4  ·  36 tiles  ·  3.46 MW
```

**The stone yields kerogen 1:1 — 8.30/s with no sink in this block.** See risk 2.

**14 + 4 = 18 buildings · 549 tiles · 9.19 MW** all in.

## Imports and exports

| | /s | note |
|---|--:|---|
| **stone** | **8.30** | mined on site, 4 drills. 3.1 stone per refined-concrete |
| **coke** | **2.00** | `lime` only — 1.5 coke per lime |
| iron-plate | 1.07 | → `iron-stick`, 8 per 10 refined-concrete |
| steel-plate | 0.27 | **1 per 10 refined-concrete, not substitutable** |

**Exports** (/s): **refined-concrete 2.667** · carbon-dioxide 13.33 *(vent-approved)*

## Intermediate flows

```
┌────────────┬───────────┬──────────────────────┬──────────────────────────────────────────────────────┐
│ Item       │ Rate /s   │ Producer             │ Consumer                                             │
├────────────┼───────────┼──────────────────────┼──────────────────────────────────────────────────────┤
│ water      │    120.02 │ water-free           │ extract-limestone-01 66.67, refined-concrete 26.67,  │
│            │           │                      │ concrete 26.67                                       │
│ gravel     │      6.22 │ stone-to-gravel      │ gravel-to-sand 3.56, concrete 2.67                   │
│ sand       │      2.67 │ gravel-to-sand       │ concrete 2.67                                        │
│ iron-stick │      2.13 │ iron-stick           │ refined-concrete 2.13                                │
│ concrete   │      1.33 │ concrete             │ refined-concrete 1.33                                │
│ lime       │      1.33 │ lime                 │ concrete 1.33                                        │
│ limestone  │      1.33 │ extract-limestone-01 │ lime 1.33                                            │
└────────────┴───────────┴──────────────────────┴──────────────────────────────────────────────────────┘
```

**Gravel splits two ways and that is the only routing subtlety** — 2.67/s straight into `concrete`
and 3.56/s onward to `gravel-to-sand`. Mis-split it and sand starves while gravel backs up.

## Terminal outputs

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| refined-concrete | 2.667 | the product — `rail-ramp` 100, `rail-support` 20 | — | — |
| carbon-dioxide | 13.33 | **vent** (`py-gas-vent`, 1×1, 25 kW), or pipe it out | ~0 | nothing — it is a free co-product of `lime`, and `kicalk-3` wants 150/craft while `olefin` wants 200 if either is ever sited nearby |
| kerogen | 8.30 | **unsolved** — see risk 2 | — | — |

## Why steel is imported

`steel-plate` is a **direct ingredient**, 1 per 10 refined-concrete, with no substitute: there is no
second `refined-concrete` recipe, and `concrete-02` (behind `cellulose-mk02`) replaces plain
`concrete`, not the refined step.

Making the 0.27/s on site costs:

```
4 x advanced-foundry-mk01   15 s for 1 steel-plate   =  144 tiles, 4.80 MW
+ 3 more soil-extractors    steel wants 1.33 limestone/s on top of lime's 1.33
+ 1.33 coke/s               doubles the block's coke
+ 5.33 iron-ore/s           20 ore per plate
```

**14 → 21 buildings and 5.73 → ~11.9 MW, for the ingredient used least by count.** The 5.33 iron-ore/s
is also more tonnage across the fence than the 8.30 stone/s already being hauled. Import it.

> **This changes when better smelting lands.** `steel-mk02` (160 u) unlocks `hotair-steel-20` —
> 2 sand-casting + 100 molten-steel + 50 hot-air → **32 steel-plate** — which is roughly 8× less coke
> per plate than the foundry route. It does not change this block: steel stays an import either way.
> What changes is that the import gets much cheaper wherever it is produced, so the 4-foundry
> comparison above stops being the relevant alternative.

## Scaling

| machines | /s | buildings | tiles | MW | stone /s | drills | ramps/hr | supports/hr |
|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 1 | 1.333 | 9 | ~330 | 2.87 | 4.15 | 2 | 48 | 240 |
| **2** | **2.667** | **14** | **513** | **5.73** | **8.30** | **4** | **96** | **480** |
| 3 | 4.000 | 18 | ~660 | 8.59 | 12.44 | 6 | 144 | 720 |
| 6 | 8.000 | 32 | ~1,200 | 17.19 | 24.89 | 11 | 288 | 1,440 |

Unlike a block whose support tier is flat, **everything here scales** — dropping from 3 machines to 2
took a limestone extractor, a crusher and two drills with it. There is no free capacity to grow into,
so pick the rate deliberately.

## Risks

1. **`gravel-to-sand` at 88.9 % on one crusher** is the tightest row in the block and the whole sand
   supply. A second is 49 tiles and 1.00 MW.
2. **Kerogen 8.30/s has no sink here.** Stone mining yields it 1:1 and it cannot be vented. Two
   unlocked routes: `sulfur-void-tar` (1 sulfur + 1 kerogen + 50 water → 50 tar, needs a sulfur
   supply) or `kerogen-extraction` (25 kerogen + 100 steam → 250 scrude) feeding `scrude-refining`
   → condensates + light-oil + heavy-oil. The second is productive but is a larger block than this
   one. **Do not commit the drills without choosing.** `grade-1-iron-crush` yields only 1 stone per
   5 iron-ore, so it cannot replace the drills either.
3. **`refined-concrete` is pinned at exactly 2.000** — no headroom, and the frac is an exact integer
   rather than a near-miss. A third machine is 9 tiles.
4. **Gravel's two-way split** (risk of starving sand) — see § Intermediate flows.
5. **Rate is a placeholder.** 96 ramps/hour was chosen as two whole machines, not measured against a
   grid rollout. Ramps only appear where an elevated run comes down, so the support count — not the
   ramp count — is what a layout actually consumes.

## Solver command

`--max-import` at 0 on every intermediate forces the chain closed; without them the LP buys gravel
and sand rather than running the crushers. `--fuel ...:acetylene-canister` on the three
`assembling-machine-2` rows avoids the coal default and its phantom ash.

```bash
npx tsx src/cli.ts solve \
  --recipes "refined-concrete,concrete,iron-stick,lime,extract-limestone-01,stone-to-gravel,gravel-to-sand,water-free" \
  --target "refined-concrete:2.667" --time 1 \
  --max-import "concrete:0" --max-import "lime:0" --max-import "limestone:0" \
  --max-import "gravel:0" --max-import "sand:0" --max-import "water:0" \
  --max-import "iron-stick:0" \
  --max-import "stone:100000" --max-import "coke:100000" \
  --max-import "iron-plate:100000" --max-import "steel-plate:100000" \
  --factory "refined-concrete:assembling-machine-2" \
  --factory "concrete:assembling-machine-2" \
  --factory "iron-stick:assembling-machine-2" \
  --factory "lime:hpf" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "stone-to-gravel:jaw-crusher" \
  --factory "gravel-to-sand:jaw-crusher" \
  --factory "water-free:pumpjack-mk01" \
  --fuel "refined-concrete:acetylene-canister" \
  --fuel "concrete:acetylene-canister" \
  --fuel "iron-stick:acetylene-canister" \
  --solver simplex --unlocked
```

Run at `--target "refined-concrete:2667"` and divide by 1000 for fracs. **`refined-concrete` shows the
float-ceiling artifact** — it reads 2.001 against an exact 2.000 (2.667 ÷ 1.3333), so the direct run
reports 3 machines where 2 is correct. Cross-check against MW: 5.73 only balances at 2.000.

## Helmod import string

Same command with `--export helmod` appended.

```
eJztl0GPmzAQhe/5FRbnUi0kIXvxpYfeesm1qiLHDBtvjE3HZrNolf9eE4gh0JVoVYlU2ht+Y+M33wMsUk2k5kySHX1bEMIlM4YG33QKMvjkhBdAI7SicT2wIgca1Vd7t+i4Q63tZZlf+KXWLwsJESkNmnlRqyjm1gcnZgHDDAFa2VaFk9uBPilAP9pXuwJ1WnJLLZbgxYxxq7GiGZOmVY2Wzmxf4QchUwTVWiRkG/lL73gLXBRXJ1fb26gvqBRe6UMnvNNG1woO79n2UIOMOvVnyaSwFQ2UxpzJ3vxre51b7/drU+pNvhoqyrx4ZvwY5seH6Kb+/kaEsFyXyvbbIyR3biUY+nb24rmr74FxrXpVX9vGU/nGI77RkO8TsheQodWhYSq9E8bP7BRyLM0BcB7Cy6mElyPC8ZCwsVpBDbhB/YG4Qbyaing1QrwcIoZXi67TULovZ4P75tWck7PRQoatP40zfjTWU3mvR7xXQ9415zvheyiyeXgmU3kmI57rIU+BWoXGCn+oz03VlSHfS6Gewpy5A969UfE/wtxXsxKk24yDrSS4PThTwrjzPvjDLDZTs9iMskiGWbg9OIK9l+f7P0vicWoSj6MkNsMkEDLXbhp+JPIXiSx6M1osxvf5fcz2Rw/CRPzCQn6TYlFaGn9Oks3vTDheCKkAZVubZ/+HcxHOC7dJiYrsFqDSX3t3X1k=
```

Does **not** include the four stone drills — Helmod has no mining-drill row for `basic-solid`, so size
those from § Mining annex.

## Build materials

Distinct items to construct the six building types, separate from flow imports:

`assembling-machine-1` · `burner-mining-drill` · `copper-plate` · `duralumin` · `electronic-circuit` ·
`inductor1` · `intermetallics` · `iron-plate` · `small-parts-01` · `steam-engine` · `steel-plate` ·
`stone-brick`

All twelve already appear in the existing catalogue. `duralumin` is the only one with any depth to it
(5 per `assembling-machine-2`, so 20 for the four here). Inferred from the recipe graph, not from save
state.
