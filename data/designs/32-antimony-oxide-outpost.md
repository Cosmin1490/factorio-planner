# 32 — Antimony oxide outpost — 0.40 sb-oxide/s, miners included

Mine-to-oxide in one block. **Four inputs plus power: aromatics, syngas, water, raw-coal** — and
**acetylene for the drills**, which are fluid burners. Oxygen is made on site.

```
sb-grade-01  [U] [screener,  5 s]  antimonium-ore 10  →  sb-grade-01 5 + sb-grade-02 3
                                                         + stone 2 + iron-oxide 1 @0.3
sb-grade-02  [U] [crusher,   5 s]  sb-grade-01 5      →  sb-grade-02 10 + stone 2 @0.2
sb-grade-03  [U] [screener, 10 s]  sb-grade-02 10     →  sb-grade-03 2 @0.4 + sb-grade-04 5
                                                         + gravel 3
sb-grade-04  [U] [sec-crush, 5 s]  sb-grade-03 5      →  sb-grade-04 4
sb-oxide-01  [U] [bof,      10 s]  plastic-bar 1 + sb-grade-04 10 + oxygen 50  →  sb-oxide 1
```

## Read the probabilities or the whole chain is wrong

**`sb-grade-03` yields `sb-grade-03` at amount 2 with `probability 0.4` — expected 0.8, not 2.** It is
the only recycled item in the chain, so getting it wrong corrupts every figure downstream:

| | face amounts | **expected (correct)** |
|---|--:|--:|
| g3 per g3-craft | 2 | **0.8** |
| net-zero ratio `c4/c3` | 0.40 | **0.16** |
| sb-grade-04 per g3-craft | 6.6 | **5.64** |
| **antimonium-ore per sb-oxide** | 11.66 | **13.64** |

Two more carry probabilities that only affect byproduct rates: `iron-oxide` @0.3 and `sb-grade-02`'s
`stone` @0.2. **The solver uses expected values throughout** — `recipes --produces` prints the face
amount, so hand-checking against its output will disagree unless the raw prototype is read. The
reconciliation that proves it: expected values give stone 1.309/s and iron-oxide 0.164/s, matching the
solver exactly; face amounts give 2.182 and 0.546.

Derivation, net-zero on every grade:

```
10 ore → 5 g1 + 3 g2 ;  5 g1 → 10 g2            →  13 g2 per 10 ore  =  1.3 g2/ore
g3 balance:  0.8·c3 = 5·c4                      →  c4 = 0.16·c3
g4 out:      5·c3 + 4(0.16·c3)                  =  5.64 per g3-craft
oxide:       5.64 / 10                          =  0.564 per g3-craft
ore:         10 / 1.3 = 7.692 per g3-craft      →  7.692 / 0.564  =  13.64 ore/oxide
```

## Why 0.40/s

| consumer | sb-oxide /s |
|---|--:|
| circuit + battery complex (designs 25–27) | 0.200 |
| logistic science (design 07) | 0.032 |
| headroom for `intermetallics` | 0.168 |
| **total** | **0.400** |

## Recipe table

```
┌──────────────────────┬─────────────────────────┬──────┬───────┬───────┬──────────┐
│ Recipe               │ Factory                 │ Cnt  │ Size  │ Load  │ MW load  │
├──────────────────────┼─────────────────────────┼──────┼───────┼───────┼──────────┤
│ (mining)             │ antimony-drill-mk01     │   6  │ 7x7   │  91 % │   fluid  │
│ sb-grade-01          │ automated-screener-mk01 │   3  │ 7x7   │  91 % │    0.82  │
│ sb-grade-02          │ jaw-crusher             │   3  │ 7x7   │  91 % │    2.73  │
│ sb-grade-03          │ automated-screener-mk01 │   8  │ 7x7   │  89 % │    2.13  │
│ sb-grade-04          │ secondary-crusher-mk01  │   1  │ 7x7   │  57 % │    0.26  │
│ sb-oxide-01          │ bof-mk01                │   4  │ 7x7   │ 100 % │  raw-coal│
│ aromatics-to-plastic │ biofactory-mk01         │   1  │ 7x7   │  60 % │    0.24  │
│ hydrogen             │ electrolyzer-mk01       │   2  │ 6x6   │ 100 % │   20.00  │
└──────────────────────┴─────────────────────────┴──────┴───────┴───────┴──────────┘
```

**28 buildings · ~1,346 tiles · 26.17 MW load (27.15 MW rated) · raw-coal 6.67/s · acetylene 5.46/s**

**Inputs** (/s): antimonium-ore 5.456 *(mined on site)* · aromatics 20.00 · syngas 40.00 · water 60.00 ·
**raw-coal 6.67** · **acetylene 5.46** · electricity 26.17 MW

**Outputs** (/s): **sb-oxide 0.400** · ash 6.67 · gravel 2.128 · stone 1.309 · iron-oxide 0.164 ·
hydrogen 40.00

All four grades net zero — `sb-grade-01` 2.73, `sb-grade-02` 7.09, `sb-grade-03` 0.57, `sb-grade-04`
4.00, each with production equal to consumption in the solver's intermediate table.

## Circuit cost — 460

Transitive through the build tree. Every bus material (`duralumin`, `glass`, `titanium-plate`,
`aluminium-plate`, `steel-plate`, `iron-plate`, `copper-plate`, `concrete`, `ceramic`, `iron-stick`)
expands to **zero** circuits, and so does the second assembly layer — Py's `lab` is
`transport-belt 4 + small-parts-01 10` and `small-lamp` carries none. **The one nested source is the
drill**, via `5 × electric-mining-drill × 3`.

| entity | n | direct | nested | per unit | **total** |
|---|--:|--:|--:|--:|--:|
| `automated-screener-mk01` | 11 | 20 | 0 | 20 | **220** |
| `antimony-drill-mk01` | 6 | 10 | **15** | 25 | **150** |
| `bof-mk01` | 4 | 10 | 0 | 10 | 40 |
| `secondary-crusher-mk01` | 1 | 25 | 0 | 25 | 25 |
| `biofactory-mk01` | 1 | 15 | 0 | 15 | 15 |
| `electrolyzer-mk01` | 2 | 5 | 0 | 5 | 10 |
| `jaw-crusher` | 3 | 0 | 0 | 0 | 0 |
| | **28** | | | | **460** |

**Screeners and drills are 370 of the 460 — 80 %**, and the `jaw-crusher` row is free, as in design 31.
Cutting the circuit bill therefore means cutting screeners or drills; nothing else moves the number
enough to matter.

**The 8 `sb-grade-03` screeners alone are 160 circuits** — the single biggest line — because the g3
recipe is a 10-second craft in a speed-1 machine. `automated-screener-mk02` is **locked**, and it is
*not* the cheap fix even once unlocked: it is built from `1× automated-screener-mk01 + 10×
advanced-circuit + 15× nexelit-plate + 3× self-assembly-monolayer + 25× stainless-steel`, so at speed 2
the row halves to 4 machines but those 4 still carry an mk01 each. It trades **80 electronic-circuit for
40 advanced-circuit** plus the nexelit and stainless — a materials upgrade, not a circuit saving.

There is no cheaper route at this tier. 460 is the price.

**Build order consequence:** at 0.40 sb-oxide/s the block returns 0.20/s to the battery line, but it
costs 460 circuits up front. It is not a bootstrap step — stand up circuit supply first, then build
this to unlock the intermetallics headroom.

## Oxygen is three quarters of the power bill

| | MW |
|---|--:|
| `electrolyzer-mk01` × 2 | **20.00** |
| everything else | 6.17 |

`hydrogen` (300 water → 200 hydrogen + 100 oxygen, 10 s, 10 MW) is the route chosen, per the decision to
make oxygen on site. **The only other unlocked source is `muddy-sludge-void-electrolyzer`**
(100 muddy-sludge → 5 soil + 100 water + 10 oxygen), which trades the 20 MW for a sludge import and a
soil output. It beats electrolysis on power by roughly the whole 20 MW if sludge is already being
disposed of; it loses if sludge has to be made. **Not taken here** — on-site oxygen with no new import
was the requirement.

**This does not improve with tier.** `electrolyzer-mk02` is speed 2 at 20.00 MW against mk01's speed 1
at 10.00 MW — both land on exactly **1.0000 MW per oxygen/s**. The tier buys floor space, not power,
and mk02 is locked anyway. 20 MW is the standing price of 20 oxygen/s by electrolysis.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **sb-oxide** | 0.400 | the product — battery, science, intermetallics | — | — |
| **ash** | 6.67 | `py-limestone` (smelting), else `planter-box` or `log3` | belt out | `ash-separation` needs its own block; `py-asphalt` and `rich-clay` are smaller sinks |
| **gravel** | 2.128 | `gravel-saline-water` (washer) — saline is wanted base-wide | 1 washer tier | `concrete` and `py-asphalt` both work; `gravel-to-sand` if sand is short |
| **stone** | 1.309 | joins the base stone pool — saline, brick, `Moss-2` | belt out | nothing to beat; stone has no voidable route under the ruleset |
| **iron-oxide** | 0.164 | `iron-oxide-smelting` | trickle, co-locate | `py-iron-oxide` needs an hpf |
| **hydrogen** | 40.00 | **unresolved — see below** | — | — |

**Hydrogen 40.00/s is pre-approved to vent, but price it first.** At 0.10 MJ each that is **4.00 MJ/s**,
which through a boiler and a `steam-engine` at effectivity 0.5 is roughly **2.0 MW electric** — 7.6 % of
the block's own draw (hand-derived, not solver output). The two real options:

- **Burn it** — ~2.0 MW back, costs a boiler, an engine and the water loop.
- **Export it** — `ralesia-1` consumes hydrogen, so a ralesia block is a genuine sink rather than a
  disposal.
- **Vent it** — pre-approved, zero build cost, forfeits the 4.00 MJ/s.

`water-from-oxygen-and-hydrogen` is **not** an escape: it wants back the oxygen that cost 20 MW to make.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **the bof and the electrolyzers are both at 100 %** | zero headroom on either. The bof is the product step and the electrolyzer is its oxygen — an outage in either stops sb-oxide outright, and neither is a cheap pad (49 and 36 tiles, 5.00 and 10.00 MW) |
| 2 | **gravel backs up and stops the block** | `sb-grade-03` is multi-output (`sb-grade-03 + sb-grade-04 + gravel 3`), so a full gravel belt stalls all 8 screeners → `sb-grade-04` starves → total stop. **2.128/s is the largest solid byproduct and is not optional to route** |
| 3 | **stone backs up** | emitted by both `sb-grade-01` and `sb-grade-02`; a stall there starves the whole grading line the same way |
| 4 | **ash 6.67/s** | the bof's own exhaust. A full ash belt stops the bof, which is the product step. Larger than design 24's 6.00/s |
| 5 | **the g3→g4 loop is tight** | `sb-grade-04` runs at 57 % on one machine, but it is the only consumer of `sb-grade-03`. If it stops, g3 backs up and stalls the screeners within a buffer |
| 6 | acetylene 5.46/s | stops mining; ore and grades back up gracefully, no cascade |

**Every solid output needs a route before first start.** Three of the six risks above are a backed-up
byproduct belt stalling a multi-output machine.

**`t = min(sink_i / rate_i)` is not computed here** — the sinks named above are recipes that exist, not
blocks with recorded capacities, so there is no inventory figure to divide by. The ordering above is by
consequence of a stall, not by time-to-stall. Once the ash and gravel consumers are sized, the binding
one is whichever of `ash 6.67/s` and `gravel 2.128/s` runs out of sink first; both stop the block.

## Scaling

Linear in sb-oxide, but **two rows are already integer-exact at 100 %**, so the step is coarse:

| sb-oxide /s | 0.20 | **0.40** | 0.60 | 0.80 |
|---|--:|--:|--:|--:|
| antimonium-ore | 2.73 | **5.46** | 8.18 | 10.91 |
| drills | 3 | **6** | 9 | 11 |
| screeners (g1 + g3) | 2 + 4 | **3 + 8** | 5 + 11 | 6 + 15 |
| `jaw-crusher` | 2 | **3** | 5 | 6 |
| `secondary-crusher-mk01` | 1 | **1** | 1 | 2 |
| `bof-mk01` | 2 | **4** | 6 | 8 |
| `biofactory-mk01` | 1 | **1** | 1 | 2 |
| `electrolyzer-mk01` | 1 | **2** | 3 | 4 |
| **buildings** (incl. drills) | 16 | **28** | 41 | 54 |
| MW load | 13.08 | **26.17** | 39.25 | 52.34 |
| raw-coal /s | 3.33 | **6.67** | 10.00 | 13.33 |

All four columns are solver runs, not scaled by hand — rounding up to whole machines is lumpy enough
that 0.20/s needs 16 buildings rather than half of 28. **Past 0.40/s, stamp rather than scale** — 41
buildings crosses the rule 20 threshold at 0.60, and the block duplicates cleanly since it has no shared
fluid loop with anything outside itself.

## Solver command

**Target mode** — single end product. No `--max-import`, no `--constraint`: the grade chain balances
itself, because `sb-grade-03` and `sb-grade-04` are in **series** (g4 consumes g3), not alternatives for
one demand, so the LP has no blend to choose. Capping `antimonium-ore` is a **dead lever** — the LP
scales its vertex instead of re-blending, and Phase 1 correctly reports infeasible below 5.4555/s.

```bash
npx tsx src/cli.ts solve \
  --recipes "sb-grade-01,sb-grade-02,sb-grade-03,sb-grade-04,sb-oxide-01,aromatics-to-plastic,hydrogen" \
  --target "sb-oxide:0.40" --time 1 \
  --factory "sb-grade-01:automated-screener-mk01" \
  --factory "sb-grade-02:jaw-crusher" \
  --factory "sb-grade-03:automated-screener-mk01" \
  --factory "sb-grade-04:secondary-crusher-mk01" \
  --factory "sb-oxide-01:bof-mk01" \
  --factory "aromatics-to-plastic:biofactory-mk01" \
  --factory "hydrogen:electrolyzer-mk01" \
  --fuel "sb-oxide-01:raw-coal" \
  --solver simplex \
  --unlocked
```

**`--fuel "sb-oxide-01:raw-coal"` is load-bearing** — without it the bof defaults to `coal` and reports
5.00/s coal and 5.00/s ash. `bof-mk01` is a solid burner, so unlike the fluid-burner cases the solver
*does* model this one and keeps its 5.00 MW out of the electric total. Check:
`4.000 × 5.00 MW ÷ 3.00 MJ = 6.667 raw-coal/s`.

**The drills are outside the solve.** `antimonium` is a resource with `mining_time 1`, one ore per cycle
and **no `required_fluid`**, so a `mining_speed 1` drill yields exactly **1.00 ore/s** — 5.4555/s needs
6. `antimony-drill-mk01` has `fluid_energy_source` with `burns_fluid: true` and effectivity 1, no
`burner_prototype`, so `resolveFuel` returns null and `--fuel` would be silently dropped (same guard as
designs 30 and 31). Hand-derived:

```
drill fuel = 5.4555 fractional × 1.00 MW ÷ (1.00 MJ × eff 1)  =  5.456 acetylene/s
```

Add the drills' 6 × 49 = 294 tiles to the solver's footprint; their 1.00 MW each is **fuel, not
electricity**, and is already excluded from the 26.17 MW.

## Build materials

Distinct construction materials across this block's 7 building types, separate from flow imports:

`aluminium-plate` · `boiler` · `duralumin` · `electric-mining-drill` · `electronic-circuit` ·
`engine-unit` · `fluid-drill-mk01` · `glass` · `iron-plate` · `lab` · `small-lamp` · `small-parts-01` ·
`steam-engine` · `steel-furnace` · `steel-plate` · `tar-processing-unit` · `titanium-plate`

**`titanium-plate` is the one to check** — 15 per `biofactory-mk01`, and that is the only building in
the block that needs any, so if titanium is short the cheapest fix is to import `plastic-bar` and drop
the biofactory rather than stand up a titanium line for one machine. `duralumin` is needed in two
places, 50 for the biofactory and 20 for the `secondary-crusher-mk01`, so dropping the biofactory
leaves 20 still required.

`fluid-drill-mk01` (one per screener, so 11) and `tar-processing-unit` (one per electrolyzer, so 2) are
the other sub-assemblies that must exist before the stamp goes down. Inferred from the recipe graph, not
from save state.
