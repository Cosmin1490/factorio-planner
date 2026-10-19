# 20 — Lead mining + grading — 3.00 lead-plate/s, 14 buildings

Same upgrade as design 19, applied to lead: mk02 drills, one grading step, gas smelters. The
ore-to-plate ratio goes **6.0 → 2.0**, a clean 3× with no losses anywhere in the chain.

```
lead-plate-1  [U] [smelting, 10 s]  ore-lead 6      →  lead-plate 1     6.0 ore/plate
grade-1-lead  [U] [screener,  3 s]  ore-lead 5      →  grade-1-lead 1
lead-plate-2  [U] [smelting, 40 s]  grade-1-lead 4  →  lead-plate 10    2.0 ore/plate
```

Unlike titanium, **`grade-1-lead` has no byproduct and there is no recycle** — the deeper tiers
(`grade-2-lead-crusher`, `grade-2-lead`, `grade-2-crush-lead`) are all locked. So no stone, no
gravel, and nothing to close internally. Re-price when they open.

## Block boundary

| class | items |
|---|---|
| **import** | acetylene (mining fluid **and** steel-furnace fuel), electricity |
| **mined in-block** | ore-lead — `fluid-drill-mk02` on the patch |
| **must-consume-internally** | grade-1-lead |
| **byproduct-exclude** | none — there are no byproducts |

## Recipe table

```
┌──────────────┬─────────────────────────┬───────┬──────┬─────────┐
│ Recipe       │ Factory                 │ Count │ Size │ MW each │
├──────────────┼─────────────────────────┼───────┼──────┼─────────┤
│ (mining)     │ fluid-drill-mk02        │     6 │ 5x5  │    0.90 │
│ grade-1-lead │ automated-screener-mk01 │     4 │ 7x7  │    0.30 │
│ lead-plate-2 │ steel-furnace           │     4 │ 2x2  │  (gas)  │
└──────────────┴─────────────────────────┴───────┴──────┴─────────┘
```

**14 buildings · 6.60 MW electric** — 5.40 drills + 1.20 screeners. ~362 tiles of building.

**Inputs** (/s): **acetylene 77.91** — 60.00 mining fluid + 17.91 steel-furnace fuel

**Exports** (/s): **lead-plate 3.00**. Nothing else leaves the block.

## Intermediate flows

```
┌──────────────┬─────────┬─────────────────────────┬────────────────────┐
│ Item         │ Rate /s │ Producer                │ Consumer           │
├──────────────┼─────────┼─────────────────────────┼────────────────────┤
│ ore-lead     │    6.00 │ 6x fluid-drill-mk02     │ grade-1-lead 6.00  │
│ grade-1-lead │    1.20 │ grade-1-lead 1.20       │ lead-plate-2 1.20  │
└──────────────┴─────────┴─────────────────────────┴────────────────────┘
```

Two steps, one intermediate. This is the simplest block in the catalogue.

## Utilisation

| | placed | fractional | load |
|---|--:|--:|--:|
| grade-1-lead | 4 | 3.60 | 90 % |
| steel-furnace | 4 | 2.98 | 75 % |

The solver reports 4 furnaces; **3 covers the demand at 100 % load** (0.30 crafts/s × 10 s effective
= 3.00 exactly). Four is the safer placement — pick 3 only if you want the margin elsewhere.

## Acetylene — the dominant cost

```
mining         ore-lead fluid_amount 100 ÷ 10  =  10 acetylene per ore
steel-furnace  6.00 MW ÷ 1.00 MJ/unit          =   6 acetylene/s at full load
```

| | mining | furnace | total | per plate |
|---|--:|--:|--:|--:|
| **this design** | 60.00 | 17.91 | **77.91 /s** | **26.0** |
| old route, same ore | 30.00 | — | 30.00 /s | 60.0 |

**Lead is 5× the acetylene draw per drill that titanium is** — `fluid_amount 100` against titanium's
40, *and* `mining_time 1` against titanium's 2, so each mk02 drill mines 1.0 ore/s here versus 0.50
there. Both factors compound.

Per plate the grading chain still halves it: **60.0 → 26.0**.

### Combined with design 19

```
design 19  titanium  6× mk02   14.16 /s
design 20  lead      6× mk02   77.91 /s
                                ───────
                                92.07 /s
```

That is **23 % of design 13's acetylene at `r=0`** (391.5/s) — comfortable off copy 1 today. But a
copy-2 sized to supply it needs **`r ≈ 0.84`**, not the `r ≈ 0.975` an earlier sizing assumed, and
that costs roughly 10 % of its aromatics (99.8 → ~89/s). Derived from design 13's recursion, not
re-solved.

**The 3-drill variant halves the problem**: 3× mk02 is 7 buildings — *four fewer than the current
setup* — at 3.00 ore/s, **1.50 lead-plate/s**, 3.30 MW and **38.9 acetylene/s**. Still triple
today's plate, and it keeps the combined two-outpost draw at 53/s instead of 92/s.

## Against what it replaces

| | 6× mk01 + `lead-plate-1` | this design |
|---|--:|--:|
| buildings | 11 | 14 |
| ore-lead | 3.00 /s | 6.00 /s |
| **lead-plate** | **0.50 /s** | **3.00 /s** |
| electric | 2.40 MW | 6.60 MW |
| acetylene | 30.0 /s | 77.9 /s |
| coal in · ash out | 0.25 · 0.25 /s | — |
| **MW per plate/s** | 4.8 | **2.2** |
| **acetylene per plate** | **60.0** | **26.0** |

**Six times the plate for three more buildings.** Power per plate more than halves here (unlike
titanium, where it was flat) because the five stone furnaces are replaced by four gas ones that draw
no electricity at all. Coal and ash leave with them.

## Build gotchas

- **The solver's MW figure counts `steel-furnace` as electric.** It is a fluid burner
  (`fluid_energy_source`, `burns_fluid = true`, effectivity 1). The 19.08 MW it reports is
  1.20 MW of screeners plus 17.91 MW of acetylene; real electric is 6.60 MW including drills.
- `ore-lead` has `required_fluid = acetylene, fluid_amount = 100`. Per the 10× prototype quirk that
  is **10 per ore**, not 100.
- Drill rate is `mining_speed ÷ mining_time`: mk02 on lead is `1 ÷ 1` = **1.00 ore/s**, double what
  the same drill does on titanium. `fluid-drill-mk03`/`-mk04` are locked.
- **`fluid-drill-mk02` consumes `fluid-drill-mk01 ×1`** each, so your six existing drills are exactly
  the feedstock for six mk02s — but design 19 wants six as well. Twelve mk01 are needed to upgrade
  both outposts, or stage them.
- `lead-plate-3` (casting, 50 plate per craft) is locked and would beat this again by a wide margin.

## Solver command

Input mode, supply-driven off a fixed drill count. The six drills and the acetylene are computed
manually — the solver models neither mining nor fluid-burner fuel.

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-1-lead,lead-plate-2" \
  --input "ore-lead:6.0" --time 1 \
  --factory "grade-1-lead:automated-screener-mk01" \
  --factory "lead-plate-2:steel-furnace" \
  --solver simplex \
  --unlocked
```

The 3-drill variant is the same command with `--input "ore-lead:3.0"`.

## Build materials

Distinct construction materials across this block's 3 building types, separate from flow imports:

`aluminium-plate` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `iron-plate` · `refined-concrete` · `small-parts-01` · `steel-plate`

Same set as design 19 minus the crusher materials. The binding items are **`fluid-drill-mk01` ×6**
(consumed by the mk02 upgrade) and **`refined-concrete`** for the steel furnaces. Inferred from the
recipe graph, not from save state.
