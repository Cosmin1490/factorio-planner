# 18 — Vrauks food — 0.225 vrauks-food-01/s, 39 buildings, 2,899 tiles

Feeds design 17's tier-2 paddocks and nothing else. Split out because it is a five-chain detour off
one recipe — the latex block has no other use for a fawogae plantation or a wood line, and keeping
them separate makes design 17's diff against design 01 readable.

```
vrauks-food-01  [U] [crafting-with-fluid, 10 s]
    cellulose 3 + agar 4 + wood-seeds 6 + fawogae 5 + moss 10 + tin-plate 1 + steam 100  →  4
```

## Block boundary

| class | items |
|---|---|
| **import — readily available** | water, tin-plate |
| **import — design 17** | steam @150 °C (it exports 57.50/s, this wants 28.13) |
| **import — other** | muddy-sludge, carbon-dioxide |
| **must-consume-internally** | cellulose, agar, wood-seeds, fawogae, fawogae-spore, moss, seaweed, limestone, wood, log, wood-seedling |
| **byproduct-exclude** | none — vrauks-food-01 is the only output |

## Recipe table

```
┌──────────────────────┬─────────────────────────┬───────┬───────┬────────┬───────┬─────────┬───────────────┐
│ Recipe               │ Factory                 │  frac │ Count │  Util  │ Size  │ MW load │ Modules       │
├──────────────────────┼─────────────────────────┼───────┼───────┼────────┼───────┼─────────┼───────────────┤
│ Moss-1               │ moss-farm-mk01          │ 9.617 │  10   │  96.2% │ 6x6   │   0.96  │ 15x moss      │
│ fawogae-1            │ fawogae-plantation-mk01 │ 8.036 │   9   │  89.3% │ 6x6   │   1.61  │ 10x fawogae   │
│ seaweed-1            │ seaweed-crop-mk01       │ 5.625 │   6   │  93.8% │ 13x13 │   2.53  │ 10x seaweed   │
│ log2                 │ fwf-mk01                │ 2.483 │   3   │  82.8% │ 15x15 │   1.12  │ 10x tree-mk01 │
│ cellulose-00         │ hpf                     │ 1.688 │   2   │  84.4% │ 7x7   │   3.38  │               │
│ extract-limestone-01 │ soil-extractor-mk01     │ 1.688 │   2   │  84.4% │ 7x7   │   0.68  │               │
│ agar                 │ hpf                     │ 1.125 │   2   │  56.3% │ 7x7   │   2.25  │               │
│ fawogae-spore        │ spore-collector-mk01    │ 0.965 │   1   │  96.5% │ 7x7   │   0.14  │               │
│ wood-seedling        │ botanical-nursery       │ 0.828 │   1   │  82.8% │ 7x7   │   0.10  │               │
│ vrauks-food-01       │ automated-factory-mk01  │ 0.563 │   1   │  56.3% │ 7x7   │   1.13  │               │
│ wood-seeds           │ automated-factory-mk01  │ 0.474 │   1   │  47.4% │ 7x7   │   0.95  │               │
│ log-wood-fast        │ wpu-mk01                │ 0.042 │   1   │   4.2% │ 6x6   │   0.02  │               │
└──────────────────────┴─────────────────────────┴───────┴───────┴────────┴───────┴─────────┴───────────────┘
```

**39 buildings · 2,899 tiles · 14.86 MW electric** *(load-weighted; installed capacity is 20.43 MW)*

**`cellulose-00` and `agar` are both category `hpf` — 4 machines doing 2.813 fracs.** Switched onto
three shared `hpf` they fit with 94 % util, saving a building and 2.00 MW of installed draw. The same
trick does nothing for `vrauks-food-01` + `wood-seeds`: both run on `automated-factory-mk01` but
0.563 + 0.474 = 1.037, which still rounds to the two machines already there.

**`log-wood-fast` at 4.2 % is the block's one silly row** — a 6×6 `wpu-mk01` doing 1 s of work per
24 s. It is correct to leave it (nothing else runs `wpu-handcrafting` here), but it is the first
thing to fold into a shared machine if this block ever sits next to another wood line.

**Inputs** (/s): water 81.07, steam 28.13, muddy-sludge 9.62, carbon-dioxide 9.62, tin-plate 0.056

**Byproducts**: none. `vrauks-food-01` 0.225/s is the sole output.

**Only one solid crosses the fence.** `tin-plate` at 0.056/s is an iron chest (32 × 100) every
**15.8 hours** — this block is hand-feedable indefinitely on its item side, and everything else
arrives by pipe.

## Intermediate flows

```
┌───────────────┬─────────┬──────────────────────┬──────────────────────────────────────┐
│ Item          │ Rate /s │ Producer             │ Consumer                             │
├───────────────┼─────────┼──────────────────────┼──────────────────────────────────────┤
│ wood          │    1.65 │ log-wood-fast        │ cellulose-00 1.18, wood-seeds 0.47   │
│ seaweed       │    1.13 │ seaweed-1            │ agar 1.13                            │
│ moss          │    0.77 │ Moss-1               │ vrauks-food-01 0.56, wood-seedling 0.21 │
│ limestone     │    0.68 │ extract-limestone-01 │ cellulose-00 0.68                    │
│ wood-seeds    │    0.38 │ wood-seeds           │ vrauks-food-01 0.34, wood-seedling 0.04 │
│ fawogae       │    0.28 │ fawogae-1            │ vrauks-food-01 0.28                  │
│ agar          │    0.225│ agar                 │ vrauks-food-01 0.225                 │
│ cellulose     │    0.17 │ cellulose-00         │ vrauks-food-01 0.17                  │
│ log           │    0.17 │ log2                 │ log-wood-fast 0.17                   │
│ wood-seedling │    0.12 │ wood-seedling        │ log2 0.12                            │
│ fawogae-spore │    0.12 │ fawogae-spore        │ fawogae-1 0.12                       │
└───────────────┴─────────┴──────────────────────┴──────────────────────────────────────┘
```

Two internal loops: `wood-seeds → wood-seedling → log2 → log → wood → wood-seeds`, and the
fawogae spore cycle. Both are net-positive and need no import.

## Terminal outputs

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| vrauks-food-01 | 0.225 | **design 17** (`vrauks-2` 2/craft, `vrauks-cocoon-2` 1/craft) | — it is the product | — |

Nothing else leaves the block.

## Risks

1. **Three rows above 93 % with no pad** — `fawogae-spore` 96.5 %, `Moss-1` 96.2 %, `seaweed-1`
   93.8 %. The spore collector is the sharpest: **one 7×7 machine at 96.5 %**, and it is the sole
   feed for all nine fawogae plantations — lose it and a quarter of the block idles as soon as the
   spore buffer drains. A second one is 49 tiles and 0.15 MW.
2. **Two internal loops, both single-threaded.** `wood-seeds → wood-seedling → log2 → log → wood →
   wood-seeds` runs through `wood-seedling` (1 machine, 82.8 %) and `log-wood-fast` (1 machine);
   the fawogae cycle through `fawogae-spore` (1 machine). Neither loop has a buffer in the design,
   so a stall anywhere in a loop drains it rather than just pausing it. Seed both with a chest.
3. **The flower banks are 25 of 39 buildings.** `Moss-1` 10 + `fawogae-1` 9 + `seaweed-1` 6 = 64 %
   of the block and 1,698 of its 2,899 tiles, for 5.1 MW. If any of the three ever becomes available
   as an import, take it — see the ladder below.
4. **Steam is an external dependency with no local source.** 28.13/s, and nothing in this block
   makes steam. If design 17 is down this block is down (§ Steam ties to design 17).

## Fallback ladder

| config | buildings | tiles | MW | imports |
|---|--:|--:|--:|---|
| **as designed** | **39** | **2,899** | **14.86** | water, steam, muddy-sludge, CO₂, tin-plate |
| import `moss` 0.77/s | 29 | 2,539 | 13.90 | **drops muddy-sludge and CO₂**, adds moss |
| + import `fawogae` 0.28/s | 19 | 2,166 | 12.15 | adds fawogae *(`fawogae-spore` falls out with it)* |
| + import `seaweed` 1.13/s | 13 | 1,152 | 9.62 | adds seaweed |
| import `vrauks-food-01` outright | **0** | **0** | **0** | food 0.225/s → add to design 17 |

**The first rung is the best one.** `Moss-1` is `100 muddy-sludge + 100 CO₂ → 8 moss` and it is the
*only* consumer of either, so importing moss removes ten buildings and two import lanes at once and
leaves just water, steam, tin-plate and moss crossing the fence.

The `hpf` share (above) composes with any rung and takes one more building off each.

Rates for the import rungs are read off the intermediate table; building, tile and MW figures are
arithmetic on the row table, not separate solves.

## Why this is a separate block and not an import

Importing the food costs nothing in buildings and is the right call at small scale — design 15 does
exactly that with `auog-food-01`. It is built here because design 17's tier-2 paddocks are the only
consumer and the rate is fixed by them, so there is no sharing to be had either way.

The bill is 39 buildings for 0.225 food/s, of which **9 fawogae plantations and 10 Moss-1 farms are
the bulk**. If you have a food source already, skip this file and add `vrauks-food-01 0.225/s` to
design 17's import list.

## Steam ties to design 17

`agar` takes 100 steam per craft and `vrauks-food-01` another 100 — 28.13/s between them. Design 17
exports **57.50/s at 150 °C** from `polybutadiene`, and both recipes here have **no
`minimum_temperature`** on their steam, so it feeds straight across with 29.37/s left over.

## Build gotchas

- **Bio modules are not optional.** `moss-farm-mk01` is speed 0.0625 bare and `fawogae-plantation-mk01`
  similar; without modules both banks multiply. All three module types here are self-funding.
- **`Moss-1` over `Moss-2`** to match design 01 and 17 — no stone. Moss-2 would be 4 farms instead
  of 10 but wants 20 stone per craft.
- `cellulose-00` (wood 7 + limestone 4 → 1) was chosen over `cellulose-02` (wood 10 +
  sodium-hydroxide 3 → 2). `cellulose-02` is half the buildings but needs sodium-hydroxide, whose
  only unlocked route is the `chlorine` electrolyzer — which produces 20 chlorine per 2
  sodium-hydroxide, and chlorine is on the never-vent list. Not worth opening.
- `log-wood-fast` over `log-wood`: design 01 uses `log-wood` on the same `wpu-mk01`. Either works;
  this picks the faster one since the block is wood-light.

## Solver command

```bash
npx tsx src/cli.ts solve \
  --recipes "vrauks-food-01,cellulose-00,agar,wood-seeds,fawogae-1,fawogae-spore,log2,log-wood-fast,wood-seedling,seaweed-1,Moss-1,extract-limestone-01" \
  --target "vrauks-food-01:13.5" --time 60 \
  --factory "vrauks-food-01:automated-factory-mk01" \
  --factory "cellulose-00:hpf" \
  --factory "agar:hpf" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "fawogae-1:fawogae-plantation-mk01" \
  --factory "fawogae-spore:spore-collector-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --modules "seaweed-1:seaweed:10" \
  --modules "fawogae-1:fawogae:10" \
  --modules "log2:tree-mk01:10" \
  --modules "Moss-1:moss:15" \
  --solver simplex \
  --unlocked
```

**Re-verified against a fresh export.** The command above reproduces 39 buildings, 14.86 MW and
13.50 vrauks-food-01/60 s exactly. Fracs come from the same command at `--target
"vrauks-food-01:13500"`, counts divided by 1000 — no float-ceiling artifacts appeared (every row's
`ceil(frac)` matches the direct run).

For design 17's 13-paddock or 16-paddock variants, retarget to `vrauks-food-01:12` (0.20/s, 35
buildings) or `vrauks-food-01:14.75` (0.246/s) respectively.

The solver warns `moss`, `seaweed`, `fawogae` and `tree-mk01` are "not unlocked" — export data
limitation; all are available in-game.

## Build materials

Distinct construction materials across this block's 10 building types, separate from flow imports:

`aluminium-plate` · `burner-mining-drill` · `copper-plate` · `electronic-circuit` · `gearbox-mk01` ·
`glass` · `inductor1` · `inserter` · `intermetallics` · `iron-plate` · `limestone` · `log` · `pipe` ·
`shaft-mk01` · `small-parts-01` · `soil` · `steam-engine` · `steel-plate` · `stone-brick` ·
`tin-plate` · `wood`

Every building type here already appears in the existing design catalogue — `fawogae-plantation-mk01`
and `spore-collector-mk01` in design 07, the rest in designs 01 and 06. Inferred from the catalogue,
not from save state.
