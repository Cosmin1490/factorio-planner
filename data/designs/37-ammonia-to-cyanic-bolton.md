# 37 — Ammonia → cyanic-acid bolt-on for design 27 — 3.00 cyanic-acid/s, 12 buildings

Closes **design 27's 6.00 ammonia/s surplus to exactly zero** — the `t = 0` gate on designs 25, 26
and 27 — and frees either **3 auog paddocks** or **0.667 manure/s** for export. Net **2.17 MW exporter**
and **6.00 tar/s** out.

Separate block rather than a revision to 27, because the tar makes it arguable that this is a small
tar plant that happens to solve the ammonia rather than the other way round.

```
cyanic-acid-01      [U] [quenching-tower, 5 s]  coal 20 + methane 100 + ammonia 100
                                                →  cyanic-acid 100 + hydrogen 50
distilled-raw-coal  [U] [distilator,      2 s]  raw-coal 10
                                                →  iron-oxide 1 (20%) + coal 3 + coal-gas 60 + tar 30
methane-co2         [U] [moon,           15 s]  moondrop-seeds 1 + water 100 + carbon-dioxide 100
                                                →  methane 40
moondrop-co2        [U] [moon,            5 s]  (no ingredients)  →  carbon-dioxide 200
```

## Why the ammonia closes exactly

`urea-decomposition` emits ammonia and cyanic-acid **1:1**, but `battery-mk01` takes cyanic 30 and no
ammonia. `cyanic-acid-01` is the mirror image — ammonia in, cyanic out, **1:1** — which is precisely
the shape of the imbalance. With `a` = urea-decomposition crafts/s and `c` = cyanic-acid-01 crafts/s,
against design 27's fixed demands (battery cyanic 6.00/s, melamine 2.00/s):

```
cyanic : 30a + 100c = 2.00 + 6.00 = 8.00
ammonia: 30a - 100c = 2.00
                              ->  a = 0.1667   c = 0.0300

cyanic   5.00 + 3.00 = 8.00
ammonia  5.00 - 2.00 - 3.00 = 0.00     <- closes
```

**Both effects are required.** This block consumes 3.00 ammonia/s; the other 3.00 disappears because
`urea-decomposition` drops from 0.2667 to 0.1667 crafts/s once cyanic arrives from two sources.
**Bolting this on without rebalancing design 27's decomposition down leaves 3.00 ammonia/s still
stranded.**

| design 27 | before | after |
|---|--:|--:|
| **ammonia surplus** | **6.00 /s** | **0** |
| urea | 5.733 /s | **3.733** (−34.9 %) |
| manure | 1.911 /s | **1.244** |
| paddocks | 9 | **6** — *or* keep 9 and export **0.667 manure/s** |
| `auog` modules | 36 | **24** — an hour of chamber time back |

Design 36 wants manure at 0.0138/s. The freed 0.667/s covers it **48× over**.

## Recipe table

```
┌────────────────────┬──────────────────────────┬───────┬───────┬────────┬──────────────┐
│ Recipe             │ Factory                  │ frac  │ Count │  util  │ Modules      │
├────────────────────┼──────────────────────────┼───────┼───────┼────────┼──────────────┤
│ moondrop-1         │ moondrop-greenhouse-mk01 │ 1.564 │   2   │  78.2% │ 16x moondrop │
│ methane-co2        │ moondrop-greenhouse-mk01 │ 1.125 │   2   │  56.3% │ 16x moondrop │
│ distilled-raw-coal │ distilator               │ 0.400 │   1   │  40.0% │              │
│ moondrop-co2       │ moondrop-greenhouse-mk01 │ 0.188 │   1   │  18.8% │ 16x moondrop │
│ cyanic-acid-01     │ quenching-tower          │ 0.150 │   1   │  15.0% │              │
│ moondrop-seeds     │ botanical-nursery        │ 0.080 │   1   │   8.0% │              │
├────────────────────┼──────────────────────────┼───────┼───────┼────────┼──────────────┤
│ (coal-gas)         │ oil-boiler-mk01          │ 0.162 │   1   │  16.2% │ hand-sized   │
│ (tar)              │ oil-boiler-mk01          │ 0.081 │   1   │   8.1% │ hand-sized   │
│ (hydrogen)         │ oil-boiler-mk01          │ 0.010 │   1   │   1.0% │ hand-sized   │
│ (power)            │ steam-engine             │ 1.013 │   2   │  50.7% │ hand-sized   │
└────────────────────┴──────────────────────────┴───────┴───────┴────────┴──────────────┘
```

**12 buildings · ~672 tiles · 1.58 MW drawn, 3.75 MW generated → 2.17 MW net export**

**Inputs** (/s): **ammonia 3.00** (from design 27) · **raw-coal 2.00** · water 8.62
**Outputs** (/s): **cyanic-acid 3.00** (to design 27) · **tar 6.00** · iron-oxide 0.04 · **2.17 MW**

## The power island

coal-gas and tar are both on the ruleset's **burn-it-instead** list and hydrogen is worth capturing at
this rate, so all three go to boilers. Hand-computed — boilers are entities with a `fluid_energy_source`,
not recipes, so they sit outside the solve.

```
coal-gas 12.00/s x 0.2 MJ  =  2.40 MJ/s
tar       6.00/s x 0.2 MJ  =  1.20 MJ/s
hydrogen  1.50/s x 0.1 MJ  =  0.15 MJ/s
                              ────────
                              3.75 MJ/s  ->  3.75 MW at the 1.00 MJe/MJ identity
```

**Three boilers, not one.** A burner has one fluid box and Factorio will not mix fluids in a pipe, so
coal-gas, tar and hydrogen each need their own `oil-boiler-mk01`. They share the engine bank. Combined
the three are **0.25 of one boiler's capacity spread across three buildings** — the same pattern design
24 hits with its 3 + 2 split.

`oil-boiler-mk01` is **effectivity 2** (nested in `fluid_energy_source`, not the top-level field) and
`steam-engine` is 0.5, so the pair is exactly **1.00 MJe per MJ of fuel**. **Place 2 engines** — one
solves to 1.013 and a second is 15 tiles.

## Why distilled rather than crushed

Both routes to `coal` were solved. **Crushed is strictly better on coal efficiency and this design
takes distilled anyway**, because the tar is the point:

| for 0.60 coal/s | `crushed-coal` [secondary-crusher] | **`distilled-raw-coal` [distilator]** |
|---|--:|--:|
| raw-coal | **0.90 /s** | 2.00 /s |
| energy | 2.70 → 4.47 MJ/s = **1.66× upgrader** | 6.00 → 6.00 = **1.00×, neutral** |
| byproducts | crushed-coal 0.30 + coal-dust 0.09, **solid fuels, no handling** | coal-gas 12.00 + tar 6.00, **fluids needing 2 boilers** |
| buildings | 8 total | **12 total** |
| MW | −1.78 draw | **+2.17 export** |
| | | **tar 6.00/s · iron-oxide 0.04/s** |

**+1.10 raw-coal/s and 4 buildings buys a 3.95 MW power swing and 360 tar/min.** On coal alone crushed
wins; the decision is whether the tar is wanted. At 6.00/s it feeds creosote, `treated-wood`,
`rich-clay` and `sand-casting` for several blocks over — design 24 and design 35 both sit on that chain.

**`iron-oxide` 0.04/s** is a trace bonus: `iron-oxide-smelting` (20 → 10 plate) returns 0.02 iron-plate/s.

## Rejected — gasifying the coal-gas to syngas

`syngas` [gasifier, 3 s] (`coal-gas 50 + water 100 → syngas 70 + tar 30 + ash 1`) is a **3.4× fuel
upgrade** on the coal-gas leg — generation would go 3.75 → 9.51 MW and tar 6.00 → 13.2/s, for one
gasifier. **Not taken: it emits ash** at 0.24/s, and the block is otherwise ash-free. Recorded because
the energy case is strong if an ash sink ever makes it worth revisiting.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **cyanic-acid** | 3.00 | **design 27** — the product; replaces 3.00/s of `urea-decomposition` output | — | — |
| **tar** | 6.00 | **export** — creosote, `treated-wood`, `rich-clay`, `sand-casting` | pipe | burning it; it is worth more as feedstock than 1.20 MJ/s |
| coal-gas | 12.00 | **boiler → engines**, 2.40 MW | 1 boiler | venting — not approved, it is a fuel gas |
| hydrogen | 1.50 | **boiler → engines**, 0.15 MW | 1 boiler | venting (pre-approved, but 0.15 MJ/s for one shared engine bank) |
| iron-oxide | 0.04 | export → `iron-oxide-smelting` | — | leaving it; it is 0.02 iron-plate/s back |

**Nothing is vented and there is no ash.** That is the main argument for this configuration over the
gasifier variant.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **ammonia supply from design 27** | this block exists to consume it; if 27 throttles to `auog-pooping-1` the ammonia halves to 3.11/s and this block runs at ~52 %. Degrades, does not stall |
| 2 | **the tar export needs a destination** | 6.00/s with no consumer backs up the distilator → no coal → no cyanic-acid → design 27 loses a third of its cyanic. **Size the tar sink before building** |
| 3 | **`moondrop-1` at 78.2 %** | the breeding loop is bigger than what it feeds; a seed shortfall stops methane and therefore cyanic |
| 4 | raw-coal 2.00/s | single import, single thread to the distilator |
| 5 | the three boilers | one fluid each, so a stall on any one backs that fluid up into the distilator or the quenching tower |

**Tar is the one to settle.** It is not a byproduct that sorts itself out — `distilled-raw-coal` is
multi-output, so a full tar buffer stops coal production entirely.

## Build notes

- **2 of the 5 greenhouses are pure overhead.** `moondrop-1` at 78.2 % exists only to breed the
  **0.12 moondrop-seeds/s** that `methane-co2` eats. **If design 25 or 27 can spare that off an existing
  nursery, drop both and this becomes 10 buildings, ~510 tiles.** Design 27 already borrows 16 moondrop
  modules from 25, so the relationship exists.
- **80 `moondrop` modules** (5 greenhouses × 16) are self-funding once `moondrop-1` runs, but the first
  16 have to come from next door — same one-time transfer design 27 documents for its CO₂ greenhouse.
- **It is tile-neutral against what it frees.** 672 tiles here against 588 (3 × 14×14 paddocks) there,
  and 12 `auog` modules returned at 300 s of chamber time each.
- **`cyanic-acid-01` at 15 % and the boilers at 1–16 %** — this block is mostly idle machines; the
  binding rows are the greenhouses. Recipe-swapping the quenching tower onto something else is viable
  if anything nearby needs one.

## Solver command

Target the cyanic-acid contribution, not design 27's total. The near-zero caps on `moondrop-seeds`,
`carbon-dioxide`, `coal` and `methane` are load-bearing — each has an internal producer, and without
them the LP saturates them as free imports instead of closing the loops. Set to 1e-3 rather than 0 so
the import variable exists.

Fractional counts for the utilisation table come from the same command at `--target "cyanic-acid:3000"`
÷ 1000.

```bash
npx tsx src/cli.ts solve \
  --recipes "cyanic-acid-01,methane-co2,moondrop-co2,distilled-raw-coal,moondrop-1,moondrop-seeds" \
  --target "cyanic-acid:3.00" --time 1 \
  --max-import "moondrop-seeds:0.001" \
  --max-import "carbon-dioxide:0.001" \
  --max-import "coal:0.001" \
  --max-import "methane:0.001" \
  --modules "methane-co2:moondrop:16" \
  --modules "moondrop-co2:moondrop:16" \
  --modules "moondrop-1:moondrop:16" \
  --factory "cyanic-acid-01:quenching-tower" \
  --factory "methane-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-co2:moondrop-greenhouse-mk01" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --factory "distilled-raw-coal:distilator" \
  --solver simplex \
  --unlocked
```

The power island is not in the solve — compute it as
`Σ (fluid/s × MJ) × 1.00 MJe/MJ`, giving 3.75 MW from coal-gas 12.00 + tar 6.00 + hydrogen 1.50.
Boiler count is set by **fluid types (3), not by load (0.25 of one)**.

The crushed-coal variant, for comparison — swap one recipe and one factory:

```bash
# ... as above but:
  --recipes "cyanic-acid-01,methane-co2,moondrop-co2,crushed-coal,moondrop-1,moondrop-seeds" \
  --factory "crushed-coal:secondary-crusher-mk01" \
# -> 8 buildings, 552 tiles, 1.78 MW drawn, raw-coal 0.90/s,
#    byproducts crushed-coal 0.30/s + coal-dust 0.09/s (solid fuels, no boilers)
```

## Build materials

Distinct construction materials across this block's 6 building types, separate from flow imports:

`concrete` · `copper-plate` · `electric-mining-drill` · `fluid-drill-mk01` · `gasifier` · `glass` ·
`inductor1` · `intermetallics` · `iron-plate` · `lab` · `pipe` · `planter-box` · `pump` ·
`small-parts-01` · `soil-extractor-mk01` · `steam-engine`

```
 865x iron-plate      346x small-parts-01   210x glass        105x pipe
  50x concrete         30x intermetallics    20x copper-plate  10x planter-box
   9x electric-mining-drill   8x steam-engine   8x inductor1    3x lab
   3x gasifier          2x pump               1x fluid-drill-mk01   1x soil-extractor-mk01
```

**`planter-box` ×10 and `concrete` ×50 are the two to check** — the planter-boxes come in through the
five `moondrop-greenhouse-mk01` and need `ash 3 + soil 5 + empty-planter-box 1` each
(`empty-planter-box` = `stone-brick 4 + wood 2 + iron-plate 1`), so **ash and stone-brick are one-time
imports appearing nowhere in the flows**. Concrete needs the gravel/lime/sand/water cluster, which no
current design supplies. Inferred from the recipe graph, not from save state.
