# 36 — Logistic science, cottongut legs — 0.1 pack/s, 85 buildings

> **One decision is open.** At **6,524 tiles** this is past the ~5,000 single-stamp threshold, and
> **37 of the 85 buildings grow flowers** to feed the breeding loop. Dropping `ralesia` and `moondrop`
> to imports takes it to ~48 buildings and ~3,800 tiles for two extra belts — see § Where to stop.
> Everything below is solver-validated at the 85-building configuration.

Covers the **two cottongut legs** of `logistic-science-pack`. `battery-mk01` is an import (design 27).

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

## The cost chain — why 0.1 pack/s needs 85 buildings

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
│ moondrop-1                  │ moondrop-greenhouse-mk01 │ 20.943 │  21   │  99.7% │ 16x moondrop       │
│ ralesia-1                   │ ralesia-plantation-mk01  │ 15.819 │  16   │  98.9% │ 12x ralesia        │
│ caged-cottongut-1           │ prandium-lab-mk01        │ 10.416 │  11   │  94.7% │ 20x cottongut-mk01 │
│ cottongut-cub-1             │ rc-mk01                  │  0.973 │   1   │  97.3% │  2x cottongut-mk01 │
│ Moss-1                      │ moss-farm-mk01           │  0.828 │   1   │  82.8% │ 15x moss           │
│ logistic-science-pack       │ research-center-mk01     │  0.750 │   1   │  75.0% │                    │
│ ralesia-seeds               │ botanical-nursery        │  1.393 │   2   │  69.7% │                    │
│ hydrogen                    │ electrolyzer-mk01        │  0.633 │   1   │  63.3% │                    │
│ log2                        │ fwf-mk01                 │  0.628 │   1   │  62.8% │ 10x tree-mk01      │
│ soil                        │ soil-extractor-mk01      │  1.022 │   2   │  51.1% │                    │
│ full-render-cottongut       │ slaughterhouse-mk01      │  1.001 │   2   │  50.1% │                    │
│ subcritical-water-01        │ py-heat-exchanger        │  0.417 │   1   │  41.7% │                    │
│ moondrop-seeds              │ botanical-nursery        │  0.399 │   1   │  39.9% │                    │
│ biomass-blood               │ compost-plant-mk01       │  0.351 │   1   │  35.1% │                    │
│ petri-dish-bacteria         │ micro-mine-mk01          │  0.278 │   1   │  27.8% │                    │
│ biomass-guts                │ compost-plant-mk01       │  0.250 │   1   │  25.0% │                    │
│ wood-seedling               │ botanical-nursery        │  0.210 │   1   │  21.0% │                    │
│ wood-seeds                  │ assembling-machine-2     │  0.181 │   1   │  18.1% │ tall-oil/acetylene │
│ animal-sample-01            │ genlab-mk01              │  0.167 │   1   │  16.7% │                    │
│ water-barrel                │ barrel-machine-mk01      │  0.114 │   1   │  11.4% │                    │
│ cellulose-00                │ hpf                      │  0.084 │   1   │   8.4% │                    │
│ extract-limestone-01        │ soil-extractor-mk01      │  0.084 │   1   │   8.4% │                    │
│ cottongut-science-red-seeds │ incubator-mk01           │  0.042 │   1   │   4.2% │                    │
│ bone-to-bonemeal-2          │ fbreactor-mk01           │  0.042 │   1   │   4.2% │                    │
│ muddy-sludge                │ washer                   │  0.034 │   1   │   3.4% │                    │
│ pressured-water             │ vacuum-pump-mk01         │  0.023 │   1   │   2.3% │                    │
│ alien-sample01              │ assembling-machine-2     │  0.021 │   1   │   2.1% │                    │
│ moondrop-co2                │ moondrop-greenhouse-mk01 │  0.021 │   1   │   2.1% │ 16x moondrop       │
│ ground-sample01             │ assembling-machine-2     │  0.016 │   1   │   1.6% │                    │
│ depolymerized-organics      │ reformer-mk01            │  0.014 │   1   │   1.4% │                    │
│ bio-sample01                │ assembling-machine-2     │  0.013 │   1   │   1.3% │                    │
│ liquid-manure               │ bio-reactor-mk01         │  0.012 │   1   │   1.2% │                    │
│ log-wood-fast               │ wpu-mk01                 │  0.011 │   1   │   1.1% │                    │
│ rich-clay                   │ assembling-machine-2     │  0.010 │   1   │   1.0% │                    │
│ fawogae-substrate           │ assembling-machine-2     │  0.005 │   1   │   0.5% │                    │
├─────────────────────────────┼──────────────────────────┼────────┼───────┼────────┼────────────────────┤
│ (steam 100/min)             │ oil-boiler-mk01          │  0.028 │   1   │   2.8% │ hand-sized         │
│ fill-acetylene-canister     │ barrel-machine-mk01      │   ~0   │   1   │  ~0 %  │ hand-sized         │
└─────────────────────────────┴──────────────────────────┴────────┴───────┴────────┴────────────────────┘
```

**85 buildings · 6,524 tiles · 35.9 MW at load (52.70 rated) · 57.2 machines of work = 69 % average**

Unlike design 35 at 28 %, this block is **genuinely loaded** — and three rows sit at 95–100 % with no
slack: `moondrop-1`, `ralesia-1`, `caged-cottongut-1`. `cottongut-cub-1` at 97.3 % is one 22×22
machine with no redundancy.

## Imports — 9

| | /min | note |
|---|--:|---|
| **water** | **10,875.49** | one pipe. Soil + limestone extraction is most of it |
| **acetylene** | **26.88** | 24.68 to the boiler + 2.20 to the canister filler |
| ash | 4.69 | → `rich-clay` → `ground-sample01`. Design 24 emits 6.00/**s** |
| native-flora | 3.83 | **no recipe exists** — map-placed only |
| battery-mk01 | 1.50 | design 27 |
| urea | 1.25 | design 27 |
| plasmids | 1.17 | both science legs — see § Plasmids |
| petri-dish | 0.83 | → `petri-dish-bacteria` |
| manure | 0.83 | design 37 frees 40/min |

**Exports** (/min): **logistic-science-pack 6.00** · oxygen 379.65 · **mukmoux-fat 9.00** · skin 5.00 ·
guts 2.00 · brain 1.00 · meat 1.00

**Steam and acetylene-canister are both internal.** One `oil-boiler-mk01` at 2.8 % makes the 100
steam/min `bone-to-bonemeal-2` needs — `100 × 0.4935 ÷ 2 = 24.68 acetylene/min`, hand-derived since
boilers are entities not recipes — and a `barrel-machine-mk01` closes the canister loop so acetylene
arrives as one fluid rather than a fluid plus a solid.

## Where to stop — the inlining ladder

| config | buildings | MW | water /min | imports |
|---|--:|--:|--:|--:|
| cottongut loop only | 16 | 10.86 | 774 | 10 |
| **+ alien-sample, ralesia, moondrop, wood** | **68** | 34.66 | 9,626 | 12 |
| + log chain, fawogae-substrate, depolymerized-organics | 81 | 35.85 | 10,676 | 11 |
| + limestone, steam-from-acetylene | **85** | 35.88 | 10,875 | **9** |

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

## Ash — checked for an alternative, there isn't one

`ash 4.69/min` feeds `rich-clay` → `ground-sample01` → `alien-sample01`. Reproduces the solver exactly:

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

## Plasmids — priced, left imported

```
plasmids [biofactory, 8 s]  1 flask + 1 lab-instrument + 1 petri-dish-bacteria + 20 zogna-bacteria -> 1
```

`zogna-bacteria` is the bulk at 20 per craft and is **cheap and local** — `1 small-lamp + 5 wood +
2 petri-dish + 50 pressured-air → 20`, and wood, pressured-air and petri-dish-bacteria are all already
in this block. 23.4 zogna/min is one incubator at a few percent; design 27 makes 114.6/min.

**`flask` and `lab-instrument` are what stop it.** `flask` needs a glassworks and `stopper`;
`lab-instrument` needs `equipment-chassi`, `lens` and `rubber`, none of which appears in any current
design. At 1.17 plasmids/min — one every 51 seconds — that is clearly the wrong trade.

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

- **6,524 tiles needs the ralesia/moondrop pushback**, not a split.
- **Three rows at 95–100 % with no slack** — `moondrop-1`, `ralesia-1`, `caged-cottongut-1` — plus
  `cottongut-cub-1` at 97.3 % in a single 22×22 building.
- **`mukmoux-fat` 9.00/min has no compost recipe.** Only unlocked consumers are `animal-sample-01`
  (counted) and `workers-food`. Accumulates.
- **`oxygen` 379.65/min** surplus from the hydrogen electrolyzer serving ralesia. Vent-approved;
  design 24's BOF wants 90/s.
- **`native-flora` 3.83/min has no recipe at all** — map-placed, `flora-collector-mk01` mines it.
- **222 `cottongut-mk01` modules** (11 labs × 20 + rc × 2) = **3.5 h of design 35's output**, and the
  labs run at 1/21 speed until they are in. Plus 352 moondrop, 192 ralesia, 15 moss, 10 `tree-mk01`.
- **`py-heat-exchanger`** needs the drivetrain cluster to build (fenxsb-alloy, fish-oil, vitreloy,
  ore-quartz, rubber, ceramic). The one nontrivial construction gate.
- **Build materials not computed.**

## Solver command

Water must be capped **generously**; 5,000 fails. `--fuel` on every `assembling-machine-2` recipe is
load-bearing (trap 1). Cap `wood` but **not** `log` — log is internal via `log2`. Fractional counts
for the utilisation table come from the same command at `--target "logistic-science-pack:6000"` ÷ 1000.

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,cottongut-science-red-seeds,animal-sample-01,full-render-cottongut,cottongut-cub-1,caged-cottongut-1,water-barrel,alien-sample01,bio-sample01,ground-sample01,bone-to-bonemeal-2,petri-dish-bacteria,rich-clay,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds,moondrop-co2,log-wood-fast,wood-seeds,soil,hydrogen,log2,wood-seedling,Moss-1,muddy-sludge,fawogae-substrate,cellulose-00,depolymerized-organics,liquid-manure,subcritical-water-01,pressured-water,biomass-bones,biomass-guts,biomass-skin,biomass-brain,biomass-blood,extract-limestone-01" \
  --target "logistic-science-pack:6" --time 60 \
  --max-import "cottongut:0.001" --max-import "barrel:0.001" \
  --max-import "ralesia-seeds:0.001" --max-import "moondrop-seeds:0.001" \
  --max-import "wood:0.001" --max-import "soil:0.001" --max-import "water:200000" \
  --max-import "moss:0.001" --max-import "biomass:0.001" --max-import "limestone:0.001" \
  --modules "caged-cottongut-1:cottongut-mk01:20" \
  --modules "cottongut-cub-1:cottongut-mk01:2" \
  --modules "ralesia-1:ralesia:12" \
  --modules "moondrop-1:moondrop:16" \
  --modules "moondrop-co2:moondrop:16" \
  --modules "Moss-1:moss:15" \
  --modules "log2:tree-mk01:10" \
  --fuel "alien-sample01:acetylene-canister" --fuel "bio-sample01:acetylene-canister" \
  --fuel "ground-sample01:acetylene-canister" --fuel "rich-clay:acetylene-canister" \
  --fuel "wood-seeds:acetylene-canister" --fuel "fawogae-substrate:acetylene-canister" \
  --factory "logistic-science-pack:research-center-mk01" \
  --factory "cottongut-science-red-seeds:incubator-mk01" \
  --factory "animal-sample-01:genlab-mk01" \
  --factory "full-render-cottongut:slaughterhouse-mk01" \
  --factory "cottongut-cub-1:rc-mk01" \
  --factory "caged-cottongut-1:prandium-lab-mk01" \
  --factory "water-barrel:barrel-machine-mk01" \
  --factory "alien-sample01:assembling-machine-2" \
  --factory "bio-sample01:assembling-machine-2" \
  --factory "ground-sample01:assembling-machine-2" \
  --factory "rich-clay:assembling-machine-2" \
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
  --factory "biomass-bones:compost-plant-mk01" \
  --factory "biomass-guts:compost-plant-mk01" \
  --factory "biomass-skin:compost-plant-mk01" \
  --factory "biomass-brain:compost-plant-mk01" \
  --factory "biomass-blood:compost-plant-mk01" \
  --solver simplex \
  --unlocked
```

Returns **83 buildings**; the `oil-boiler-mk01` and `fill-acetylene-canister` barreler are added by
hand for 85. The boiler is `steam/min × 0.4935 ÷ 2 = acetylene/min`.

**The 16-building import-everything version** is the other end and may be the better base for the next
pass: drop every recipe after `water-barrel`, drop the matching `--factory`/`--fuel` flags, and import
`alien-sample01`, `ralesia-seeds`, `moondrop`, `wood-seeds`, `fawogae-substrate` and
`depolymerized-organics`. Solves to **16 buildings, 2,252 tiles, 10.86 MW**.
