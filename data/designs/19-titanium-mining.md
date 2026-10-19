# 19 — Titanium mining + grading — 0.58 titanium-plate/s, 12 buildings

Replaces direct ore smelting with the grading chain and a gas smelter. The ore-to-plate ratio goes
**10.0 → 5.22**, and acetylene per plate drops **39 %** — which is the number that matters, since
acetylene is the mining fluid and is about to get scarce.

```
titanium-plate-1  [U] [smelting, 60 s]   ore-titanium 40  →  titanium-plate 4     10.0 ore/plate
titanium-plate-2  [U] [smelting, 25 s]   grade-3-ti 5     →  titanium-plate 10     5.22 ore/plate
```

Both recycles in the grading chain are unlocked and both matter: without them the ratio is 6.67,
not 5.22.

## Block boundary

| class | items |
|---|---|
| **import** | acetylene (mining fluid **and** steel-furnace fuel), electricity |
| **mined in-block** | ore-titanium — `fluid-drill-mk02` on the patch |
| **must-consume-internally** | grade-1-ti, grade-2-ti, grade-3-ti, ti-rejects |
| **byproduct-exclude** | none |

## Recipe table

```
┌────────────────────┬─────────────────────────┬───────┬──────┬─────────┐
│ Recipe             │ Factory                 │ Count │ Size │ MW each │
├────────────────────┼─────────────────────────┼───────┼──────┼─────────┤
│ (mining)           │ fluid-drill-mk02        │     6 │ 5x5  │    0.90 │
│ grade-1-ti         │ automated-screener-mk01 │     2 │ 7x7  │    0.30 │
│ grade-2-ti-crush   │ jaw-crusher             │     1 │ 7x7  │    1.00 │
│ grade-3-ti         │ automated-screener-mk01 │     1 │ 7x7  │    0.30 │
│ ti-rejects-recrush │ secondary-crusher-mk01  │     1 │ 7x7  │    0.45 │
│ titanium-plate-2   │ steel-furnace           │     1 │ 2x2  │  (gas)  │
└────────────────────┴─────────────────────────┴───────┴──────┴─────────┘
```

**12 buildings · 7.23 MW electric** — 5.40 drills + 1.83 process. ~400 tiles of building.

**Inputs** (/s): **acetylene 14.16** — 12.00 mining fluid + 2.16 steel-furnace fuel

**Byproducts** (/s): stone 0.30, gravel 0.13

## Intermediate flows

```
┌──────────────┬─────────┬──────────────────────────────────────┬────────────────────────┐
│ Item         │ Rate /s │ Producer                             │ Consumer               │
├──────────────┼─────────┼──────────────────────────────────────┼────────────────────────┤
│ ore-titanium │    3.00 │ 6x fluid-drill-mk02                  │ grade-1-ti 3.00        │
│ grade-1-ti   │    0.75 │ grade-1-ti 0.60 + grade-2-ti-crush 0.15 │ grade-3-ti 0.75     │
│ grade-2-ti   │    0.30 │ grade-1-ti 0.30                      │ grade-2-ti-crush 0.30  │
│ grade-3-ti   │    0.29 │ grade-3-ti 0.25 + recrush 0.04       │ titanium-plate-2 0.29  │
│ ti-rejects   │    0.13 │ grade-3-ti 0.13                      │ ti-rejects-recrush 0.13│
└──────────────┴─────────┴──────────────────────────────────────┴────────────────────────┘
```

`grade-2-ti-crush` returns 20 % of the grade-1 supply; `ti-rejects-recrush` returns 13 % of the
grade-3 supply. Both close internally — no grade-tier item leaves the block.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| titanium-plate | 0.58 | the product | — | — |
| stone | 0.30 | **export** — offsets stone mining | 0 | mining it, which is the thing this replaces |
| gravel | 0.13 | **export** — feeds `gravel-to-sand` → concrete | 0 | `gravel` has no disposal problem; it is wanted |

Both byproducts are wanted, so neither needs a void path.

## Utilisation

| | placed | fractional | load |
|---|--:|--:|--:|
| **grade-1-ti** | 2 | 1.80 | **90 %** |
| **grade-2-ti-crush** | 1 | 0.90 | **90 %** |
| grade-3-ti | 1 | 0.75 | 75 % |
| ti-rejects-recrush | 1 | 0.375 | 38 % |
| steel-furnace | 1 | 0.359 | 36 % |

The `grade-1-ti` screener and the jaw-crusher bind first — a seventh drill needs another of each.
The furnace is speed 4 against a 25 s recipe, so it covers **16 mk02 drills** before a second is
needed.

## Acetylene

```
mining         ore-titanium fluid_amount 40 ÷ 10  =  4 acetylene per ore
steel-furnace  6.00 MW ÷ 1.00 MJ/unit             =  6 acetylene/s at full load
```

| | mining | furnace | total | per plate |
|---|--:|--:|--:|--:|
| **this design** | 12.00 | 2.16 | **14.16 /s** | **24.6** |
| old route, same ore | 12.00 | — | 12.00 /s | 40.0 |

**The gas smelter is 15 % of the draw.** Mining fluid is the cost, and it scales with *ore*, not
with plate — so the grading chain buys back far more acetylene per plate than the smelter spends.

Note for design 13 planning: if copy 1's acetylene block is deleted in the powerplant upgrade, this
block alone wants **14.16/s** from whatever replaces it. An earlier sizing used design 07's 5.88/s
figure for mining fluid; that is 2.5× too small once these drills exist.

## Against what it replaces

| | 6× mk01 + `titanium-plate-1` | this design |
|---|--:|--:|
| buildings | 9 | 12 |
| ore-titanium | 1.50 /s | 3.00 /s |
| **titanium-plate** | **0.150 /s** | **0.575 /s** |
| electric | 2.40 MW | 7.23 MW |
| acetylene | 6.00 /s | 14.16 /s |
| coal in · ash out | 0.11 · 0.11 /s | — |
| stone · gravel out | — | 0.30 · 0.13 /s |
| **MW per plate/s** | 16.0 | **16.3** |
| **acetylene per plate** | **40.0** | **24.6** |

Power per plate is flat — the electric increase is proportional to output, not a premium for the
chain. Coal and ash leave the picture with the stone furnaces.

An intermediate step exists if the acetylene is not available yet: **3× mk02 + the same grading
chain** is 8 buildings (one *fewer* than today), 1.50 ore/s, **0.288 plate/s**, 4.70 MW and
7.08 acetylene/s. Same ore rate as now, nearly double the plate. It consumes 3 of your 6 mk01
drills as feedstock (the mk02 recipe takes `fluid-drill-mk01 ×1` each), leaving 3 spare.

## Build gotchas

- **The solver reports 3.99 MW for the process, which is wrong** — it counts `steel-furnace`'s
  6.00 MW as electric. It is a fluid burner (`fluid_energy_source`, `burns_fluid = true`,
  effectivity 1). Real process electric is 1.83 MW; the balance is the acetylene above.
- `secondary-crusher` is not a factory name — use **`secondary-crusher-mk01`**.
- `ore-titanium` has `required_fluid = acetylene, fluid_amount = 40`. Per the 10× prototype quirk
  that is **4 per ore**, not 40.
- Drill rate is `mining_speed ÷ mining_time`: mk02 is `1 ÷ 2` = **0.50 ore/s**, mk01 is 0.25.
  `fluid-drill-mk03` and `-mk04` are locked.
- `titanium-plate-4` (grade-4-ti via ball-mill) and `titanium-plate-3` (casting) are both locked and
  would beat this again — worth re-pricing when either opens.

## Solver command

Input mode, since the block is supply-driven off a fixed drill count. The six drills and the
acetylene are computed manually — the solver models neither mining nor fluid-burner fuel.

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-1-ti,grade-2-ti-crush,grade-3-ti,ti-rejects-recrush,titanium-plate-2" \
  --input "ore-titanium:3.0" --time 1 \
  --factory "grade-1-ti:automated-screener-mk01" \
  --factory "grade-2-ti-crush:jaw-crusher" \
  --factory "grade-3-ti:automated-screener-mk01" \
  --factory "ti-rejects-recrush:secondary-crusher-mk01" \
  --factory "titanium-plate-2:steel-furnace" \
  --solver simplex \
  --unlocked
```

The 3-drill variant is the same command with `--input "ore-titanium:1.5"`.

## Build materials

Distinct construction materials across this block's 5 building types, separate from flow imports:

`aluminium-plate` · `duralumin` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `iron-plate` · `refined-concrete` · `small-lamp` · `small-parts-01` ·
`steam-engine` · `steel-plate`

Two to check before starting: **`fluid-drill-mk02` is built from `fluid-drill-mk01`** plus
`engine-unit` and `aluminium-plate`, so the six mk01 drills you already have are the feedstock for
the upgrade rather than scrap. And `steel-furnace` needs `refined-concrete`. Both inferred from the
recipe graph, not from save state.
