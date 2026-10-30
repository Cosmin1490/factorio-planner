# 36 — Logistic science, cottongut legs — 0.1 pack/s, 92 buildings

> **Two decisions are open.** At **~6,940 tiles** this is past the ~5,000 single-stamp threshold,
> and **40 of the 92 buildings grow flowers** to feed the breeding loop — dropping `ralesia` and
> `moondrop` to imports takes it to ~52 buildings for two extra belts (§ Where to stop). Separately,
> **`agar` is 81.5 % of the acetylene draw** for 4.34 items/min; reverting it to an import takes
> acetylene 133.6 → 47/min (§ Plasmids). Everything below is solver-validated at the 92-building
> configuration.

Covers the **two cottongut legs** of `logistic-science-pack`. `battery-mk01` is an import (design 27).
**`plasmids` and `petri-dish` are made on site** — see § Plasmids.

```
logistic-science-pack  [U] [research, 90 s]  battery-mk01 3 + animal-sample-01 2
                                             + alien-sample01 2 + solidified-sarcorus 1
                                →  logistic-science-pack 12

solidified-sarcorus    [U] [incubator, 15 s]  fawogae-substrate 10 + native-flora 5 + plasmids 1
                                              + cottongut 20 + depolymerized-organics 50  →  3
animal-sample-01       [U] [genlab,    10 s]  bones 5 + brain 3 + guts 3 + meat 7 + mukmoux-fat 1
                                              + skin 3 + plasmids 1 + blood 50  →  1
full-render-cottongut  [U] [slaughterhouse, 30 s]  cottongut 5
                                →  bones 5 + meat 4 + skin 4 + guts 5 + mukmoux-fat 5 + brain 2 + blood 60
```

## The cost chain — why 0.1 pack/s needs this many buildings

Four modest steps compound:

```
1. animal-sample-01 wants 7 meat, a render gives 4   ->  breed 1.75x the animals
2. the cub/caged amplifier nets 4.571 cottongut per 10 cub-crafts  ->  2.14x churn
3. both breeding recipes eat flowers as feed         ->  4.22 ralesia-seeds + 1.69 moondrop
                                                         per cottongut netted
4. moondrop-1 is 140 s for 4, ralesia-1 is 125 s for 10, even at effective speed 1.00
```

```
per logistic-science-pack:  8.5 ralesia-seeds  +  3.4 moondrop
12.1 cottongut/min:  8.75 to rendering (72%)  ·  3.33 to sarcorus (28%)
```

**The flowers never touch a science pack.** They are animal feed, and 72% of the animals exist only
because of the meat ratio in step 1.

## Recipe table

```
┌─────────────────────────────┬──────────────────────────┬────────┬───────┬────────┬────────────────────┐
│ Recipe                      │ Factory                  │  frac  │ Count │  util  │ Modules            │
├─────────────────────────────┼──────────────────────────┼────────┼───────┼────────┼────────────────────┤
│ moondrop-1                  │ moondrop-greenhouse-mk01 │ 20.945 │  21   │  99.7% │ 16x moondrop       │
│ ralesia-1                   │ ralesia-plantation-mk01  │ 15.821 │  16   │  98.9% │ 12x ralesia        │
│ caged-cottongut-1           │ prandium-lab-mk01        │ 10.417 │  11   │  94.7% │ 20x cottongut-mk01 │
│ full-render-cottongut       │ slaughterhouse-mk01      │  1.001 │   1   │ 100.1% │ **pinned**         │
│ Moss-1                      │ moss-farm-mk01           │  0.985 │   1   │  98.5% │ 15x moss           │
│ cottongut-cub-1             │ rc-mk01                  │  0.973 │   1   │  97.3% │  2x cottongut-mk01 │
│ seaweed-1                   │ seaweed-crop-mk01        │  1.806 │   2   │  90.3% │ 10x seaweed        │
│ log2                        │ fwf-mk01                 │  0.779 │   1   │  77.9% │ 10x tree-mk01      │
│ logistic-science-pack       │ research-center-mk01     │  0.750 │   1   │  75.0% │                    │
│ ralesia-seeds               │ botanical-nursery        │  1.393 │   2   │  69.7% │                    │
│ petri-dish-bacteria         │ micro-mine-mk01          │  0.667 │   1   │  66.7% │                    │
│ hydrogen                    │ electrolyzer-mk01        │  0.633 │   1   │  63.3% │                    │
│ soil                        │ soil-extractor-mk01      │  1.030 │   2   │  51.5% │                    │
│ subcritical-water-01        │ py-heat-exchanger        │  0.417 │   1   │  41.7% │                    │
│ moondrop-seeds              │ botanical-nursery        │  0.399 │   1   │  39.9% │                    │
│ petri-dish                  │ automated-factory-mk01   │  0.362 │   1   │  36.2% │ **plasmid chain**  │
│ agar                        │ hpf                      │  0.362 │   1   │  36.2% │ **plasmid chain**  │
│ biomass-blood               │ compost-plant-mk01       │  0.351 │   1   │  35.1% │                    │
│ wood-seedling               │ botanical-nursery        │  0.260 │   1   │  26.0% │                    │
│ biomass-guts                │ compost-plant-mk01       │  0.250 │   1   │  25.0% │                    │
│ wood-seeds                  │ assembling-machine-2     │  0.182 │   1   │  18.2% │ tall-oil/acetylene │
│ animal-sample-01            │ genlab-mk01              │  0.167 │   1   │  16.7% │                    │
│ plasmids                    │ biofactory-mk01          │  0.156 │   1   │  15.6% │ **plasmid chain**  │
│ water-barrel                │ barrel-machine-mk01      │  0.114 │   1   │  11.4% │                    │
│ zogna-bacteria              │ incubator-mk01           │  0.098 │   1   │   9.8% │ **plasmid chain**  │
│ cellulose-00                │ hpf                      │  0.084 │   1   │   8.4% │                    │
│ extract-limestone-01        │ soil-extractor-mk01      │  0.084 │   1   │   8.4% │                    │
│ cottongut-science-red-seeds │ incubator-mk01           │  0.042 │   1   │   4.2% │                    │
│ bone-to-bonemeal-2          │ fbreactor-mk01           │  0.042 │   1   │   4.2% │                    │
│ muddy-sludge                │ washer                   │  0.040 │   1   │   4.0% │                    │
│ moondrop-co2                │ moondrop-greenhouse-mk01 │  0.025 │   1   │   2.5% │ 16x moondrop       │
│ pressured-water             │ vacuum-pump-mk01         │  0.023 │   1   │   2.3% │                    │
│ alien-sample01              │ assembling-machine-2     │  0.021 │   1   │   2.1% │                    │
│ ground-sample01             │ assembling-machine-2     │  0.016 │   1   │   1.6% │                    │
│ copper-cable                │ automated-factory-mk01   │  0.015 │   1   │   1.5% │ feeds `small-lamp` │
│ depolymerized-organics      │ reformer-mk01            │  0.014 │   1   │   1.4% │                    │
│ bio-sample01                │ assembling-machine-2     │  0.013 │   1   │   1.3% │                    │
│ log-wood-fast               │ wpu-mk01                 │  0.013 │   1   │   1.3% │                    │
│ liquid-manure               │ bio-reactor-mk01         │  0.012 │   1   │   1.2% │                    │
│ small-lamp                  │ automated-factory-mk01   │  0.010 │   1   │   1.0% │ **plasmid chain**  │
│ fawogae-substrate           │ assembling-machine-2     │  0.005 │   1   │   0.5% │                    │
│ pressured-air               │ vacuum-pump-mk01         │  0.005 │   1   │   0.5% │ no ingredients     │
├─────────────────────────────┼──────────────────────────┼────────┼───────┼────────┼────────────────────┤
│ (steam 533/min)             │ oil-boiler-mk01          │  0.148 │   1   │  14.8% │ hand-sized         │
│ fill-acetylene-canister     │ barrel-machine-mk01      │   ~0   │   1   │  ~0 %  │                    │
└─────────────────────────────┴──────────────────────────┴────────┴───────┴────────┴────────────────────┘
```

**92 buildings · ~6,940 tiles · 38.46 MW at load**

`seaweed-1` is 2 at 90.3 %, `soil` 2 at 51.5 %, `full-render-cottongut` **1 at 100.1 %** — the fractional
count now exceeds 1.0, so it has **zero headroom**; one more plasmid needs a second slaughterhouse.
`biomass-bones`, `-skin` and `-brain` all solve to **0** — the plasmid chain rebalanced which render
co-products get composted, and three compost plants fell out.

Unlike design 35 at 28 %, this block is **genuinely loaded** — and three rows sit at 95–100 % with no
slack: `moondrop-1`, `ralesia-1`, `caged-cottongut-1`. `cottongut-cub-1` at 97.3 % is one 22×22
machine with no redundancy.

## Imports — 14

| | /min | note |
|---|--:|---|
| **water** | **11,261.19** | one pipe. Soil + limestone extraction is most of it |
| **acetylene** | **133.6** | 131.5 steam + 2.12 canisters. **81.5 % of the steam is `agar`** |
| empty-petri-dish | 4.33 | design 38 all-dish makes 0.45/min |
| native-flora | 3.83 | **no recipe exists** — map-placed only |
| copper-plate | 2.91 | → `copper-cable` → `small-lamp` on site |
| glass | 2.33 | `small-lamp` |
| rich-clay | 1.88 | → `ground-sample01`. Replaces the old ash 4.69 import |
| battery-mk01 | 1.50 | design 27 |
| urea | 1.25 | design 27 |
| **lab-instrument** | **1.17** | one import replacing six — see § Plasmids |
| flask | 1.17 | needs a glassworks + `stopper` (coal + latex) |
| iron-plate | 1.17 | `small-lamp` only |
| manure | 0.83 | design 37 frees 40/min |

**Exports** (/min): **logistic-science-pack 6.00** · oxygen 379.65 · **mukmoux-fat 9.00** · skin 5.00 ·
guts 2.00 · brain 1.00 · meat 1.00

**Acetylene is the single energy import.** One `oil-boiler-mk01` at 14.8 % makes all 533 steam/min —
`533 × 0.4935 ÷ 2 = 131.5 acetylene/min`, hand-derived since boilers are entities not recipes — and a
`barrel-machine-mk01` closes the canister loop, so the burned canisters return empty to be refilled
instead of leaving as an export. **Only two recipes consume steam**: `bone-to-bonemeal-2` at 100.8/min
and **`agar` at 434.4/min**.

**`pressured-air` is free** — `[vacuum, 1 s]` has an empty ingredient list and yields 200, so one 3×3
pump at 0.5 % replaced a 58.28/min import outright.

## Where to stop — the inlining ladder

| config | buildings | MW | water /min | imports |
|---|--:|--:|--:|--:|
| cottongut loop only | 16 | 10.86 | 774 | 10 |
| **+ alien-sample, ralesia, moondrop, wood** | **68** | 34.66 | 9,626 | 12 |
| + log chain, fawogae-substrate, depolymerized-organics | 81 | 35.85 | 10,676 | 11 |
| + limestone, steam-from-acetylene | 85 | 35.88 | 10,875 | 9 |
| + plasmid chain w/ **lens** bought | 100 | 39.87 | 11,261 | 18 |
| **+ plasmid chain w/ `lab-instrument` bought** | **92** | 38.46 | 11,261 | **14** |

**The last rung is the only one that added imports**, and where you cut it matters more than whether
you take it. Buying the lens leaves the block reaching into the bus for `tin-plate`, `iron-plate`,
`electronic-circuit` and `sb-oxide`; buying the instrument one level up removes all four for the same
2 deletions (`plasmids`, `petri-dish`). **Net +5 imports, not +11.**

**Row 2 is the mistake.** By subsystem:

```
group                 bldgs   tiles    %
  moondrop (inlined)     23    1831   27%   ─┐  41 buildings, 2,713 tiles
  ralesia  (inlined)     18     882   21%   ─┘  to replace 2 solid imports
  cottongut loop         13    2077   15%
  the 3 chains           12     922   14%
  alien-sample chain      6     110    7%
  science core            4     319    5%
  misc + boiler/barreler  9     383   11%
```

**Everything inlined after row 2 was cheap.** The three chains are 14 % of buildings and 14 % of tiles
and removed three imports while adding two; limestone was 2 buildings and water-only; the alien-sample
chain is the best value in the block at 6 buildings and 110 tiles.

**Per-chain tile split**, since the group total hides it:

```
depolymerized-organics   6 buildings   518 tiles    (reformer 169 + 2 compost 242)
log chain                6 buildings   476 tiles    (fwf-mk01 225 is most of it)
fawogae-substrate        2 buildings    58 tiles    <- noise
```

Four buildings — `fwf-mk01` 225, `reformer-mk01` 169, two `compost-plant-mk01` 242 — are **60 % of
that 1,052**. Big machines doing small jobs, not throughput.

> **Inlining the compost gave a building back.** The three chains add 14 gross machines but only
> **+13 net**: `soil` goes 1 → 2, and the slaughterhouse drops **2 → 1** because once `biomass-guts`
> and `biomass-blood` run, the LP rebalances which co-products are consumed versus composted.

**Resume: drop `ralesia-1`/`ralesia-seeds` and `moondrop-1`/`moondrop-seeds` to imports.** That returns
~37 buildings and ~8,000 water/min for two belts, and design 35 already runs both chains at smaller
scale. Keep `moondrop-co2` — it is one greenhouse making 2,400 CO₂/min from nothing.

## Verified: the flower counts are real

Checked because they look wrong. **Both are fully moduled at effective speed exactly 1.00** —
`moondrop-greenhouse-mk01` 0.05882 × 17, `ralesia-plantation-mk01` 0.07692 × 13:

```
moondrop-1   140 s for 4 moondrop  ->  1.714 moondrop/min per 9x9 building
ralesia-1    125 s for 10 ralesia  ->  4.800 ralesia/min per 7x7 building
```

And the seed loops consume most of the output:

```
moondrop net demand   20.39 /min
gross produced        32.5  /min      67% circulates back through moondrop-seeds
machines              19 (+1 co2, +1 rounding = 21)
```

So 41 buildings is what self-sufficiency in two slow bio crops costs, not a sizing error. It scales
linearly — **0.05 pack/s halves it.**

## The render surplus is the biomass, and that is the trick

`animal-sample-01` wants **7 meat** against a render's **4**, so you run the render **1.75×** and
everything else comes out over-supplied by that factor:

```
per animal-sample (1.75 renders):   made     used    surplus
  meat                              7.00     7.00       0     <- binds
  bones                             8.75     5.00    3.75
  brain                             3.50     3.00    0.50
  guts                              8.75     3.00    5.75
  skin                              7.00     3.00    4.00
  mukmoux-fat                       8.75     1.00    7.75
  blood                           105.00    50.00   55.00
```

That surplus composts to **~70 biomass per craft** against `subcritical-water-01`'s need of ~50 — which
is why **blood went from a 70/min export to zero** when the compost plants came in. The same render
feeds both science legs: `animal-sample-01` directly, and the sarcorus via
biomass → subcritical-water → depolymerized-organics.

**`depolymerized-organics` is 60 : 1 biomass to manure** (600 biomass and 10 manure per 100), so the
manure is a trickle and the biomass is the real input — site it wherever something is already being
slaughtered. `subcritical-water` is 10× the volume of the liquid-manure and cannot be shipped, so the
`py-heat-exchanger` has to sit next to the `reformer-mk01`.

## Ash — checked for an alternative, then sidestepped

**`rich-clay` is now imported at 1.87/min and the ash import is gone.** Buying the clay instead of
the ash is strictly lighter — 1.87 solid/min against 4.69 plus 500 water per craft — and it removes
the `assembling-machine-2` whose coal default caused trap 1 below. The analysis that follows is why
ash was the input in the first place, and still applies if you ever want to reverse it.

`ash 4.69/min` fed `rich-clay` → `ground-sample01` → `alien-sample01`. Reproduces the solver exactly:

```
6 packs/min -> alien-sample01 1.00 -> ground-sample01 3.75 -> rich-clay 1.88 -> ash 4.69
```

`ground-sample01` has **one recipe**. `rich-clay` has three:

| | |
|---|---|
| `rich-clay` [U] | 25 ash + 500 water → 10 — **current** |
| `rich-clay-2` [**locked**, tech `kicalk`] | 20 clay + 100 muddy-sludge → 10 |
| `tar-distilation` [U] | **350 tar → 1 rich-clay** — useless; it is an aromatics recipe |

So ash stays, and it should: 4.69/**min** against design 24's 6.00/**s** and design 13's 6.52/s, both
of which currently treat ash as a *disposal* problem. Even unlocked, `rich-clay-2` would trade a free
waste stream for +125 steam/min, +18.8 muddy-sludge/min and a `clay-pit-mk01`.

> `log2` needs no ash in its **flow** — but its 10 `tree-mk01` modules need 10 planter-boxes =
> **30 ash + 50 soil + 40 stone-brick, one-time at build.**

## Plasmids — now inlined

```
plasmids [biofactory, 8 s]  1 flask + 1 lab-instrument + 1 petri-dish-bacteria + 20 zogna-bacteria -> 1
```

**The earlier verdict here was wrong.** It said "`flask` and `lab-instrument` are what stop it" —
both are unlocked, and so is every input beneath them, including `nexelit-plate-2`, `boric-acid` and
`fenxsb-alloy-2`. What actually stops the *full* chain is cost, not availability, and the two deepest
legs are the ones worth buying rather than building.

**Bought: `flask` and `lab-instrument`. Built: everything else.**

The cut line is **one level higher than it first looks.** Importing `lens` was the obvious call —
`lens` and `flask` each want 100 molten-glass per craft, 1.95/s combined, **5× what design 38
produces** — and it dropped five buildings at once: `lens`, `boron-trioxide`, `boric-acid`, `diborane`
**and `hydrogen`**, which existed only to feed diborane.

But **importing `lab-instrument` instead dominates it**, because `lab-instrument` is the sole consumer
of `small-parts-01` in this block, so the whole sub-assembly tree goes with it:

| | lens imported | **lab-instrument imported** |
|---|--:|--:|
| buildings | 100 | **92** |
| MW | 39.87 | **38.46** |
| imports | 18 | **14** |

**Eight buildings, not four** — `lab-instrument`, `equipment-chassi`, `fenxsb-alloy-2`,
`nexelit-plate-2`, plus `small-parts-01`, `iron-gear-wheel`, `bolts`, `iron-stick`. And it deletes
six imports for one: **`lens` 1.75, `rubber` 5.83, `tin-plate` 5.83, `clean-nexelit` 0.58,
`electronic-circuit` 0.58, `sb-oxide` 0.29** all go, `iron-plate` falls 8.31 → 1.17, and
`copper-plate` 5.10 → 2.91. Every Tier A bus item except glass leaves the block.

`rubber` was the single best deletion in either version: `rubber-01` wants 50 polybutadiene each →
**4.875 polybutadiene/s → aromatics 9.75/s**, on a bus already carrying design 17's 25 and
design 32's 20.

**`agar` is now the expensive inline.** 2 `seaweed-crop-mk01` (338 tiles), 1 hpf, and **434.4 of the
533 steam/min = 107 acetylene/min**, to avoid importing 4.34 agar/min. **Reverting it takes acetylene
133.6 → 47/min and drops ~4 buildings** — the single biggest lever left in this design.

**`copper-cable` survives alone** at 1.5 %, feeding `small-lamp`. The sub-assembly split the MAM
analysis argued for is moot here once `lab-instrument` is bought — there is no other `small-parts-01`
consumer.

**`nexelit-ore` had a pretty source nobody built, and buying the instrument forfeits it.**
`digosaurus` dig sites take `1 guts → 1 nexelit-ore`, and this block exports **guts 2.00/min** while
design 17 emits 27/min. Worth revisiting if a digosaurus pen ever exists — dig rates are script-driven
and absent from the export, measured at ~4 trips/min each.

## Three invocation traps hit while building this

All three produced *plausible* output.

**1. `assembling-machine-2` defaults to coal, and coal burns to ash.** `rich-clay` needs 25 ash per
craft, so the LP ran **`wood-seeds` as an ash furnace** — 177.73 surplus wood-seeds and 24.30 log/min
to generate 4.56 ash. Setting `--fuel` on all six assembler recipes collapsed the log import to
**2.08/min**. Design 29 documents the same failure mode.

**2. `--max-import "water:5000"` is a hard constraint and caused `Phase 1 infeasible`.** The soil
extractor alone wants ~4,800 water/min. The stderr named `animal-sample-01` as the stuck artificial,
four steps from the cause.

**3. Capping both `cottongut` and `cottongut-pup`** — two nodes of one closed cycle — gave
`Phase 1 infeasible` with three stuck artificials. Cap one end or neither.

## Open

- **`agar` is the biggest lever left.** 434.4 of 533 steam/min, = 107 of the 133.6 acetylene. Revert
  it to an import: **~96 buildings, acetylene 47/min**, one more item on the belt.
- **~6,940 tiles needs the ralesia/moondrop pushback**, not a split.
- **`full-render-cottongut` is pinned at 100.1 %** — the fractional count exceeds 1.0, so there is
  literally zero headroom. Any increase needs a second `slaughterhouse-mk01`.
- **Four rows at 95–100 %** — `moondrop-1`, `ralesia-1`, `caged-cottongut-1`, `Moss-1` — plus
  `cottongut-cub-1` at 97.3 % in a single 22×22 building and `seaweed-1` at 90.3 %.
- **`mukmoux-fat` 9.00/min has no compost recipe.** Only unlocked consumers are `animal-sample-01`
  (counted) and `workers-food`. Accumulates.
- **`oxygen` 379.65/min** surplus from the hydrogen electrolyzer serving ralesia. Vent-approved;
  design 24's BOF wants 90/s.
- **`native-flora` 3.83/min has no recipe at all** — map-placed, `flora-collector-mk01` mines it.
- **222 `cottongut-mk01` modules** (11 labs × 20 + rc × 2) = **3.5 h of design 35's output**, and the
  labs run at 1/21 speed until they are in. Plus 352 moondrop, 192 ralesia, 20 seaweed, 15 moss,
  10 `tree-mk01`.
- **`py-heat-exchanger`** needs the drivetrain cluster to build (fenxsb-alloy, fish-oil, vitreloy,
  ore-quartz, rubber, ceramic). The one nontrivial construction gate.
- **Build materials not computed.**

## Solver command

Water must be capped **generously**; 5,000 fails. `--fuel` on every `assembling-machine-2` recipe is
load-bearing (trap 1). Cap `wood` but **not** `log` — log is internal via `log2`. Fractional counts
for the utilisation table come from the same command at `--target "logistic-science-pack:6000"` ÷ 1000.

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,cottongut-science-red-seeds,animal-sample-01,full-render-cottongut,cottongut-cub-1,caged-cottongut-1,water-barrel,alien-sample01,bio-sample01,ground-sample01,bone-to-bonemeal-2,petri-dish-bacteria,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds,moondrop-co2,log-wood-fast,wood-seeds,soil,hydrogen,log2,wood-seedling,Moss-1,muddy-sludge,fawogae-substrate,cellulose-00,depolymerized-organics,liquid-manure,subcritical-water-01,pressured-water,biomass-bones,biomass-guts,biomass-skin,biomass-brain,biomass-blood,extract-limestone-01,plasmids,zogna-bacteria,petri-dish,agar,seaweed-1,small-lamp,copper-cable,small-parts-01,iron-gear-wheel,bolts,iron-stick,pressured-air,fill-acetylene-canister" \
  --target "logistic-science-pack:6" --time 60 \
  --max-import "cottongut:0.001" --max-import "barrel:0.001" \
  --max-import "ralesia-seeds:0.001" --max-import "moondrop-seeds:0.001" \
  --max-import "wood:0.001" --max-import "soil:0.001" --max-import "water:200000" \
  --max-import "moss:0.001" --max-import "biomass:0.001" --max-import "limestone:0.001" \
  --max-import "plasmids:0.001" --max-import "agar:0.001" --max-import "petri-dish:0.001" \
  --max-import "zogna-bacteria:0.001" --max-import "seaweed:0.001" --max-import "small-lamp:0.001" \
  --max-import "copper-cable:0.001" --max-import "small-parts-01:0.001" --max-import "iron-gear-wheel:0.001" \
  --max-import "bolts:0.001" --max-import "iron-stick:0.001" \
  --max-import "pressured-air:0.001" --max-import "acetylene-canister:0.001" \
  --max-import "empty-fuel-canister:0.001" \
  --modules "caged-cottongut-1:cottongut-mk01:20" \
  --modules "cottongut-cub-1:cottongut-mk01:2" \
  --modules "ralesia-1:ralesia:12" \
  --modules "moondrop-1:moondrop:16" \
  --modules "moondrop-co2:moondrop:16" \
  --modules "Moss-1:moss:15" \
  --modules "log2:tree-mk01:10" \
  --modules "seaweed-1:seaweed:10" \
  --fuel "alien-sample01:acetylene-canister" --fuel "bio-sample01:acetylene-canister" \
  --fuel "ground-sample01:acetylene-canister" \
  --fuel "wood-seeds:acetylene-canister" --fuel "fawogae-substrate:acetylene-canister" \
  --factory "logistic-science-pack:research-center-mk01" \
  --factory "cottongut-science-red-seeds:incubator-mk01" \
  --factory "animal-sample-01:genlab-mk01" \
  --factory "full-render-cottongut:slaughterhouse-mk01" \
  --factory "cottongut-cub-1:rc-mk01" \
  --factory "caged-cottongut-1:prandium-lab-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "fill-acetylene-canister:barrel-machine-mk01" \
  --factory "alien-sample01:assembling-machine-2" \
  --factory "bio-sample01:assembling-machine-2" \
  --factory "ground-sample01:assembling-machine-2" \
  --factory "wood-seeds:assembling-machine-2" \
  --factory "fawogae-substrate:assembling-machine-2" \
  --factory "cellulose-00:hpf" \
  --factory "bone-to-bonemeal-2:fbreactor-mk01" \
  --factory "petri-dish-bacteria:micro-mine-mk01" \
  --factory "ralesia-1:ralesia-plantation-mk01" \
  --factory "ralesia-seeds:botanical-nursery" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "hydrogen:electrolyzer-mk01" \
  --factory "depolymerized-organics:reformer-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "subcritical-water-01:py-heat-exchanger" \
  --factory "pressured-water:vacuum-pump-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "biomass-bones:compost-plant-mk01" \
  --factory "biomass-guts:compost-plant-mk01" \
  --factory "biomass-skin:compost-plant-mk01" \
  --factory "biomass-brain:compost-plant-mk01" \
  --factory "biomass-blood:compost-plant-mk01" \
  --factory "plasmids:biofactory-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "small-parts-01:automated-factory-mk01" \
  --factory "iron-gear-wheel:automated-factory-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "agar:hpf" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "zogna-bacteria:incubator-mk01" \
  --solver simplex \
  --unlocked
```

Returns **91 buildings**; the `oil-boiler-mk01` is added by hand for 92. The boiler is
`steam/min × 0.4935 ÷ 2 = acetylene/min` — at 533 steam/min that is **131.5 acetylene/min**, plus
2.12 for the canister filler.

**`rich-clay` is deliberately absent** from `--recipes`: it is imported now, which also removes the
sixth `--fuel` flag the old command needed. **`--max-import "empty-fuel-canister"` is load-bearing** —
without it the LP takes free empties instead of closing the canister loop, and acetylene reads low.
The nine new `--max-import` caps on the plasmid intermediates are what force them internal; drop any
one and the LP buys it.

The **×1000 trick still works** for fractional counts, but raise `water` to `200000000` — the absolute
caps do not scale with the target.

**The 16-building import-everything version** is the other end and may be the better base for the next
pass: drop every recipe after `water-barrel`, drop the matching `--factory`/`--fuel` flags, and import
`alien-sample01`, `ralesia-seeds`, `moondrop`, `wood-seeds`, `fawogae-substrate` and
`depolymerized-organics`. Solves to **16 buildings, 2,252 tiles, 10.86 MW**.
