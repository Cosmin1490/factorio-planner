# 28 — Auog food — 1.50 auog-food-01/s, 126 buildings

Shared infrastructure for every auog consumer in the base. `auog-food-01` feeds `auog-pooping-2/3`,
`auog-maturing-2` through `-5`, and `auog-recharge-0` — so one block serves all of them, where building
it inside a consumer serves exactly one.

**Independent of designs 25/26/27.** Nothing crosses but the food itself, plus a one-time loan of 16
`moondrop` modules.

> **Build this after the circuit complex, not before it.** Design 27 runs on `auog-pooping-1` with no
> food at all — 99 buildings instead of 72 — so **nothing here is on the critical path to circuits.**
> This block's entire benefit is **−27 buildings in design 27**, and it costs **1,695
> electronic-circuit** to build (93 % of them in the plantations). Sized down to design 27's 0.68/s it is
> still ~790 circuits for the same 27-building saving.
>
> **If circuits are the scarce resource, that trade runs backwards.** Sequence it
> **27 on `auog-pooping-1` → 26 at 1.0 circuit/s → then this block**, at which point 1,695 circuits is
> ~28 minutes of output rather than a campaign. The retrofit is clean: swap `auog-pooping-1` for `-2` in
> nine of the eighteen paddocks and decommission the rest — the `auog` modules transfer.

```
auog-food-01         [U] [automated-factory, 10 s]  native-flora 5 + ralesia 5 + moss 5 + seaweed 3
                                                    + plastic-bar 2 + steam 100  →  auog-food-01 3
ralesia-1            [U] [ralesia,          125 s]  soil 15 + ralesia-seeds 8 + water 100
                                                    + hydrogen 100  →  ralesia 10
ralesia-seeds        [U] [nursery,          5.5 s]  ralesia 5  →  ralesia-seeds 8
aromatics-to-plastic [U] [biofactory,       1.5 s]  aromatics 50 + syngas 100  →  plastic-bar 1
hydrogen             [U] [electrolyzer,      10 s]  water 300  →  hydrogen 200 + oxygen 100
```

## Why 1.50/s — aromatics sets the rate

**2/3 plastic-bar per food unit × 50 aromatics per plastic-bar = 33.33 aromatics per food.** That one
ratio fixes the whole block, because `aromatics-to-plastic` is the only unlocked plastic route and both
food variants need `plastic-bar 2`.

| food /s | **aromatics /s** | syngas /s | verdict |
|---|--:|--:|---|
| 1.00 | 33.33 | 66.67 | under-uses the budget |
| **1.50** | **50.00** | **100.00** | **exactly the 50/s ceiling** |
| 2.00 | 66.67 | 133.33 | over budget |

**1.50/s is the largest rate that fits 50 aromatics/s**, and it lands on round numbers for both fluids.
Design 27 needs **0.68/s**, so this covers it **2.2×** with 0.82/s spare for the next auog consumer.

## Thinking ahead — `plastic-from-melamine` lifts the ceiling

```
plastic-from-melamine  [L] [crafting, 10 s]  melamine 10  →  plastic-bar 5
```

**This is the recipe that removes the aromatics constraint**, and with it the 1.5/s cap. Plastic-bar
1.00/s would come from **melamine 2.00/s** in 2 `automated-factory-mk01` (+3.4 MW against the
biofactories) — **no aromatics, no syngas at all.** The block's rate would then be bounded by how large a
bio annex you want rather than by a fluid budget.

**It is not free.** Melamine 2.00/s means expanding design 27's manure chain by roughly **+20 buildings**
(≈ +10 per melamine/s — see [27 § leeching melamine](25-27-electronic-circuit/27-battery-urea.md)). So
the trade is **~20 buildings to escape a 50/s aromatics budget**, which only pays if you actually want
more than 1.5 food/s.

### The loop closes, with room

Food enables `auog-pooping-2` → manure → urea → cyanic-acid → melamine → plastic → food. That is a real
cycle across two blocks, and it is comfortably net-positive:

```
food 1.50/s  →  plastic 1.00  →  melamine 2.00  →  cyanic 2.00  →  urea 1.333
             →  manure 0.444  →  (pooping-2, 3 food per craft)  →  food 0.157/s
```

**10.5 % recirculation** — the loop consumes about a tenth of its own output, so it is not chasing its
tail. **But it is a cold-start deadlock**: no food → no melamine → no plastic → no food. Keep at least
one `biofactory-mk01` on the aromatics route as a floor, or hold a food buffer big enough to restart the
chain. Same shape as design 27's paddock switch — two routes to the same item, one of which always works.

### The gate, and what arrives before it

| milestone | unresearched techs | units |
|---|--:|--:|
| **`sulfur-processing`** | 22 | **4,870** |
| **`plastics-mk02`** (← `korlex` ← `biotech-mk02` ← … ← `sulfur-processing`) | 38 | **11,635** |

**All 22 of `sulfur-processing`'s chain are inside `plastics-mk02`'s** — you pass through it at 42 % of
the way, and **it is the bigger event.** `sulfur-processing` → `sulfuric-acid` → `rayon` → batteries at
**1.200 bat/s per building against `battery-mk01`'s 0.100**, which collapses design 27's 30:1
cyanic-acid ratio, its 45-building bio annex, **and the ammonia surplus** (the surplus equals the
battery's cyanic draw exactly, so a better battery dissolves `t = 0`).

> **Expect design 27 to be rebuilt before this recipe arrives**, which changes the premise: with a better
> battery the urea chain shrinks, so melamine stops being abundant alongside it and becomes something
> you expand the bio annex deliberately to get. **Re-price this swap when `plastics-mk02` actually
> lands** rather than assuming today's +20 buildings still holds.

## Block boundary

| class | items |
|---|---|
| **export — to design 27 and any future auog consumer** | **auog-food-01** 1.50/s |
| **import — asked and approved** | **aromatics** 50.00/s · **syngas** 100.00/s · **native-flora** 2.50/s |
| **import — whitelisted** | water 767.50/s |
| **made in-block** | ralesia, ralesia-seeds, moss, muddy-sludge, soil, CO₂, seaweed, plastic-bar, hydrogen, steam |
| **byproduct-exclude** | none |
| **byproduct — vented** | **oxygen** 25.00/s |

**No `--max-import` flags.** Every intermediate is endogenous and there is no free input for the LP to
over-consume; the only imports are the four raws above, all of which the block genuinely cannot make.

## Recipe table

Bio counts are **module-corrected**; the solver reports base crafting speed, an 11–17× error here.
**Divide the solver count by the multiplier.** All four bio buildings here reach effective speed 1.00
(`ralesia-plantation-mk01` 0.0769 × 13, `moss-farm-mk01` 0.0625 × 16, `seaweed-crop-mk01` 0.0909 × 11,
`moondrop-greenhouse-mk01` 0.0588 × 17) — unlike `auog-paddock-mk01`, which reaches 2.0 and is not used
here.

```
┌──────────────────────────┬──────────────────────────┬──────┬───────┬───────┬─────────┐
│ Recipe                   │ Factory                  │ Cnt  │ Size  │ Load  │ MW load │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ auog-food-01             │ automated-factory-mk01   │   5  │ 7x7   │ 100 % │  10.000 │
│ hydrogen                 │ electrolyzer-mk01        │   3  │ 6x6   │  83 % │  25.010 │
│ soil                     │ soil-extractor-mk01      │   6  │ 7x7   │  89 % │   2.125 │
│ ralesia-seeds            │ botanical-nursery        │   3  │ 7x7   │  92 % │   0.344 │
│ aromatics-to-plastic     │ biofactory-mk01          │   2  │ 7x7   │  75 % │   0.600 │
│ muddy-sludge             │ washer                   │   2  │ 6x6   │  63 % │   0.500 │
│ electric-boiler-water-…  │ py-electric-boiler       │   1  │ 3x3   │  83 % │  20.850 │
├──────────────────────────┼──────────────────────────┼──────┼───────┼───────┼─────────┤
│ ralesia-1                │ ralesia-plantation-mk01  │ *63  │ 7x7   │  99 % │  25.000 │
│ Moss-1                   │ moss-farm-mk01           │ *32  │ 6x6   │  98 % │   3.125 │
│ seaweed-1                │ seaweed-crop-mk01        │  *8  │ 13x13 │  94 % │   3.375 │
│ moondrop-co2             │ moondrop-greenhouse-mk01 │  *1  │ 9x9   │  78 % │   0.352 │
└──────────────────────────┴──────────────────────────┴──────┴───────┴───────┴─────────┘
   * module-corrected. Solver base counts: 813 / 500 / 83 / 14
     multipliers:                           13x /  16x / 11x /17x
```

**126 buildings · ~6,645 tiles · 91.28 MW at load · 101.83 MW rated**

**The ralesia plantation is half the block** — 63 of 126 buildings and 3,087 of 6,645 tiles. See
§ The seed loop is the reason.

**Two machines are half the power**: `electrolyzer-mk01` ×3 at 25.01 MW (hydrogen for ralesia) and the
`py-electric-boiler` at 20.85 MW (steam for the food), together **45.86 MW of 91.28**. Neither makes
anything the food contains — they make a reagent and a utility.

**Inputs** (/s): **water 767.50** · **syngas 100.00** · **aromatics 50.00** · native-flora 2.50

**Exports** (/s): **auog-food-01 1.50** · *(oxygen 25.00 vented)*

## Intermediate flows

```
┌────────────────┬──────────┬───────────────────────────────┬────────────────────────────────────────┐
│ Item           │ Rate /s  │ Producer                      │ Consumer                               │
├────────────────┼──────────┼───────────────────────────────┼────────────────────────────────────────┤
│ ralesia        │    5.00  │ ralesia-1                     │ auog-food-01 2.50,                     │
│                │          │                               │ ralesia-seeds 2.50   ← 50 % recycled    │
│ ralesia-seeds  │    4.00  │ ralesia-seeds                 │ ralesia-1 4.00       ← closed loop      │
│ moss           │    2.50  │ Moss-1                        │ auog-food-01 2.50                      │
│ seaweed        │    1.50  │ seaweed-1                     │ auog-food-01 1.50                      │
│ plastic-bar    │    1.00  │ aromatics-to-plastic          │ auog-food-01 1.00                      │
│ steam          │   50.00  │ electric-boiler-water-to-steam│ auog-food-01 50.00                     │
│ hydrogen       │   50.00  │ hydrogen                      │ ralesia-1 50.00                        │
│ soil           │   10.63  │ soil                          │ ralesia-1 7.50, muddy-sludge 3.12      │
│ muddy-sludge   │   31.25  │ muddy-sludge                  │ Moss-1 31.25                           │
│ carbon-dioxide │   31.25  │ moondrop-co2                  │ Moss-1 31.25                           │
└────────────────┴──────────┴───────────────────────────────┴────────────────────────────────────────┘
```

## The seed loop is the reason it is 63 plantations

```
ralesia-1      soil 15 + ralesia-seeds 8 + water 100 + hydrogen 100  →  ralesia 10
ralesia-seeds  ralesia 5                                            →  ralesia-seeds 8
```

Eight seeds cost **five ralesia**, and ten ralesia cost eight seeds. **Net yield is 5 ralesia per 10
grown — the plantation is sized at exactly 2× what the food consumes.** 5.00/s is grown so that 2.50/s
reaches `auog-food-01`; the other 2.50/s goes straight back into the nursery.

**`ralesia-seeds-paper-towel` would halve it — and whether it is reachable is an open question.**
`paper-towel 1 + ralesia 5 → ralesia-seeds 16` takes net yield from 50 % to 67 % and the plantation from
**63 to ~42 — 21 buildings and ~1,030 tiles, the largest single saving on the table.** Both it and
`paper-towel` read `enabled: false` with **no normal `unlock-recipe` tech effect**, which is the
signature of a **TURD** pick rather than of a dead recipe: the research may not be done, or a different
option may have been taken. **Ask before writing it off.** The research-gated plantation upgrade is
separate — see § Thinking ahead.

**`ralesia` is self-funding** — `ralesia-plantation-mk01` takes `ralesia` as its own module, 12 slots.
So the seed loop that costs half the output is also what pays for the 756 modules.

## Where the water goes

767.50/s is the largest flow in any block in this repo, and 69 % of it is one recipe:

| consumer | /s | share |
|---|--:|--:|
| **`soil`** (soil-extractor, 800 per 16 soil) | **531.30** | **69 %** |
| `hydrogen` (electrolyzer) | 75.03 | 10 % |
| `electric-boiler` → food steam | 50.04 | 7 % |
| `ralesia-1` | 50.00 | 7 % |
| `muddy-sludge` | 31.25 | 4 % |
| `seaweed-1` | 30.00 | 4 % |

> **This block must be sited on water.** 767.50/s is ~1.9× a mk01 fluid wagon and nearly a full mk02;
> rail-feeding it is not sensible at any tier (rule 27). Site it on a lake and pipe the water, and the
> 531/s costs nothing but pipe.

**`soil` is 50 water per soil unit** and the block needs 10.63 soil/s — 7.50 for the plantations and 3.12
for the sludge that feeds the moss. **`limestone-void` is the alternative** (`limestone 3 + soil 2 →
soil 3 + limestone 2`, net 1 soil per 1 limestone, `[secondary-crusher, 0.5 s]`): about **6 crushers and
limestone 10.63/s** in exchange for all 531.30 water/s. Worth taking **only if the block cannot sit on
water** — otherwise it trades a free input for a mined one.

## Planned upgrade — TURD `remove-muddy-sludge`, applied after build

`moss-upgrade` is **researched with no option selected**, so `Moss-1-without-sludge-for-real`
(`[moss, 100 s] carbon-dioxide 100 → moss 8` — same yield, **no sludge**) is a free pick. **Decision:
build as drawn, take the pick afterwards.**

**This block gains the most of the three.** Its 32 farms stop drawing muddy-sludge 31.25/s, which deletes
**2 washers and 2 of the 6 soil-extractors** — the other 4 serve `ralesia-1` — and **187.5 water/s,
taking the block from 767.50 to 580.0/s.** The 29 % water share in § Where the water goes that is
*not* ralesia disappears entirely.

**No complication here** — this block runs no `melamine`, so nothing else wants the sludge. Design 27
owns the decision and the sludge sink that has to exist before the pick
([27 § Planned upgrade](25-27-electronic-circuit/27-battery-urea.md)). Full option comparison and the
Moss-3 counter-argument: solver-reference § Recipe availability.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **auog-food-01** | 1.50 | **design 27** `auog-pooping-2` takes 0.68; **0.82/s spare** for the next auog consumer | — | the product. `t = 2.2` against design 27 alone — deliberately oversized, since this is shared infrastructure |
| **oxygen** | **25.00** | **vented** — `py-gas-vent`, pre-approved, 1 building at 25 kW | 1 × 1×1 | see below |

> **The oxygen is worth 25.00/s to design 24 if they are ever adjacent.** Design 24's `molten-iron-05`
> needs **oxygen 90/s** and spends ~90 MW of electrolysis making it — this block's vent stream would
> cover **28 % of that**, i.e. roughly 25 MW of design 24's draw, for a pipe. Venting is the right
> default (pre-approved, and the blocks have no reason to be neighbours), but **if a layout ever puts
> them together, pipe it rather than vent it.** Recorded as an option, not a plan.

## Capacity pads

| recipe | solver | placed | load | why pad |
|---|--:|--:|--:|---|
| **`auog-food-01`** | 5.000 | 5 | **100 %** | exactly saturated and it is the product. A sixth `automated-factory-mk01` is 49 tiles / 2.00 MW rated — **take it** |
| `ralesia-1` | 62.500 | 63 | 99 % | 49 tiles and 12 more `ralesia` modules each. Self-funding, so the pad costs time not material — a 64th is cheap by bio standards |
| `Moss-1` | 31.250 | 32 | 98 % | 36 tiles, self-funding. Cheap |
| `seaweed-1` | 7.500 | 8 | 94 % | **169 tiles** — the most expensive pad per building here |
| `hydrogen` | 2.501 | 3 | 83 % | already padded by rounding; a 4th electrolyzer is 10.00 MW rated for nothing |

**Pad `auog-food-01` first.** It is the only 100 % row, it is the output, and at 49 tiles it is the
cheapest insurance in the block.

## Bio modules

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `ralesia-plantation-mk01` | 63 | `ralesia` 12 | **756** | **yes** — `ralesia-1` runs here |
| `moss-farm-mk01` | 32 | `moss` 15 | **480** | **yes** — `Moss-1` runs here |
| `seaweed-crop-mk01` | 8 | `seaweed` 10 | **80** | **yes** — `seaweed-1` runs here |
| `moondrop-greenhouse-mk01` | 1 | `moondrop` 16 | **16** | **one-time from design 25** |

**1,332 modules, and 1,316 of them are self-funding** — no creature chamber, no codex grind, nothing
like design 27's `auog` bottleneck. The bootstrap is `ralesia-sample` [nursery, 200 s] = `planter-box 1 +
bio-sample 5 + cdna 3 + earth-flower-sample 1 + ralesia-codex 1 + water 1000 → **ralesia 2**`, and the
seed loop compounds from there. **Two per run against auog's one per 300 s** — this block starts fast.

The 16 `moondrop` are the only thing that crosses from design 25, once, at build time. Design 25's
breeding loop also lends 16 to design 27, so **32 total** come off its nursery as a brief surplus.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **aromatics 50.00/s is at the stated ceiling** | zero headroom by construction — the rate was chosen to hit it exactly. Any shortfall scales the block linearly, and **`plastic-bar` has no second route**: `aromatics-to-plastic` is the only unlocked one. A 10 % aromatics dip is a 10 % food dip |
| 2 | **syngas 100.00/s** | same chain, twice the volume. Both fluids come from the same upstream, so they fail together rather than independently |
| 3 | **water 767.50/s** | not a supply risk if sited on a lake, which it must be anyway — but it makes siting a hard constraint rather than a preference |
| 4 | **`auog-food-01` at 100 %** | no headroom on the output machine; see § Capacity pads |
| 5 | **the ralesia seed loop** | nets to zero and has no external top-up. A nursery outage drains the seed bank and the plantation stops — 125 s per craft means slow recovery, and the loop is 50 % of throughput |
| 6 | native-flora 2.50/s | map-placed, no recipe. `flora-collector-mk01` at 1.0/s → **3 collectors**. Small compared to design 27's 4.50/s |

**Nothing downstream can throttle this block.** Both caps are on the import side, and the one byproduct
(oxygen) goes to a vent with 40,000/s of capacity against 25.00/s of supply.

## Stamping

**6,645 tiles is past the ~5,000 threshold** (rule 20 / phase 8), so lay this out as **two stamps**:

| stamp | contents | buildings | tiles |
|---|---|--:|--:|
| **A — ralesia** | `ralesia-1` ×63, `ralesia-seeds` ×3 | 66 | ~3,234 |
| **B — food + support** | everything else | 60 | ~3,411 |

**The seam is two solids**: `ralesia` 2.50/s out of A, `soil` 7.50/s into A. Both are stack-100 items on a
short belt — no fluid crosses, which is why this is the cheap split (rule 19 notwithstanding, there is
simply no fluid at this boundary). Hydrogen and water both terminate inside A; steam, sludge and CO₂ all
terminate inside B.

## Solver command

Target mode on `auog-food-01` — single end product, demand-driven. No constraints needed. Bio buildings
are at mk01 and **must be re-read with the module multipliers in the recipe table**.

```bash
npx tsx src/cli.ts solve \
  --recipes "auog-food-01,ralesia-1,ralesia-seeds,Moss-1,muddy-sludge,soil,moondrop-co2,seaweed-1,hydrogen,aromatics-to-plastic,electric-boiler-water-to-steam" \
  --target "auog-food-01:1.5" --time 1 \
  --factory "auog-food-01:automated-factory-mk01" \
  --factory "ralesia-1:ralesia-plantation-mk01" \
  --factory "ralesia-seeds:botanical-nursery" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "hydrogen:electrolyzer-mk01" \
  --factory "aromatics-to-plastic:biofactory-mk01" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --solver simplex \
  --unlocked
```

It reports **1,432 buildings and 477.50 MW** — that is the pre-module-correction figure. The four bio
rows carry **1,410 of those 1,432**; dividing by their multipliers gives 126.

**The factory names are easy to get wrong here.** `aromatics-to-plastic` is category `biofactory`, and
the entity is **`biofactory-mk01`** — `--factory "...:biofactory"` fails with *Factory "biofactory" not
found*. `auog-food-01` is `crafting-with-fluid`, whose only electric options are
`automated-factory-mk01`–`mk04`; all three vanilla `assembling-machine` tiers are **burners** in
Pyanodon and would add a burnt-result coupling.

Fractional counts were recovered by re-running at `--target "auog-food-01:1500"` and dividing by 1000.

## Build materials

Distinct construction materials across this block's 10 building types, separate from flow imports:

`aluminium-plate` · `concrete` · `copper-cable` · `copper-plate` · `duralumin` · `electronic-circuit` ·
`engine-unit` · `glass` · `intermetallics` · `iron-gear-wheel` · `iron-plate` · `lab` · `pipe` · `pump` ·
`shaft-mk01` · `small-lamp` · `small-parts-01` · `soil` · `steam-engine` · `steel-plate` ·
`stone-brick` · `treated-wood` · `wood`

### Direct build bill

Summed across all 12 building types, including the recommended `auog-food-01` pad and one `py-gas-vent`:

| item | qty | | item | qty |
|---|--:|---|---|--:|
| **soil** | 20,500 | | **duralumin** | **730** |
| glass | 6,470 | | `inductor1` (standalone) | 564 |
| **treated-wood** | 3,150 | | aluminium-plate | 410 |
| iron-plate | 3,055 | | tin-plate | 400 |
| stone-brick | 1,905 | | **intermetallics** | **327** |
| small-parts-01 | 1,655 | | pipe · limestone | 200 · 200 |
| **electronic-circuit** | **1,695** | | steam-engine | 173 |
| small-lamp | 1,260 | | steel-plate | 150 |
| | | | planter-box · titanium-plate | 30 · 30 |

**`ralesia-plantation-mk01` is 93 % of the circuits and all of the small-lamp.** Each is `small-lamp 20
+ steam-engine 1 + soil 300 + treated-wood 50 + intermetallics 5 + electronic-circuit 25 +
small-parts-01 15 + duralumin 10 + glass 100 + iron-plate 30`, times 63.

The `electronic-circuit` figure is 1,650 direct plus 45 inside `inserter` ×18 and
`electric-mining-drill` ×3. Add `inductor1` 1,695 more if the circuits are built here rather than drawn
from design 26, since `electronic-circuit-2` is 1:1 on inductors.

### Feasibility

**Everything is reachable — but `intermetallics` cascades.** All three items flagged in earlier revisions
have unlocked producers:

```
duralumin-1      [U] [py-rawores-smelter,  4 s]  aluminium-plate 4 + copper-plate 2  →  1
intermetallics   [U] [advanced-foundry,   15 s]  fenxsb-alloy 1 + vitreloy 1  →  1
fenxsb-alloy-2   [U] [py-rawores-smelter, 20 s]  nexelit-plate 2 + sb-oxide 1 + iron-plate 7  →  2
vitreloy         [U] [py-rawores-smelter, 10 s]  sb-oxide 3 + duralumin 3 + nickel-plate 3
                                                 + titanium-plate 3 + copper-plate 3  →  2
```

**`titanium-plate` is not a concern** — design 19 exports **0.575/s**, so even the cascaded 521 total is
~15 minutes of it. That item was wrongly flagged as unknown in an earlier revision of this file.

**327 intermetallics pulls in a second tier** that appears in no flow table here:
**`nexelit-plate` 327 · `sb-oxide` 655 · `nickel-plate` 491**, plus **491 more duralumin** (total
**1,221**, i.e. `aluminium-plate` ~4,884 and `copper-plate` ~2,442) and 491 more titanium-plate.
**`sb-oxide` is the antimony oxide already discussed as an import**; `nexelit-plate` and `nickel-plate`
are the genuinely open ones. Inferred from the recipe graph, not from save state.

**`treated-wood` 3,150 is the schedule item** — design 25 makes 0.12/s, ~7.3 hours of that block's
output, so it wants its own run or a buffer rather than being drawn live.

**`soil` 20,500 is self-supplied** — this block makes 10.63/s, about 32 minutes of its own production.
**Build the six soil extractors first.**
