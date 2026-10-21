# 25 — Formica — 0.40 formica/s, 26 buildings

`formica-2` replaces the melamine-resin stack with a **melamine-resin + fiberboard** laminate, and
fiberboard is made from treated-wood rather than grown pulp. That one substitution removes the entire
sap field and four fifths of the block.

```
formica-2       [U] [wpu-mk01,      10 s]  melamine-resin 10 + fiberboard 2  →  formica 5
melamine-resin  [U] [fbreactor,      5 s]  urea 5 + melamine 20 + methanal 50  →  melamine-resin 10
fiberboard      [U] [pulp-mill,      5 s]  treated-wood 3 + raw-fiber 5 + sodium-hydroxide 3
                                           + steam 500  →  fiberboard 4 + tall-oil 15 + black-liquor 10
chlorine        [U] [electrolyzer,   2 s]  water-saline 100  →  sodium-hydroxide 2 + chlorine 20
                                                              + hydrogen 20
log2            [U] [fwf-mk01,      60 s]  wood-seedling 3 + water 500  →  log 4
```

## What it replaced

| | route 1 (`formica`) | **route 2 (`formica-2`)** |
|---|--:|--:|
| buildings | 148 | **26** |
| tiles | ~6,820 | **~1,687** |
| MW at load | 36.75 | **13.67** |
| **creosote** | 40.00 /s | **6.00 /s** |
| water | 241.53 /s | **60.46 /s** |
| ash | 5.31 /s | **none** |
| copper-plate | 2.00 /s | **0.40 /s** |
| bio modules | `sap-tree` 160 · `tree-mk01` 80 · `moss` 180 · `moondrop` 384 | **`moondrop` 96 · `moss` 30 · `tree-mk01` 20** |
| new imports | — | **melamine 1.60 · urea 0.40 · water-saline 6.00** |
| byproducts | none | **tall-oil 0.60 · black-liquor 0.40 · hydrogen 1.20** |

**Creosote 6.00/s is the headline.** Route 1's 40.00/s was the complex's binding constraint against a
base floor near 34/s; at 6.00 the constraint disappears. **The sap field goes with it** — route 1 ran
80 `sap-extractor` for a pulp input `formica-2` does not use, and that is most of the 122 buildings.

The trade is three new imports, two of them **inter-block from design 27** (melamine, urea) and one
genuinely new external item (**water-saline 6.00/s**, a fluid — see § The sodium-hydroxide question).
Route 1 had no byproducts; route 2 has three, one of which is unresolved — see § Terminal outputs.

## Block boundary

| class | items |
|---|---|
| **export — to design 26** | **formica** 0.40/s |
| **export — external** | **iron-oxide** 0.02/s |
| **import — whitelisted** | creosote, copper-plate, iron-plate, water |
| **import — asked and approved** | **water-saline** 6.00/s |
| **import — inter-block, design 27** | **melamine** 1.60/s · **urea** 0.40/s |
| **made in-block** | methanal, methane, CO₂, moondrop, moondrop-seeds, raw-fiber, treated-wood, wood, log, wood-seedling, wood-seeds, moss, muddy-sludge, soil, sodium-hydroxide, steam |
| **byproduct-exclude** | none — chlorine is forced to a sink by `--max-import chlorine:0` |

**`--max-import chlorine:0` is load-bearing.** Without it the LP imports chlorine and skips
`chloride-void-iron-oxide`, leaving 1.20 chlorine/s on the never-vent list with nothing attached.

## Recipe table

Bio counts are **module-corrected**; the solver reports base crafting speed, a 11–17× error here.

```
┌──────────────────────────┬──────────────────────────┬──────┬───────┬───────┬─────────┐
│ Recipe                   │ Factory                  │ Cnt  │ Size  │ Load  │ MW load │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ formica-2                │ wpu-mk01                 │   1  │ 6x6   │  80 % │   0.400 │
│ melamine-resin           │ fbreactor-mk01           │   1  │ 5x5   │  40 % │   0.200 │
│ fiberboard               │ pulp-mill-mk01           │   1  │ 5x5   │  20 % │   0.030 │
│ treated-wood             │ tar-processing-unit      │   1  │ 11x11 │  12 % │   0.061 │
│ fiber-01                 │ wpu-mk01                 │   1  │ 6x6   │ 100 % │   0.500 │
│ methanal                 │ hpf                      │   1  │ 7x7   │  32 % │   0.640 │
│ moondrop-seeds           │ botanical-nursery        │   1  │ 7x7   │  13 % │   0.016 │
│ log-wood-fast            │ wpu-mk01                 │   1  │ 6x6   │   3 % │   0.014 │
│ wood-seedling            │ botanical-nursery        │   1  │ 7x7   │  55 % │   0.069 │
│ wood-seeds               │ automated-factory-mk01   │   1  │ 7x7   │   4 % │   0.070 │
│ muddy-sludge             │ washer                   │   1  │ 6x6   │   7 % │   0.028 │
│ soil                     │ soil-extractor-mk01      │   1  │ 7x7   │   9 % │   0.034 │
│ chlorine                 │ electrolyzer-mk01        │   1  │ 6x6   │  12 % │   1.210 │
│ chloride-void-iron-oxide │ hpf                      │   1  │ 7x7   │   4 % │   0.082 │
│ electric-boiler-water-…  │ py-electric-boiler       │   1  │ 3x3   │  29 % │   7.320 │
│ (tall-oil burner)        │ oil-boiler-mk01          │   1  │ 5x5   │   4 % │   0.000 │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ methane-co2              │ moondrop-greenhouse-mk01 │  *2  │ 9x9   │  90 % │   0.810 │
│ moondrop-1               │ moondrop-greenhouse-mk01 │  *3  │ 9x9   │  83 % │   1.126 │
│ moondrop-co2             │ moondrop-greenhouse-mk01 │  *1  │ 9x9   │  34 % │   0.154 │
│ Moss-1                   │ moss-farm-mk01           │  *2  │ 6x6   │  85 % │   0.171 │
│ log2                     │ fwf-mk01                 │  *2  │ 15x15 │  82 % │   0.739 │
└──────────────────────────┴──────────────────────────┴──────┴───────┴───────┴─────────┘
   * module-corrected. Solver base counts: 31 / 43 / 6 / 28 / 19
     multipliers:                          17x / 17x /17x / 16x /11x
```

**26 buildings · ~1,687 tiles · 13.67 MW at load · 48.50 MW rated**

The rated figure is 3.5× the load figure and almost all of the gap is two machines: the
`py-electric-boiler` at 29 % (25.00 rated) and the `electrolyzer-mk01` at 12 % (10.00 rated). **Size the
substation for 14 MW, not 49** — nothing in this block can reach rated simultaneously, because both
large draws are sized by a recipe rate, not a buffer.

**Inputs** (/s): water 60.46 · **water-saline 6.00** · creosote 6.00 · **melamine 1.60** ·
copper-plate 0.40 · **urea 0.40** · iron-plate 0.02

**Exports** (/s): **formica 0.40** · iron-oxide 0.02 · *(hydrogen 1.20 vented · black-liquor 0.40
buffered · tall-oil 0.60 burned in-block)*

**Seven imports, and the two largest 15×15 buildings are both `fwf-mk01`** — the wood chain is 450 of
the 1,687 tiles, 27 % of the block, to make 1.09 wood/s.

## Intermediate flows

```
┌──────────────────┬──────────┬───────────────────────────────┬────────────────────────────────────────┐
│ Item             │ Rate /s  │ Producer                      │ Consumer                               │
├──────────────────┼──────────┼───────────────────────────────┼────────────────────────────────────────┤
│ melamine-resin   │    0.80  │ melamine-resin                │ formica-2 0.80                         │
│ fiberboard       │    0.16  │ fiberboard                    │ formica-2 0.16                         │
│ methanal         │    4.00  │ methanal                      │ melamine-resin 4.00                    │
│ methane          │    4.80  │ methane-co2                   │ methanal 4.80                          │
│ treated-wood     │    0.12  │ treated-wood                  │ fiberboard 0.12                        │
│ raw-fiber        │    0.20  │ fiber-01                      │ fiberboard 0.20                        │
│ sodium-hydroxide │    0.12  │ chlorine                      │ fiberboard 0.12                        │
│ steam            │   20.00  │ electric-boiler 17.57 +       │ fiberboard 20.00                       │
│                  │          │ oil-boiler (tall-oil) 2.43    │                                        │
├── wood ──────────┼──────────┼───────────────────────────────┼────────────────────────────────────────┤
│ wood             │    1.09  │ log-wood-fast                 │ fiber-01 1.00, treated-wood 0.06,      │
│                  │          │                               │ wood-seeds 0.04                        │
│ log              │    0.11  │ log2                          │ log-wood-fast                          │
│ wood-seedling    │    0.08  │ wood-seedling                 │ log2                                   │
│ wood-seeds       │    0.03  │ wood-seeds                    │ wood-seedling      ← closed loop        │
│ moss             │    0.14  │ Moss-1                        │ wood-seedling                          │
│ muddy-sludge     │    1.71  │ muddy-sludge                  │ Moss-1                                 │
│ soil             │    0.17  │ soil                          │ muddy-sludge                           │
├── moondrop ──────┼──────────┼───────────────────────────────┼────────────────────────────────────────┤
│ carbon-dioxide   │   13.72  │ moondrop-co2                  │ methane-co2 12.00, Moss-1 1.71         │
│ moondrop-seeds   │    0.19  │ moondrop-seeds                │ methane-co2 0.12, moondrop-1 0.07      │
│ moondrop         │    0.07  │ moondrop-1                    │ moondrop-seeds     ← closed loop        │
├── chlorine ──────┼──────────┼───────────────────────────────┼────────────────────────────────────────┤
│ chlorine         │    1.20  │ chlorine                      │ chloride-void-iron-oxide 1.20          │
└──────────────────┴──────────┴───────────────────────────────┴────────────────────────────────────────┘
```

**Two closed loops, both net zero.** `moondrop-seeds` returns 2.2 moondrop per craft against 5 consumed,
so `moondrop-1` tops up the 2.8 difference and the bank is a one-time stock. `wood-seeds →
wood-seedling → log2 → log → wood → wood-seeds` closes the same way at 0.03/s. Neither needs resupply;
both need a starting stock.

**`methane-co2` is 12.00 of the 13.72 CO₂/s.** The moss bank takes the remaining 1.71. One
`moondrop-co2` greenhouse at 34 % covers both, and it makes CO₂ from literally nothing — no ingredients.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **formica** | 0.40 | **design 26** `electronic-circuit-2` — the product | — | — |
| **tall-oil** | 0.60 | **burned** — `oil-boiler-mk01`, fluid fuel 1.00 MJ, no fuel filter, effectivity 2 | 1 building, 25 tiles, 0 MW | `tall-oil-separation` needs light-oil (no unlocked producer); `tall-oil-combustion` needs coke **and** gives back combustion-mixture1 with nowhere to burn it. `tall-oil-pyvoid-fluid` is a liquid void — not approved |
| **hydrogen** | 1.20 | **vented** — pre-approved, 0.10 MJ is noise | 1 × `py-gas-vent`, 25 kW | a second `oil-boiler-mk01` would recover 0.49 steam/s ≈ 0.20 MW — one building for 1.4 % of the steam demand. Rejected on building cost, not on principle |
| **iron-oxide** | 0.02 | **export** — real product, stack 100 | — | it is the chlorine sink's output, not a waste |
| **black-liquor** | **0.40** | **buffered — no sink** | 1 storage tank ≈ 17.4 h | see below |

> **black-liquor 0.40/s has no consumer this block can use.** The only non-void recipe is
> `black-liquor` [gasifier, 5 s] `black-liquor 80 + oxygen 100 → aromatics 100 + acetone 50`, which at
> this rate is **aromatics 0.50/s (useful — it is the plastic input) plus acetone 0.25/s (on the
> never-vent list, with no reachable consumer)**. Its cheapest sink is `organic-solvent2` behind
> `oil-processing`, a **~2,965-unit** research chain. So gasifying trades a fluid with no sink for a
> fluid with no sink, and adds an oxygen import.
>
> **Decision: buffer it.** 0.40/s fills a 25,000-unit storage tank in **17.4 hours**; a bank of four is
> three days of continuous running. This is explicitly accepted as deferred, not solved — the block
> throttles on a full buffer exactly as a steam backup throttles a boiler. `black-liquor-pyvoid-fluid`
> was not taken: liquids are ask-and-expect-no, and nothing has been asked.

**The tall-oil burner is the smaller half of its own argument.** It saves 1.03 MW (the electric boiler
drops 0.334 → 0.293 machines, 8.35 → 7.32 MW) for one building — roughly break-even on its own. It
earns its place because **tall-oil is a liquid fuel with no approved disposal**, and a boiler is the
ruleset's standing answer to exactly that.

## Capacity pads

Solver counts are minimum-feasible. One row has no headroom:

| recipe | solver | placed | why pad |
|---|--:|--:|---|
| **`fiber-01`** | 1.000 | **1** | exactly saturated at 100 %. Any downtime propagates directly to formica. A second `wpu-mk01` is 36 tiles and 0.50 MW rated — **cheapest insurance in the block** |
| `methane-co2` | 1.800 | 2 | already padded by rounding — 2 at 90 % |
| `Moss-1` · `log2` | 1.710 · 1.641 | 2 · 2 | already padded — 85 % and 82 % |

Everything else runs below 85 %. `formica-2` itself at 80 % is the output machine and will absorb a
restart without a pad.

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `moondrop-greenhouse-mk01` | 6 | `moondrop` 16 | **96** | **yes** — `moondrop-1` + `moondrop-seeds` run here as a closed loop |
| `moss-farm-mk01` | 2 | `moss` 15 | **30** | **yes** — `Moss-1` runs here |
| `fwf-mk01` | 2 | `tree-mk01` 10 | **20** | needs **20 planter-boxes** |

**Down from route 1's 804 modules to 146.** The `sap-tree` ×160 requirement is gone entirely with the
sap field.

`tree` [nursery, 30 s] is `planter-box 1 + wood-seedling 3 → tree-mk01 1`, so twenty modules means
**20 planter-boxes**: `ash 60 + soil 100 + empty-planter-box 20`, and `empty-planter-box` is
`stone-brick 80 + wood 40 + iron-plate 20`. Soil and wood are made here; **ash and stone-brick are
one-time imports** that appear in no flow table.

> **The block still needs ash — once, not continuously.** Dropping `log3` removed the **0.54 ash/s
> flow**, which is what cost a permanent station. The 60 ash for the planter-boxes is construction
> capital delivered by hand or bot, same as the `stone-brick`. `log2` needing two `fwf` rather than one
> **doubled that one-time figure from 30 to 60** — still a few chests.

The `moondrop` bootstrap starts from `moondrop-sample` [nursery, 200 s] = `petri-dish 2 +
planter-box 1 + moondrop-codex 1 + water 1000 → moondrop 4`, then the seed loop compounds. **Design 27
borrows 32 of these**, once, at build time.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **black-liquor buffer fills** | 17.4 h per tank, then `fiberboard` stalls → formica stops. Not an operational risk on any normal timescale, but it is the only hard stop with a clock on it |
| 2 | **`fiber-01` at 100 %** | no headroom; see § Capacity pads |
| 3 | **melamine 1.60/s + urea 0.40/s from design 27** | both inter-block, and design 27 is the 99-building half gated on `auog`. **This block cannot start before 27 reaches rate** |
| 4 | **water-saline 6.00/s has no identified producer** | see § The sodium-hydroxide question — the washers did not disappear, they moved outside the block, and no block currently runs them |
| 5 | **the wood chain** | `log2` is 60 s per craft across two `fwf-mk01`. A seedling or moss stall takes ~2 minutes to show and the same to clear |
| 6 | creosote 6.00/s | feeds `treated-wood` only, at 12 % load. Throttles rather than stalls |

**No cycle in this block can deadlock.** Both loops (moondrop, wood-seeds) have an external top-up path
and run at a few hundredths of an item per second; a stall drains them slowly enough to notice.

## The sodium-hydroxide question

`water-saline` exists only to make **sodium-hydroxide 0.12/s** for `fiberboard`. Four ways to get there:

| | buildings | tiles | MW load | import added | byproducts kept |
|---|--:|--:|--:|---|---|
| **import `water-saline` 6.00/s** *(chosen)* | +1 | +36 | +1.21 | water-saline (**3rd bus fluid**) | chlorine 1.20 · hydrogen 1.20 |
| make saline from stone | +4 | +194 | +2.17 | stone 1.20/s (solid) | chlorine 1.20 · hydrogen 1.20 |
| make saline from gravel | +4 | +194 | +2.17 | gravel 1.80/s (solid) | chlorine 1.20 · hydrogen 1.20 |
| **import `sodium-hydroxide` 0.12/s** | **0** | **0** | **0** | sodium-hydroxide (solid, stack 100) | **none** |

> **Importing saline moves the washers, it does not delete them.** Nothing in the base currently
> produces `water-saline`, and the three recipes that can are all `[washer, 20 s]`:
> `saline-water` (stone 10 + water 100 → 50), `gravel-saline-water` (gravel 15 + water 100 → 50), and
> `water-saline` (salt 10 + water 100 → **100** — 10× the throughput per washer, but no salt line
> exists). **Whichever block makes it still pays 3 washers and ~0.96 MW at 6.00/s.** This design records
> that cost as external by choice; it is not a saving until a saline source exists for another reason.

**Importing `sodium-hydroxide` directly is still the cheapest end state** — it deletes the electrolyzer,
the chlorine sink and both byproducts, giving **24 buildings and ~12.5 MW**. It was not taken because
0.12/s is a half-full chest per hour and would still cost a station, while a saline pipe also carries
whatever the next NaOH consumer needs.

**Revisit if a salt outpost appears.** Salt makes `water-saline` at 10× per washer, which would make
producing it locally cheaper than importing it.

## Build notes

- **`log2`, not `log3`.** `log3` is `ash 30 + wood-seedling 3 + water 500 → log 6` in 40 s against
  `log2`'s `wood-seedling 3 + water 500 → log 4` in 60 s — **2.5× the logs per building-second**. The
  ash bought seedling efficiency too (6 logs per 3 seedlings against 4), so dropping it raised
  `wood-seedling` 0.36 → 0.55 and `Moss-1` 1.13 → 1.71. Net: **ash flow gone, one more 15×15 `fwf`
  (+225 tiles), two buildings fewer overall** because the three saline washers left with the stone.
- **`log4` was examined and declined.** `wood-seedling 3 + water 500 + carbon-dioxide 300 → log 5` in
  30 s — no ash, and the CO₂ comes from `moondrop-co2`, which makes it **from no ingredients at all**
  and still fits in one greenhouse (0.34 → 0.50 load). It is **25 buildings · ~1,462 tiles · 13.22 MW ·
  water 54.99/s** against log2's 26 · 1,687 · 13.67 · 60.46 — better on every axis, one `fwf` instead of
  two, no new input.

  **Not taken: it is locked behind `wood-processing-2`** (160 units × [3× automation-science-pack,
  2× py-science-pack-1, 1× logistic-science-pack]; prerequisite `logistic-science-pack` already
  researched, so directly researchable). **One building, 225 tiles and 0.45 MW does not justify a
  research plus rebuilding the wood chain** — `log2` is the design. If `wood-processing-2` is researched
  for one of its other unlocks (`tree-mk02`, `wood-seedling-mk02`, `co2-organics`), the swap is then
  free: `--recipes log2` → `log4` and `--factory "log2:fwf-mk01"` → `"log4:fwf-mk01"`, nothing else
  changes.

  > **Caution — the solver does not enforce `--unlocked` on recipes named in `--recipes`.** The log4
  > figures above came from a solve that ran with `--unlocked` and used it anyway; `--unlocked` governs
  > only what the LP may pull in on its own. Cross-check with
  > `recipes --produces <item> --unlocked`, which does filter: it returns log1/log2/log3 and omits log4.

  Of the three recipes `wood-processing-2` unlocks, **log4 is the one to take.** `log5`
  (`+ muddy-sludge 500`) also lands on one `fwf` but needs **7.81 sludge/s** against this block's 1.71,
  pulling ~47.6 more water/s through the soil-extractor; `log6` puts the ash back.
- **`Moss-1`, not `Moss-2`.** Moss-2 doubles yield for `stone 20` per craft. At two farms the saving is
  one building against ~3.4 stone/s — and this block no longer imports stone at all, so it would be a
  new station for one 6×6 building.
- **`Moss-1-without-sludge-for-real` is TURD-gated, worth asking about.** `[moss, 100 s]
  carbon-dioxide 100 → moss 8` — same yield as `Moss-1` with no muddy-sludge, which here would delete the
  `washer` and `soil-extractor` (2 buildings, 85 tiles, 8.8 water/s) for 1.71 more CO₂/s from a
  greenhouse that has headroom. It reads `enabled: false` with **no normal `unlock-recipe` tech effect**,
  the signature of a **TURD** pick: the research may not be done, or a different option may have been
  taken. **Not unreachable — ask.** The same recipe is worth far more to design 27 (40 % of its water),
  so settle it there first.
- **The boiler is process steam, not power.** `fiberboard` takes `steam 500` per craft as an
  *ingredient*. There is no generator in this block and nothing to generate from.
- **`chloride-void-iron-oxide` is a sink, not a product line.** `iron-plate 1 + chlorine 60 →
  iron-oxide 1` runs one hpf at 4 % and absorbs all 1.20 chlorine/s. Its capacity is 30 chlorine/s —
  **25× the demand**, so it will never be the constraint.

## Solver command

Target mode on `formica`. **`--max-import chlorine:0` changes the answer** — see § Block boundary. Bio
buildings are at mk01 and **must be re-read with the module multipliers in the recipe table**.

```bash
npx tsx src/cli.ts solve \
  --recipes "formica-2,melamine-resin,fiberboard,treated-wood,fiber-01,methanal,methane-co2,moondrop-co2,moondrop-1,moondrop-seeds,log2,log-wood-fast,wood-seedling,wood-seeds,Moss-1,muddy-sludge,soil,chlorine,chloride-void-iron-oxide,electric-boiler-water-to-steam" \
  --target "formica:0.40" --time 1 \
  --max-import "chlorine:0" \
  --factory "formica-2:wpu-mk01" \
  --factory "melamine-resin:fbreactor-mk01" \
  --factory "fiberboard:pulp-mill-mk01" \
  --factory "treated-wood:tar-processing-unit" \
  --factory "fiber-01:wpu-mk01" \
  --factory "methanal:hpf" \
  --factory "methane-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "chlorine:electrolyzer-mk01" \
  --factory "chloride-void-iron-oxide:hpf" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

It reports **129 buildings and 58.06 MW** — that is the pre-module-correction figure. The five bio rows
carry it; dividing by their multipliers gives 25, and the `oil-boiler-mk01` is the 26th (the solver has
no model of fluid-fuel burners, so it is added by hand and costs no electricity).

**The boiler row in the solver output is 0.334 machines / 8.35 MW.** This design runs it at 0.293 /
7.32 MW because the tall-oil burner covers 2.43 of the 20.00 steam/s. `tall-oil` fuel value 1.00 MJ ×
effectivity 2 ÷ 0.4935 MJ per steam unit = 2.431 steam/s at 0.60 tall-oil/s. Hand algebra, not solver
output.

Fractional counts were recovered by re-running at `--target "formica:400"` and dividing by 1000; the
ceilings reproduce the 0.40/s run exactly.

## Build materials

Distinct construction materials across this block's 12 building types, separate from flow imports:

`aluminium-plate` · `battery-mk01` · `boiler` · `brick` · `concrete` · `copper-cable` · `copper-plate` ·
`electric-mining-drill` · `electronic-circuit` · `engine-unit` · `gearbox-mk01` · `glass` · `inductor1` ·
`iron-gear-wheel` · `iron-plate` · `lab` · `log` · `pcb1` · `pipe` · `pump` · `shaft-mk01` ·
`small-parts-01` · `steam-engine` · `steel-plate` · `stone-brick` · `stone-furnace` · `wood`

Nothing here is exotic — the heaviest items are the two `fwf-mk01`, and the one-time **`ash` ×60 and
`stone-brick` ×80** for twenty planter-boxes appear in no flow table. Inferred from the recipe graph,
not from save state.
