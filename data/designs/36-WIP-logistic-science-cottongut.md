# 36 — WIP — Logistic science, cottongut legs — 0.1 pack/s, 81 buildings

> **IN PROGRESS. NOT A BUILDABLE DESIGN.** Parked mid-exploration on 2026-10-27. The solve below is
> real and re-runnable, but the block is **6,320 tiles** — well past the ~5,000 single-stamp threshold —
> and the inlining went further than it probably should have. Resume by deciding what to push back out
> to imports, not by building this.

Covers the **two cottongut legs** of `logistic-science-pack`. The other two ingredients,
`battery-mk01` and the research centre itself, are imports.

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

**Cottongut feeds both legs** — the sarcorus directly at 20 per craft, and the animal sample via the
render, which produces the entire eight-item ingredient list from one recipe.

## Where it got to

**81 buildings · 6,320 tiles · 35.85 MW · 6.00 logistic-science-pack/min (0.1/s)**

```
  22x moondrop-greenhouse-mk01  9x9     1782     11x prandium-lab-mk01    12x12  1584
  16x ralesia-plantation-mk01   7x7      784      1x rc-mk01              22x22   484
   2x compost-plant-mk01       11x11     242      1x fwf-mk01             15x15   225
   4x botanical-nursery         7x7      196      1x reformer-mk01        13x13   169
   1x slaughterhouse-mk01      11x11     121      1x research-center-mk01 10x10   100
   2x soil-extractor-mk01       7x7       98      6x assembling-machine-2  3x3     54
   + 13 singles at 9-49 tiles each
```

**Imports** (/min): water **10,675.54** · steam 100.00 · ash 4.69 · native-flora 3.83 · limestone 2.00 ·
battery-mk01 1.50 · urea 1.25 · plasmids 1.17 · petri-dish 0.83 · manure 0.83 · acetylene-canister 0.22

**Exports** (/min): **logistic-science-pack 6.00** · oxygen 379.65 · mukmoux-fat 9.00 · skin 5.00 ·
guts 2.00 · brain 1.00 · meat 1.00 · empty-fuel-canister 0.22

## The inlining sequence, and where to stop

Recorded so the next pass can pick a stopping point rather than re-deriving:

| config | buildings | MW | water /min | imports |
|---|--:|--:|--:|--:|
| cottongut loop only | 16 | 10.86 | 774 | 10 |
| **+ alien-sample, ralesia, moondrop, wood** | **68** | 34.66 | 9,626 | 12 |
| + log chain, fawogae-substrate, depolymerized-organics | **81** | 35.85 | 10,676 | **11** |

**The second row is where it went wrong.** Inlining `ralesia` and `moondrop` added **37 buildings** —
21 greenhouses and 16 plantations — to replace imports of 20.39 and 50.98/min. `ralesia-1` alone drives
**113.90 of the 117.65 soil/min**, and soil is 800 water per 16, which is most of the 12× water increase.

Everything inlined *after* that was comparatively cheap: the log chain, fawogae-substrate and
depolymerized-organics together cost 13 buildings and 1,050 water/min, and **removed three imports while
adding two** (limestone, manure).

**Resume here: push `ralesia` and `moondrop` back out.** That returns ~37 buildings and ~8,000 water/min
for two solid imports, and design 35 already runs both chains at smaller scale.

## What binds

**Meat binds the rendering.** `animal-sample-01` wants 7 meat per craft against 4 per render, so meat
sets the render rate and every other co-product comes out surplus. That surplus is what feeds
`bone-to-bonemeal-2` (bones → bonemeal for `bio-sample01`) and the compost plants.

**The biomass closure is near-exact and worth keeping.** `subcritical-water-01` needs 30 biomass per
50 subcritical-water = **50 biomass/min**, and the render surplus composts to **~50.25/min**
(bones 3.75 + guts 7 + skin 5 + brain 1, at 3 biomass each). The LP runs `biomass-guts` and
`biomass-blood` and leaves the rest — blood went from a 70/min export to zero.

**222 `cottongut-mk01` modules** — 11 labs × 20 plus 2 for the `rc-mk01`. At design 35's 1.0633/min
that is **3.5 hours of minting**, and the labs run at 1/21 speed until they are in. Plus 352 `moondrop`,
192 `ralesia`, 15 `moss` and 10 `tree-mk01` — the last of which needs the ash-and-stone-brick
planter-box bootstrap from design 35.

## Three invocation traps hit while building this

All three produced *plausible* output. Recording them because each cost a round trip.

**1. `assembling-machine-2` defaults to coal, and coal burns to ash.** `rich-clay` needs 25 ash per
craft, so the LP discovered it could run `wood-seeds` as an **ash furnace** — 177.73 surplus wood-seeds
and 24.30 log/min to generate 4.56 ash. It reads as a clean solve. Setting `--fuel` on all six
assembler recipes collapsed the log import to **2.08/min**. Same failure mode design 29 documents.

**2. `--max-import "water:5000"` is a hard constraint and silently caused `Phase 1 infeasible`.** The
soil extractor alone wants ~4,800 water/min to feed ralesia's 95.6 soil/min. The stderr line named
`animal-sample-01` as the stuck artificial, which is four steps from the actual cause.

**3. Capping both `cottongut` and `cottongut-pup`** — two nodes of one closed cycle — gave
`Phase 1 infeasible` with three stuck artificials. Solver-reference § Closed self-sustaining loops has
this exactly; cap one end or neither.

## Open

- **6,320 tiles needs splitting** (rule 25 / phase 8) — or the ralesia/moondrop pushback above, which
  is the better answer.
- **`mukmoux-fat` 9.00/min has no compost recipe.** Only unlocked consumers are `animal-sample-01`
  (already counted) and `workers-food`. Accumulates.
- **`oxygen` 379.65/min** surplus from the hydrogen electrolyzer that serves ralesia. Vent-approved,
  but it is a lot — design 24's BOF would take it.
- **`manure 0.83/min`** couples this to an auog paddock. Tiny, but it is the head of design 27's
  45-building bio annex. Inlining is clearly wrong at this rate; leave it an import and note the
  dependency.
- **`subcritical-water-01` runs in a `py-heat-exchanger`**, whose construction needs the drivetrain
  cluster (fenxsb-alloy, fish-oil, vitreloy, ore-quartz, rubber, ceramic). The one nontrivial build gate.
- **No utilisation table yet** — needs a 1000× re-run and divide.
- **Build materials not computed.**

## Solver command — current state

Water must be capped **generously**; 5,000 is too low and fails. `--fuel` on every
`assembling-machine-2` recipe is load-bearing (trap 1). Cap `wood` but **not** `log` — log is internal
via `log2`, and capping both ends of the wood cycle breaks it.

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,cottongut-science-red-seeds,animal-sample-01,full-render-cottongut,cottongut-cub-1,caged-cottongut-1,water-barrel,alien-sample01,bio-sample01,ground-sample01,bone-to-bonemeal-2,petri-dish-bacteria,rich-clay,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds,moondrop-co2,log-wood-fast,wood-seeds,soil,hydrogen,log2,wood-seedling,Moss-1,muddy-sludge,fawogae-substrate,cellulose-00,depolymerized-organics,liquid-manure,subcritical-water-01,pressured-water,biomass-bones,biomass-guts,biomass-skin,biomass-brain,biomass-blood" \
  --target "logistic-science-pack:6" --time 60 \
  --max-import "cottongut:0.001" --max-import "barrel:0.001" \
  --max-import "ralesia-seeds:0.001" --max-import "moondrop-seeds:0.001" \
  --max-import "wood:0.001" --max-import "soil:0.001" --max-import "water:200000" \
  --max-import "moss:0.001" --max-import "biomass:0.001" \
  --modules "caged-cottongut-1:cottongut-mk01:20" --modules "cottongut-cub-1:cottongut-mk01:2" \
  --modules "ralesia-1:ralesia:12" --modules "moondrop-1:moondrop:16" --modules "moondrop-co2:moondrop:16" \
  --modules "Moss-1:moss:15" --modules "log2:tree-mk01:10" \
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

**The 16-building import-everything version**, which is the other end of the range and may be the
better starting point for the next pass — drop every recipe after `water-barrel` from `--recipes`,
drop the matching `--factory` and `--fuel` flags, and import `alien-sample01`, `ralesia-seeds`,
`moondrop`, `wood-seeds`, `fawogae-substrate` and `depolymerized-organics` instead. That solves to
**16 buildings, 2,252 tiles, 10.86 MW**.
