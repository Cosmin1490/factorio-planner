# 23 — Glass works — 1.843 glass/s + design 01's petri/flask, 39 buildings + 7-building coke dump

Replaces design 01's inline `glass-1` chain. Three changes compound: the **crushed-quartz route**
(`glass-2`), the **hot-air variants** on every consumer, and **`coke-coal` as the fuel source** — which
together take acetylene from **120.2/s to zero** and turn the block into a coke exporter.

```
glass-1                  [U] [glassworks, 5 s]  ore-quartz 6         →  molten-glass 10
glass-2                  [U] [glassworks, 4 s]  crushed-quartz 2     →  molten-glass 30
crushing-quartz          [U] [crusher,    1 s]  ore-quartz 5         →  crushed-quartz 1 + stone 1@0.5
hotair-empty-petri-dish  [U] [glassworks, 3 s]  molten-glass 50 + hot-air 50
                                                                     →  empty-petri-dish 2
hotair-flask             [U] [glassworks, 3 s]  stopper 4 + molten-glass 100 + hot-air 50
                                                                     →  flask 3
hotair-molten-glass      [U] [glassworks, 3 s]  molten-glass 50 + hot-air 50
                                                                     →  glass 7
```

`glass-2` alone is **3.75× the molten-glass per glassworks** of `glass-1` (30 per 4 s against 10 per
5 s) and 1.8× the ore efficiency. The hot-air variants then cut molten-glass *demand* by 42 %.

## Architecture — one pump instead of a second fuel

The three products do not sit on the same side of the fuel ledger. Petri-dish and glass **generate**
surplus coke-oven-gas; flask **consumes** it. Four designs were considered:

- **One welded block** (fixed product ratio) — the fuel margin becomes a function of the product mix,
  which spawns three conditionals. None of them are about glass.
- **Two separate blocks** (positive side / flask on plain `flask`) — removes the coupling entirely but
  costs a standing **16.33 acetylene/s**, +0.067 latex/s, and +1.11 ore-quartz/s, permanently.
- **An acetylene stub** — a second flask glassworks on its own acetylene header, opened by a pump when
  the flask buffer drains. This is what settled the question: working out what the stub had to cover is
  what exposed the real failure mode, which is not a shortfall at all (below).
- **A COG@250 bypass** — what is built. One pump taps gas from upstream of the heat exchanger straight
  into the fuel header. **No second fluid enters the block.**

The bypass wins because it addresses the actual failure and the stub did not: the hazard is a **blocked
fuel path**, not a fuel deficit, and no amount of imported acetylene unblocks a stalled heat exchanger.
It is also free — see below — where the stub carried a standing pipe and a second header.

## The fuel path is in series, and that is the whole problem

```
coke-coal (hpf)  →  COG @250  →  warm-stone-brick-1 (rhe)  →  COG @100  +  warm-stone-brick
                                                                 ↓               ↓
                                                            glassworks      warm-air-1 (rhe)  →  hot-air
```

`warm-stone-brick-1` emits **both** COG@100 and warm-stone-brick, and a machine stalls when *any* output
backs up. So when glass and petri stop drawing hot-air:

```
hot-air backs up → warm-air-1 stops → warm-stone-brick backs up
                 → warm-stone-brick-1 STALLS → COG@100 stops being produced at all
                 → every glassworks starves, including the flask machine
```

**The entire fuel supply sits downstream of a machine that stalls on a solid byproduct belonging to the
hot-air line.** `coke-coal` still has gas in front of it; it cannot get through. This is a total stall,
not a degradation, and it is reachable from "nobody is taking glass or petri dishes right now."

### The bypass, and why it costs nothing

One `pump` from the @250 header into the COG@100 tank. Both temperatures burn for the same 1.0 MJ —
`coke-oven-gas` has `fuel_value: 1,000,000` flat — so the only thing forgone is **0.375 hot-air per
COG**. In the exact state where the gate opens, that hot-air is hot-air nobody wants; wanting less of it
is what stalled the exchanger. **The bypass has zero marginal cost in every state where it fires**, and
the gas it moves is gas that could not otherwise move at all.

Temperatures mix in the tank and nothing downstream cares: the glassworks fuel box and
`oil-boiler-mk01`'s fuel box are both unfiltered inputs with no temperature bound, and COG's
`max_temperature` is 1000.

> **It must be a pump, never a pipe.** Same fluid at two temperatures averages across a shared network.
> `warm-stone-brick-1` requires `minimum_temperature: 250` exactly, and its only source emits at exactly
> 250 — so **any** backflow of @100 gas into the inlet header stalls all six exchangers simultaneously,
> which is the same total stall by a different route. Pumps are directional; the @250 header must never
> receive return gas. This is the one wiring mistake in this block that produces a dead factory rather
> than a slow one.

## The control law — for sizing, not control

```
net COG  =  18.333·P  +  5.238·G  −  10.000·F          (MJ/s, = COG/s at 1.0 MJ/unit)
              petri/s     glass/s     flask/s
```

Coefficients fall out of two facts: hot-air per unit is **25 / 7.143 / 16.667** for petri / glass /
flask, each hot-air drags 2.667 COG through the exchanger, and each unit costs its own glassworks time
plus the `glass-2` behind it. Derivation in § How the fuel closes.

**Nothing in the build computes this.** Two pumps read one tank at opposite thresholds:

| tank level | gate | role |
|---|---|---|
| above ~90 % | COG@100 → `oil-boiler-mk01` | surplus sink, lowest priority |
| middle | both shut | buffer floats just under the high gate |
| below ~30 % | **COG@250 → tank** | the bypass: unblocks the fuel path |

Non-overlapping thresholds, no arithmetic, nothing measures a fuel balance. In normal operation the
surplus is 12.056 MJ/s against the boiler's **14.805 MJ/s** fuel ceiling (`max_energy_usage` 29.61 MW is
heat output, not fuel burn — solver-reference § Power & energy), so **the boiler runs at 81 %** and the
tank drains only 2.75 MJ/s faster than it fills while the gate is open. It oscillates in a narrow band
below the high gate; one boiler is sufficient and the 1 : 4 pairing is unaffected.

### Operating envelope — the built caps, not the ledger

The block has three hard ceilings, and **the fuel sign is almost never the one that binds**:

```
hot-air        22.500 /s     6 hpf at 60 COG/s x 0.375
molten-glass   27.000 /s     9 borax-mine at 1.00 ore/s ÷ 0.3333 ore per mg   (the glass-2 bank is 30.0)
fuel           60.000 MJ/s   6 hpf x 1.0 MJ
```

Max flask at design 01's petri demand `P = 0.240`:

| glass draw G | max flask, no bypass | binds | **max flask, bypass** | binds |
|--:|--:|---|--:|---|
| **0** | 0.440 | **fuel sign** | **0.630** | molten-glass |
| 0.257 | 0.575 | *both, exactly* | 0.575 | — |
| 0.500 | 0.523 | molten-glass | 0.523 | — |
| 1.000 | 0.416 | molten-glass | 0.416 | — |
| **1.843** (nominal) | **0.200** | hot-air | **0.200** | — |

`F = 0.440 + 0.524·G` (fuel sign) crosses `F = 0.630 − 0.214·G` (ore) at **G = 0.257**. Above that glass
draw the **ore supply runs out before the fuel sign does** — the block physically cannot reach a COG
deficit. Leaving all 14 mines standing instead of 9 raises the mg cap to the bank's 30.0/s and moves the
crossover to **G = 0.379**.

**This is why the published "break-even 1.406 flask/s" was the wrong number.** That figure, and the
10 acetylene/s it implied, treat COG as scaling freely with demand — true when *sizing* the block, false
for the 39 buildings actually placed. Reaching those points needs more hpf and more exchangers, i.e. a
bigger block, not an import line.

### The case the bypass exists for

When glass **and** petri both back up, flask alone is left drawing, and flask alone is net −10.00 MJ:

| flask /s | hot-air | COG pulled | fuel need | **deficit = bypass** | coke /s |
|--:|--:|--:|--:|--:|--:|
| 0.200 | 3.333 | 8.889 | 10.889 | **2.000** | 2.18 |
| 0.440 | 7.333 | 19.556 | 23.956 | **4.400** | 4.79 |
| 0.630 | 10.500 | 28.000 | 34.300 | **6.300** | 6.86 |
| **0.810** (ore cap) | 13.500 | 36.000 | 44.100 | **8.100** | 8.82 |

```
deficit  =  10.000 x flask/s      exactly, at every flask rate
```

**It never closes.** There is no self-sufficient operating point in that state — a buffer only delays
it. At the ore-bound ceiling the bypass carries 8.100 COG/s against the hpf bank's 60, so **the bypass
covers the entire feasible set of the built block.** Acetylene here is not unlikely, it is unreachable:
past the fuel cap the block throttles rather than importing, and ore binds before fuel at every G.

Note also what coke does in this state: **2.18/s at F = 0.200, against 12.00/s nominal** — the block is
small when glass and petri are off. The bypass raises the coke *floor*, never the ceiling, so **the coke
sink is not sized by it.**

### Floor configuration — no glass at all

The `G = 0` column is the one that makes the build decision easy: **the block closes on science alone.**
Petri and flask by themselves are COG-positive, so glass is upside, not justification.

| | floor (G = 0) | ceiling (G = 1.843) |
|---|--:|--:|
| **buildings** | **22** | 39 |
| raw-coal | 12.444 /s | 30.000 /s |
| molten-glass · hot-air | 12.667 · 9.333 | 25.833 · 22.500 |
| COG produced | 24.889 | 60.000 |
| glassworks draw | 22.489 MW | 47.944 MW |
| **excess COG** | **+2.400 /s** | +12.056 /s |
| oil-boiler · engines | 1 · 1 | 1 · 4 |
| net grid | 5.93 MW | 6.98 MW |
| ore-quartz · stone | 4.222 · 0.422 | 8.611 · 0.861 |
| **coke out** | **4.978 /s** | 12.000 /s |

Against design 01's current chain **with no glass product at all**: 27 buildings → **22**, acetylene
120.2/s → **0**, ore-quartz 13.20 → 4.22/s, plus **4.98 coke/s** — for 12.44 raw-coal/s and 0.4 MW more
grid. The whole case closes before glass is mentioned.

**At the floor the boiler and engine are not optional.** The 2.400 COG/s surplus has no other sink, and
COG backing up stalls `coke-coal`. At the ceiling the large `glass-2` bank absorbs most of the gas and
the boiler is a trim; at `G = 0` it is the only thing between you and a deadlock on a fluid the ruleset
will not let you vent.

The block walks continuously between the two columns — pull less glass and `hotair-molten-glass` stops,
molten-glass backs up, `glass-2` throttles, hot-air backs up, `coke-coal` throttles, and raw-coal intake
falls to 12.444/s. **The 39 buildings are a ceiling, not an operating point.**

### Dispatch mode — the other thing the bypass unlocks

Run all 6 hpf *regardless* of hot-air demand and the glass-off configuration becomes a power block
instead of a trickle. At `P = 0.240, F = 0.200, G = 0` the glassworks draw 22.489 of the 60 MJ/s:

```
surplus 37.511 MJ/s  →  152.0 steam/s  →  3 oil-boiler + 11 steam-engine  =  37.51 MW
```

against the nominal 1 + 4 / 12.06 MW. **+9 buildings for +25.5 MW**, and it pins coke at 12.00/s instead
of 4.98. Same pump, opposite reason: the gate version of the bypass never asks for more gas than the
recipes need, this one deliberately does. Not built — recorded because it is the only use of the bypass
that *does* move the coke sink.

## Sizing: glass is the residual

Petri-dish and flask are pinned to design 01's demand. **Raw-coal is clamped at 30/s** and whatever
hot-air that buys beyond petri and flask goes to glass:

```
raw-coal(G) = 12.4444 + 9.5238·G      →   G = (30 − 12.4444) / 9.5238 = 1.84333 glass/s
```

**Petri and flask take a fixed 12.4444 raw-coal/s off the top**, so all marginal coal goes to glass —
doubling the clamp from 15 to 30 gives **6.9× the glass** (0.268 → 1.843), not 2×. Next landmark is
2.333 glass/s at raw-coal **34.67/s**, where the `hotair-molten-glass` machine hits exactly 100 %.

At a fixed clamp **hot-air is the budget**, and the three products compete for it at 25 / 16.667 / 7.143
each. **One flask displaces 2.33 glass.**

```
petri  0.240 × 25.000  =   6.000
flask  0.200 × 16.667  =   3.333
glass  1.843 ×  7.143  =  13.167
                          ──────
                          22.500  hot-air/s
```

The other clamps: `coke 15/s` gives 2.631 glass/s, `ore-quartz 15/s` gives 4.527 glass/s but draws
55.56 raw-coal/s — **quartz never binds**, because `glass-2` is efficient enough that coal is always the
scarce input.

## Block boundary

| class | items |
|---|---|
| **import — readily available** | raw-coal, water, electricity |
| **import — from design 01** | stopper (its latex chain) |
| **mined in-block** | ore-quartz — `borax-mine` on the crystal patch, **no mining fluid** |
| **must-consume-internally** | crushed-quartz, molten-glass, hot-air, pressured-air, coke-oven-gas (both temperatures), coke, coal-gas, tar, steam, warm-stone-brick, stone-brick |
| **byproduct-exclude** | none |

No conditional imports. `ore-quartz` has `resource_category: "borax"` and **no `required_fluid`**;
`quartz-rock` is the other quartz resource and wants acetylene 3/ore — not this one.

**Coke-oven-gas is a temperature-variant boundary** (rule 19) and is deliberately kept internal for that
reason. The solver reports it as two columns, 250 °C consumed and 100 °C emitted; the bypass merges them
physically, which is legal only because `fuel_value` is temperature-blind and only in that direction.

## Recipe table — at the nominal point

Counts are solver output except where the `src` column says otherwise. `solve` = reported by the commands
in § Solver commands. `calc` = the solver models neither mining nor fluid-burner fuel, so these are
derived from prototype fields and are deterministic, not estimates. **No padding is in this table.**

```
┌─────────────────────────┬──────────────────┬───────┬──────┬───────┬─────────┬────────┐
│ Recipe                  │ Factory          │ Count │ src  │ Size  │ MW each │ load   │
├─────────────────────────┼──────────────────┼───────┼──────┼───────┼─────────┼────────┤
│ (mining)                │ borax-mine       │     9 │ calc │ 9x9   │    0.42 │  96 %  │
│ crushing-quartz         │ jaw-crusher      │     2 │ solve│ 7x7   │    1.00 │  86 %  │
│ glass-2                 │ glassworks-mk01  │     4 │ solve│ 7x7   │  (gas)  │  86 %  │
│ hotair-empty-petri-dish │ glassworks-mk01  │     1 │ solve│ 7x7   │  (gas)  │  36 %  │
│ hotair-flask            │ glassworks-mk01  │     1 │ solve│ 7x7   │  (gas)  │  20 %  │
│ hotair-molten-glass     │ glassworks-mk01  │     1 │ solve│ 7x7   │  (gas)  │  79 %  │
│ coke-coal               │ hpf              │     6 │ solve│ 7x7   │    2.00 │ 100 %  │
│ warm-stone-brick-1      │ rhe              │     5 │ solve│ 5x5   │    0.30 │  96 %  │
│ warm-air-1              │ rhe              │     1 │ solve│ 5x5   │    0.30 │  30 %  │
│ pressured-air           │ vacuum-pump-mk01 │     1 │ solve│ 3x3   │    1.00 │  11 %  │
│ (steam)                 │ oil-boiler-mk01  │     1 │ calc │ 5x5   │  (gas)  │  81 %  │
│ (power)                 │ steam-engine     │     4 │ calc │ 3x5   │       — │  81 %  │
│ (COG buffer)            │ py-tank-4000     │     1 │ calc │ 3x3   │       — │   —    │
│ (boiler gate, bypass)   │ pump             │     2 │ calc │ 1x2   │   0.029 │   —    │
└─────────────────────────┴──────────────────┴───────┴──────┴───────┴─────────┴────────┘
```

**39 buildings · ~1,721 tiles · 19.04 MW drawn, 12.06 MW self-generated, 6.98 MW net grid**

The three consumer glassworks cross-check against each other: solved separately at design 01's demand
they report hot-air **6.00 + 3.33 + 13.17 = 22.50/s**, molten-glass **6.00 + 6.67 + 13.17 = 25.84/s**,
ore-quartz **2.00 + 2.22 + 4.39 = 8.61/s** and stone **0.20 + 0.22 + 0.44 = 0.86/s** — every total
matching the combined `glass-2` run independently.

### Optional pads — not in the count above

| pad | takes | why | cost |
|---|---|---|---|
| **2nd `hotair-flask`** | 1 → 2 | flask capacity 1.00 → 2.00/s, and the one machine carrying all science flasks stops being a single point of failure. Both sit on the same COG header, so there is no fuel switching | 49 tiles |
| **6th `warm-stone-brick-1`** | 5 → 6 | **N+1**: 5 give 62.5 COG/s of capacity, so losing one drops to 50.0 and takes 17 % off all three products at once; 6 give 75.0 and losing one still clears the 60 needed | 25 tiles, 0.30 MW |

Both pads → **41 buildings, ~1,795 tiles**. Neither changes a single rate, and load-weighted power is
unaffected because an idle pad draws nothing. The N+1 test also marks a **4th distilator** and a **5th
`glass-2`**; a **7th hpf is not a pad** — 6 exchangers can pass 70 COG/s, so it raises the ceiling and
breaks the 30/s raw-coal clamp.

**Inputs** (/s): raw-coal 30.000 · water 48.848 · stopper 0.267 · electricity 6.98 MW net

**Exports** (/s): glass 1.843 · empty-petri-dish 0.240 · flask 0.200 · stone 0.861 · **coke 12.000 → the
dump annex below**

## Intermediate flows

```
┌──────────────────┬─────────┬────────────────────────────┬─────────────────────────────────────────┐
│ Item             │ Rate /s │ Producer                   │ Consumer                                │
├──────────────────┼─────────┼────────────────────────────┼─────────────────────────────────────────┤
│ ore-quartz       │   8.611 │ 9x borax-mine              │ crushing-quartz 8.611                   │
│ crushed-quartz   │   1.722 │ crushing-quartz            │ glass-2 1.722                           │
│ molten-glass     │  25.833 │ glass-2                    │ petri 6.000, flask 6.667, glass 13.167  │
│ hot-air          │  22.500 │ warm-air-1                 │ petri 6.000, flask 3.333, glass 13.167  │
│ pressured-air    │  22.500 │ pressured-air              │ warm-air-1 22.500                       │
│ warm-stone-brick │   3.000 │ warm-stone-brick-1         │ warm-air-1 3.000                        │
│ stone-brick      │   3.000 │ warm-air-1                 │ warm-stone-brick-1 3.000   ← closed     │
│ COG @250 °C      │  60.000 │ coke-coal                  │ warm-stone-brick-1 60.000, bypass 0.000 │
│ COG @100 °C      │  60.000 │ warm-stone-brick-1         │ glassworks 47.944, tank/boiler 12.056   │
│ steam @250 °C    │  48.848 │ oil-boiler-mk01            │ steam-engine 48.848                     │
└──────────────────┴─────────┴────────────────────────────┴─────────────────────────────────────────┘
```

The bypass row is **0.000 at the nominal point** — all 60 COG/s is pulled through the exchanger because
hot-air demand is exactly 22.500. That is the design working, not an unused building.

## How the fuel closes

```
warm-stone-brick-1 takes COG at ≥250 °C and returns it at 100 °C
   →  heat extracted = 100 units × 1000 J/°C × 150 °C = 15 MJ per craft
   →  but coke-oven-gas has fuel_value 1,000,000 flat — TEMPERATURE-BLIND
   →  the cooled gas still burns for the full 1.0 MJ/unit
```

The exchanger is a free heat tap on a stream that was always going to be burned. `coke-coal` is the only
unlocked COG producer, and it emits at exactly 250 °C — the minimum `warm-stone-brick-1` accepts.

`glassworks-mk01` is a fluid burner with an **empty fuel `fluid_box` filter** — no restriction — and COG
is 1.0 MJ/unit, same as acetylene, so they substitute 1:1. A glassworks has **one** fuel fluid box and
Factorio will not mix two fluids in a pipe; that is why the bypass moves the same fluid rather than a
second one, and why the coke dump below needs two boilers.

```
COG produced             60.000 /s  ×  1.0 MJ        =  60.000 MJ/s
glassworks draw           4.794 fractional × 10 MW   =  47.944 MJ/s
                                                        ──────────
surplus at nominal                                      12.056 MJ/s   — 25.1 %
```

Surplus goes to `oil-boiler-mk01` (effectivity 2) → `steam-engine` (effectivity 0.5), a 1.00 MJe/MJ
round trip yielding **12.06 MW**.

### Which consumers pay, per unit of molten-glass

| recipe | hot-air / mg | COG credit | glassworks cost | net |
|---|--:|--:|--:|--:|
| `hotair-empty-petri-dish` | 1.000 | 2.667 MJ | 1.933 MJ | **+0.733** |
| `hotair-molten-glass` | 1.000 | 2.667 MJ | 1.933 MJ | **+0.733** |
| `hotair-flask` | 0.500 | 1.333 MJ | 1.633 MJ | **−0.300** |
| `hotair-lens` | 0.500 | 1.333 MJ | 1.633 MJ | −0.300 |

**Every unlocked hot-air glassworks recipe takes exactly 50 hot-air per craft.** Molten-glass per craft
is what varies — 50 for petri and glass, 100 for flask and lens, 120/140 for `flask-2`/`flask-3`. Hot-air
is a **flat per-craft tax**, so recipes passing the least molten-glass per craft get the most COG per
unit of work. Flask is not an anomaly; it is the one member of the negative half currently in use.

Per unit of product: **+18.333 MJ per petri-dish, +5.238 MJ per glass, −10.000 MJ per flask**.

### Keep `hotair-flask`, never plain `flask`

```
hotair-flask :  10 MJ own  +  44.44 glass-2  −  44.44 COG credit  =   −10.00 MJ per flask
plain flask  :  15 MJ own  +  66.67 glass-2  −  0                 =  −81.67 MJ per flask
```

**8.2× cheaper in net fuel**, plus the stopper saving (3 flask per 4 stopper against 2 — a flat 33 %
cut, worth 0.067 latex/s at design 01's rate).

## The coke dump — 7 buildings

Coke is a structural co-product: `coke-coal` is the only unlocked COG route and the ratio is locked at
**0.2 coke per COG**, so 12.00 coke/s is not optional at this clamp. The sink is sized for value
*captured per tile*, not per MJ, and it is explicitly a low-value dump.

```
coal-gas-from-coke  [U] [distilator, 5 s]  coke 20  →  coal-gas 20 + tar 20 + ash 1
```

```
┌────────────────────────┬──────────────────┬───────┬───────┬─────────┬────────┐
│ Recipe                 │ Factory          │ Count │ Size  │ MW each │ load   │
├────────────────────────┼──────────────────┼───────┼───────┼─────────┼────────┤
│ coal-gas-from-coke     │ distilator       │     3 │ 8x8   │    0.50 │ 100.0% │
│ (burn coal-gas)        │ oil-boiler-mk01  │     1 │ 5x5   │  (gas)  │  16.2% │
│ (burn tar)             │ oil-boiler-mk01  │     1 │ 5x5   │  (gas)  │  16.2% │
│ (power)                │ steam-engine     │     2 │ 3x5   │       — │  64.8% │
└────────────────────────┴──────────────────┴───────┴───────┴─────────┴────────┘
```

**7 buildings · 272 tiles · 1.50 MW drawn · 4.80 MW generated · net +3.30 MW**

- **In** (/s): coke 12.000 · water 19.453
- **Out** (/s): **ash 0.600**
- **Intermediates** (/s): coal-gas 12.000 · tar 12.000 · steam 19.453

**It captures 8 % of the coke's energy.** `coal-gas` and `tar` are **0.2 MJ/unit each**, so 60.0 MJ/s of
chemical energy becomes 4.80 MJ/s. That is the deliberate trade — see what it beat.

**The boilers are 16.2 % loaded and that is not a sizing error.** `oil-boiler-mk01`'s
`max_energy_usage` 29.61 MW is **heat output, not fuel burn** (solver-reference § Power & energy), so at
effectivity 2 its fuel ceiling is **14.805 MJ/s** against 2.40 MJ/s of fuel each — **the pair absorbs up
to 74 coke/s**, 6× this block's output. Raising the raw-coal clamp never touches them and there is no
sizing risk anywhere in the annex. Two is forced only because coal-gas and tar cannot share a fuel box.
The cost is 50 tiles of 5×5 boiler at 16 %, which cannot be shrunk.

**This sits at lowest priority on a coke splitter** (rule 29). It is a fallback, not a commitment: when
design 13 is running you bias the splitter toward 3 distilators *there* and these boilers idle. Unlike a
void it stays legal with no ask — burning is the sanctioned answer for both coke and coal-gas.

**Burn the tar rather than tanking it.** The boiler and engine are already placed for the coal-gas, so it
costs nothing, and a priority splitter on the tar line later is free. 12.00 tar/s is worth 2.40 MW burned
against **5.16 aromatics/s** refined, so the valve is the upgrade path.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| glass | 1.843 | the product — building material | — | — |
| empty-petri-dish | 0.240 | design 01 `petri-dish` | — | importing it |
| flask | 0.200 | design 01 `py-science-pack-1` | — | — |
| stone | 0.861 | **export** — design 01 imports 1.00/s for `sodium-alginate` | 0 | mining it; `stone-brick` is the fallback |
| **coke** | 12.000 | **`coal-gas-from-coke` → burn both fluids**, 7 bldg / 272 tiles / **+3.30 MW** | 8 % energy captured | see table below |
| **ash** | 0.600 | **steel chests**, then `rich-clay` | 0 | see below |

### What the coke dump beat

| route | bldg | tiles | result at 12.00 coke/s | why not |
|---|--:|--:|---|---|
| **burn coke directly** in solid `boiler` | 24 | **216** | **+29.6 MW** | **`coke` has `burnt_result: ash`** — 11.84 ash/s, 20× the chosen route, cascading into 3 `rich-clay` plus a rich-clay sink. Fewer tiles and 9× the power, paid for in a byproduct problem |
| ship coke → design 13's `coal-gas-from-coke` | 3 | 192 | ~8.26 aromatics/s | **better value, and it stays the upgrade** — but it needs design 13 running, which the glass works must not wait on |
| on-site acetylene chain | 21 | ~1,000 | **128.00 acetylene/s** + CO₂ 20.27/s | real value, but a whole block at 18.45 MW, and it drives design 13 to `r ≈ 0.946`, costing it ~88 MW of generation for +6.0 aromatics/s |
| `graphite` [hpf] | 8 | 392 | 4.80 graphite/s | only unlocked graphite route and 44 consumers, but the base wants **1.20/s**; 14.4 MW for a 4× oversupply. Tap 3.00 coke/s with 2 hpf if design 14 wants it |
| `resistor1` | 10 | 490 | absorbs 31 % | glass-bound, not a disposal route |
| `steel-plate` | 36 | — | 2.40 steel/s | needs iron-ore 48/s — a reason to *want* coke, not to dispose of it |
| `coke-co2` | 30 | 1,470 | CO₂ 480/s | destroys 60 MJ/s **and** draws 60 MW |

### Ash

`ash` has **stack_size 1000**, so a 48-slot steel chest holds 48,000 = **22 hours** at 0.600/s. Park two
or three and decide later. The eventual sink is `rich-clay` [U] `ash 25 + water 500 → rich-clay 10` in a
`chemical-plant-mk01` — **1 building at 14.4 %**, but 9×9 and 1.00 MW for 0.60 ash/s, and it emits
rich-clay 0.240/s wanting its own home. Not worth it until something downstream asks for clay.

## Backpressure and risk order

The old `glass-1` block was fluid-in / glass-out and could never deadlock on a solid. This one has four
distinct stall paths, two of which are on streams small enough to be overlooked.

| | risk | why |
|---|---|---|
| 1 | **the @250 header receiving return gas** | mixed temperature fails `minimum_temperature: 250`, all 6 exchangers stall at once, **total dead stop**. Directional pump only. The one mistake with no graceful degradation |
| 2 | **raw-coal 30/s** | 2× design 13's entire input — the dominant new mining requirement, and it scales everything proportionally |
| 3 | **the 3 distilators at exactly 100 %** | one down → coke backs up → `coke-coal` stops → no COG → no hot-air **and** no glassworks fuel → total stall. Unlike the 6 hpf, which *are* the clamp by construction, these have no fault margin. A 4th at 75 % is **64 tiles** for it — the one place in the annex where padding buys something |
| 4 | **ash 0.600/s** | trivial rate, same cascade: ash backs up → distilators stall → coke backs up → block stalls. Chests give 22 h each; the sink is load-bearing regardless of how small the number looks |
| 5 | **`stone-brick` loop** | 3.000/s circulates and nets to zero, so nothing refills it. One stray inserter drains it and hot-air stops with no obvious cause. Self-healing if one `stone-brick` furnace is added — `stone 2 → 1`, and the block makes 0.861 stone/s |
| 6 | stopper 0.267/s | throttles flask only; the block scales down rather than stalling |
| 7 | stone 0.861/s | design 01 wants 1.00/s, so this is nearly a clean offset |

The fuel margin is deliberately **not** on this list — the bypass converts it from a failure mode into a
reallocation of gas that was already produced.

`t = min(sink_i / rate_i)` over every terminal output, including ash: at 0.600/s against three steel
chests (48 slots × stack 1000) ash gives **66 h**. It is the only terminal output here backed by a
finite buffer rather than a flow sink, so it is the one whose window is knowable from this design alone
— the others depend on design 01's receiving capacity and are not settled here.

## Build notes

- **`oil-boiler-mk01` and `steam-engine` pair exactly 1 : 4.** The boiler makes 60 steam/s
  (`max_energy_usage` 493,500 J/tick ÷ 0.4935 MJ per 250 °C unit); each engine takes 15. So 4 engines
  cap steam demand at 60/s and **a second boiler can never exceed 50 % load** in the nominal
  configuration. The maximum surplus with flask fully stopped is
  `18.333(0.240) + 5.238(1.843) = 14.056 MJ/s` → 56.97 steam/s, still inside one boiler. Dispatch mode
  is the only configuration that changes this.
- **The 6 `coke-coal` hpf *are* the raw-coal clamp.** They cap intake at 30/s by construction, so the
  coal line needs no metering — and a 7th would break the clamp rather than add safety. This is the one
  place where 100 % load is correct rather than risky.
- **Padding is argued from N+1, never from load percentage.** High utilisation is not itself a risk — a
  96 % machine is not closer to failing than an 80 % one. What matters is whether losing one unit drops
  the bank below demand. See § Optional pads for the two that pass that test and the one (a 7th hpf)
  that cannot.
- **Three gate signals, all output-side, none computing a balance.** The boiler pump is load-bearing:
  Factorio fluid distribution equalises rather than prioritising, so without it the boiler drains gas
  the flask machines need. Cost of the gate: the boiler's 12.06 MW stops being firm, so grid draw swings
  6.98 → 19.04 MW during a drawdown.
- **Wire a lamp to the bypass pump's enable condition.** That pump opens only when glass or petri has
  backed up, so it is simultaneously the earliest notice of a fuel-path block *and* an indicator of the
  upstream demand fact you actually want to know. One lamp. Without it the first symptom is a glassworks
  stutter displaced from whatever stopped taking product.
- **`py-tank-4000`** (40,000 in 3×3) is 1.6× `storage-tank` in the same footprint. **The window is the
  spacing between the two gates, not the tank size** — from the boiler gate at 90 % down to a bypass
  gate at 30 % gives 24,000 usable:

  | breach | deficit | window |
  |---|--:|--:|
  | glass + petri off, flask 0.200/s | 2.00 COG/s | **3.33 h** |
  | ...flask 0.630/s | 6.30 | 1.06 h |
  | ...flask 0.810/s (ore cap) | 8.10 | 0.82 h |

  Moving the bypass gate to 10 % buys 4.44 h at the first row; `py-tank-10000` multiplies all of it by
  2.5 for 8×8 instead of 3×3. The window is only the time to *notice* — the bypass then holds
  indefinitely, so this is comfort, not a dependency.
- **`borax-mine` costs `fluid-drill-mk01` ×1 + `soil-extractor-mk01` ×1** each. Nine here against the 14
  the current ore rate implies, so this **frees 5 mines**. Leaving all 14 standing instead raises the
  molten-glass cap from 27.0 to the bank's 30.0/s and pushes the fuel-sign crossover to `G = 0.379` —
  cheap insurance if the mines are already placed, and it needs a 3rd jaw-crusher above 10 ore/s.
- `steam-turbine-mk01` accepts only `pressured-steam` ≥500 °C. `steam-engine` is the generator here
  (`min_temp 100`, max 500, effectivity 0.5). `py-oil-powerplant-mk01` burns fluid at effectivity 1 but
  is an assembling-machine running a molten-salt recipe — same gate as the parked powerplant branch.
- **39 buildings sits just under the 40 stamping threshold; both pads put it at 41.** Three seams if
  you split: 9 mines on the patch, gas plant (6 hpf + 6 rhe + vacuum-pump) at 13, glass core
  (7 glassworks + 2 crushers + boiler + engines + tank + pumps) at 17. The coke dump is a fourth, fully
  detachable pad.

## Against design 01's current glass chain

| | `glass-1` today | this block |
|---|--:|--:|
| glassworks | 13 | 7 |
| crystal mines (`borax-mine`) | 14 | 9 |
| other | — | 2 crusher · 6 rhe · 6 hpf · 1 pump · 1 boiler · 4 engines · 1 tank · 2 gate pumps |
| **buildings** | 27 | **39** (+7 dump) |
| footprint | ~1,770 tiles | ~1,721 (+272) tiles |
| **acetylene** | **120.2 /s** | **0 — not conditional** |
| raw-coal | — | 30.00 /s |
| **ore-quartz** | **13.20 /s** | **8.61 /s** |
| stopper → latex | 0.400 → 0.200 | **0.267 → 0.133** |
| **glass out** | — | **1.843 /s** |
| coke → ash | — | 12.00 → 0.600 /s |
| net grid | 5.54 MW | **3.69 MW** (6.98 − 3.30 from the dump) |

```
today  :  120.2 acetylene + 5.54 electric                  =  125.74 MJ/s
this   :  90.0 raw-coal (30/s x 3.0 MJ) + 3.69 net grid    =   93.69 MJ/s
```

**1.34× better, and that figure now includes what the coke is actually worth** rather than assuming a
credit — the dump's +3.30 MW is the realized value of 12.00 coke/s, not its 60 MJ/s of chemical energy.
Route the coke to design 13 instead and the comparison improves again; the published 3.4× from valuing
coke at its plain 5 MJ was an upper bound nothing in this design collects. The glass is ignored
throughout.

## Solver commands

Three runs: two for the upstream chains, one for the dump. The consumers are fixed demand, computed
directly (`hotair-empty-petri-dish` 0.120 crafts/s, `hotair-flask` 0.0667, `hotair-molten-glass`
0.2633) — `--target` honours only its last occurrence, and with one machine each there is nothing to
optimise. Drills, glassworks fuel and every boiler/engine pair are computed by hand: the solver models
neither mining nor fluid-burner fuel, and **its MW figure counts every glassworks' 10 MW as electric**.

```bash
npx tsx src/cli.ts solve \
  --recipes "glass-2,crushing-quartz" \
  --target "molten-glass:25.8333" --time 1 \
  --factory "glass-2:glassworks-mk01" \
  --factory "crushing-quartz:jaw-crusher" \
  --solver simplex \
  --unlocked
```

```bash
npx tsx src/cli.ts solve \
  --recipes "warm-air-1,warm-stone-brick-1,pressured-air,coke-coal" \
  --target "hot-air:22.5" --time 1 \
  --factory "warm-air-1:rhe" \
  --factory "warm-stone-brick-1:rhe" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "coke-coal:hpf" \
  --solver simplex \
  --unlocked
```

The dump. Input mode because it is supply-driven off a fixed coke rate with three outputs — target mode
on any one of them would drop the others:

```bash
npx tsx src/cli.ts solve \
  --recipes "coal-gas-from-coke" \
  --input "coke:12.0" --time 1 \
  --factory "coal-gas-from-coke:distilator" \
  --solver simplex \
  --unlocked
```

No `--max-import` is needed in any of the three — nothing here needs a recycling loop forced. The
`stone-brick` cycle closes on its own and the solver zeroes it correctly (it emits a cycle warning;
ignore it, the loop is intentional). The solver reports `coke-oven-gas` twice — 250 °C consumed by
`warm-stone-brick-1`, 100 °C emitted as an output. **That 100 °C row is the block's fuel, not waste.**

The acetylene chain, kept only as the priced alternative. `--max-import` is load-bearing here: without
it the LP imports limestone (free in its objective) and leaves slacked-lime as waste instead of closing
the loop. At `acetylene:128` it consumes exactly 12.00 coke/s:

```bash
npx tsx src/cli.ts solve \
  --recipes "lime,calcium-carbide,acetylene,slacked-lime-void" \
  --target "acetylene:128" --time 1 \
  --factory "lime:hpf" --factory "calcium-carbide:hpf" \
  --factory "acetylene:gasifier" --factory "slacked-lime-void:evaporator" \
  --max-import "limestone:2.05" \
  --solver simplex \
  --unlocked
```

## Sunset condition

This architecture is temporary. `glass-3` [glassworks, 4 s] `pure-sand 10 + powdered-quartz 2 → molten-glass 50`
makes **50 molten-glass per 4 s against `glass-2`'s 30**, dropping the upstream cost from 1.333 to
**0.800 MJ per molten-glass**. That 0.533 lifts every recipe by the same amount:

| | with `glass-2` | with `glass-3` |
|---|--:|--:|
| petri-dish, glass | +0.733 | +1.267 |
| **flask** | **−0.300** | **+0.233** |

**Flask goes COG-positive**, and the second flask machine, the bypass, the gate pumps and the control law
all become dead weight — the block collapses to "make gas, make glass, burn the surplus." It is two gates
away: `quartz-mk02` requires the unresearched `rare-earth-tech`, and `glass-3` additionally needs
`pure-sand`, whose only two recipes (`sand-washing`, `sponge-pure-sand`) are both locked. Not soon — but
the architecture has a known expiry, which is worth knowing before committing 39 buildings.

Note what does *not* sunset: the series-coupling hazard in § The fuel path is a property of
`warm-stone-brick-1` emitting two products, not of the fuel sign. Any future block that taps the
exchanger for heat inherits it.

## Build materials

Distinct construction materials across this block's 12 building types, separate from flow imports:

`boiler` · `copper-plate` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `inductor1` · `intermetallics` · `iron-plate` · `lab` · `pipe` ·
`small-parts-01` · `soil-extractor-mk01` · `steam-engine` · `steel-plate` · `stone-brick` ·
`transport-belt`

**The coke dump adds nothing to this list.** `distilator` costs
`pipe 10 + steam-engine 2 + inductor1 3 + small-parts-01 10 + copper-plate 20 + iron-plate 10` and
`steel-chest` costs `steel-plate 8` — every item already required by the main block. The annex is free
on materials and costs only placement.

The two to check before starting are **`soil-extractor-mk01`** and **`fluid-drill-mk01`**, one of each
per `borax-mine` — and `fluid-drill-mk01` is the same item the mk02 outpost upgrades (designs 19–22)
consume, so stage them against each other. `gasifier` and `lab` appear only via `oil-boiler-mk01`,
`boiler` only via `rhe`, `engine-unit` only via `pump`. Inferred from the recipe graph, not from save
state.
