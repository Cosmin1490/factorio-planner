# 13B — Coal chemicals, molten-salt power — 15/s raw-coal → 178–1,501 MW

**A variant of design 13, not a replacement.** Same tar tree, same coke recycle dial, same plastic
feedstock. One change: **the acetylene branch is deleted and the coke that fed it burns in
`py-coal-powerplant-mk01` instead**, driving a molten-salt loop into steam turbines.

Both coke sinks are kept, because power demand is not guaranteed — `r` still dials coke between the
tar recycle and the power island, exactly as before. Only the far end of the dial changed.

```
coal-molten-salt-01  [U] [coal-powerplant, 20 s]  molten-salt 500   →  hot-molten-salt 500 @1000 °C
he-01                [U] [heat-exchanger, 2.5 s]  hot-molten-salt 200 @≥950 + pressured-water 75
                                                                    →  molten-salt 200 + pressured-steam 75 @1000 °C
pressured-water      [U] [vacuum, 2 s]            water 500         →  pressured-water 500
ash-separation       [U] [solid-separator, 1 s]   ash 10            →  coal-dust 1 (50 %) + iron-oxide 1 (5 %) + soot 1 (20 %)
soot-separation      [U] [solid-separator, 1 s]   soot 2            →  iron-ore 1 (20 %) + copper-ore 1 (20 %) + ash 1 (30 %)
                                                                       + ore-aluminium 1 (10 %) + ore-zinc 1 (10 %) + ore-lead 1 (10 %)
```

## Why this is worth 3.4× the power

`py-coal-powerplant-mk01` is a **chemical burner at 10 MW** that heats salt rather than water, and
the chain is not energy-conserving — that is the point of it:

```
6.4 py-coal-powerplant-mk01    64 MW of coke  =  12.8 coke/s @ 5 MJ
      ↓ 160 hot-molten-salt/s
1   py-heat-exchanger (speed 2)                 200 salt per 1.25 s
      ↓ 60 pressured-steam/s @1000 °C           8000 × (1000 − 15) = 7.88 MJ/unit
1   steam-turbine-mk01                          60 × 7.88 = 472.8 MW  ← exactly max_power_output
```

**472.8 MW out of 64 MW of coke — 7.39 MJe per MJ.** Against the oil-boiler + steam-engine route the
tar fuels use, which is **1.00 MJe/MJ**, that is the entire argument. It is a property of the
recipes, not an efficiency: 200 salt carrying 80 MJ produces 75 pressured-steam carrying 591 MJ.

One exchanger feeds exactly one turbine, and 6.4 powerplants feed exactly one exchanger. The set is
the unit.

**`molten-salt` is a closed loop** — `he-01` returns 200 per 200 and the powerplant 500 per 500. It
is a **one-time fill**, not a standing input. Only `pressured-water` is consumed. See § Seeding.

## Seeding the salt loop

The loop consumes no salt once charged, but it will not start until **every machine's input box
holds a full craft at the same time**. A pipe network fills proportionally, so an underfilled system
gives you twenty powerplants each holding 400-odd units, all stalled, with the total looking
adequate.

```
machine floor   20 py-coal-powerplant x 500 molten-salt   = 10,000
                 3 py-heat-exchanger  x 200 hot-molten-salt =  600
                                                             ------
                                                            10,600 molten-salt  =  31,800 salt
```

**32,000 salt should work; seed 40,000.** The floor is the machine boxes with nothing anywhere else
in the system, which never happens — the margin covers whatever the pipe network holds. Over-seeding
is harmless: surplus sits in the loop and is never consumed.

| seed | molten-salt | `bof-mk01` crafts | time on one bof | energy |
|--:|--:|--:|--:|--:|
| **32,000 salt** *(floor)* | 10,667 | 106.7 | **53 min** | 16 GJ |
| **40,000 salt** *(build to this)* | 13,333 | 133.3 | **67 min** | 20 GJ |

`molten-salt` [bof, 30 s] is `salt 300 → 100`, and `bof-mk01` is speed 1 — so one bof turns
**10 salt/s** into 3.33 molten-salt/s.

**One `salt-mine` feeds exactly one `bof-mk01`.** `salt-rock` has `mining_time 1` and **no required
fluid**, and `salt-mine` is speed 10 — so 10 salt/s, matching the bof's draw to the digit. The whole
seeding rig is **one 11×11 mine at 2.00 MW plus one bof at 5.00 MW, run for about an hour**, then
removed.

*(Scaling note: a build at 8 powerplants was seeded at 15,000–20,000 salt against its 4,250-unit
floor — 1.18–1.57×. The 40,000 here is the same ratio at 2.5× the machines.)*

## The power island — fuel affinity, two banks

A powerplant has **one fuel slot**, so it is piped to a fuel and stays there, exactly like design
13's boilers. Coke and coal-dust get separate banks.

```
COKE BANK       coke 36.70/s  @ 2 coke/s each      (10 MW ÷ 5 MJ)
                frac 18.350   ->  19 py-coal-powerplant-mk01    96.6 %

DUST BANK       coal-dust 1.932/s  @ 3.333/s each  (10 MW ÷ 3 MJ)
                frac  0.579   ->   1 py-coal-powerplant-mk01    57.9 %
                self-feeding — see below

ash-separation  38.632 ash/s   frac 3.863  ->  4 solid-separator   96.6 %
soot-separation  0.773 soot/s  frac 0.386  ->  1 solid-separator   38.6 %

turbine sets    2.958  ->  3 py-heat-exchanger + 3 steam-turbine-mk01
pressured-water 177.5/s        frac 0.710  ->  1 vacuum-pump-mk01

gross 1,398.4 MW  −  draw 8.56  =  NET 1,390 MW   ·   32 buildings · 3,856 tiles
```

### The dust bank feeds itself

**Every coal fuel has `burnt_result: ash`** — coke, coal, coal-dust and raw-coal all burn 1:1 to an
ash item. So the coke bank emits 36.70 ash/s, and the dust bank's own combustion returns more:

```
D = (coke + D) × 0.05          →  D = 1.932 coal-dust/s
ash = 36.70 + 1.932 = 38.632/s
```

The 0.05 is `ash-separation`'s 10 ash → 1 coal-dust at 50 % probability. The loop converges hard —
5 % per pass — and `ash-separation` destroys **92.5 % of ash by count** (10 in, 0.75 out), which is
what keeps the largest solid byproduct in this design from needing an external sink.

### The recycle only pays because of the 7.39×

```
4 separators draw                1.5 MW per craft/s
coal-dust produced               1.5 MJ per craft     ← exactly equal
```

At 1.00 MJe/MJ this loop is a **precise wash and worthless**. It pays only because the salt chain
multiplies the fuel:

```
coal-dust 5.79 MJ/s  × 7.3875  =  42.8 MW turbine output
5 separators                      −7.0 MW draw
                                  ───────
                                  +36 MW net, for 6 buildings
```

Worth recording as the reason: the same loop bolted onto design 13's oil-boilers would gain nothing.

## The dial

`r` is unchanged from design 13 — coke priority-split between `coal-gas-from-coke` and the
powerplants. Both banks built, neither removed.

```
C(r) = 36.70 / (1 − 0.411 r)        total coke/s          ← unchanged recursion
R(r) = r · C(r)                     to coal-gas-from-coke
P(r) = (1 − r) · C(r)               to the power island
tar(r) = 132.30 + 1.6 · R(r)
D(r)  = P(r) × 0.05 / 0.95          coal-dust
sets  = (5·P + 3·D) / 64
```

| r | coke/s | **→ power** | tar/s | aromatics/s | ash/s | sets | **MW salt** | **MW tar** | **TOTAL MW** | max plastic/s |
|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **0.00** | 36.70 | **36.70** | 132.3 | 56.9 | **38.63** | 2.96 | **1,390** | 111 | **1,501** | 1.14 |
| 0.25 | 40.90 | 30.68 | 148.7 | 63.9 | 32.29 | 2.47 | 1,162 | 122 | 1,284 | 1.28 |
| 0.50 | 46.19 | 23.10 | 169.3 | 72.8 | 24.31 | 1.86 | 875 | 136 | 1,011 | 1.46 |
| 0.75 | 53.05 | 13.26 | 196.0 | 84.3 | 13.96 | 1.07 | 502 | 154 | 656 | 1.69 |
| **1.00** | 62.31 | **0** | 232.0 | **99.8** | **0** | 0 | **0** | **178** | **178** | **2.00** |

Against design 13 — **440 MW at r=0, 180 at r=1** — the low end is unchanged (no coke reaches power
at r=1 either way) and the high end is **3.4×**.

**Both endpoints are solver-validated.** The r=0 tar tree reproduces design 13's seven published
figures exactly (coke 36.70, tar 132.30, aromatics 56.89, gasoline 90.36, naphthalene 76.73,
carbolic 19.85, hydrogen 18.52, steam 357.21) and r=1 gives 178.4 MW against design 13's 180.
Intermediate rows are the recursion, with `F_tar = 1.2106·tar + 60.48 + 0.56·R` fitted to both
endpoints and matching each to 0.03 %.

**Every island row scales with the same `P(r)`**, so unlike design 13's boilers — acetylene peaking
at `r=0` and everything else at `r=1` — the whole island sizes at `r=0` and idles together. No
max-over-r subtlety and no case for reallocation control.

### The plastic trade changes sign

```
diverting existing aromatics :  57.5 MW per plastic-bar/s      (unchanged)
dialling r upward            :  (1501 − 178) / (2.00 − 1.14)  =  1,538 MW per plastic-bar/s
```

Design 13's rule was *divert before you dial* at 5.3×. Here it is **27×**. Sit at `r=0` and take
plastic out of the aromatics you already have; the dial's job is purely to keep the tree alive when
power is not wanted.

## Recipe table — the envelope

```
┌──────────────────────────────┬──────────────────────────┬───────┬──────────┬───────────┐
│ Recipe                       │ Factory                  │ Count │ peaks at │ MW (peak) │
├──────────────────────────────┼──────────────────────────┼───────┼──────────┼───────────┤
│ distilled-raw-coal           │ distilator               │     3 │ both     │           │
│ coal-gas                     │ distilator               │     2 │ both     │           │
│ coal-gas-from-coke           │ distilator               │    16 │ r=1      │           │
│ syngas                       │ gasifier                 │    11 │ r=1      │      5.50 │
│ tar-refining                 │ tar-processing-unit      │    12 │ r=1      │           │
│ pitch-refining               │ distilator               │    17 │ r=1      │           │
│ tar-refining-tops            │ tar-processing-unit      │     3 │ r=1      │           │
│ light-oil-aromatics          │ distilator               │     4 │ r=1      │           │
│ anthracene-gasoline-cracking │ distilator               │    22 │ r=1      │           │
├──────────────────────────────┼──────────────────────────┼───────┼──────────┼───────────┤
│ coal-molten-salt-01 (coke)   │ py-coal-powerplant-mk01  │    19 │ r=0      │  (coke)   │
│ coal-molten-salt-01 (dust)   │ py-coal-powerplant-mk01  │     1 │ r=0      │  (dust)   │
│ ash-separation               │ solid-separator          │     4 │ r=0      │      5.79 │
│ soot-separation              │ solid-separator          │     1 │ r=0      │      0.58 │
│ he-01                        │ py-heat-exchanger        │     3 │ r=0      │      1.48 │
│ (generation)                 │ steam-turbine-mk01       │     3 │ r=0      │         0 │
│ pressured-water              │ vacuum-pump-mk01         │     1 │ r=0      │      0.71 │
├──────────────────────────────┼──────────────────────────┼───────┼──────────┼───────────┤
│ (oil-boiler-mk01)            │ 5×5                      │    28 │ r=1      │         0 │
│ (steam-engine)               │ 3×5                      │    61 │ r=1      │         0 │
└──────────────────────────────┴──────────────────────────┴───────┴──────────┴───────────┘
90 process + 32 salt island + 89 steam island = 211 buildings · 22–43 MW process draw
```

**211 against design 13's 359.** The acetylene block (16 `extract-limestone-01`, 4 `lime`, 16
`calcium-carbide`, 32 `acetylene`, 4 `slacked-lime-void` = 72) is gone, and with it 27 acetylene
boilers and 81 steam-engines. The 32-building salt island replaces all of it.

### Boilers — same affinity rule, smaller bank

With acetylene deleted **every remaining fuel peaks at `r=1`**, so the bank is simply the `r=1`
column — no opposite-end sizing problem.

| Fuel | MJ/unit | **boilers** | @ `r=0` | @ `r=1` |
|---|--:|--:|--:|--:|
| gasoline | 1.20 | **13** | 7.33 | **12.84** |
| syngas | 0.40 | **7** | 4.09 | **6.44** |
| naphthalene-oil | 0.30 | **3** | 1.55 | **2.73** |
| aromatics | 0.35 | **3** | 1.34 | **2.36** |
| carbolic-oil | 0.35 | **1** | 0.47 | **0.82** |
| hydrogen | 0.10 | **1** | 0.13 | **0.22** |
| **total** | | **28** | 14.91 | **25.41** |

Venting hydrogen (pre-approved, 0.10 MJ is noise) removes one → **27**. **Engines peak at `r=1`
too** — 898 steam/s, 61 engines — where design 13's peaked at `r=0` with 142. At `r=0` only 37 are
loaded. The turbines run on `pressured-steam`, a different fluid with a ≥500 °C filter, so the two
generation banks share nothing and cannot substitute.

## Imports and exports

**Inputs** (/s): raw-coal **15.00** · water **216–341** (process) **+ 0–178** (pressured-water) ·
molten-salt *(one-time fill)*

**Outputs**: electricity **178–1,501 MW** · aromatics 56.9–99.8/s *(or up to 2.00 plastic-bar/s)* ·
creosote 31.8–55.7/s · iron-oxide 0.44–0.63/s · trace ore from `soot-separation`

## Byproducts and sinks

| Byproduct | r=0 | r=1 | Sink | note |
|---|--:|--:|---|---|
| gasoline, syngas, naphthalene, aromatics, carbolic, hydrogen | — | — | **burn** | unchanged from design 13 |
| **aromatics** (diverted) | 0–56.9 | 0–99.8 | `aromatics-to-plastic` | unchanged |
| **creosote** | 31.8 | **55.7** | external sink | unchanged — `fuel_value: 0`, cannot be burned |
| **ash** | **38.63** | 2.16 | **`ash-separation` on site, 4 separators** | design 12's export — at 38.63/s it is no longer a trickle |
| **soot** | 0.773 | 0 | `soot-separation`, 1 separator | belting it out instead drops the island to 31 buildings |
| iron-oxide | 0.63 | 0.44 | iron-plate route | |
| **carbon-dioxide** | **0** | **0** | — | **gone at every r** |
| **slacked-lime** | **0** | **0** | — | **gone at every r** |

**Two byproducts disappear entirely.** Design 13's CO2 came from `lime` and dialled to zero only at
`r=1`; here the lime branch does not exist, so CO2 is zero across the whole dial and
`slacked-lime-void` goes with it.

**Ash moves the other way.** Design 13's ash is 2.16–6.52/s of recipe ash. Here combustion
dominates: **38.63/s at r=0**, 18× the recipe figure, and it falls to 2.16 at r=1 as the banks idle.
That is why `ash-separation` is a built row rather than a reference to design 12.

## Solver commands

`--max-import` is omitted throughout for the same reason as design 13 — the coke↔tar loop is a
closed self-sustaining cycle the LP mishandles when over-constrained.

**r = 0 (all coke to power) — the tar tree with coke terminal:**

```bash
npx tsx src/cli.ts solve \
  --recipes "distilled-raw-coal,coal-gas,syngas,tar-refining,pitch-refining,tar-refining-tops,light-oil-aromatics,anthracene-gasoline-cracking" \
  --input "raw-coal:15" --time 1 \
  --factory "distilled-raw-coal:distilator" --factory "coal-gas:distilator" --factory "syngas:gasifier" \
  --factory "tar-refining:tar-processing-unit" --factory "pitch-refining:distilator" \
  --factory "tar-refining-tops:tar-processing-unit" --factory "light-oil-aromatics:distilator" \
  --factory "anthracene-gasoline-cracking:distilator" \
  --solver simplex --unlocked
```

→ 47 buildings, 21.48 MW, **coke 36.70/s terminal**, and design 13's seven r=0 figures to the digit.

**r = 1 (all coke recycled, power island idle):**

```bash
npx tsx src/cli.ts solve \
  --recipes "distilled-raw-coal,coal-gas,coal-gas-from-coke,syngas,tar-refining,pitch-refining,tar-refining-tops,light-oil-aromatics,anthracene-gasoline-cracking" \
  --input "raw-coal:15" --time 1 \
  --factory "distilled-raw-coal:distilator" --factory "coal-gas:distilator" \
  --factory "coal-gas-from-coke:distilator" --factory "syngas:gasifier" \
  --factory "tar-refining:tar-processing-unit" --factory "pitch-refining:distilator" \
  --factory "tar-refining-tops:tar-processing-unit" --factory "light-oil-aromatics:distilator" \
  --factory "anthracene-gasoline-cracking:distilator" \
  --solver simplex --unlocked
```

→ 90 buildings, 43.25 MW, coke 0 terminal.

**The salt island is outside the solve**, because the turbine is a generator rather than a recipe,
`molten-salt` is a closed loop with no net flow, and combustion ash is a `burnt_result` the LP does
not model. It is the arithmetic above, all of it prototype data: `py-coal-powerplant-mk01` 10 MW
chemical burner with `burnt_result: ash`, `he-01` in a speed-2 `py-heat-exchanger`,
`pressured-steam` heat capacity 8000 at 1000 °C, `steam-turbine-mk01` `max_power_output` 7.88
MJ/tick = 472.8 MW, and `ash-separation`'s three probability outputs discounted at 50/5/20 %.

## Build materials — the island

Beyond design 13's tar-tree bill, the 32-building island needs:

| item | qty | | item | qty |
|---|--:|---|---|--:|
| small-parts-01 | **7,010** | | gasifier | 60 |
| steel-plate | 4,560 | | duralumin | 60 |
| electronic-circuit | 2,105 | | brake-mk01 | 12 |
| intermetallics | 1,045 | | gearbox-mk01 | 9 |
| steam-engine | 415 | | utility-box-mk01 | 6 |
| electric-mining-drill | 200 | | shaft-mk01 | 3 |
| inductor1 | 150 | | py-tank-7000 | 3 |
| pipe | 130 | | automated-factory-mk01 | 3 |
| iron-plate | 120 | | | |
| **mechanical-parts-01** | **63** | | | |

### Mechanical parts: 63

**60 from the twenty powerplants** (3 each) and **3 from the exchangers** (1 each). The turbines
carry none directly but want **9 `gearbox-mk01` + 3 `shaft-mk01` + 12 `brake-mk01` + 6
`utility-box-mk01`** of their own.

Priced in design 42's currency — 63 mechanical-parts is **210 shaft-equivalents** including the
turbines' drivetrain:

| at design 42's rate | |
|---|--:|
| 0.75 mechanical-parts/min | **84 minutes** for the 63 |
| 2.25 shaft-eq/min | **93 minutes** for all 210 |

So the drivetrain is roughly **an hour and a half of design 42's entire output** — and it is not the
binding item. **`small-parts-01` at 7,010** is, and that is a MAM-throughput problem rather than a
design one. Inferred from the recipe graph, not from save state.

## Risks

1. **The 7.39 MJe/MJ ratio is the whole design.** It comes from `he-01` producing 591 MJ of
   pressured-steam from 80 MJ of salt heat. If that is rebalanced, 13B collapses toward design 13
   and the acetylene branch would have to be rebuilt.
2. **`steam-turbine-mk01` accepts only `pressured-steam` ≥500 °C.** It cannot be fed from the
   oil-boilers, and the two generation banks are not interchangeable in either direction.
3. **The salt seed is a prerequisite, not a flow** — 40,000 salt, about an hour on one mine and one
   bof, before the island produces anything. See § Seeding. Underfilling does not degrade output
   gracefully; it stalls every powerplant at once.
4. **The island is 3,856 tiles**, of which 3,380 is twenty 13×13 powerplants. It is larger in area
   than the entire tar tree.
5. **The dust bank cannot borrow from the coke bank.** Fuel affinity means its 42 % idle capacity is
   stranded — one powerplant's worth of waste, accepted to keep every pipe fixed.
6. **Ash is 38.63/s, not 2.16.** If `ash-separation` stalls, ash backs up into the powerplants'
   burnt-result slots and both banks stop, taking the whole island with them. It is risk #1 on the
   island side and has no buffer at 96.6 % utilisation.
