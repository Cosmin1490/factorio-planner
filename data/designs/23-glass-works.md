# 23 — Glass works — glass + petri-dish + flask, 26 buildings, no standing acetylene

Replaces design 01's inline `glass-1` chain. Three changes compound: the **crushed-quartz route**
(`glass-2`), the **hot-air variants** on every consumer, and **`coke-coal` as the fuel source** — which
together take acetylene from **120.2/s to zero at the nominal point** and turn the block into a coke
exporter.

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

## Architecture — coupled, but each failure mode reasoned alone

The three products do not sit on the same side of the fuel ledger. Petri-dish and glass **generate**
surplus coke-oven-gas; flask **consumes** it. Two cleaner-looking designs were considered and rejected:

- **One welded block** (fixed product ratio) — the fuel margin becomes a function of the product mix,
  which spawns three conditionals: a plain/hot-air glass dial, a COG buffer, and an acetylene annex.
  None of them are about glass.
- **Two separate blocks** (positive side / flask on plain `flask`) — removes the coupling entirely but
  costs a standing **16.33 acetylene/s**, +0.067 latex/s, and +1.11 ore-quartz/s, permanently.

This design keeps the coupling and makes it **monotonic and benign** instead: flask machines are
duplicated across two fuel headers, one on surplus COG and one on an acetylene stub. More petri/glass
demand → less acetylene; less demand → more acetylene. **The failure direction is "import a bit more
gas", never a stall.** The whole coupling is insured by a 10/s pipe.

That is the design property being bought: not fewer failure modes, but failure modes that can be
reasoned about one at a time.

## The control law

```
net COG  =  18.333·P  +  5.238·G  −  10.000·F          (MJ/s, = COG/s at 1.0 MJ/unit)
              petri/s     glass/s     flask/s

  net > 0  →  excess to oil-boiler + steam-engines
  net < 0  →  acetylene import = −net
```

Coefficients fall out of two facts: hot-air per unit is **25 / 7.143 / 16.667** for petri / glass /
flask, each hot-air drags in 2.667 COG, and each unit costs its own glassworks time plus the `glass-2`
behind it. Derivation in § How the fuel closes.

**Nothing in the build computes this.** Two pumps read local, output-side signals:

| pump | signal | role |
|---|---|---|
| acetylene stub → `hotair-flask` #2 | **flask buffer chest below N** | shortfall make-up |
| COG → `oil-boiler-mk01` | **COG tank above ~90 %** | overflow sink, lowest priority |

The margin tracks itself. No circuit measures a fuel balance, and crossing zero cannot fail silently —
the flask chest simply drains and the stub opens. The formula above is for **sizing**, not control.

### Operating envelope

At design 01's P = 0.240 and the raw-coal 15/s clamp (G = 0.268):

| scenario | P | G | F | net COG | **acetylene** |
|---|--:|--:|--:|--:|--:|
| **nominal** | 0.240 | 0.268 | 0.200 | **+3.81** | **0** |
| glass demand off | 0.240 | 0 | 0.200 | +2.40 | 0 |
| petri demand off | 0 | 0.268 | 0.200 | −0.60 | 0.60 /s |
| both off | 0 | 0 | 0.200 | −2.00 | 2.00 /s |
| flask break-even | 0.240 | 0.268 | **0.581** | 0 | 0 |
| flask 5× | 0.240 | 0.268 | 1.000 | −4.19 | 4.19 /s |
| worst realistic | 0 | 0 | 1.000 | −10.00 | **10.00 /s** |

**A 10/s acetylene stub covers every case** — one pipe, one pump. Against the 16.33/s the split
architecture imports continuously, and the 5-building annex that was rejected.

Flask has **2.9× headroom before the stub engages at all** (break-even 0.581/s against design 01's
0.200), and the `py-tank-4000` defers it further: at F = 1.00 the deficit is 4.19 COG/s, so a full
tank runs **2.65 h** before any acetylene flows. Tank defers, stub guarantees.

## Sizing: glass is the residual

Petri-dish and flask are pinned to design 01's demand. **Raw-coal is clamped at 15/s** — equal to
design 13's entire input — and whatever hot-air that buys beyond petri and flask goes to glass:

```
raw-coal(G) = 12.4444 + 9.5238·G      →   G = (15 − 12.4444) / 9.5238 = 0.26833 glass/s
```

At a fixed coal clamp **hot-air is the budget**: raw-coal 15/s → COG 30/s → hot-air 11.25/s, and the
three products compete for it at 25 / 16.667 / 7.143 each. **One flask displaces 2.33 glass.**

The other two clamps were priced and rejected: `coke 15/s` gives 2.631 glass/s at 46 buildings,
`ore-quartz 15/s` gives 4.527 glass/s at 61 buildings but still draws 55.56 raw-coal/s — **quartz never
binds**, because `glass-2` is efficient enough that coal is always the scarce input.

## Block boundary

| class | items |
|---|---|
| **import — readily available** | raw-coal, water, electricity |
| **import — from design 01** | stopper (its latex chain) |
| **import — conditional** | acetylene, 0–10/s per the envelope above |
| **mined in-block** | ore-quartz — `borax-mine` on the crystal patch, **no mining fluid** |
| **must-consume-internally** | crushed-quartz, molten-glass, hot-air, pressured-air, coke-oven-gas, steam, warm-stone-brick, stone-brick |
| **byproduct-exclude** | none |

`ore-quartz` has `resource_category: "borax"` and **no `required_fluid`**. `quartz-rock` is the other
quartz resource and wants acetylene 3/ore — not this one.

## Recipe table — at the nominal point

```
┌─────────────────────────┬──────────────────┬───────┬───────┬─────────┬───────┐
│ Recipe                  │ Factory          │ Count │ Size  │ MW each │ load  │
├─────────────────────────┼──────────────────┼───────┼───────┼─────────┼───────┤
│ (mining)                │ borax-mine       │     5 │ 9x9   │    0.42 │  97 % │
│ crushing-quartz         │ jaw-crusher      │     1 │ 7x7   │    1.00 │  97 % │
│ glass-2                 │ glassworks-mk01  │     2 │ 7x7   │  (gas)  │  97 % │
│ hotair-empty-petri-dish │ glassworks-mk01  │     1 │ 7x7   │  (gas)  │  36 % │
│ hotair-flask (COG)      │ glassworks-mk01  │     1 │ 7x7   │  (gas)  │  20 % │
│ hotair-flask (acetylene)│ glassworks-mk01  │     1 │ 7x7   │  (gas)  │   0 % │
│ hotair-molten-glass     │ glassworks-mk01  │     1 │ 7x7   │  (gas)  │  12 % │
│ coke-coal               │ hpf              │     3 │ 7x7   │    2.00 │ 100 % │
│ warm-stone-brick-1      │ rhe              │     3 │ 5x5   │    0.30 │  80 % │
│ warm-air-1              │ rhe              │     1 │ 5x5   │    0.30 │  15 % │
│ pressured-air           │ vacuum-pump-mk01 │     1 │ 3x3   │    1.00 │   6 % │
│ (steam)                 │ oil-boiler-mk01  │     1 │ 5x5   │  (gas)  │  26 % │
│ (power)                 │ steam-engine     │     2 │ 3x5   │       — │  51 % │
│ (COG buffer)            │ py-tank-4000     │     1 │ 3x3   │       — │     — │
│ (gates)                 │ pump             │     2 │ 1x2   │   0.029 │     — │
└─────────────────────────┴──────────────────┴───────┴───────┴─────────┴───────┘
```

**26 buildings · ~1,072 tiles · 9.84 MW drawn, 3.81 MW self-generated, 6.03 MW net grid**

The acetylene flask machine sits idle at the nominal point — that is the design working, not waste.
Two machines also take flask *capacity* to 2.00/s, so neither fuel source is a single point of failure.

**Inputs** (/s): raw-coal 15.000 · water 15.423 · stopper 0.267 · acetylene **0 nominal, 0–10 per envelope** · electricity 6.03 MW net

**Exports** (/s): glass 0.268 · empty-petri-dish 0.240 · flask 0.200 · **coke 6.000** · stone 0.486

## Intermediate flows

```
┌──────────────────┬─────────┬────────────────────────────┬─────────────────────────────────────────┐
│ Item             │ Rate /s │ Producer                   │ Consumer                                │
├──────────────────┼─────────┼────────────────────────────┼─────────────────────────────────────────┤
│ ore-quartz       │   4.861 │ 5x borax-mine              │ crushing-quartz 4.861                   │
│ crushed-quartz   │   0.972 │ crushing-quartz            │ glass-2 0.972                           │
│ molten-glass     │  14.583 │ glass-2                    │ petri 6.000, flask 6.667, glass 1.917   │
│ hot-air          │  11.250 │ warm-air-1                 │ petri 6.000, flask 3.333, glass 1.917   │
│ pressured-air    │  11.250 │ pressured-air              │ warm-air-1 11.250                       │
│ warm-stone-brick │   1.500 │ warm-stone-brick-1         │ warm-air-1 1.500                        │
│ stone-brick      │   1.500 │ warm-air-1                 │ warm-stone-brick-1 1.500   ← closed     │
│ COG @250 °C      │  30.000 │ coke-coal                  │ warm-stone-brick-1 30.000               │
│ COG @100 °C      │  30.000 │ warm-stone-brick-1         │ glassworks 26.194, tank/boiler 3.806    │
│ steam @250 °C    │  15.423 │ oil-boiler-mk01            │ steam-engine 15.423                     │
└──────────────────┴─────────┴────────────────────────────┴─────────────────────────────────────────┘
```

Crushed-quartz feeds every `glass-2` from one crusher — a single mine bank and a single crushing step
serve all three products.

## How the fuel closes

```
warm-stone-brick-1 takes COG at ≥250 °C and returns it at 100 °C
   →  heat extracted = 100 units × 1000 J/°C × 150 °C = 15 MJ per craft
   →  but coke-oven-gas has fuel_value 1,000,000 flat — TEMPERATURE-BLIND
   →  the cooled gas still burns for the full 1.0 MJ/unit
```

The RHE is a free heat tap on a stream that was always going to be burned. `coke-coal` is the only
unlocked COG producer, and it emits at exactly 250 °C — the minimum `warm-stone-brick-1` accepts.

`glassworks-mk01` is `burns_fluid: true` with an **empty `fluid_box` filter** — no fuel restriction —
and COG is 1.0 MJ/unit, same as acetylene, so they substitute 1:1. A glassworks has **one** fuel fluid
box and Factorio will not mix fluids in a pipe, which is why the flask machines are duplicated across
two headers rather than switched between fuels.

```
COG produced             30.000 /s  ×  1.0 MJ        =  30.000 MJ/s
glassworks draw           2.619 fractional × 10 MW   =  26.194 MJ/s
                                                        ──────────
surplus at nominal                                       3.806 MJ/s   — 14.5 %
```

Surplus goes to `oil-boiler-mk01` (effectivity 2) → `steam-engine` (effectivity 0.5), a 1.00 MJe/MJ
round trip yielding **3.81 MW**.

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

Per unit of product: **+18.333 MJ per petri-dish, +5.238 MJ per glass, −10.000 MJ per flask** — which is
where the control law's coefficients come from.

### Keep `hotair-flask` on both headers

```
hotair-flask :  10 MJ own  +  44.44 glass-2  −  44.44 COG credit  =   −10.00 MJ per flask
plain flask  :  15 MJ own  +  66.67 glass-2  −  0                 =  −81.67 MJ per flask
```

**8.2× cheaper in net fuel**, plus the stopper saving (3 flask per 4 stopper against 2 — a flat 33 %
cut, worth 0.067 latex/s at design 01's rate). Only the fuel differs between the two machines.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| glass | 0.268 | the product — building material | — | — |
| empty-petri-dish | 0.240 | design 01 `petri-dish` | — | importing it |
| flask | 0.200 | design 01 `py-science-pack-1` | — | — |
| **coke** | 6.000 | **`coal-gas-from-coke` → design 13's recycle branch** — 2 distilators, 0.75 MW | 2 bldg at design 13 | on-site acetylene (no consumer here); `boiler`+engine dump (15 MW but earns little); `coke-co2`, which destroys 30 MJ/s for 15 hpf |
| stone | 0.486 | **export** — design 01 imports 1.00/s for `sodium-alginate` | 0 | mining it; `stone-brick` is the fallback |

### The coke sink in detail

```
coal-gas-from-coke  [U] [distilator, 5 s]  coke 20  →  coal-gas 20 + tar 20 + ash 1
```

6.00 coke/s → 0.30 crafts/s → **2 distilators (1.50 fractional), 0.75 MW**, giving coal-gas 6.00/s, tar
6.00/s direct and ash 0.30/s (design 12's territory).

Design 13's relation is `dtar/dR = 1.6` per coke entering this recipe, including the recursion
feedback — so **9.60 tar/s**, and at 0.430 aromatics/tar that is **≈4.13 aromatics/s**, covering about
22 % of the shortfall design 22 flagged.

**It is additive, not a trade.** Dialling design 13's `r` upward diverts *its own* coke away from
acetylene, which is why `r=1` zeroes acetylene. Injecting external coke raises `R` without touching
`C(r)` — the tar arrives and the acetylene stays. *Derived from design 13's published relations, not
re-solved with an external coke injection; worth a confirming run before committing.*

Also considered: `resistor1` [U] [electronics-factory-mk01, 5 s] `coke 2 + glass 1 + tin-plate 1 → 3`
consumes **both** of this block's products (0.805 resistor1/s here, 2 factories) but coke accrues at
3.810 per glass against its 2.0 appetite, so it can only ever take ~9 %. And `steel-plate`
[advanced-foundry-mk01] turns 6.00 coke/s into **1.20 steel-plate/s** — but needs 18 foundries and
iron-ore 24.0/s. That is a reason to want the coke, not a disposal route.

## Backpressure and risk order

Both solid exports are hard stall conditions. The old `glass-1` block was fluid-in / glass-out and
could never deadlock on a solid.

| | risk | why |
|---|---|---|
| 1 | **raw-coal 15/s** | equals design 13's entire input — doubles the coal mining requirement, and scales everything proportionally |
| 2 | **coke 6.00/s** | backs up → `coke-coal` stops → no COG → no hot-air **and** no glassworks fuel → total stall. Floor: coke is `chemical` fuel at 5.0 MJ, so `boiler`+`steam-engine` at 0.50 MJe/MJ yields **15.0 MW** for 9+5 buildings — more than the block draws. Needs a destination designed, never lacks one |
| 3 | **`stone-brick` loop** | 1.500/s circulates and nets to zero, so nothing refills it. One stray inserter drains it and hot-air stops with no obvious cause. Self-healing if one `stone-brick` furnace is added — `stone 2 → 1`, and the block makes 0.486 stone/s |
| 4 | stopper 0.267/s | throttles flask only; the block scales down rather than stalling |
| 5 | stone 0.486/s | design 01 already wants 2× this |

The fuel margin is deliberately **not** on this list — the acetylene stub converts it from a failure
mode into an import line. That is what the hybrid architecture buys.

`t = min(sink_i / rate_i)` needs the actual destination capacities; coke at 6.00/s is the one to size.

## Against design 01's current glass chain

| | `glass-1` today | this block |
|---|--:|--:|
| glassworks | 13 | 6 |
| crystal mines (`borax-mine`) | 14 | **5** |
| other | — | 1 crusher · 4 rhe · 3 hpf · 1 pump · 1 boiler · 2 engines · 1 tank · 2 gate pumps |
| **buildings** | 27 | **26** |
| footprint | ~1,770 tiles | **~1,072** |
| **acetylene** | **120.2 /s** | **0 nominal, 0–10 conditional** |
| raw-coal | — | 15.00 /s |
| **ore-quartz** | **13.20 /s** | **4.86 /s** |
| stopper → latex | 0.400 → 0.200 | **0.267 → 0.133** |
| glass out | — | **0.268 /s** |
| coke out | — | **6.00 /s** |
| net grid | 5.54 MW | 6.03 MW |

```
today  :  120.2 acetylene + 5.54 electric                        =  125.7 MJ/s
this   :  45.0 raw-coal + 6.03 grid − 60.0 coke (as acetylene)   =   −8.97 MJ/s
```

Energy-positive, and **6× better** even valuing coke at its plain 5 MJ fuel value.

## Build notes

- **Two gate pumps, both reading output-side signals.** The boiler pump is load-bearing: Factorio fluid
  distribution equalises rather than prioritising, so without it the boiler steals COG the flask machine
  needs and acetylene gets imported for no reason. Cost of the gate: the boiler's 3.81 MW stops being
  firm, so grid draw swings 6.03 → 9.84 MW during a drawdown.
- **`py-tank-4000`** (40,000 in 3×3) is 1.6× `storage-tank`'s capacity in the same footprint. Fills in
  2.9 h at the nominal surplus. `py-tank-10000` buys 23 h at 3.5× flask demand if 8×8 is affordable.
- **Three glassworks at 36 / 20 / 12 % and one idle** is the price of the coal clamp — they are fluid
  burners, so idle costs capital and space, not fuel. Raising glass to **1.00/s** fills the glass one to
  43 % for +8 buildings and +6.97 raw-coal/s.
- **`borax-mine` costs `fluid-drill-mk01` ×1 + `soil-extractor-mk01` ×1** each. Five mines here against
  the 14 the current ore rate implies, so this **frees 9 mines** rather than consuming drills.
- `steam-turbine-mk01` accepts only `pressured-steam` ≥500 °C. `steam-engine` is the generator here
  (`min_temp 100`, max 500, effectivity 0.5). `py-oil-powerplant-mk01` burns fluid at effectivity 1 but
  is an assembling-machine running a molten-salt recipe — same gate as the parked powerplant branch.
- **If the flask baseline ever settles above 0.581/s**, no tank helps and the stub runs continuously. At
  that point either add glass (**1.91 glass/s per extra flask/s**) or build the 5-building acetylene
  annex (`lime` + `calcium-carbide` + `acetylene` + `slacked-lime-void`, 15/s for coke 1.41, limestone
  0.24, water 45.00). The annex retrofits cleanly — coke and water are already on site and only
  limestone is new — so there is no reason to build it before that threshold moves.

## Solver commands

Two target-mode runs, one per upstream chain. The consumers are fixed demand, computed directly
(`hotair-empty-petri-dish` 0.120 crafts/s, `hotair-flask` 0.0667, `hotair-molten-glass` 0.0383) —
`--target` honours only its last occurrence, and with one machine each there is nothing to optimise.
Drills, glassworks fuel and the boiler/engine pair are computed by hand: the solver models neither
mining nor fluid-burner fuel, and **its MW figure counts every glassworks' 10 MW as electric** (it
reports 20.42 MW for the upstream chain; 19.44 of that is COG).

```bash
npx tsx src/cli.ts solve \
  --recipes "glass-2,crushing-quartz" \
  --target "molten-glass:14.5833" --time 1 \
  --factory "glass-2:glassworks-mk01" \
  --factory "crushing-quartz:jaw-crusher" \
  --solver simplex \
  --unlocked
```

```bash
npx tsx src/cli.ts solve \
  --recipes "warm-air-1,warm-stone-brick-1,pressured-air,coke-coal" \
  --target "hot-air:11.25" --time 1 \
  --factory "warm-air-1:rhe" \
  --factory "warm-stone-brick-1:rhe" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "coke-coal:hpf" \
  --solver simplex \
  --unlocked
```

The acetylene annex, should the flask threshold ever move — `--max-import` is load-bearing here, since
without it the LP imports limestone (free in its objective) and leaves slacked-lime as waste instead of
closing the loop:

```bash
npx tsx src/cli.ts solve \
  --recipes "lime,calcium-carbide,acetylene,slacked-lime-void" \
  --target "acetylene:15" --time 1 \
  --factory "lime:hpf" --factory "calcium-carbide:hpf" \
  --factory "acetylene:gasifier" --factory "slacked-lime-void:evaporator" \
  --max-import "limestone:0.25" \
  --solver simplex \
  --unlocked
```

No `--max-import` is needed in the two main runs — nothing there needs a recycling loop forced. The
`stone-brick` cycle closes on its own and the solver zeroes it correctly (it emits a cycle warning;
ignore it, the loop is intentional). The solver also models the COG temperature split natively,
reporting `coke-oven-gas` twice — 250 °C consumed by `warm-stone-brick-1`, 100 °C emitted as an output.
**That 100 °C row is the block's fuel, not waste.**

## Build materials

Distinct construction materials across this block's 10 building types, separate from flow imports:

`boiler` · `copper-plate` · `electric-mining-drill` · `electronic-circuit` · `engine-unit` ·
`fluid-drill-mk01` · `gasifier` · `inductor1` · `intermetallics` · `iron-plate` · `lab` · `pipe` ·
`small-parts-01` · `soil-extractor-mk01` · `steam-engine` · `steel-plate` · `stone-brick` ·
`transport-belt`

The two to check before starting are **`soil-extractor-mk01`** and **`fluid-drill-mk01`**, one of each
per `borax-mine` — and `fluid-drill-mk01` is the same item the mk02 outpost upgrades (designs 19–22)
consume, so stage them against each other. `gasifier` and `lab` appear only via `oil-boiler-mk01`,
`boiler` only via `rhe`, `engine-unit` only via `pump`. Inferred from the recipe graph, not from save
state.
