# 23 — Glass works — 1.843 glass/s + design 01's petri/flask, 41 buildings

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

At design 01's P = 0.240 and the raw-coal 30/s clamp (G = 1.843):

| scenario | P | G | F | net COG | **acetylene** |
|---|--:|--:|--:|--:|--:|
| **nominal** | 0.240 | 1.843 | 0.200 | **+12.06** | **0** |
| glass demand off | 0.240 | 0 | 0.200 | +2.40 | 0 |
| petri demand off | 0 | 1.843 | 0.200 | +7.66 | 0 |
| both off | 0 | 0 | 0.200 | −2.00 | 2.00 /s |
| **flask break-even** | 0.240 | 1.843 | **1.406** | 0 | 0 |
| flask 10× | 0.240 | 1.843 | 2.000 | −5.94 | 5.94 /s |
| worst realistic | 0 | 0 | 1.000 | −10.00 | **10.00 /s** |

**A 10/s acetylene stub covers every case** — one pipe, one pump. Flask has **7.0× headroom** before the
stub engages at all (break-even 1.406/s against design 01's 0.200), and the `py-tank-4000` defers it
further. At this clamp the stub is near-ceremonial; it earns its place only if petri *and* glass demand
both go to zero.

## Sizing: glass is the residual

Petri-dish and flask are pinned to design 01's demand. **Raw-coal is clamped at 30/s** and whatever
hot-air that buys beyond petri and flask goes to glass:

```
raw-coal(G) = 12.4444 + 9.5238·G      →   G = (30 − 12.4444) / 9.5238 = 1.84333 glass/s
```

**Petri and flask take a fixed 12.4444 raw-coal/s off the top**, so all marginal coal goes to glass —
doubling the clamp from 15 to 30 gives **6.9× the glass** (0.268 → 1.843), not 2×. Next landmark is
2.333 glass/s at raw-coal **34.67/s**, where the `hotair-molten-glass` machine hits exactly 100 %.

At a fixed clamp **hot-air is the budget**: raw-coal 30/s → COG 60/s → hot-air 22.5/s, and the three
products compete for it at 25 / 16.667 / 7.143 each. **One flask displaces 2.33 glass.**

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
│ (mining)                │ borax-mine       │     9 │ 9x9   │    0.42 │  96 % │
│ crushing-quartz         │ jaw-crusher      │     2 │ 7x7   │    1.00 │  86 % │
│ glass-2                 │ glassworks-mk01  │     4 │ 7x7   │  (gas)  │  86 % │
│ hotair-empty-petri-dish │ glassworks-mk01  │     1 │ 7x7   │  (gas)  │  36 % │
│ hotair-flask (COG)      │ glassworks-mk01  │     1 │ 7x7   │  (gas)  │  20 % │
│ hotair-flask (acetylene)│ glassworks-mk01  │     1 │ 7x7   │  (gas)  │   0 % │
│ hotair-molten-glass     │ glassworks-mk01  │     1 │ 7x7   │  (gas)  │  79 % │
│ coke-coal               │ hpf              │     6 │ 7x7   │    2.00 │ 100 % │
│ warm-stone-brick-1      │ rhe              │     6 │ 5x5   │    0.30 │  80 % │
│ warm-air-1              │ rhe              │     1 │ 5x5   │    0.30 │  30 % │
│ pressured-air           │ vacuum-pump-mk01 │     1 │ 3x3   │    1.00 │  11 % │
│ (steam)                 │ oil-boiler-mk01  │     1 │ 5x5   │  (gas)  │  81 % │
│ (power)                 │ steam-engine     │     4 │ 3x5   │       — │  81 % │
│ (COG buffer)            │ py-tank-4000     │     1 │ 3x3   │       — │     — │
│ (gates)                 │ pump             │     2 │ 1x2   │   0.029 │     — │
└─────────────────────────┴──────────────────┴───────┴───────┴─────────┴───────┘
```

**41 buildings · ~1,795 tiles · 19.04 MW drawn, 12.06 MW self-generated, 6.98 MW net grid**

The acetylene flask machine sits idle at the nominal point — that is the design working, not waste. Two
machines also take flask *capacity* to 2.00/s, so neither fuel source is a single point of failure.

**Inputs** (/s): raw-coal 30.000 · water 48.848 · stopper 0.267 · acetylene **0 nominal, 0–10 per envelope** · electricity 6.98 MW net

**Exports** (/s): glass 1.843 · empty-petri-dish 0.240 · flask 0.200 · **coke 12.000** · stone 0.861

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
│ COG @250 °C      │  60.000 │ coke-coal                  │ warm-stone-brick-1 60.000               │
│ COG @100 °C      │  60.000 │ warm-stone-brick-1         │ glassworks 47.944, tank/boiler 12.056   │
│ steam @250 °C    │  48.848 │ oil-boiler-mk01            │ steam-engine 48.848                     │
└──────────────────┴─────────┴────────────────────────────┴─────────────────────────────────────────┘
```

Crushed-quartz feeds every `glass-2` from one crusher bank — a single mine bank and a single crushing
step serve all three products.

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
| glass | 1.843 | the product — building material | — | — |
| empty-petri-dish | 0.240 | design 01 `petri-dish` | — | importing it |
| flask | 0.200 | design 01 `py-science-pack-1` | — | — |
| **coke** | 12.000 | **`coal-gas-from-coke` → design 13's recycle branch** — 3 distilators, 1.50 MW | 3 bldg at design 13 | on-site acetylene (no consumer here); `boiler`+engine dump (30 MW but earns little); `coke-co2`, which destroys 60 MJ/s for 30 hpf |
| stone | 0.861 | **export** — design 01 imports 1.00/s for `sodium-alginate` | 0 | mining it; `stone-brick` is the fallback |

### The coke sink in detail

```
coal-gas-from-coke  [U] [distilator, 5 s]  coke 20  →  coal-gas 20 + tar 20 + ash 1
```

12.00 coke/s → 0.600 crafts/s → **3 distilators (3.000 fractional, 100 %), 1.50 MW**, giving coal-gas
12.00/s, tar 12.00/s direct and ash 0.600/s (design 12's territory).

Design 13's relation is `dtar/dR = 1.6` per coke entering this recipe, including the recursion
feedback — so **19.20 tar/s**, and at 0.430 aromatics/tar that is **≈8.26 aromatics/s**, covering about
45 % of the shortfall design 22 flagged.

**It is additive, not a trade.** Dialling design 13's `r` upward diverts *its own* coke away from
acetylene, which is why `r=1` zeroes acetylene. Injecting external coke raises `R` without touching
`C(r)` — the tar arrives and the acetylene stays. *Derived from design 13's published relations, not
re-solved with an external coke injection; worth a confirming run before committing.*

Also considered: `resistor1` [U] [electronics-factory-mk01, 5 s] `coke 2 + glass 1 + tin-plate 1 → 3`
consumes **both** of this block's products (3.687 coke/s and 1.843 glass/s → 5.53 resistor1/s, 10
factories, tin-plate 1.843/s) — at this clamp it absorbs **31 %** of the coke, up from 9 % at the 15/s
clamp, because glass scaled 6.9× while coke only doubled. Worth revisiting if resistors are wanted.
And `steel-plate` [advanced-foundry-mk01] turns 12.00 coke/s into **2.40 steel-plate/s** — but needs 36
foundries and iron-ore 48.0/s. That is a reason to want the coke, not a disposal route.

## Backpressure and risk order

Both solid exports are hard stall conditions. The old `glass-1` block was fluid-in / glass-out and
could never deadlock on a solid.

| | risk | why |
|---|---|---|
| 1 | **raw-coal 30/s** | 2× design 13's entire input — the dominant new mining requirement, and it scales everything proportionally |
| 2 | **coke 12.00/s** | backs up → `coke-coal` stops → no COG → no hot-air **and** no glassworks fuel → total stall. Floor: coke is `chemical` fuel at 5.0 MJ, so `boiler`+`steam-engine` at 0.50 MJe/MJ yields **30.0 MW** for 17+10 buildings. Needs a destination designed, never lacks one |
| 3 | **`stone-brick` loop** | 3.000/s circulates and nets to zero, so nothing refills it. One stray inserter drains it and hot-air stops with no obvious cause. Self-healing if one `stone-brick` furnace is added — `stone 2 → 1`, and the block makes 0.861 stone/s |
| 4 | stopper 0.267/s | throttles flask only; the block scales down rather than stalling |
| 5 | stone 0.861/s | design 01 wants 1.00/s, so this is nearly a clean offset |

The fuel margin is deliberately **not** on this list — the acetylene stub converts it from a failure
mode into an import line. That is what the hybrid architecture buys.

`t = min(sink_i / rate_i)` needs the actual destination capacities; coke at 12.00/s is the one to size.

## Against design 01's current glass chain

| | `glass-1` today | this block |
|---|--:|--:|
| glassworks | 13 | 8 |
| crystal mines (`borax-mine`) | 14 | 9 |
| other | — | 2 crusher · 7 rhe · 6 hpf · 1 pump · 1 boiler · 4 engines · 1 tank · 2 gate pumps |
| **buildings** | 27 | **41** |
| footprint | ~1,770 tiles | ~1,795 tiles |
| **acetylene** | **120.2 /s** | **0 nominal, 0–10 conditional** |
| raw-coal | — | 30.00 /s |
| **ore-quartz** | **13.20 /s** | **8.61 /s** |
| stopper → latex | 0.400 → 0.200 | **0.267 → 0.133** |
| **glass out** | — | **1.843 /s** |
| coke out | — | **12.00 /s** |
| net grid | 5.54 MW | 6.98 MW |

**Essentially the same footprint as design 01's glass chain today**, for 14 more buildings — and it also
produces 1.843 glass/s and 12.00 coke/s while importing no acetylene.

```
today  :  120.2 acetylene + 5.54 electric                         =  125.7 MJ/s
this   :  90.0 raw-coal + 6.98 grid − 120.0 coke (as acetylene)   =  −23.0 MJ/s
```

Energy-positive. Valuing coke at its plain 5 MJ fuel value instead gives +37.0 MJ/s against today's
125.7 — still **3.4× better**, and that comparison ignores the glass entirely.

## Build notes

- **`oil-boiler-mk01` and `steam-engine` pair exactly 1 : 4.** The boiler makes 60 steam/s
  (`max_energy_usage` 493,500 J/tick ÷ 0.4935 MJ per 250 °C unit); each engine takes 15. So 4 engines
  cap steam demand at 60/s and **a second boiler can never exceed 50 % load.** It is not needed for
  headroom either: the maximum surplus this block can produce is with flask fully stopped,
  `18.333(0.240) + 5.238(1.843) = 14.056 MJ/s` → 56.97 steam/s, still inside one boiler's 60/s.
  A second boiler only earns its place alongside 4 more engines, and the COG cannot fill those.
- **The 6 `coke-coal` hpf *are* the raw-coal clamp.** They cap intake at 30/s by construction, so the
  coal line needs no metering — and a 7th hpf would break the clamp rather than add safety. This is the
  one place where 100 % load is correct rather than risky.
- **`warm-stone-brick-1` is the element worth padding.** At 5 it runs 96 %; the sixth takes it to 80 %
  for 25 tiles. It is the hot-air throttle, so losing one hits all three products at once — better value
  than the spare boiler. Dropping the pad gives 40 buildings.
- **Two gate pumps, both reading output-side signals.** The boiler pump is load-bearing: Factorio fluid
  distribution equalises rather than prioritising, so without it the boiler steals COG the flask machine
  needs and acetylene gets imported for no reason. Cost of the gate: the boiler's 12.06 MW stops being
  firm, so grid draw swings 6.98 → 19.04 MW during a drawdown.
- **`py-tank-4000`** (40,000 in 3×3) is 1.6× `storage-tank`'s capacity in the same footprint.
  `py-tank-10000` buys far longer ride-through if 8×8 is affordable.
- **`borax-mine` costs `fluid-drill-mk01` ×1 + `soil-extractor-mk01` ×1** each. Nine here against the 14
  the current ore rate implies, so this still **frees 5 mines** rather than consuming drills.
- `steam-turbine-mk01` accepts only `pressured-steam` ≥500 °C. `steam-engine` is the generator here
  (`min_temp 100`, max 500, effectivity 0.5). `py-oil-powerplant-mk01` burns fluid at effectivity 1 but
  is an assembling-machine running a molten-salt recipe — same gate as the parked powerplant branch.
- **If the flask baseline ever settles above 1.406/s**, no tank helps and the stub runs continuously. At
  that point either add glass (**1.91 glass/s per extra flask/s**) or build the 5-building acetylene
  annex (`lime` + `calcium-carbide` + `acetylene` + `slacked-lime-void`, 15/s for coke 1.41, limestone
  0.24, water 45.00). The annex retrofits cleanly — coke and water are already on site and only
  limestone is new — so there is no reason to build it before that threshold moves.
- **41 buildings is past the 40 stamping threshold.** Three seams if you split: 9 mines on the patch,
  gas plant (6 hpf + 7 rhe + vacuum-pump) at 14, glass core (8 glassworks + 2 crushers + boiler +
  engines + tank + pumps) at 18.

## Solver commands

Two target-mode runs, one per upstream chain. The consumers are fixed demand, computed directly
(`hotair-empty-petri-dish` 0.120 crafts/s, `hotair-flask` 0.0667, `hotair-molten-glass` 0.2633) —
`--target` honours only its last occurrence, and with one machine each there is nothing to optimise.
Drills, glassworks fuel and the boiler/engine pair are computed by hand: the solver models neither
mining nor fluid-burner fuel, and **its MW figure counts every glassworks' 10 MW as electric**.

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

## Sunset condition

This architecture is temporary. `glass-3` [glassworks, 4 s] `pure-sand 10 + powdered-quartz 2 → molten-glass 50`
makes **50 molten-glass per 4 s against `glass-2`'s 30**, dropping the upstream cost from 1.333 to
**0.800 MJ per molten-glass**. That 0.533 lifts every recipe by the same amount:

| | with `glass-2` | with `glass-3` |
|---|--:|--:|
| petri-dish, glass | +0.733 | +1.267 |
| **flask** | **−0.300** | **+0.233** |

**Flask goes COG-positive**, and the duplicated flask machine, the acetylene stub, the gate pumps and
the whole control law become dead weight — the block collapses to "make gas, make glass, burn the
surplus." It is two gates away: `quartz-mk02` requires the unresearched `rare-earth-tech`, and `glass-3`
additionally needs `pure-sand`, whose only two recipes (`sand-washing`, `sponge-pure-sand`) are both
locked. Not soon — but the architecture has a known expiry, which is worth knowing before committing
41 buildings.

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
