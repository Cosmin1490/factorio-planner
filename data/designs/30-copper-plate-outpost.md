# 30 — Copper plate outpost — 6.00 copper-plate/s at 2 yellow belts

Remote smelting. **Three inputs: copper-ore on belt, acetylene for the furnaces, electricity.** Nothing
else — `copper-ore` is `basic-solid`, so no mining fluid is involved.

```
grade-2-copper        [U] [screener, 3 s]  copper-ore 5      →  grade-1-copper 1 + grade-2-copper 2
grade-1-copper-crush  [U] [crusher,  3 s]  grade-1-copper 2  →  grade-2-copper 1 + stone 2
copper-plate-4        [U] [smelting, 2 s]  grade-2-copper 5  →  copper-plate 2
```

## Grade, don't smelt direct

Both routes are unlocked and the difference is large:

| route | per copper-ore | |
|---|--:|---|
| `copper-plate` — `copper-ore 8 → copper-plate 1` | **0.125** plate/ore | one building, terrible ratio |
| **grading chain** — `ore 5 → grade-2 2.5 → plate 1.0` | **0.200** plate/ore | **1.6× better** |

The grading route recovers the `grade-1-copper` fraction by crushing it back into `grade-2-copper`, which
is where the extra 60 % comes from — and it throws off **stone 2 per crush craft** as a bonus.

## Both sizes

| | **1 yellow belt** | **2 yellow belts** |
|---|--:|--:|
| copper-ore in | 15.00 /s | **30.00 /s** |
| **copper-plate out** | 3.00 /s | **6.00 /s** |
| **stone out** | 3.00 /s | **6.00 /s** |
| **acetylene** | 4.50 /s | **9.00 /s** |
| electricity | 7.20 MW | **14.40 MW** |
| buildings | 15 | **30** |
| tiles | ~690 | **~1,380** |

**2 belts is the recommendation.** The circuit complex alone wants **copper-plate 3.39/s**
(designs 25 + 26 + 27 combined), which one belt does not quite cover, and copper-plate is a Tier A bus
item with 50+ consumers. At 30 buildings and 1,380 tiles it is still comfortably a single stamp.

## Recipe table — 2 belts

```
┌──────────────────────┬─────────────────────────┬──────┬───────┬───────┬──────────┐
│ Recipe               │ Factory                 │ Cnt  │ Size  │ Load  │ MW load  │
├──────────────────────┼─────────────────────────┼──────┼───────┼───────┼──────────┤
│ grade-2-copper       │ automated-screener-mk01 │  18  │ 7x7   │ 100 % │    5.40  │
│ grade-1-copper-crush │ jaw-crusher             │  10  │ 7x7   │  90 % │    9.00  │
│ copper-plate-4       │ steel-furnace           │   2  │ 2x2   │  75 % │   burner │
└──────────────────────┴─────────────────────────┴──────┴───────┴───────┴──────────┘
```

**30 buildings · ~1,380 tiles · 14.40 MW electric · acetylene 9.00/s**

**The screeners are the block.** 18 of the 30 buildings and 882 of the 1,380 tiles, all at 100 % —
`grade-2-copper` is a 3-second craft in a speed-1 machine, so it needs one screener per 1.67 ore/s. The
crushers are 10 at 90 %.

**Two `steel-furnace` do all the smelting**, because they are **speed 4** and 2×2 — 8 tiles total for the
entire smelting step. That is the whole reason this block is small.

**Inputs** (/s): copper-ore 30.00 · **acetylene 9.00** · electricity 14.40 MW

**Outputs** (/s): **copper-plate 6.00** · **stone 6.00**

## Acetylene — the solver cannot model it, verified

**`--fuel "copper-plate-4:acetylene"` is silently accepted and has no effect.** Two independent guards in
`resolveFuel` (`src/solver/MatrixSolver.ts:145`) block it:

```js
const burner = factory.burner_prototype;
if (!burner) return null;            // steel-furnace has fluid_energy_source, burner_prototype is ABSENT
...
const item = data.items[fuelName];   // acetylene lives in data.fluids, not data.items
```

So the fuel must be derived by hand. Prototype values, read directly:

| | |
|---|---|
| `steel-furnace.energy_usage` | 100,000 J/tick = **6.000 MW** |
| `fluid_energy_source.effectivity` | **1** |
| `burns_fluid` · input filter | `true` · **none** (any fluid fuel) |
| `crafting_speed` | **4** |
| `acetylene.fuel_value` | 1,000,000 J = **1.00 MJ** |

```
furnace fractional = (grade-2-copper 15/s ÷ 5) × 2 s ÷ speed 4  =  1.500
fuel               = 1.500 × 6.00 MW ÷ (1.00 MJ × eff 1)        =  9.000 acetylene/s
```

**The decomposition is confirmed against the solver's own output.** It reports **23.40 MW** for the
2-belt case, and:

```
screeners  18.0 fractional × 0.30 MW  =   5.40
crushers    9.0 fractional × 1.00 MW  =   9.00
                        electrical    =  14.40 MW
furnaces    1.5 fractional × 6.00 MW  =   9.00 MW  ← fuel, miscounted as electric
                                  sum =  23.40 MW  ✓ matches exactly
```

So **electrical is 14.40 MW and acetylene is 9.000/s** — halve both for the 1-belt case. Design 10
produces acetylene at 391.48/s, so this is well inside supply.

## The stone is the second product

**6.00 stone/s is not a trace byproduct** — it is twice design 24's 1.833/s export and comfortably covers
the base's whole saline requirement:

| consumer | water-saline | stone |
|---|--:|--:|
| design 25 | 6.000 /s | 1.200 /s |
| design 29 | 1.103 /s | 0.221 /s |
| **total** | 7.103 /s | **1.421 /s** |

**This outpost settles the saline question on its own** — 6.00 stone/s against 1.421 needed, with 4.6/s
spare for `Moss-2` (designs 27/28 both want ~3–4 stone/s if that swap is ever taken) or brick.

Stone is stack 50, so 6.00/s is 7.2 stacks/min — it wants its own belt lane and a load station, not a
corner of the copper lane.

## Terminal outputs and their sinks

| output | /s | sink |
|---|--:|---|
| **copper-plate** | 6.00 | the product — Tier A, 50+ consumers. Circuit complex takes 3.39 |
| **stone** | 6.00 | **[design 38](38-stone-disposal-outpost.md) takes it with design 31's 6.00** (see note below); saline needs only 1.42/s of it, then `Moss-2` if adopted, brick. Real product, not waste |

**No byproducts to resolve.** Everything this block emits has a consumer, which is unusual for a py block
and is the reason it stays at three recipes.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **stone backs up** | `grade-1-copper-crush` is **multi-output** (`stone 2 + grade-2-copper 1`), so a full stone belt stalls it → `grade-1-copper` backs up → the screeners stall → **total stop.** The stone is not optional to route |
| 2 | **the screeners are at 100 %** | 18 of them, zero headroom. A single outage drops plate output proportionally. 49 tiles and 0.30 MW each — the cheapest pad in the block |
| 3 | acetylene 9.00/s | feeds both furnaces; an interruption stops all smelting but nothing upstream, so ore and grade-2 back up gracefully |
| 4 | copper-ore 30.00/s | a full yellow-belt pair. Anything less throttles proportionally — no cliff |

**This block has no cycles and no fluid byproducts**, so backpressure is simple: the only hard stop is
stone, and only because of the multi-output crusher.

## Scaling

Linear in copper-ore. Integer at every yellow-belt multiple, since `grade-2-copper` is exactly
**1 screener per 1.67 ore/s** and ore 15/s gives exactly 9:

| | 1 belt | 2 belts | 3 belts |
|---|--:|--:|--:|
| copper-plate | 3.00 | 6.00 | 9.00 |
| buildings | 15 | 30 | 45 |
| acetylene | 4.50 | 9.00 | 13.50 |

**Past 2 belts, stamp rather than scale** — 45 buildings crosses the rule 20 threshold, and the ore input
exceeds a red belt at 2 belts anyway.

## Solver command

**Input mode** — supply-driven with two products, so `--target` is wrong here (it would size for
copper-plate and could drop the stone leg).

```bash
npx tsx src/cli.ts solve \
  --recipes "grade-2-copper,grade-1-copper-crush,copper-plate-4" \
  --input "copper-ore:30" --time 1 \
  --factory "grade-2-copper:automated-screener-mk01" \
  --factory "grade-1-copper-crush:jaw-crusher" \
  --factory "copper-plate-4:steel-furnace" \
  --solver simplex \
  --unlocked
```

For one belt, `--input "copper-ore:15"`. No `--max-import`, no `--fuel`, no constraints — there are no
cycles, no capped intermediates, and the furnace's fluid fuel is outside the solver's model anyway.

**Reported MW includes the furnaces' 6.00 MW each as electrical.** Subtract `furnace_fractional × 6.00`
to get the true electrical figure and divide the same number by the fuel's MJ to get the gas rate.

## Build materials

Distinct construction materials across this block's 3 building types, separate from flow imports:

`concrete` · `copper-cable` · `electronic-circuit` · `engine-unit` · `gearbox-mk01` · `iron-gear-wheel` ·
`iron-plate` · `pipe` · `shaft-mk01` · `small-parts-01` · `steel-plate` · `stone-brick` · `stone-furnace`

Nothing exotic — three building types, all early-tier. **`gearbox-mk01` is the one to note**, since it
needs fish-oil from design 29; a handful from stock covers 30 buildings' worth. Inferred from the recipe
graph, not from save state.
