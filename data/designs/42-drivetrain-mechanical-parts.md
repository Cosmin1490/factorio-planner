# 42 — Drivetrain (mechanical-parts / gearbox / shaft) — 2.40 mechanical-parts-01/min, 21 buildings

**The block is `shaft-mk01`.** Everything else is a thin assembler bolted on top of a shaft supply —
`gearbox-mk01` solved standalone at 3/min is 24 buildings, and *six of them are shaft factories*; the
gearbox assembler itself is one 3×3. `brake-mk01` at 3/min is 6 buildings and 3.25 MW. So the sizing
question is not "how many mechanical parts" but "how many shafts per minute", and the answer is
priced in acetylene, not buildings.

**2.40/min is the clean stop**: `shaft-mk01` and `fenxsb-alloy-2` both land at frac **2.000** — two
buildings each at exactly 100 %. Nothing else is above 60 %.

```
mechanical-parts-01 [U] [adv-crafting, 12 s]  brake 1 + controler 1 + gearbox 1 + shaft 1
                                              + utility-box 1 + rubber 3 + small-parts-01 25
                                              + steel-plate 15                              →  1
gearbox-mk01        [U] [adv-crafting, 10 s]  shaft 2 + steel-plate 5 + duralumin 4
                                              + titanium-plate 4 + fish-oil 20              →  1
shaft-mk01          [U] [crafting,     50 s]  fenxsb-alloy 5 + small-parts-01 5 + solder 5  →  1
brake-mk01          [U] [crafting,     20 s]  vitreloy 2 + ceramic 10 + small-parts-01 10
                                              + steel-plate 5 + duralumin 20 + glass 10
                                              + copper-plate 10                             →  1
controler-mk01      [U] [crafting,     15 s]  battery-mk01 3 + e-circuit 4 + glass 4
                                              + iron-plate 5 + ore-quartz 5                 →  1
utility-box-mk01    [U] [crafting,     30 s]  e-circuit 3 + plastic-bar 5 + copper-plate 25
                                              + iron-plate 10 + tinned-cable 50             →  1
fenxsb-alloy-2      [U] [rawores-smelt, 20 s] nexelit-plate 2 + sb-oxide 1 + iron-plate 7   →  2
ceramic             [U] [hpf,            5 s]  coke 1 + clay 10                            →  5
clay                [U] [clay,           4 s]  steam 100                                   →  3
electric-boiler-... [U] [elec-boiler,    5 s]  water 300                                   →  steam 300
```

## Recipe table

```
┌────────────────────────────────┬────────────────────────┬────────┬───────┬────────┬───────┐
│ Recipe                         │ Factory                │  frac  │ Count │  Util  │ Size  │
├────────────────────────────────┼────────────────────────┼────────┼───────┼────────┼───────┤
│ shaft-mk01                     │ automated-factory-mk01 │  2.000 │   2   │ 100.0% │ 7x7   │
│ fenxsb-alloy-2                 │ smelter-mk01           │  2.000 │   2   │ 100.0% │ 13x13 │
│ solder-0                       │ automated-factory-mk01 │  1.200 │   2   │  60.0% │ 7x7   │
│ nexelit-plate-2                │ advanced-foundry-mk01  │  0.667 │   1   │  66.7% │ 6x6   │
│ copper-cable                   │ automated-factory-mk01 │  0.584 │   1   │  58.4% │ 7x7   │
│ utility-box-mk01               │ automated-factory-mk01 │  0.400 │   1   │  40.0% │ 7x7   │
│ clay                           │ clay-pit-mk01          │  0.355 │   1   │  35.5% │ 7x7   │
│ tinned-cable                   │ automated-factory-mk01 │  0.334 │   1   │  33.4% │ 7x7   │
│ brake-mk01                     │ automated-factory-mk01 │  0.267 │   1   │  26.7% │ 7x7   │
│ iron-stick                     │ automated-factory-mk01 │  0.250 │   1   │  25.0% │ 7x7   │
│ controler-mk01                 │ automated-factory-mk01 │  0.200 │   1   │  20.0% │ 7x7   │
│ iron-gear-wheel                │ automated-factory-mk01 │  0.167 │   1   │  16.7% │ 7x7   │
│ electric-boiler-water-to-steam │ py-electric-boiler     │  0.148 │   1   │  14.8% │ 3x3   │
│ ceramic                        │ hpf                    │  0.133 │   1   │  13.3% │ 7x7   │
│ bolts                          │ automated-factory-mk01 │  0.100 │   1   │  10.0% │ 7x7   │
│ mechanical-parts-01            │ assembling-machine-2   │  0.081 │   1   │   8.1% │ 3x3   │
│ small-parts-01                 │ automated-factory-mk01 │  0.067 │   1   │   6.7% │ 7x7   │
│ gearbox-mk01                   │ assembling-machine-2   │  0.067 │   1   │   6.7% │ 3x3   │
└────────────────────────────────┴────────────────────────┴────────┴───────┴────────┴───────┘
```

**21 buildings · 1,136 tiles · 15.98 MW electric + 20.00 acetylene/s**

The solver reports **35.97 MW** for this block. That is the `fluid_energy_source` fold described in
CLAUDE.md — 20.00 MW of it is the two `smelter-mk01`, which burn acetylene, not electricity:

| | MW | source |
|---|--:|---|
| `smelter-mk01` ×2 @100 % | **20.00** | **acetylene — 20.00/s, 1,200/min** |
| `automated-factory-mk01` ×13 (Σfrac 5.569) | 11.14 | electric |
| `py-electric-boiler` ×1 @14.8 % | **3.70** | electric — all of it for clay |
| `advanced-foundry-mk01` ×1 @66.7 % | 0.80 | electric |
| `hpf` ×1 @13.3 % | 0.27 | electric |
| `clay-pit-mk01` ×1 @35.5 % | 0.07 | electric |
| `assembling-machine-2` ×2 (Σfrac 0.148) | 0.02 | jerry — 0.13 acetylene-canister/min |
| **reported total** | **35.97** | |

*The `clay`, `ceramic` and boiler fracs are hand-derived (rate ÷ per-building throughput); the ×1000
frac probe used elsewhere overflows the `water` cap at this scale. The seven rows sum to 36.00
against the solver's reported 35.97, which is the check.*

## The real price of a shaft is 8.33 acetylene/s

`fenxsb-alloy-2` is the **only** unlocked route to `fenxsb-alloy`, its category is
`py-rawores-smelter`, and the only machines in that category are `smelter-mk01`…`mk04`. A
`smelter-mk01` is a 13×13 fluid burner at a flat **10 MW = 10.00 acetylene/s** (acetylene is
1 MJ/unit), and it turns out 2 fenxsb per 20 s = 6/min. A shaft eats 5 fenxsb.

```
1 shaft/min  =  5 fenxsb/min  =  0.833 smelter  =  8.33 acetylene/s  =  500 acetylene/min
```

Scaling is linear past this size — 6 shaft/min solves to 20 buildings / 69.25 MW and 12 shaft/min to
35 / 138.50, exactly double. So the marginal cost of **exported** shaft, on top of this block:

| per +1 shaft-mk01/min | |
|---|--:|
| buildings | +2.5 |
| acetylene | +8.33/s |
| electric | +3.21 MW |

For scale: 2 smelters here is 1,200 acetylene/min, where design 39's *entire* block is 95.5/min.
Design 41 already runs 11 `smelter-mk01` ≈ 98 MW of acetylene for the same reason — it makes
`shaft-mk01` ×3 internally. **Both blocks are paying for the same fenxsb smelters separately**, and
`shaft-mk01` has 18 consumers base-wide against `fenxsb-alloy`'s 9. If 41 gets built, hoisting shaft
into one shared supply and exporting it is the structural move; the acetylene does not go away, but
it stops being bought twice at partial utilisation.

## Boundary — why fenxsb is in and duralumin is out

Consumer counts over **all** recipes (the lens rule 16 asks for, since boundaries must survive
unlocks):

| item | all | unlocked | call |
|---|--:|--:|---|
| `small-parts-01` | 250 | 6 | **inline** — 1 building at 6.7 %, a station would cost more than the machine |
| `nexelit-plate` | 195 | 2 | inline — sole use here is fenxsb; foundry is 1.2 MW |
| `mechanical-parts-01` | 182 | 2 | **the product** |
| `duralumin` | 175 | 2 | **import** — Tier A bus item |
| `titanium-plate` | 190 | 2 | import |
| `solder` | 29 | 2 | inline — 1.2 buildings |
| `tinned-cable` | 40 | 2 | inline |
| `shaft-mk01` | 18 | 2 | inline *(see above — export candidate)* |
| `ceramic` | 18 | 2 | **inline** — costs 3 buildings; carries clay + a boiler with it |
| `gearbox-mk01` | 15 | 2 | inline |
| `brake-mk01` | 11 | 2 | inline |
| `fenxsb-alloy` | **9** | 2 | **inline** — Tier D, and its only unlocked consumer is `shaft-mk01` |

Boundaries priced at 2.40/min:

| config | buildings | reported MW | |
|---|--:|--:|---|
| + `duralumin-1` also inline | 23 | 48.75 | 4 smelters |
| **fenxsb + ceramic inline, duralumin imported** | **21** | **35.97** | **chosen** |
| fenxsb inline, ceramic imported | 18 | 31.93 | |
| all alloys imported | ~16 | ~11 | 0 smelters |

Importing fenxsb looks like it saves 3 buildings and 21 MW, but it does not: a dedicated fenxsb block
would have `shaft-mk01` as its only unlocked customer, so it is this block's smelters with a station
bolted on. `duralumin` is the opposite case — 175 consumers, genuinely a bus item, and its smelters
get amortised across everything else that wants it.

Ceramic sits between them at 18 consumers. Inlining trades one import lane (8.00 ceramic/min) for
two (1.60 coke + 532.57 water) and **+4.04 MW**, of which 3.70 is the boiler — see below. It also
closes a construction loop: the two `smelter-mk01` need 100 ceramic to build, which is 12.5 minutes
of the block's own output.

## The clay steam is 3.70 MW, and it does not have to be

`clay` is **100 steam → 3**, so 8.00 ceramic/min pulls 15.98 clay/min and **532.57 steam/min
(8.88/s)**. That single number is the whole cost of inlining ceramic — the `hpf` and the clay pit
together are 0.34 MW.

`py-electric-boiler` is the configured source: 25 MW rated, 3×3, 14.8 % utilised = **3.70 MW
electric**. Two alternatives, both real, neither resolvable without knowing what the marginal
megawatt costs:

**`oil-boiler-mk01` — effectivity 2.** 8.88 steam@250/s is 4.38 MJ/s of steam energy; at effectivity
2 that is **2.19 MW of acetylene = 131 acetylene/min**, against 3.70 MW electric. The block already
imports 1,200 acetylene/min, so this is +11 % on a lane that already exists and no new import type.
It wins whenever electricity is being made from acetylene at worse than 59 % — which any
plain-steam generator is, at effectivity 0.5. It loses once molten-salt power is online and
electricity is the cheap thing. **The separator is molten salt, not this block.**

**The heat exchanger is a 1.70× on steam volume, and the solver cannot see it.** `clay-pit-mk01`'s
steam fluidbox has no filter and no `minimum_temperature` — clay counts steam **by volume**, and is
indifferent to temperature. `cool-steam-250-to-150` (`py-heat-exchanger`, 0.5 MW, speed 2) is
200 steam@250 + 150 water → 340 steam@150:

```
per clay craft (100 steam, temperature-blind)
  direct :  100 steam@250                          =  49.35 MJ of boiler energy
  via HX :   58.8 steam@250 + 44.1 water           =  29.03 MJ          -41.2 %
block     :  4.38 MW of steam energy  ->  2.58 MW
```

Energy is conserved across the exchanger (98.7 → 96.4 MJ); the gain is entirely that cooling spreads
the same energy over 1.7× the volume, and volume is what clay is billed in. This is the
cooling-tower mechanic from CLAUDE.md running in your favour rather than against you.

**Offering this recipe to the LP collapses the solve to 0 buildings.** The solver does not model
fluid temperature, so `200 steam → 340 steam` reads as an unbounded free multiplier and the program
degenerates. The 41.2 % above is hand arithmetic, not solver output, and the configured block does
**not** include it. Worth about 1.5 MW here — too small to justify a 7×7 exchanger whose own build
cost includes a `mechanical-parts-01`; worth revisiting if clay demand ever scales.

## Imports — 20 + acetylene

| | /min | note |
|---|--:|---|
| **acetylene** | **1,200.00** | 20.00/s, smelter fuel — *not in solver output* |
| **water** | **532.57** | → clay, via the boiler |
| iron-plate | 123.98 | |
| copper-plate | 97.98 | |
| tin-plate | 64.00 | → solder |
| lead-plate | 48.00 | → solder |
| steel-plate | 20.00 | |
| duralumin | 19.18 | brake 20/craft is most of it |
| fish-oil | 16.00 | design 29 |
| clean-nexelit | 12.00 | → nexelit-plate → fenxsb |
| glass | 11.19 | |
| sb-oxide | 6.00 | |
| electronic-circuit | 5.60 | |
| **ore-quartz** | **4.00** | **no producer in any current design — see risk 1** |
| plastic-bar | 4.00 | |
| titanium-plate | 3.20 | |
| battery-mk01 | 2.40 | |
| rubber | 2.40 | design 40 makes 15/min |
| coke | 1.60 | → ceramic |
| vitreloy | 1.60 | |
| acetylene-canister | 0.13 | `assembling-machine-2` fuel |

**Exports** (/min): **mechanical-parts-01 2.40** · empty-fuel-canister 0.13 *(return to the filler)*

Twenty import lanes on a 21-building block is the headline cost of a MAM-shaped design — the station
count exceeds the machine count on every row below `steel-plate`. The four plate lanes (iron,
copper, tin, lead = 334/min combined) are 80 % of the solid mass.

## What 2.40 mechanical-parts/min actually buys

Shaft is the common currency, so price the consumers in shaft-equivalents
(`gearbox-mk01` = 2 shaft):

| build | shaft-eq each | per min at this size |
|---|--:|--:|
| `mechanical-parts-01` | 3 | **2.40** ← as configured |
| `automated-factory-mk01` (2 gearbox + 2 shaft) | 6 | 1.20 |
| `locomotive` (1 gearbox + 4 shaft + 4 brake) | 6 | 1.20 |
| `cargo-wagon` / `fluid-wagon` (2 shaft + 2 brake) | 2 | 3.60 |
| `py-construction-robot-mk01` (1 gearbox) | 2 | 3.60 |
| `tidal-mk01` (10 mech-parts + 3 gearbox + 3 shaft) | 39 | 0.18 |

The block runs 7.20 shaft-eq/min and currently spends all of it on `mechanical-parts-01`. Any
export of raw shaft, gearbox or brake comes out of that budget or off the marginal table above —
`brake-mk01` is the cheap one, 2 buildings and no smelter per 3/min.

For the molten-salt plan: `py-coal-powerplant-mk01` is 3 `mechanical-parts-01` and
`py-heat-exchanger` is 1, so 2.40/min is 0.80 powerplants/min — a full 6.4-powerplant turbine set
every 8 minutes.

## Solver command

**The `--factory` overrides are the load-bearing flags.** Drop them and the LP answers with
`assembling-machine-3`, `smelter-mk04` and `electric-furnace` — a 15-building, 20.83 MW block that
cannot be built, since `--unlocked` filters recipes but not the machines `--factory` would have
pinned.

The boundary is set by **membership in `--recipes`**, not by the caps: `duralumin-1` is deliberately
absent, which is what makes `duralumin` an import. Removing *all* `--max-import` flags leaves every
rate and the MW unchanged and only moves the `shaft-mk01` ceil (frac 2.000 → 3 machines, +1
building). The caps are kept to pin that rounding, not to force anything internal.

`--fuel ...:acetylene-canister` on the two `assembling-machine-2` rows avoids the coal default and
its phantom ash. **`cool-steam-250-to-150` must stay out of `--recipes`** — it degenerates the solve
to 0 buildings (see the steam section). `--max-import "water:100000"` is a plain allowance, but note
it does not scale: a ×1000 frac probe overflows it and returns all zeros.

```bash
npx tsx src/cli.ts solve \
  --recipes "mechanical-parts-01,controler-mk01,utility-box-mk01,gearbox-mk01,shaft-mk01,brake-mk01,tinned-cable,small-parts-01,iron-gear-wheel,copper-cable,bolts,iron-stick,solder-0,fenxsb-alloy-2,nexelit-plate-2,ceramic,clay,electric-boiler-water-to-steam" \
  --target "mechanical-parts-01:2.4" --time 60 \
  --max-import "controler-mk01:0.001" --max-import "utility-box-mk01:0.001" \
  --max-import "gearbox-mk01:0.001" --max-import "shaft-mk01:0.001" --max-import "brake-mk01:0.001" \
  --max-import "tinned-cable:0.001" --max-import "small-parts-01:0.001" \
  --max-import "iron-gear-wheel:0.001" --max-import "copper-cable:0.001" --max-import "bolts:0.001" \
  --max-import "iron-stick:0.001" --max-import "solder:0.001" \
  --max-import "fenxsb-alloy:0.001" --max-import "nexelit-plate:0.001" \
  --factory "mechanical-parts-01:assembling-machine-2" \
  --factory "gearbox-mk01:assembling-machine-2" \
  --fuel "mechanical-parts-01:acetylene-canister" --fuel "gearbox-mk01:acetylene-canister" \
  --factory "controler-mk01:automated-factory-mk01" \
  --factory "utility-box-mk01:automated-factory-mk01" \
  --factory "shaft-mk01:automated-factory-mk01" \
  --factory "brake-mk01:automated-factory-mk01" \
  --factory "tinned-cable:automated-factory-mk01" \
  --factory "small-parts-01:automated-factory-mk01" \
  --factory "iron-gear-wheel:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "fenxsb-alloy-2:smelter-mk01" \
  --factory "nexelit-plate-2:advanced-foundry-mk01" \
  --factory "ceramic:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "electric-boiler-water-to-steam:py-electric-boiler" \
  --max-import "ceramic:0.001" --max-import "clay:0.001" --max-import "steam:0.001" \
  --max-import "water:100000" \
  --solver simplex --unlocked
```

## Intermediates

```
┌─────────────────────┬────────────┬────────────────────────────┬──────────────────────────────────────────────────┐
│ Item                │ Rate       │ Producer                   │ Consumer                                         │
├─────────────────────┼────────────┼────────────────────────────┼──────────────────────────────────────────────────┤
│ copper-cable        │ 140.00/min │ copper-cable               │ tinned-cable 80.00, small-parts-01 60.00         │
│ bolts               │  60.00/min │ bolts                      │ small-parts-01 60.00                             │
│ iron-stick          │  60.00/min │ iron-stick                 │ bolts 60.00                                      │
│ steam               │ 532.57/min │ electric-boiler-...-steam  │ clay 532.57                                      │
│ small-parts-01      │  39.99/min │ small-parts-01             │ mech-parts 20.00, shaft 12.00, brake 7.99        │
│ tinned-cable        │  40.00/min │ tinned-cable               │ utility-box-mk01 40.00                           │
│ iron-gear-wheel     │  20.00/min │ iron-gear-wheel            │ small-parts-01 20.00                             │
│ clay                │  15.98/min │ clay                       │ ceramic 15.98                                    │
│ fenxsb-alloy        │  12.00/min │ fenxsb-alloy-2             │ shaft-mk01 12.00                                 │
│ solder              │  12.00/min │ solder-0                   │ shaft-mk01 12.00                                 │
│ nexelit-plate       │  12.00/min │ nexelit-plate-2            │ fenxsb-alloy-2 12.00                             │
│ ceramic             │   7.99/min │ ceramic                    │ brake-mk01 7.99                                  │
│ shaft-mk01          │   2.40/min │ shaft-mk01                 │ mech-parts 0.80, gearbox-mk01 1.60               │
│ brake-mk01          │   0.80/min │ brake-mk01                 │ mechanical-parts-01 0.80                         │
│ controler-mk01      │   0.80/min │ controler-mk01             │ mechanical-parts-01 0.80                         │
│ gearbox-mk01        │   0.80/min │ gearbox-mk01               │ mechanical-parts-01 0.80                         │
│ utility-box-mk01    │   0.80/min │ utility-box-mk01           │ mechanical-parts-01 0.80                         │
└─────────────────────┴────────────┴────────────────────────────┴──────────────────────────────────────────────────┘
```

## Risks

1. **`ore-quartz` has no producer in any current design.** `controler-mk01` needs 5 per craft =
   4.00/min here, and design 39 hit the same wall. It is mined, not crafted: the `ore-quartz`
   resource takes no fluid, `quartz-rock` requires acetylene. A quartz outpost is a prerequisite for
   `mechanical-parts-01` at any rate — `gearbox-mk01`, `shaft-mk01` and `brake-mk01` are unaffected.
2. **`sb-oxide` and `clean-nexelit` (6.00 and 12.00/min) feed the only fenxsb route.** Both are
   single-route imports with no alternative, so a gap on either stops all shaft production and
   therefore the whole block.
3. **Acetylene supply is the scaling limit, not buildings.** Two smelters is 20.00/s; a block twice
   this size wants 40/s before any shaft is exported.
4. **Water is now a block input at 532.57/min**, and the whole ceramic branch stalls without it —
   `brake-mk01` is the only ceramic consumer, and `mechanical-parts-01` needs a brake per craft, so
   a dry boiler stops the product. `shaft-mk01` and `gearbox-mk01` keep running.

## Lever: efficiency modules

`smelter-mk01` allows `consumption` and has 1 module slot, as do `automated-factory-mk01`, `hpf`,
`clay-pit-mk01` and `py-electric-boiler` (3 slots). One `efficiency-module` (−30 % consumption, no
speed penalty) in every slot takes the pre-ceramic block from **31.93 → 22.35 MW** (solver-verified);
applied to the 35.97 MW configuration the same −30 % lands near 25.2 MW, with the smelters at
14.00 acetylene/s and the boiler at 2.59 MW — zero extra buildings. `efficiency-module` is **not
researched**; this is priced as an upgrade, not the baseline. `productivity-module` is the wrong pick
here: ×1.2 consumption against ×0.825 throughput is 1.45× the fuel per fenxsb.

## Construction materials

Distinct items needed to build the 21 machines (none appear in the flow imports except
`electronic-circuit`, `steel-plate`, `iron-plate`, `copper-plate`, `titanium-plate` and `duralumin`):

| item | qty | for |
|---|--:|---|
| small-parts-01 | 405 | every machine type |
| steel-plate | 344 | |
| iron-plate | 260 | smelters, foundry, clay pit, boiler |
| ceramic | 100 | smelter-mk01 ×2 — *now made on site* |
| stone-brick | 100 | smelters, foundry, hpf, clay pit |
| electronic-circuit | 81 | |
| inserter | 39 | automated-factory ×13 |
| titanium-plate | 30 | smelter-mk01 ×2 |
| copper-cable | 30 | advanced-foundry |
| intermetallics | 26 | automated-factory ×13 |
| **gearbox-mk01** | **26** | automated-factory ×13 |
| **shaft-mk01** | **26** | automated-factory ×13 |
| steam-engine | 23 | smelters ×2, hpf, clay pit |
| copper-plate | 20 | hpf |
| duralumin | 10 | assembling-machine-2 ×2 |
| stone-furnace | 10 | advanced-foundry |
| pipe | 10 | clay-pit-mk01 |
| electric-mining-drill | 3 | py-electric-boiler |
| inductor1 | 3 | hpf |
| burner-mining-drill | 2 | clay-pit-mk01 |
| assembling-machine-1 | 2 | |
| lab | 1 | py-electric-boiler |
| gasifier | 1 | py-electric-boiler |

**The block builds itself, twice over.** Its 13 `automated-factory-mk01` need 26 gearbox + 26 shaft
= 78 shaft-equivalents, which is **10.8 minutes of its own 7.20 shaft-eq/min output**; the 100
ceramic for the two smelters is **12.5 minutes** of its own 8.00 ceramic/min. So the second stamp is
nearly free and the first is the one that has to come from somewhere else.
Construction-feasibility note, inferred: `intermetallics` (26), `inductor1` (3) and `vitreloy` (flow
import, 1.60/min) are the items here with no recorded producing design; design 41 runs
`intermetallics` internally via `advanced-foundry-mk01`, so that recipe is reachable, but none has a
standing supply. Build or confirm those three plus the `ore-quartz` outpost before committing the
stamp.
