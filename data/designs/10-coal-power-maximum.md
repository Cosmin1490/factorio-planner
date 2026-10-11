# Maximum power from one belt of raw-coal — 15/s → ~446 MW, 287 buildings

Single fixed configuration, **not adaptive**. Every output that can burn, burns. Material exports are
creosote at its structural floor (31.75/s) and carbon-dioxide (61.98/s), both assumed to have external
sinks.

**Result: ~446 MW net electric from 15/s raw-coal** — a 9.9× gain over burning the coal directly (45 MW).

Generators are **`steam-engine`** (effectivity 0.5), which is the binding constraint on output. With
`steam-turbine-mk01` the same chain yields ~970 MW off 36 turbines instead of 142 engines — see
§ Generator choice.

CO2 (61.98/s) is **vented** via one `py-gas-vent` — an approved exception in this ruleset, see
CLAUDE.md § Rules. Converting it instead (`chromium-01`, or `methane-co2` for +15 MW) is documented but
not required; the headline figure assumes venting.

Derived from design 09's drawable-energy budget framing, but inverted: instead of maximising material
draws against the budget, this maximises the budget itself and draws nothing.

## Configuration

| Dial | Setting | Why |
|---|---|---|
| **f** — coke recycling | **0** | All coke → acetylene instead. Worth 10 MJ/coke vs ~6.6 recycled. |
| **x** — anthracene | **1** (all cracked) | Cracking is a 5.9× fuel amplifier. Creosote is 0 MJ. |
| **n** — naphthalene/carbolic | **0** (burn) | Creosote is the only non-fuel product; never make it deliberately. |
| **g** — coal-gas tap | **0** | Gasify everything; syngas is a 3.4× multiplier on coal-gas. |
| coke destination | **acetylene** | The single biggest lever — see below. |

## The three multipliers that make this work

Py recipes do not conserve energy. This chain is a designed energy amplifier, and three compounding
steps do nearly all the work:

**1. Coke → acetylene doubles the energy, then the boiler doubles it again.**

```
1 coke (5.00 MJ)  →  10 acetylene (10.00 MJ)       2× on fuel value
acetylene in oil-boiler-mk01 (effectivity 2)       2× again on heat
coke in plain boiler (effectivity 1, solid fuel)   1×
                                                   ───
                                        net 4× heat vs burning the coke
```

Verified: `acetylene` 1.00 MJ, `coke` 5.00 MJ, 10 coke per 100 acetylene (slacked-lime recycling
improves this slightly in practice). `oil-boiler-mk01` has `burns_fluid: true`, `effectivity: 2`, and
**no filter** on its fuel fluidbox, so it accepts acetylene directly. The plain `boiler` that would
take solid coke is `effectivity: 1`.

**2. Cracking anthracene is a 5.9× amplifier.**

```
anthracene-gasoline-cracking:  50 anthracene (12.50 MJ) → 5 coke + 20 gasoline
   5 coke  → 50 acetylene = 50.00 MJ
  20 gasoline            = 24.00 MJ
                           ────────
                             74.00 MJ out from 12.50 MJ in
```

This is why `x=1` is not close — burning the anthracene raw yields 12.50 MJ.

**3. Gasifying coal-gas is a 3.4× amplifier, and it makes tar.**

```
syngas:  50 coal-gas (10.00 MJ) + 100 water → 70 syngas (28.00 MJ) + 30 tar (6.00 MJ)
```

34 MJ out of 10 MJ in, and the 30 tar re-enters tar-refining. Syngas supplies 49% of all tar at `f=0`.

## Recipe table

Solver-validated, input mode, `--input raw-coal:900 --time 60`.

```
┌──────────────────────────────┬─────────────────────┬───────┬──────────┐
│ Recipe                       │ Factory             │ Count │ MW       │
├──────────────────────────────┼─────────────────────┼───────┼──────────┤
│ distilled-raw-coal           │ distilator          │     3 │          │
│ coal-gas                     │ distilator          │     2 │          │
│ syngas                       │ gasifier            │     7 │     3.50 │
│ tar-refining                 │ tar-processing-unit │     7 │          │
│ pitch-refining               │ distilator          │    10 │          │
│ tar-refining-tops            │ tar-processing-unit │     2 │          │
│ light-oil-aromatics          │ distilator          │     3 │          │
│ anthracene-gasoline-cracking │ distilator          │    13 │          │
├──────────────────────────────┼─────────────────────┼───────┼──────────┤
│ lime                         │ hpf                 │     4 │     8.00 │
│ calcium-carbide              │ hpf                 │    16 │    32.00 │
│ acetylene                    │ gasifier            │    32 │    16.00 │
│ slacked-lime-void            │ evaporator          │     4 │     4.00 │
├──────────────────────────────┼─────────────────────┼───────┼──────────┤
│ (oil-boiler-mk01)            │ 5×5                 │    42 │        0 │
│ (steam-engine)               │ 3×5                 │   142 │        0 │
└──────────────────────────────┴─────────────────────┴───────┴──────────┘
103 process + 184 power island = 287 buildings · 77.91 MW draw
```

Optional CO2-sink add-on (§ The CO2 problem): +10 `methane-co2` greenhouses, +13 cultivation
greenhouses, +1 botanical-nursery, +1 boiler, +5 engines → 317 buildings, 82.41 MW draw, ~461 MW.
All moondrop-greenhouses need **16 moondrop modules each** (speed 0.0588 × 17 = 1.0 effective);
unmoduled they are unbuildable at this rate.

**The acetylene chain costs 60 MW of electricity and returns ~391 MW** on engines (391.48 MJ/s of
acetylene × 1.00 MJ/MJ). A 6.5× return — still decisive, but note it is half what turbines would give,
and the 60 MW draw is now 13% of gross output.

## Fuel budget and power

| Fuel | /s | MJ/unit | **MJ/s** |
|---|--:|--:|--:|
| **acetylene** | **391.48** | 1.00 | **391.48** |
| gasoline | 90.36 | 1.20 | 108.43 |
| syngas | 151.20 | 0.40 | 60.48 |
| naphthalene-oil | 76.73 | 0.30 | 23.02 |
| aromatics | 56.89 | 0.35 | 19.91 |
| carbolic-oil | 19.85 | 0.35 | 6.95 |
| hydrogen | 18.52 | 0.10 | 1.85 |
| **total F** | | | **612.12** |
| *(+ methane 24.79 if CO2 sunk internally)* | | *0.80* | *+19.83* |

Acetylene alone is 64% of the fuel budget. That is the whole design in one number.

```
heat           = F × 2 (boiler effectivity 2)      = 1224.24 MJ/s
steam          = 1224.24 / 0.4935                  = 2480.7 steam/s
process steam (tar-refining, pitch-refining, tops) =  357.21 steam/s
steam to engines                                   = 2123.5 steam/s
gross electric = 2123.5 × 0.4935 × 0.5 (engine eff)=  523.98 MW
block draw                                         =   77.91 MW
                                                     ─────────
net                                                = ~446 MW
```

Equivalently: **`electric = F − 0.24675 × S − draw`** for steam-engines, or
`2F − 0.4935 × S − draw` for turbines.

### Generator choice — the binding constraint

```
oil-boiler-mk01   max_energy_usage 493,500 J/tick       = 29.61 MW heat
                  fluid_energy_source.effectivity 2     → burns 14.805 MW of fuel
                  target 250°C, water default 15°C, steam heat_capacity 2100
                  energy per steam unit = 235 × 2100     = 0.4935 MJ
                  steam output = 29.61 / 0.4935          = 60.00 /s
steam-turbine-mk01  60 steam/s × 0.4935 MJ × effectivity 1 = 29.61 MW electric

                  14.805 MW fuel  →  29.61 MW electric   = 2.000 MJ/MJ
```

That 2.000 MJ/MJ is what the boiler alone delivers. **The generator then decides how much survives.**

`steam-engine` loses twice over — half the nameplate *and* half the energy:

```
nameplate at 500°C:  15 steam/s × (500−15) × 2100 × 0.5  = 7.64 MW
actual at 250°C:     15 steam/s × (250−15) × 2100 × 0.5  = 3.70 MW   ← oil-boiler caps at 250°C
```

The temperature shortfall costs building count; `effectivity 0.5` costs energy on top.

| generator | per building | buildings | net MW | MJ electric / MJ fuel |
|---|--:|--:|--:|--:|
| **`steam-engine`** (eff 0.5, 15 steam/s) | 3.70 MW | **142** | **446.07** | **1.00** |
| `steam-turbine-mk01` (eff 1, 60 steam/s) | 29.61 MW | 36 | 970.05 | 2.00 |

**This design assumes steam-engines.** The turbine would give 2.17× the net power from a quarter of the
buildings, and `force.recipes` reports it unlocked — worth re-checking in game, because it is by far the
largest single improvement available to this block. Net is not exactly double because the 77.91 MW block
draw does not halve.

The turbine is also temperature-limited (29.61 MW against a 1000°C nameplate of 124.1 MW) but loses no
energy to it — effectivity 1 extracts everything the 250°C steam carries. Only the engine wastes any.

### Sanity-decomposing the 9.9×

| stage | multiplier |
|---|--:|
| 45 MJ/s raw-coal → 612.12 MJ/s fuel (chemistry) | **13.60×** |
| boiler effectivity 2 × engine effectivity 0.5 | **1.00×** |
| less process steam (88.14 MJ/s of fuel) | −1.96× |
| less block draw (77.91 MW) | −1.73× |
| **net** | **9.91×** |

With steam-engines the boiler's 2× and the engine's 0.5× cancel exactly, so conversion is energy-neutral
and the entire gain is chemical. Note the block draw is now 1.73× of the input energy — at 15% of gross
output it matters far more than it did with turbines (7%), which makes the acetylene chain's 60 MW the
one place worth hunting for savings.

The conversion half is well-understood prototype arithmetic. The 13.6× chemical amplification is the
part worth an in-game check before committing 42 boilers — it is Py's recipe balance rather than an
accounting artifact, with coke → acetylene (5 MJ → 10 MJ) the single largest contributor.

**Power island:** 42 oil-boilers (2480.7 ÷ 60) and **142 steam-engines** (2123.5 ÷ 15). Not matched
1:1 — process steam takes 357.21/s off the top before the engines see it, and each engine swallows only
15 steam/s against a boiler's 60. Footprint is **3,180 tiles** (boilers 1,050 + engines 2,130), larger
than the entire process chain. This is the dominant cost of the engine constraint.

## Imports, exports, byproducts

| Import | /s | Note |
|---|--:|---|
| raw-coal | 15.00 | one yellow belt |
| **water** | **3871.1** | process 1390.4 (acetylene 1174.4 + syngas 216) + boiler feed 2480.7 → **4 offshore pumps** |
| limestone | 6.20 | for lime |

No bio dependency in the baseline. The optional methane sink adds 0.62/s moondrop-seeds — self-grown,
so a closed loop rather than an import — plus ~71/s more water.

| Export | /s |
|---|--:|
| **electricity** | **~446 MW** |
| creosote | 31.75 (external sink assumed) |
| carbon-dioxide | 61.98 (external sink assumed — or convert, § The CO2 problem) |

| Byproduct | /s | Sink |
|---|--:|---|
| ash | 2.16 | planter-box export, or `rich-clay` |
| gravel | 1.63 | `gravel-to-sand` → sand-casting, or concrete |
| iron-oxide | 0.435 | `iron-oxide-smelting` → 0.22/s iron-plate |

Water is the hidden headline. 4013/s is 3.3 offshore pumps' worth and the boiler feed is 64% of it —
size the trunk main for this before anything else.

## The CO2 problem — mandatory, not optional

The `lime` recipe emits **100 CO2 per 10 lime**, so at 6.20/s lime the chain produces **61.98/s
carbon-dioxide**. This is unavoidable: acetylene needs calcium-carbide needs lime, and `lime` is the
only unlocked source besides `slacked-lime-void` recycling (which recovers just 1.63/s at the 60:1
ratio).

**If CO2 backs up, lime stalls → calcium-carbide stalls → acetylene stalls → 391 MJ/s of fuel vanishes
and the design collapses to ~178 MW.** CO2 handling is load-bearing, not a tidy-up.

| Option | Verdict |
|---|---|
| **Export the CO2** | **Preferred.** 446 MW at 103 process buildings, no bio dependency. Needs a consumer — design 07's Moss-2 takes 8.17/s, and anywhere running `moondrop-co2` (free, no inputs) can take yours instead. |
| `methane-co2` — 100 CO2 + 100 water + 1 moondrop-seeds → 40 methane | Self-contained, ~461 MW, but **24 buildings** — see below. **+15 MW** for that is a bad trade on engines. |
| `Moss-1` / `Moss-2` | Impractical — moss-farm speed 0.0625 on a 100s recipe needs **~62 farms** even with 15 moss modules. |
| `chromium-01` | Only if chromium is wanted; needs chromite-sand and sand-casting. |
| Barrelling | 1.24 barrels/s is not a sink, just deferred storage. |

### Costing `methane-co2` properly

The conversion is 10 greenhouses, but **moondrop-seeds are not free** — they need a self-sustaining
cultivation loop:

```
moondrop-1      (greenhouse, 140s)  4 moondrop-seeds + 100 water → 4 moondrop
moondrop-seeds  (nursery, 5s)       5 moondrop → 2.2 moondrop + 7.5 seeds   (expected, incl. probabilistic outputs)
```

The nursery nets −2.8 moondrop / +7.5 seeds per craft; the greenhouse returns seeds to moondrop 1:1.
Balanced, each nursery craft yields **4.7 net seeds** and needs 0.7 greenhouse crafts behind it. For
0.62/s seeds that is 1 botanical-nursery and **13 more greenhouses**.

| | buildings | tiles | modules | MW |
|---|--:|--:|--:|--:|
| `methane-co2` conversion | 10 greenhouse | 810 | 160 moondrop | 4.50 |
| moondrop cultivation | 13 greenhouse + 1 nursery | ~1,170 | 208 moondrop | 5.85 |
| **total** | **24** | **~1,980** | **368** | **10.35** |

Gain is 19.83 MJ/s of fuel, which on steam-engines is only **+15.3 MW net** after the 10.35 MW the
greenhouses draw — 24 buildings and 368 bio modules for 3% more power. (On turbines it would be +35 MW,
still poor.) **Prefer exporting the CO2** unless the block must stand alone.

If neither export nor methane is available, the honest fallback is the no-acetylene configuration
below — not an unsunk CO2 stream.

## Alternatives considered

| Configuration | Net MW | Process bldgs | Note |
|---|--:|--:|---|
| **f=0, x=1, n=0 + acetylene, CO2 exported** | **~446** | **103** | this design |
| f=0, x=1, n=0 + acetylene + methane-co2 | ~461 | 127 | self-contained; +15 MW for 24 buildings |
| f=0, x=1, n=0 + acetylene, CO2 unsunk | — | — | stalls; not a real option |
| f=1, x=1, n=0 (recycle coke, no acetylene) | ~178 | 90 | no CO2, no acetylene chain. The fallback. |
| *same chain on `steam-turbine-mk01`* | *~970* | *103* | *2.17× for a quarter the generators* |
| Burn 15/s raw-coal directly | 45 | — | effectivity-1 solid boiler |

**Why coke → acetylene beats coke recycling.** Marginal value of one coke:

```
→ acetylene:              10 acetylene × 1.00 MJ                        = 10.00 MJ
→ coal-gas-from-coke:     1 coal-gas → 1.4 syngas (0.56) + 1.6 tar      ≈  6.61 MJ
                          (tar valued at ~3.78 MJ/unit net of steam cost)
```

Acetylene wins by ~1.5×, and the solver confirms it at the aggregate: F = 612.12 MJ/s at `f=0` with
acetylene versus 376.28 MJ/s at `f=1` without.

**Rejected outright:** `tar-to-carbolic` (100 tar + 1 raw-coal + steam → 10.5 MJ out of 23 MJ in — a
large net loss); `coke-co2` and `graphite` (no fuel output); `syngas2` (locked, would be +43% syngas for
60 oxygen/craft); `tar-distilation` (flue-gas has no unlocked sink).

## Notes and risks

- **Not adaptive by design.** No mode switching, no circuit control beyond boiler fuel priority. Every
  branch runs flat out.
- **Boiler fuel priority still matters:** naphthalene → carbolic → everything else. Those two have no
  non-fuel consumer, so if the boilers prefer gasoline they back up and stall `tar-refining-tops` and
  `pitch-refining`. The one piece of control logic this design needs.
- **Electricity demand must be real.** Generators draw steam in proportion to grid load. 446 MW of
  engine capacity into a base that wants 200 MW means steam backs up, boilers stop, and fuel queues
  behind them throttle the chain. Build the power island to actual load and scale it as demand grows —
  the chain is sized for the ceiling, the engines need not be. This is also the cheap way to stage the
  build: the 103-building process chain is the hard part, the 142 engines can arrive incrementally.
- **Creosote 31.75/s is the structural floor** (tar-refining emits 24 per 100 tar) and cannot be
  reduced at this tech. Per the brief, an external sink is assumed.
- Acetylene at 391.48/s is also the mining fluid for lead, titanium and quartz-rock — if ore demand
  appears later, it competes directly with power at 1 MJ per unit diverted.

## Behaviour under partial electrical demand

The block's generators do **not** run at a utilisation set by its own supply-vs-demand ratio. Factorio
splits grid load across *every* generator on the network in proportion to capacity, so:

```
u  =  grid_demand / total_generation_capacity      (including every other power plant)
```

Add 200 MW of other generation to this block's 446 MW and a 300 MW grid load gives `u = 300/646 = 46%`
— this block's engines run at 46% regardless of how much fuel it is making. At `u < 1` the chain
produces fuel faster than the boilers consume it:

```
fuel surplus = 523.98 × (1 − u)  MJ/s
```

At `u = 0.46` that is 283 MJ/s of fuel with nowhere to go.

### Output is linear in throughput — so it can serve any demand

Every term scales with throughput `t` (fraction of the 15/s raw-coal feed):

```
F(t) = 612.12t      S(t) = 357.21t      draw(t) ≈ 77.91t
electric(t) = 612.12t − 88.14t − 77.91t = 446.07t
```

**No ratio shifts anywhere in the chain** — it is input-limited end to end, so reducing raw-coal scales
every recipe together. Process steam, electrical draw, and the creosote/CO2 exports all fall
proportionally. The only nonlinearity is idle drain (~1/30 of full draw on stopped machines), which
makes low throughput slightly less efficient: at `t = 0.1` output is 42.3 MW rather than a linear 44.6.
Net-positive above `t ≈ 0.6%`, so effectively always worth running.

**Required raw-coal feed = `15 × (MW wanted / 446)`.** 200 MW → 6.72/s.

### Without any control: the chain self-regulates

**The backpressure forms a closed negative feedback loop, and it settles at the correct throughput on
its own.** Acetylene not being burned backs up coke, which stalls the coke producers
(`pitch-refining`, `anthracene-gasoline-cracking`), which cuts gasoline and everything downstream — so
the other fuels thin out and the boilers have no choice but to burn acetylene again. Burning acetylene
drains the tank → the acetylene recipe runs → consumes CaC → lime → coke → unblocks the coke producers
→ the chain speeds back up.

Solving for the fixed point (fuel produced = fuel burned):

```
612.12t  =  88.14t + 0.24675E        →   t = P_gross / 524.0
```

| engine steam /s | t | gross MW | net MW | acetylene burned | (produced) |
|--:|--:|--:|--:|--:|--:|
| 2123.5 | 1.000 | 524.0 | 446.1 | 391.5 | 391.5 |
| 1600 | 0.753 | 394.8 | 336.1 | 295.0 | 295.0 |
| 1061.75 | 0.500 | 262.0 | 223.0 | 195.7 | 195.7 |
| 500 | 0.235 | 123.4 | 105.0 | 92.2 | 92.2 |
| 200 | 0.094 | 49.4 | 42.0 | 36.9 | 36.9 |

Acetylene burn matches production at **every** level — the loop closes. This works because acetylene is
simultaneously 64% of the fuel budget *and* the lowest-priority fuel, so it is the swing stream that
absorbs all variance; and because its own consumption gates its own production through coke, it is a
single-variable monotonic loop rather than a multi-variable one that could hunt.

So recipes do not stall permanently — they **duty-cycle**, and the average throughput automatically
equals demand. Buffer size sets the cycle *period*, not whether it works:

- **small buffers** → fast duty-cycling, looks smooth, chain tracks demand closely
- **large buffers** → slow swings that look like stall–restart, but ride out dips at full chain rate

That makes buffer sizing a choice about the **exports**, not about stability: size large if downstream
creosote and CO2 consumers need a steady rate, small if you would rather the chain track grid load.

### Cascade ordering still matters

Backpressure propagates cleanly but **totally** — every recipe here is multi-output, and a multi-output
recipe stalls when *any* one of its outputs is blocked. Tracing from the lowest-priority fuel:

```
acetylene tank full → acetylene stalls → CaC chests fill → calcium-carbide stalls
  → lime chests fill → slacked-lime-void stalls
  → coke chests fill → pitch-refining AND anthracene-gasoline-cracking AND coal-gas all stall
  → pitch/anthracene back up → tar-refining stalls → tar backs up
  → syngas and distilled-raw-coal stall → whole block stops
```

It does recover by itself: with the chain stopped the boilers keep drawing down the fuel buffers, which
relieves the backpressure and the chain restarts. The result is **stall–restart cycling** with a period
set by buffer size — at `u = 0.5` and one 25,000-unit acetylene tank, roughly 95 s to fill. Average
output correctly tracks demand and nothing is damaged, but the chain churns, and downstream creosote and
CO2 consumers see a square wave rather than a rate.

### Deadlock check — the acetylene loop

The solver warned about this cycle and it deserves an in-game answer, not just a constraint:

```
lime → calcium-carbide → acetylene → slacked-lime → (slacked-lime-void) → lime
```

A four-recipe loop. The dangerous state is *slacked-lime full **and** lime full* at once: acetylene
cannot run (no room for slacked-lime), the void cannot run (no room for lime), CaC cannot run (its own
chests full), and lime drains only via CaC. Fully jammed, and no amount of returning demand fixes it.

**It does not occur in practice, because of the void recipe's 60:1 ratio.** Producing one lime consumes
**60** slacked-lime, so while the chain is stalling the void drains the slacked-lime tank far faster than
it fills the lime chests. The steady stall state is therefore *slacked-lime near empty, lime full* —
which has a clean restart path. The safety condition is simply:

```
slacked_lime_tank_capacity  <  60 × lime_buffer_capacity
```

One storage tank (25,000) needs only 417 units of lime buffer — about four stacks — to be safe. Any sane
layout satisfies this by a wide margin. **But do not buffer slacked-lime in many tanks while keeping lime
on a single small chest**, which is the one arrangement that inverts the inequality and deadlocks.

### The fix: throttle the raw-coal feed

Gate the incoming raw-coal on **acetylene tank level** — acetylene is the lowest-priority fuel, so its
level is the most direct measure of surplus:

- enable the feed below ~40%, disable above ~60%
- hysteresis band × tank count sets the cycle period; more tanks = slower, calmer cycling
- for genuinely smooth control, split the feed into 4 lanes gated at staggered thresholds, giving a
  4-step proportional throttle rather than bang-bang

Throttling upstream is strictly better than letting backpressure do it: the chain runs continuously at
reduced rate instead of cycling, exports stay steady, and buffers never reach the states that make the
acetylene loop's deadlock condition even theoretically reachable.

### Make this block base-load, not a peaker

Throttling solves the stall, but it does not solve the *dilution* — at `u = 0.46` the block is only
delivering 205 MW of its 446 MW capability while other plants carry the rest. To invert that, put the
**other** generators behind an accumulator-triggered power switch:

- this block's engines: connected directly, always available
- every other generator: behind a power switch that closes when accumulator charge drops below ~30%

Accumulators discharge only when demand exceeds what the directly-connected engines supply, so this
block absorbs load first and the others become peakers. That raises `u` toward 1 and the raw-coal
throttle then tracks real demand rather than a diluted share of it.

### Black start

The chain needs ~77.91 MW to make the fuel that makes the power, so **this block cannot cold-start
itself**. On a dead grid it is inert. Keep either an independent generator or an accumulator bank sized
to carry the 77.91 MW through spin-up — the chain must be producing fuel before its own engines can
contribute.

### Fuel priority is cascade selection — pick the deepest buffer

The statement "any fuel backing up stalls the chain" is true but unhelpful, because the cascades are
nowhere near equivalent. Engine draw is global and uncontrollable, but **which fuel the boilers decline
to burn is entirely controllable** — and that choice decides how long the block rides out a demand dip
before anything stalls.

Cascade depth by fuel, counting buffer stages between the full tank and the first core recipe:

| fuel declines to burn | cascade | stages | buffering |
|---|---|--:|---|
| naphthalene / carbolic | → `tar-refining-tops`, `pitch-refining` stall | **1** | fluid only — fastest cascade, and no alternative sink exists |
| syngas | → coal-gas → `distilled-raw-coal` stalls | 1 | fluid only |
| gasoline | → light-oil **and** anthracene → `tar-refining` stalls | 1 | fluid only, hits two paths at once |
| aromatics | → light-oil → `pitch-refining` stalls | 1 | fluid only |
| hydrogen | → `pitch-refining` stalls | 1 | fluid only |
| **acetylene** | → CaC → lime → coke → core stalls | **4** | **3 of 4 stages are solid items in chests** |

**The acetylene branch is uniquely deep**, because `calcium-carbide`, `lime` and `coke` are all items
(stack 100) rather than fluids. Measured ride-through:

| stage | rate /s | capacity | seconds |
|---|--:|--:|--:|
| acetylene — 1 storage tank | 391.48 | 25,000 | 64 |
| calcium-carbide — per chest | 39.15 | 4,800 | 123 |
| lime — per chest | 7.83 | 4,800 | **613** |
| coke — per chest | 36.70 | 4,800 | 131 |

1 tank + 2 CaC chests + 1 lime chest + 10 coke chests = **37 minutes** of full-surplus absorption before
any core recipe stalls. Lime buffers exceptionally well because its rate is only 7.83/s.

**So burn acetylene last and naphthalene/carbolic first.** The full order, by cost of accumulating:

```
naphthalene → carbolic → gasoline → aromatics → hydrogen → syngas → acetylene
```

### Implementing it on the steam side, not the fuel side

Dedicating boiler groups per fuel does **not** create priority: every boiler feeds the same steam bus,
so when the engines throttle, backpressure in the shared bus stops all groups equally. Priority has to
be applied to the steam, exactly as described:

- **primary boilers** (naphthalene, carbolic, gasoline, aromatics, hydrogen, syngas) — output directly
  into the steam bus
- **acetylene boilers** — output through a `py-underflow-valve` (passes only when the downstream bus is low) or a pump gated on `steam bus < ~60%`. Check valve throughput against the 2,123 steam/s in play before choosing valves

The gated boilers only contribute when the primaries cannot meet demand. When the bus is satisfied the
pump closes, the acetylene boilers' own steam output blocks, they stop, and acetylene begins
accumulating — riding the deep cascade instead of a shallow one. No core recipe is affected for the
first ~37 minutes.

### Optional: coke overflow to solid boilers

Coke is a solid fuel (5.00 MJ, `chemical`), so the coke chests can overflow into plain `boiler`s via
inserters above a level threshold. That is a lossy second path — `effectivity 1` instead of the oil
boiler's 2:

```
36.70/s coke × 5.00 MJ = 183.5 MJ/s → 372 steam/s → 91.75 MW   (23% of the acetylene route's 391.48 MW)
```

Worth it as a valve rather than a plan: it converts "the chain stalls" into "the chain keeps running at
reduced electrical efficiency," and it extends ride-through indefinitely as long as *some* steam demand
exists. It does not help at `u → 0`, where nothing does.

### The layered strategy

| layer | handles | mechanism | required? |
|---|---|---|---|
| **0. Backpressure** | **all steady-state demand levels** | none — intrinsic | **free** |
| **1. Steam priority** | which cascade absorbs variance | pump-gated acetylene boilers | recommended |
| **2. Buffer depth** | holding exports steady through dips | lime/coke/CaC chests, acetylene tanks | optional |
| **3. Coke overflow** | lossy extra headroom | inserters → plain boilers at eff 1 | optional |
| **4. Raw-coal throttle** | buffer discipline, not regulation | belt gated on acetylene tank level | optional |

**Layer 0 does the actual regulating, for free.** The feedback loop above means the block already tracks
any demand level without a single combinator. Layer 1 decides *where* the variance is absorbed (the
4-stage acetylene cascade rather than a 1-stage fluid one). Layer 2 decides whether exports stay steady.

Layer 4 is no longer the load-bearing piece — it is worth adding only to keep buffers off 100%, which
is where the acetylene loop's theoretical deadlock state lives, and to cut duty-cycle churn. Build 1
first; 2 if the exports matter; 4 last if at all.

## Full-chain backpressure — the complete propagation

Tracing only as far as "acetylene backs up, coke backs up" stops short. The cascade runs all the way to
the raw-coal belt, and completing it exposes a constraint that is easy to miss.

```
acetylene tank full
  → acetylene stalls            → CaC chests fill
  → calcium-carbide stalls      → lime chests fill
  → lime stalls                 → coke has no consumer, chests fill
  → coke blocks its 3 producers: pitch-refining, anthracene-gasoline-cracking, coal-gas
      · cracking stops          → gasoline production falls 61.92→0
      · pitch-refining stops    → light-oil, naphthalene, hydrogen stop; pitch backs up
  → anthracene has no consumer  → tar-refining blocked on its own output
  → tar backs up                → distilled-raw-coal AND syngas both blocked
  → coal-gas backs up           → chain fully stopped at the raw-coal belt
```

### Consequence 1: there is exactly one throughput variable

Every recipe here is multi-output, and the graph is a single connected DAG from raw-coal. There is no
stable state in which one branch runs while another is stopped — any divergence immediately generates
backpressure that corrects it. **The whole block is described by one scalar `t`.** This is why the
feedback loop settles cleanly rather than finding odd partial regimes.

### Consequence 2: every terminal output caps `t` independently — including the non-fuels

The fuels are collectively regulated by power demand. The **non-fuel** terminal outputs are not — they
scale with `t` regardless of how much electricity the grid wants, so each imposes its own hard ceiling:

```
t  =  min( P_gross/524,  S_creosote/31.75,  S_CO2/61.98,  S_ash/2.16,  S_gravel/1.63,  S_ironoxide/0.435 )
net MW = 446.07 × t
```

| non-fuel output | rate at t=1 | sink needed for full 446 MW |
|---|--:|--:|
| carbon-dioxide | 61.98/s | 61.98/s |
| creosote | 31.75/s | 31.75/s |
| ash | 2.16/s | 2.16/s |
| gravel | 1.63/s | 1.63/s |
| iron-oxide | 0.435/s | 0.435/s |

**An undersized sink throttles the power output, not just the byproduct.**

| scenario | t | net MW |
|---|--:|--:|
| CO2 sink = design 07's Moss-2 only (7.59/s) | 0.122 | **54.6** |
| CO2 sink = 20/s | 0.323 | 143.9 |
| creosote sink = 10/s | 0.315 | 140.5 |
| **all sinks sized to full rate** | **1.000** | **446.1** |

### Consequence 3: CO2 is vented — the cap disappears for one tile

At **61.98/s** there is no plausible external consumer: Moss-2 takes 7.59/s, and every other site makes
CO2 for free from `moondrop-co2`, so nobody wants an import. With Moss-2 as the only outlet the block
would be capped at **54.6 MW — 12% of its capability.** Every unlocked conversion sink is gated on an
input this block lacks (olefin needs 124/s hydrogen against 18.52/s; log6 needs 5.31/s ash against
2.16/s; formamide needs 61.98/s ammonia against 0.81/s).

**Per the project ruleset, CO2 is vented.** `carbon-dioxide-pyvoid-gas` (20,000 CO2 → nothing) in a
`py-gas-vent`: **1×1 tile, 25 kW, no fuel, 40,000/s capacity** — one vent at 0.15% utilisation. The cap
disappears for a rounding error, and the block holds 446 MW with no bio dependency and no chromium line.

Venting is a deliberate, approved exception rather than a default — see CLAUDE.md § Rules. Both
conversion routes stay documented in case CO2 becomes worth capturing later:

| route | buildings | gives | needs |
|---|--:|---|---|
| **vent** | **1** (1×1, 25 kW) | — | nothing |
| `chromium-01` | 3 | 2.07/s chromium, sinks 4.13/s creosote too | chromite-sand 6.20/s, a chromium ore line |
| `methane-co2` | 24 | +15 MW | 368 moondrop modules, self-grown seeds |

`chromium-01` is the one worth revisiting — 150 CO2 per craft is the densest sink available, it is
already unlocked, and it absorbs creosote as a side effect. Build it if a chromium line is wanted
anyway; otherwise vent.

Creosote at 31.75/s has the same structure — the brief assumes an external sink, and that assumption is
load-bearing for 446 MW, not a tidying detail.

### Consequence 4: where the backpressure front sits determines buffer state

A recipe only duty-cycles when one of its outputs is *full*; downstream of the blockage, recipes are
input-limited and run freely. So the position of the backpressure front decides where every buffer sits:

| | front location | buffer state | consequences |
|---|---|---|---|
| **no input throttle** | acetylene tank, propagating upstream to raw-coal | **essentially all buffers at ~100%** | zero ride-through, no spike absorption, maximum exposure to the acetylene-loop deadlock state |
| **raw-coal throttled** | the input belt, outside the chain | **all internal buffers low** | full ride-through, spikes absorbed from buffer, deadlock state unreachable |

This is the real argument for layer 4, and it supersedes the "optional refinement" framing above.
Backpressure regulates throughput correctly either way — but without a throttle it does so by holding
every buffer in the block pinned at full, which is precisely the state with no margin for anything.
Throttling moves the front outside the chain and leaves the buffers empty and useful.
