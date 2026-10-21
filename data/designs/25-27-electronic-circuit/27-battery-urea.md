# 27 — Battery + urea + melamine — 0.20 battery-mk01/s + 1.60 melamine/s, 99 buildings

The cascade half of the circuit chain. `battery-mk01` takes **cyanic-acid 30 per battery**, and that
30:1 ratio drags in the whole urea → manure → auog → native-flora chain — **71 of the 99 buildings are
a bio annex.** Feeds design 26 with batteries and design 25 with melamine and urea.

```
battery-mk01        [U] [chemistry,  10 s]  pbsb-alloy 1 + melamine 2 + graphite 3 + bolts 3
                                            + glass 1 + zinc-plate 3 + cyanic-acid 30  →  1
urea-decomposition  [U] [distilator,  8 s]  urea 20  →  ammonia 30 + cyanic-acid 30
melamine            [U] [fbreactor,  10 s]  water 200 + cyanic-acid 20 + ammonia 20
                                                     →  melamine 20 + CO₂ 30 + muddy-sludge 50
```

**`urea-decomposition` is the only unlocked source of ammonia or cyanic-acid in the game.** Nine other
ammonia recipes exist; all nine are locked. There is no bypass around
`urea → liquid-manure → manure → auog paddocks`.

## What changed — melamine 0.40 → 2.00/s

Design 25 switched to `formica-2`, which consumes **melamine 1.60/s and urea 0.40/s** as imports. Both
are made here. `melamine` went from a byproduct-balancing sideline to the block's second product.

| | at melamine 0.40 /s | **at melamine 2.00 /s** |
|---|--:|--:|
| buildings | 79 | **99** |
| tiles | ~5,574 | **~7,678** |
| MW at load | 26.0 | **37.12** |
| cyanic-acid | 6.40 /s | **8.00 /s** |
| urea | 4.27 /s | **5.73 /s** |
| **native-flora** | 5.17 /s | **6.95 /s** |
| water | 365.09 /s | **483.27 /s** |
| moss · auog · seaweed · moondrop · fwf | 33 · 13 · 4 · 1 · 1 | **45 · 18 · 5 · 2 · 1** |
| **`auog` modules** | 52 | **72** (~6.0 h of chamber time) |
| **ammonia exported** | **6.00 /s** | **6.00 /s** |

**The ammonia surplus did not move.** Melamine went up 5× and the export is still exactly 6.00/s — the
invariant in § The ammonia decision is independent of melamine rate, which is the whole point of it.
**+20 buildings bought design 25 a 120-building saving**, so the melamine demand is the single best
trade in the complex.

**Only +1.78 native-flora/s for 5× the melamine**, because melamine's own cyanic-acid draw is 2.00 of
the 8.00/s — the battery's 6.00 was always the bulk of it. The bio annex grows by a quarter, not
fivefold.

## Block boundary

| class | items |
|---|---|
| **export — to design 26** | **battery-mk01** 0.20/s |
| **export — to design 25** | **melamine** 1.60/s · **urea** 0.40/s |
| **export — external** | **ammonia** 6.00/s — *no consumer identified* |
| **import — whitelisted** | coke, copper-plate, iron-plate, glass, zinc-plate, water |
| **import — asked and approved** | **pbsb-alloy**, **native-flora** |
| **import — boundary inherited from design 15** | **empty-petri-dish** 0.19/s |
| **made in-block** | cyanic-acid, ammonia, melamine, graphite, bolts, iron-stick, small-lamp, copper-cable · the whole urea chain: manure, liquid-manure, zogna-bacteria, petri-dish, agar, seaweed, urea · moss, muddy-sludge, soil, CO₂, wood, steam, pressured-air |
| **byproduct-exclude** | none |

## Recipe table

Bio counts are **module-corrected**; the solver reports base crafting speed, a 5–17× error here.
Multipliers from solver-reference § Bio module system, all reaching effective speed 1.0.

```
┌──────────────────────────┬──────────────────────────┬──────┬───────┬───────┬─────────┐
│ Recipe                   │ Factory                  │ Cnt  │ Size  │ Load  │ MW load │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ battery-mk01             │ chemical-plant-mk01      │   2  │ 9x9   │ 100 % │   2.000 │
│ melamine                 │ fbreactor-mk01           │   1  │ 5x5   │ 100 % │   0.500 │
│ urea-decomposition       │ distilator               │   3  │ 8x8   │  71 % │   1.067 │
│ urea-from-liquid-manure  │ bio-reactor-mk01         │   2  │ 7x7   │  77 % │   0.612 │
│ liquid-manure            │ bio-reactor-mk01         │   2  │ 7x7   │  77 % │   0.612 │
│ zogna-bacteria           │ incubator-mk01           │   1  │ 7x7   │  48 % │   0.287 │
│ petri-dish               │ automated-factory-mk01   │   1  │ 7x7   │  96 % │   1.914 │
│ agar                     │ hpf                      │   1  │ 7x7   │  96 % │   1.914 │
│ graphite                 │ hpf                      │   1  │ 7x7   │  90 % │   1.802 │
│ bolts                    │ automated-factory-mk01   │   1  │ 7x7   │   6 % │   0.122 │
│ iron-stick               │ automated-factory-mk01   │   1  │ 7x7   │  15 % │   0.302 │
│ small-lamp               │ automated-factory-mk01   │   1  │ 7x7   │   5 % │   0.104 │
│ copper-cable             │ automated-factory-mk01   │   1  │ 7x7   │   8 % │   0.156 │
│ wood-seeds               │ automated-factory-mk01   │   1  │ 7x7   │   2 % │   0.034 │
│ water-barrel             │ barrel-machine-mk01      │   1  │ 3x3   │  70 % │   0.139 │
│ muddy-sludge             │ washer                   │   2  │ 6x6   │  78 % │   0.628 │
│ soil                     │ soil-extractor-mk01      │   2  │ 7x7   │  98 % │   0.785 │
│ pressured-air            │ vacuum-pump-mk01         │   1  │ 3x3   │   3 % │   0.025 │
│ log-wood-fast            │ wpu-mk01                 │   1  │ 6x6   │   1 % │   0.007 │
│ wood-seedling            │ botanical-nursery        │   1  │ 7x7   │  25 % │   0.031 │
│ electric-boiler-water-…  │ py-electric-boiler       │   1  │ 3x3   │  32 % │   8.025 │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ Moss-1                   │ moss-farm-mk01           │ *45  │ 6x6   │  98 % │   4.421 │
│ auog-pooping-1           │ auog-paddock-mk01        │ *18  │ 14x14 │  97 % │   8.687 │
│ seaweed-1                │ seaweed-crop-mk01        │  *5  │ 13x13 │  96 % │   2.150 │
│ moondrop-co2             │ moondrop-greenhouse-mk01 │  *2  │ 9x9   │  52 % │   0.464 │
│ log2                     │ fwf-mk01                 │  *1  │ 15x15 │  74 % │   0.333 │
└──────────────────────────┴──────────────────────────┴──────┴───────┴───────┴─────────┘
   * module-corrected. Solver base counts: 707 / 87 / 53 / 18 / 8
     multipliers:                          16x /  5x / 11x / 17x /11x
```

**99 buildings · ~7,678 tiles · 37.12 MW at load · 67.73 MW rated**

**71 buildings and ~6,380 tiles (83 % of the area) are the bio annex** — 45 moss-farm, 18 auog-paddock,
5 seaweed-crop, 2 moondrop-greenhouse, 1 fwf. The 28 process buildings are the chemistry.

**At 7,678 tiles this block is past the ~5,000-tile stamping threshold** (rule 20 / phase 8) and should
be laid out as **two stamps**: the chemistry plus the moss/sludge/soil web in one, the auog paddocks and
seaweed in the other. The seam is `moss` and `water-barrel` — one solid and one barrelled fluid.

**Inputs** (/s): water 483.27 · **native-flora 6.95** · coke 1.50 · zinc-plate 0.60 · iron-plate 0.38 ·
glass 0.35 · copper-plate 0.20 · **pbsb-alloy 0.20** · empty-petri-dish 0.19

**Exports** (/s): **battery-mk01 0.20** → 26 · **melamine 1.60** → 25 · **urea 0.40** → 25 ·
**ammonia 6.00** → *no destination*

## Intermediate flows

```
┌────────────────┬──────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ Item           │ Rate /s  │ Producer                      │ Consumer                                 │
├────────────────┼──────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ cyanic-acid    │    8.00  │ urea-decomposition            │ battery-mk01 6.00, melamine 2.00 ← closed│
│ ammonia        │    8.00  │ urea-decomposition            │ melamine 2.00, **export 6.00**           │
│ melamine       │    2.00  │ melamine                      │ battery-mk01 0.40, **export 1.60**       │
│ graphite       │    0.60  │ graphite                      │ battery-mk01                             │
│ bolts          │    0.60  │ bolts                         │ battery-mk01                             │
│ iron-stick     │    0.60  │ iron-stick                    │ bolts                                    │
├── urea ────────┼──────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ urea           │    5.73  │ urea-from-liquid-manure       │ urea-decomposition 5.33, **export 0.40** │
│ liquid-manure  │   19.11  │ liquid-manure                 │ urea-from-liquid-manure                  │
│ manure         │    1.91  │ auog-pooping-1                │ liquid-manure                            │
│ zogna-bacteria │    1.91  │ zogna-bacteria                │ urea-from-liquid-manure                  │
│ barrel         │    1.74  │ auog-pooping-1                │ water-barrel       ← closed loop          │
│ water-barrel   │    1.74  │ water-barrel                  │ auog-pooping-1                           │
│ pressured-air  │    4.78  │ pressured-air                 │ zogna-bacteria                           │
│ petri-dish     │    0.19  │ petri-dish                    │ zogna-bacteria                           │
│ agar           │    0.19  │ agar                          │ petri-dish                               │
│ seaweed        │    0.96  │ seaweed-1                     │ agar                                     │
│ steam          │   19.26  │ electric-boiler-water-to-steam│ agar                                     │
│ small-lamp     │    0.10  │ small-lamp                    │ zogna-bacteria                           │
│ copper-cable   │    0.29  │ copper-cable                  │ small-lamp                               │
├── moss ────────┼──────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ moss           │    3.54  │ Moss-1                        │ auog-pooping-1 3.47, wood-seedling 0.06  │
│ muddy-sludge   │   44.21  │ muddy-sludge 39.23            │ Moss-1 44.21                             │
│                │          │ + melamine 5.00               │                                          │
│ carbon-dioxide │   44.21  │ moondrop-co2 41.20            │ Moss-1 44.21                             │
│                │          │ + melamine 3.00               │                                          │
│ soil           │    3.92  │ soil                          │ muddy-sludge                             │
│ wood           │    0.49  │ log-wood-fast                 │ zogna-bacteria 0.48, wood-seeds 0.01     │
│ log            │    0.05  │ log2                          │ log-wood-fast                            │
│ wood-seedling  │    0.04  │ wood-seedling                 │ log2               ← closed loop          │
└────────────────┴──────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

**`melamine`'s byproducts are still fully consumed internally, and now they matter.** At 2.00 melamine/s
it emits **CO₂ 3.00/s and muddy-sludge 5.00/s**, both of which go straight into the moss bank — covering
7 % of the CO₂ demand and 11 % of the sludge. This is why `moondrop-co2` lands at 1.03 machines rather
than 1.11: the extra melamine partly pays for its own moss.

**The barrel loop is net zero** on barrels but not on water — `water-barrel` pulls **87.12 water/s** to
refill what the paddocks drink. Barrels are a one-time stock; the water inside is consumed.

## Where the water goes

483.27/s is the largest single flow in the complex, and it is not the chemistry:

| consumer | /s | share |
|---|--:|--:|
| **`soil`** (soil-extractor, 800 per craft) | **196.20** | **41 %** |
| `liquid-manure` | 95.63 | 20 % |
| `water-barrel` → paddocks | 87.12 | 18 % |
| `muddy-sludge` | 39.23 | 8 % |
| `melamine` | 20.00 | 4 % |
| `electric-boiler` → `agar` steam | 19.26 | 4 % |
| `seaweed-1` | 19.11 | 4 % |
| `log2` · `wood-seedling` | 7.41 | 2 % |

**`soil` + `muddy-sludge` = 235.43/s — 49 % of the block's water exists to feed the moss bank**, and the
moss exists to feed the auog paddocks. See § Build notes for the recipe that would delete it.

## The ammonia decision

`urea-decomposition` emits ammonia and cyanic-acid **1:1**, but `battery-mk01` takes cyanic-acid 30 and
**no ammonia**, while `melamine` is the only 1:1 consumer. So the block makes **8.00 ammonia/s against
2.00 wanted**.

**The surplus is pinned at exactly 6.00/s and nothing internal can move it.** With `a` =
urea-decomposition crafts/s and `m` = melamine crafts/s:

```
cyanic-acid:  30a − 20m − 6.00 (battery)  =  0   →   30a − 20m = 6.00
ammonia:      30a − 20m − X               =  0   →   X = 6.00,  for any m
```

**Design 25's melamine demand tested this and it held.** Going 0.40 → 2.00/s raises both sides together:
more melamine consumes more ammonia *and* needs exactly as much more `urea-decomposition` to make the
cyanic-acid it pairs with. The gap equals the battery's cyanic-acid draw precisely, because that is the
one demand with no matching ammonia. **This is also why the block split lands at battery rather than at
cyanic-acid** — the surplus belongs in the same block as the demand that creates it.

**`cyanic-acid-01` would close it** (`coal 20 + methane 100 + ammonia 100 → cyanic-acid 100 +
hydrogen 50`), and was in an earlier revision. It was removed because it needs **`coal`** — a distinct
item from both `raw-coal` (3.0 MJ) and `coke` (5.0 MJ), reachable only through `distilled-raw-coal`,
`crushed-coal` or `coal-gas-from-wood`, each of which emits something. Of those, `crushed-coal`
(`raw-coal 3 → crushed-coal 1 + coal 2 + coal-dust`) is the cleanest, since its byproducts are solid
fuels. Four small byproducts and one extra import were traded for one large export.

> **The 6.00 ammonia/s has no consumer identified.** There are exactly two unlocked ammonia recipes in
> the game — `melamine` and `cyanic-acid-01` — and both are in this block. All 42 locked ammonia
> consumers sit behind chemical science or worse. Ammonia is on the never-vent list, so it cannot be
> disposed of either. This is an export awaiting a destination, not a routed one. Recorded as risk 1,
> and it makes **`t = 0` for designs 25, 26 and 27 all three** — 25 now depends on this block too.

## Where the CO₂ comes from

`Moss-1` needs **CO₂ 44.21/s**; `melamine` contributes 3.00 and `moondrop-co2` makes the other 41.20
from nothing at all:

```
moondrop-co2  [U] [moon, 5 s]  (no ingredients)  →  carbon-dioxide 200
```

**Two `moondrop-greenhouse-mk01` at 52 %** — 0.46 MW, 162 tiles, zero inputs. It was one greenhouse at
82 % before the melamine increase; 1.03 fractional is barely over the line, so the second runs half
idle. The catch is 16 `moondrop` modules each to reach effective speed 1.0, and this block runs no
moondrop chain.

**That is a one-time transfer of 32 modules from design 25, not a dependency.** Design 25 runs
`moondrop-1` and `moondrop-seeds` as a closed breeding loop for its methane, so 32 units is a brief
surplus off its nursery — and the creature-chamber codex that starts the loop is a once-per-base cost
design 25 has already paid. It crosses at build time and never again.

The alternative was `coke-co2` (`coke 2 → CO₂ 80`): at 41.20 CO₂/s that is **4 hpf, coke 1.03/s,
5.15 MW**, destroying 5.15 MJ/s of fuel value to avoid borrowing 32 modules from next door. Rejected —
it priced a once-paid bootstrap as though it had to be paid per block.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **battery-mk01** | 0.20 | **design 26** `electronic-circuit-2` — stack 100, 21 consumers overall (11 unlocked) | — | it is a Tier B bus item; other consumers will want it |
| **melamine** | 1.60 | **design 25** `melamine-resin` → `formica-2` — solid, stack 100 | — | design 25's route 1 needed none, at +120 buildings |
| **urea** | 0.40 | **design 25** `melamine-resin` — solid, stack 100 | — | making it in 25 would mean a second urea chain, i.e. a second bio annex |
| **ammonia** | **6.00** | **export — no consumer identified** | — | `cyanic-acid-01` would close it at the cost of a `coal` import. Not ventable |

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `moss-farm-mk01` | 45 | `moss` 15 | **675** | **yes** — `Moss-1` is its own product |
| `auog-paddock-mk01` | 18 | `auog` 4 | **72** | **no** |
| `seaweed-crop-mk01` | 5 | `seaweed` 10 | **50** | **yes** — `seaweed-1` runs here |
| `moondrop-greenhouse-mk01` | 2 | `moondrop` 16 | **32** | **one-time from design 25** |
| `fwf-mk01` | 1 | `tree-mk01` 10 | **10** | needs **10 planter-boxes** |

**`auog` ×72 is the long pole, and it got longer.** The only non-circular route is `auog`
[creature-chamber, 300 s] from a codex plus samples, at **1 per run** — so 72 modules is **~6.0 hours**
of chamber time (was 4.3 h at 52), and the paddocks run at 1/5 speed until it finishes.
`auog-recharge-0` is not a shortcut: it needs `auog-food-01`, which needs **ralesia**, an entire
additional plantation. **Start this before anything else in the complex** — design 25 waits on design 27
for melamine and urea, so this gates all three blocks.

`tree` [nursery, 30 s] is `planter-box 1 + wood-seedling 3 → tree-mk01 1`, so the ten modules need
**10 planter-boxes**: `ash 30 + soil 50 + empty-planter-box 10`, and `empty-planter-box` is
`stone-brick 40 + wood 20 + iron-plate 10`. Soil and wood are made here; **ash and stone-brick are
one-time imports** appearing nowhere in the flows.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **ammonia 6.00/s with no consumer** | both unlocked consumers are in this block and it is not ventable, so it cannot be disposed of. **`t = 0` until a destination exists** — a design-level open item, not an operational one, and it now gates designs 25 and 26 too |
| 2 | **moss 3.54/s** | 3.47 feeds `auog-pooping-1` → manure → urea → cyanic-acid → batteries **and** melamine → design 25's formica. A moss outage now stops two blocks, and with 45 farms at 100 s per craft recovery is slow |
| 3 | **native-flora 6.95/s** | no recipe exists at all — map-placed only. Same cascade as moss, one step earlier. `flora-collector-mk01` mines it at 1.0/s, so **7 collectors**, map permitting |
| 4 | **the barrel loop** | nets to zero, so nothing refills it. One stray inserter drains it and the paddocks stop with no obvious cause |
| 5 | **`soil` at 98 % and `Moss-1` at 98 %** | both effectively saturated; see § Capacity pads |
| 6 | coke 1.50/s | feeds `graphite` only; throttles the battery rather than stalling it |
| 7 | the auog module bootstrap | a schedule risk, not a flow one — 72 codex runs at 300 s each is ~6.0 h before the paddocks reach full speed |

## Capacity pads

| recipe | solver | placed | load | why pad |
|---|--:|--:|--:|---|
| **`battery-mk01`** | 2.000 | 2 | **100 %** | exactly saturated — a third chemical-plant at ~0 % is 81 tiles and covers science's 0.025 bat/s later |
| **`melamine`** | 1.000 | 1 | **100 %** | exactly saturated, and it now feeds design 25. 25 tiles for a second `fbreactor-mk01` |
| `soil` | 1.962 | 2 | 98 % | effectively saturated; one more `soil-extractor-mk01` is 49 tiles |
| `Moss-1` | 44.205 | 45 | 98 % | 45 is already the ceiling of 44.2; a 46th farm is 36 tiles for 2 % headroom |
| `auog-pooping-1` | 17.374 | 18 | 97 % | **196 tiles and 4 more `auog` modules** per paddock — the expensive pad. Leave it |
| `petri-dish` · `agar` | 0.957 | 1 | 96 % | 49 tiles each. Both feed `zogna-bacteria` → urea |

**`melamine` and `battery-mk01` are the two worth padding**, because both are outputs feeding other
blocks and both cost under 100 tiles. The paddocks are the one place where padding is genuinely
expensive — 4 extra `auog` modules is 20 more minutes of chamber time.

## Build notes

- **Never size the bio buildings without modules.** The three runs sum to **~889 fractional machines**
  before correction; the multipliers bring the block to 99. `moss-farm-mk01` 16× at 15 slots,
  `auog-paddock-mk01` 5× at 4, `seaweed-crop-mk01` 11× at 10, `moondrop-greenhouse-mk01` 17× at 16,
  `fwf-mk01` 11× at 10. **The five bio rows are 872 of those 889** — read them uncorrected and the block
  looks nine times its real size.
- **Unexamined, and the largest lever in the complex: `Moss-1-without-sludge-for-real`** —
  `[moss, 100 s] carbon-dioxide 100 → moss 8`, **identical yield to `Moss-1` with no muddy-sludge at
  all.** That deletes 2 washers and 2 soil-extractors (**4 buildings, 170 tiles**) and
  **235.43 water/s — 49 % of this block's water and 40 % of the whole complex's.** The catch:
  `melamine`'s muddy-sludge 5.00/s would lose its only sink, and `moondrop-co2` would need to cover the
  3.00 CO₂/s melamine currently contributes. Not applied — it is a recipe swap outside this revision's
  scope, but it should be the next thing examined.
- **Unexamined: `seaweed-1-dry`** — `[seaweed, 50 s] → seaweed 10`, same yield as `seaweed-1` with **no
  water**. Removes 19.11 water/s for zero cost if the dry variant has no hidden requirement. Check it.
- **`auog-pooping-1`, not `-2`.** Variant 2 is 1.9× the manure per paddock but needs `auog-food-01` →
  **ralesia**. Variant 1 costs **+54 % native-flora** and roughly double the paddocks to avoid an
  entire plantation chain.
- **`Moss-1`, not `Moss-2`.** Moss-2 gives 16 moss per craft against 8 but needs **stone 20**, which at
  44.21 sludge/s means **~4.4 stone/s**. It would cut the bank **45 → 23 farms (~790 tiles)**. Design 24
  exports 1.833 stone/s and design 25 now imports 1.20 of it — so this needs a second stone supplier,
  not a spare chest. **Worth revisiting the moment a stone outpost exists**; it is the biggest
  building-count saving on the table after the sludge question.
- **The boiler makes process steam, not power.** `agar` [hpf, 5 s] takes `steam 100` per craft as an
  *ingredient*. One `py-electric-boiler` at 32 % is 8.03 MW. It is under-loaded because the block split
  left `clay`'s 38.22 steam/s in design 26 — if the two blocks sit adjacent, one boiler covers both at
  **96 %** and saves a building.
- **`battery-mk01` is the only unlocked battery route**, at 0.100 bat/s per building — 10× worse than
  `nas-battery` (1.200), `battery-2` (1.000), `battery-1` (0.750) and `battery` (0.250). All four need
  **rayon**, which needs `fiber` + `sulfuric-acid` + `sodium-carbonate` + `carbon-sulfide`, none of
  which has an unlocked producer. **Revisit the moment sulfuric-acid lands** — it would collapse this
  entire block.
- **Entity figures in the pre-revision table were wrong** for `melamine` (5×5 / 0.50 MW, not 9×9 /
  1.00), `soil` (7×7 / 0.40, not 5×5 / 0.30), `zogna-bacteria` (7×7 / 0.60, not 5×5 / 0.30) and both
  `bio-reactor-mk01` rows (7×7 / 0.40, not 9×9 / 1.00). The table above reads them from prototype data.

## Solver command

**Two solver runs, summed.** `--target` takes one item and this block has three independent products
(battery, melamine export, urea export). The chains are linear below `urea-decomposition`, so the
fractional machine counts add; they were recovered by re-running each at 1000× target and dividing.

Run 1 — battery 0.20/s, which carries melamine 0.40/s internally:

```bash
npx tsx src/cli.ts solve \
  --recipes "battery-mk01,melamine,urea-decomposition,urea-from-liquid-manure,liquid-manure,auog-pooping-1,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,moondrop-co2,graphite,bolts,iron-stick,small-lamp,copper-cable,pressured-air,log2,log-wood-fast,wood-seedling,wood-seeds,electric-boiler-water-to-steam" \
  --target "battery-mk01:0.20" --time 1 \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "graphite:hpf" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

Run 2 — the **melamine 1.60/s export** to design 25:

```bash
npx tsx src/cli.ts solve \
  --recipes "melamine,urea-decomposition,urea-from-liquid-manure,liquid-manure,auog-pooping-1,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,moondrop-co2,pressured-air,log2,log-wood-fast,wood-seedling,wood-seeds,electric-boiler-water-to-steam" \
  --target "melamine:1.60" --time 1 \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

Run 3 — the **urea 0.40/s export** to design 25. `urea-decomposition` and `melamine` are dropped from
`--recipes` so the LP sizes the manure chain for a bare urea output:

```bash
npx tsx src/cli.ts solve \
  --recipes "urea-from-liquid-manure,liquid-manure,auog-pooping-1,zogna-bacteria,petri-dish,agar,seaweed-1,water-barrel,Moss-1,muddy-sludge,soil,moondrop-co2,small-lamp,bolts,iron-stick,copper-cable,pressured-air,log2,log-wood-fast,wood-seedling,wood-seeds,electric-boiler-water-to-steam" \
  --target "urea:0.40" --time 1 \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

**Run 2 reports `small-lamp 0.02/s` as a raw input and run 3 reports it as internal** — in the merged
block it is internal, produced at 0.10/s total. Same for `copper-cable`. The merged fractional count is
the sum, 0.052 machines, still one building.

Run 1 reports **`ammonia: 6.00/1s` as an output — that is the design intent, not an artefact.** Contrast
an earlier revision where the same row appeared because the LP was scaling `melamine` for its CO₂ and
muddy-sludge byproducts; check the urea rate to tell them apart, since the artefact ran it at 6.95/s
against this design's 5.73.

All three runs emit a long cycle warning spanning the moss/CO₂/urea/barrel web. That is intentional and
the solver zeroes it correctly; do not add the suggested excludes.

## Build materials

Distinct construction materials across this block's 16 building types, separate from flow imports:

`aluminium-plate` · `boiler` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-cable` ·
`copper-plate` · `distilator` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `gearbox-mk01` · `glass` · `inductor1` · `inserter` ·
`intermetallics` · `iron-plate` · `lab` · `log` · `pcb1` · `pipe` · `pump` · `shaft-mk01` ·
`small-parts-01` · `steam-engine` · `steel-furnace` · `steel-plate` · `stone-brick` · `stone-furnace` ·
`wood`

The items to check first are **`auog` ×72** (§ Bio modules — a 6.0 h codex bootstrap, not a material)
and the one-time **`ash` ×30 and `stone-brick` ×40** for ten planter-boxes. Inferred from the recipe
graph, not from save state.
