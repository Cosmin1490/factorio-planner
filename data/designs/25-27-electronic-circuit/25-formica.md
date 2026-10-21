# 25 — Formica — 0.40 formica/s, 166 buildings

The pulp half of the electronic-circuit chain, split out as its own block. Feeds **design 26**
(`pcb1`) and nothing else. Three imports, one export, no chemistry.

```
formica        [U] [pulp, 10 s]  treated-wood 2 + saps 10 + raw-fiber 5 + methanal 50  →  formica 1
treated-wood   [U] [tar,   2 s]  wood 1 + creosote 100                                 →  treated-wood 2
fiber-01       [U] [wpu,  10 s]  wood 10                                               →  raw-fiber 2
sap-01         [U] [sap-extractor, 80 s]  (no ingredients)                             →  saps 4
methanal       [U] [hpf,   4 s]  copper-plate 5 + methane 60                           →  methanal 50
```

**Why `formica` and not `formica-2`.** `formica-2` needs `melamine-resin` (urea) and `fiberboard`,
whose `sodium-hydroxide` emits **chlorine at 10 per NaOH** — never-ventable, with only two unlocked
consumers that each destroy something else to absorb it. Route 1 avoids it, at the cost of 6.7× the
creosote (treated-wood 2 per formica 1, against `formica-2`'s 5-per-craft yield through fiberboard).

## Block boundary

| class | items |
|---|---|
| **import** | creosote, water, copper-plate |
| **export** | formica — to design 26 |
| **made in-block** | wood, log, wood-seedling, wood-seeds, moss, muddy-sludge, soil, saps, raw-fiber, treated-wood, methanal, methane, moondrop, moondrop-seeds, CO₂ |
| **byproduct-exclude** | none — the block has no byproducts at all |

**Independent apart from the formica handoff.** The tree farm, the sap field, the moondrop plant and
the moss that feeds the seedlings are all local; nothing crosses except the product.

## Recipe table

Bio counts are **module-corrected**. The solver reports base crafting speed, a 3–17× error;
multipliers from solver-reference § Bio module system, all reaching effective speed 1.0.

```
┌────────────────┬──────────────────────────┬───────┬───────┬────────┬────────┐
│ Recipe         │ Factory                  │ Count │ Size  │ MW ea  │ load   │
├────────────────┼──────────────────────────┼───────┼───────┼────────┼────────┤
│ formica        │ pulp-mill-mk01           │     4 │ 5x5   │   0.15 │ 100 %  │
│ treated-wood   │ tar-processing-unit      │     1 │ 11x11 │   0.50 │  80 %  │
│ fiber-01       │ wpu-mk01                 │    10 │ 6x6   │   0.50 │ 100 %  │
│ log-wood-fast  │ wpu-mk01                 │     1 │ 6x6   │   0.50 │  27 %  │
│ methanal       │ hpf                      │     2 │ 7x7   │   2.00 │  80 %  │
│ wood-seedling  │ botanical-nursery        │     6 │ 7x7   │   0.13 │  90 %  │
│ moondrop-seeds │ botanical-nursery        │     1 │ 7x7   │   0.13 │  24 %  │
│ wood-seeds     │ automated-factory-mk01   │     1 │ 7x7   │   2.00 │  34 %  │
│ muddy-sludge   │ washer                   │     1 │ 6x6   │   0.40 │  67 %  │
│ soil           │ soil-extractor-mk01      │     1 │ 5x5   │   0.30 │  84 %  │
├────────────────┼──────────────────────────┼───────┼───────┼────────┼────────┤
│ sap-01         │ sap-extractor-mk01       │  *80  │ 5x5   │   0.15 │ 100 %  │
│ log2           │ fwf-mk01                 │  *17  │ 15x15 │   0.45 │  95 %  │
│ Moss-1         │ moss-farm-mk01           │  *17  │ 6x6   │   0.10 │  99 %  │
│ moondrop-1     │ moondrop-greenhouse-mk01 │  *13  │ 9x9   │   0.45 │  97 %  │
│ methane-co2    │ moondrop-greenhouse-mk01 │   *9  │ 9x9   │   0.45 │ 100 %  │
│ moondrop-co2   │ moondrop-greenhouse-mk01 │   *2  │ 9x9   │   0.45 │  96 %  │
└────────────────┴──────────────────────────┴───────┴───────┴────────┴────────┘
   * module-corrected. Solver base counts: 240 / 178 / 269 / 213 / 153 / 33
     multipliers:        3x  /  11x /  16x /  17x /  17x / 17x
```

**166 buildings · ~9,080 tiles · 42.75 MW electric**

**121 of the 166 buildings are the sap field and the tree farm** (80 `sap-extractor` + 17 `fwf` + 17
`moss-farm` + the nurseries). The FWF bank alone is **3,825 tiles**, the sap field 2,000, the moondrop
plant 1,944 — this is a farm with a three-building chemical tail, not a factory.

**Inputs** (/s): **creosote 40.00** · water 330.61 · copper-plate 2.00

**Exports** (/s): **formica 0.40**

**No byproducts.** Nothing leaves this block but the product.

## Intermediate flows

```
┌────────────────┬──────────┬────────────────────────┬────────────────────────────────────────────────┐
│ Item           │ Rate /s  │ Producer               │ Consumer                                       │
├────────────────┼──────────┼────────────────────────┼────────────────────────────────────────────────┤
│ treated-wood   │    0.80  │ treated-wood           │ formica 0.80                                   │
│ saps           │    4.00  │ sap-01                 │ formica 4.00                                   │
│ raw-fiber      │    2.00  │ fiber-01               │ formica 2.00                                   │
│ methanal       │   20.00  │ methanal               │ formica 20.00                                  │
│ methane        │   24.00  │ methane-co2            │ methanal 24.00                                 │
│ wood           │   10.74  │ log-wood-fast          │ fiber-01 10.00, treated-wood 0.40,             │
│                │          │                        │   wood-seeds 0.34                              │
│ log            │    1.07  │ log2                   │ log-wood-fast 1.07                             │
│ wood-seedling  │    0.81  │ wood-seedling          │ log2 0.81                                      │
│ wood-seeds     │    0.27  │ wood-seeds             │ wood-seedling 0.27                             │
│ moss           │    1.34  │ Moss-1                 │ wood-seedling 1.34                             │
│ muddy-sludge   │   16.77  │ muddy-sludge           │ Moss-1 16.77                                   │
│ soil           │    1.68  │ soil                   │ muddy-sludge 1.68                              │
│ carbon-dioxide │   76.77  │ moondrop-co2           │ methane-co2 60.00, Moss-1 16.77                │
│ moondrop-seeds │    0.96  │ moondrop-seeds         │ methane-co2 0.60, moondrop-1 0.36              │
│ moondrop       │    0.36  │ moondrop-1             │ moondrop-seeds 0.36    ← closed loop            │
└────────────────┴──────────┴────────────────────────┴────────────────────────────────────────────────┘
```

**Two things make this block self-contained.** `moondrop-co2` takes **no ingredients at all**, so CO₂
is free and uncapped; and `soil` is `water 800 → soil 16`, so the moss chain needs no stone. Between
them the whole bio side runs on water.

**`moondrop → moondrop-seeds → moondrop` closes at 0.36/s** — self-sustaining once bootstrapped.

## Why there is a moondrop farm at all

`formica` needs **methanal 20.00/s**, and `methanal` has exactly one unlocked recipe
(`copper-plate 5 + methane 60`). Methane in turn has one unlocked route — `methane-co2` [moon]
`moondrop-seeds 1 + water 100 + CO₂ 100 → methane 40`. So **24 of the 166 buildings exist to make
24.00 methane/s for one ingredient**, and there is no way around it on either formica route.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **formica** | 0.40 | **design 26 `pcb1`** — stack 100, one solid station | — | nothing else consumes formica |

Formica has **1 consumer in the entire game**. It is a Tier D item that would never justify its own
block on consumer count (rule 16) — it is split out because the tree farm, sap field and moondrop
plant are 121 buildings of farm that have nothing to do with electronics, and keeping them separate
means design 26 is a 99-building block instead of a 259-building one.

## Bio modules — the real bootstrap

Every bio building needs its slots filled to reach effective speed 1.0. Two of the four items are
self-funding; two are not.

| building | ×count | module | needed | self-funding? |
|---|--:|---|--:|---|
| `moss-farm-mk01` | 17 | `moss` 15 | **255** | **yes** — `Moss-1` is its own product |
| `moondrop-greenhouse-mk01` | 24 | `moondrop` 16 | **384** | **yes** — `moondrop-1` runs here |
| `sap-extractor-mk01` | 80 | `sap-tree` 2 | **160** | **effectively** — see below |
| `fwf-mk01` | 17 | `tree-mk01` 10 | **170** | **effectively** |

```
sap-tree   [U] [nursery, 45 s]  planter-box 1 + sap-seeds 5   →  sap-tree 1
sap-seeds  [U] [nursery,  5 s]  saps 5                        →  sap-seeds 2
tree-mk01  [U] [nursery, 30 s]  planter-box 1 + wood-seedling 3 →  tree-mk01 1
planter-box       [U] [crafting, 2 s]  ash 3 + soil 5 + empty-planter-box 1  →  planter-box 1
empty-planter-box [U] [crafting, 1 s]  stone-brick 4 + wood 2 + iron-plate 1 →  empty-planter-box 1
```

**`sap-tree` and `tree-mk01` are paid for out of the block's own output**, which is the nice part:
160 sap-trees want **800 sap-seeds = 2,000 saps**, and the sap field makes 4.00/s, so it funds its own
modules in about **8 minutes of running at partial speed**. Likewise `tree-mk01` wants wood-seedling,
which the nurseries make. The chicken-and-egg resolves because unmoduled buildings still run, just at
3× and 11× slower.

**What is genuinely external is the planter-boxes: 330 of them**, costing one-time:

| item | one-time | source |
|---|--:|---|
| `stone-brick` | 1,320 | **import — not in the flow list** |
| `ash` | 990 | **import — this block burns nothing** |
| `iron-plate` | 330 | **import — not in the flow list** |
| soil · wood | 1,650 · 660 | made here |

Those three are capital, not flows, so they never appear in the solver output — a few chests off
design 12 or 24 covers all of it. **They are the easiest thing in this design to forget**, because
nothing in the recipe table or the import list mentions them.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **creosote 40.00/s** | `treated-wood 2` per formica and `creosote 100` per treated-wood 2. Design 10's structural floor is 31.75/s plus design 07's 2.45 — **this block alone exceeds the base's supply**, so `t ≈ 0.85` and the upstream must scale first. The only cap on the design |
| 2 | **moss 1.34/s** | feeds `wood-seedling`, which is the sole path to logs → wood → both `raw-fiber` and `treated-wood`. A moss outage stops everything downstream of it with a long lag, because the FWF bank is 60 s per craft |
| 3 | **the moondrop seed loop** | nets to zero at 0.36/s, so nothing refills it. Draining it stops methane → methanal → formica, and re-bootstrapping needs the codex route |
| 4 | copper-plate 2.00/s | throttles `methanal` only; the block scales down rather than stalling |

`t = min(sink_i / rate_i)` has only one terminal output, so the binding constraint is the **creosote
import at 0.85** — there is no byproduct in this block that can throttle it.

## Build notes

- **Never size the bio buildings without modules.** The solver's 1,114 is meaningless; the multipliers
  bring it to 166. `sap-extractor-mk01` 3× at 2 slots, `fwf-mk01` 11× at 10, `moss-farm-mk01` 16× at
  15, `moondrop-greenhouse-mk01` 17× at 16 — all reaching effective speed 1.0.
- **`log3` would halve the FWF bank** (40 s and 6 logs against `log2`'s 60 s and 4) for **ash ~5/s**.
  At 17 → 8 buildings that is **~2,000 tiles saved**, and the block already wants 990 ash for the
  planter-boxes, so an ash line may be worth running anyway.
- **Start this block first.** It carries the module bootstrap, which is wall-clock time rather than
  throughput, and 121 of its 166 buildings are farms. Design 26 cannot start until formica flows.
- **`sap-01` has no ingredients** — 80 extractors turning water-free, input-free saps at 4.00/s for
  0.15 MW each. It is 2,000 tiles of pure footprint and nothing else.
- The block is ~9,080 tiles, so it does not fit one 128×128 city block comfortably alongside stations.
  Split seam if needed: **sap field (2,000 t) · tree farm + moss (4,437 t) · moondrop plant (1,944 t) ·
  pulp tail (~700 t)**.

## Solver command

Target mode on the end product. No `--max-import`, no `--fuel`, no constraints — the block has a
single output and no byproducts, so there is nothing for the LP to game. Bio buildings are specified
at mk01 and **must be re-read with the module multipliers above**; the solver has no model of bio
modules.

```bash
npx tsx src/cli.ts solve \
  --recipes "formica,treated-wood,fiber-01,sap-01,methanal,methane-co2,moondrop-co2,moondrop-1,moondrop-seeds,log2,log-wood-fast,wood-seedling,wood-seeds,Moss-1,muddy-sludge,soil" \
  --target "formica:0.40" --time 1 \
  --factory "formica:pulp-mill-mk01" \
  --factory "treated-wood:tar-processing-unit" \
  --factory "fiber-01:wpu-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "methanal:hpf" \
  --factory "sap-01:sap-extractor-mk01" \
  --factory "methane-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "Moss-1:moss-farm-mk01" \
  --factory "muddy-sludge:washer" \
  --factory "soil:soil-extractor-mk01" \
  --solver simplex \
  --unlocked
```

It emits a cycle warning on `moondrop-seeds ↔ moondrop`. That loop is intentional and the solver zeroes
it correctly; do not add the suggested exclude.

## Build materials

Distinct construction materials across this block's 10 building types, separate from flow imports:

`boiler` · `burner-inserter` · `burner-mining-drill` · `concrete` · `copper-cable` · `copper-plate` ·
`electronic-circuit` · `engine-unit` · `fluid-drill-mk01` · `gasifier` · `gearbox-mk01` · `glass` ·
`inductor1` · `inserter` · `intermetallics` · `iron-plate` · `lab` · `pipe` · `pump` · `shaft-mk01` ·
`small-parts-01` · `steam-engine` · `steel-plate` · `stone-brick` · `stone-furnace` · `wood`

Beyond these, the **330 planter-boxes** above need `stone-brick` ×1,320, `ash` ×990 and `iron-plate`
×330 as one-time capital — see § Bio modules. Inferred from the recipe graph, not from save state.
