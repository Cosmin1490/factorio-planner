# 42 — Drivetrain (mechanical-parts / gearbox / shaft) — 1.20 mechanical-parts-01/min, 18 buildings

**The block is `shaft-mk01`.** Everything else is a thin assembler bolted on top of a shaft supply —
`gearbox-mk01` solved standalone at 3/min is 24 buildings, and *six of them are shaft factories*; the
gearbox assembler itself is one 3×3. `brake-mk01` at 3/min is 6 buildings and 3.25 MW. So the sizing
question is not "how many mechanical parts" but "how many shafts per minute", and the answer is
priced in acetylene, not buildings.

**1.20/min is the smallest clean stop, and every row is one machine.** `shaft-mk01` and
`fenxsb-alloy-2` both land at frac **1.000** — the binding pair, saturated, with nothing else above
60 %. Because those two scale together, doubling to 2.40/min is also clean (21 buildings: a second
shaft factory, a second smelter, a second solder) — so this is a stamp, not a compromise.

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
ceramic             [U] [hpf,            5 s] coke 1 + clay 10                              →  5
clay                [U] [clay,           4 s] steam 100                                     →  3
steam for clay      [U] [oil-boiler-mk01, effectivity 2]  acetylene 1.09/s  ->  4.43 steam@250/s
```

## Recipe table

```
┌────────────────────────────────┬────────────────────────┬───────┬────────┬────────┬───────┐
│ Recipe                         │ Factory                │ Count │  frac  │  Util  │ Size  │
├────────────────────────────────┼────────────────────────┼───────┼────────┼────────┼───────┤
│ shaft-mk01                     │ automated-factory-mk01 │   1   │  1.000 │ 100.0% │ 7x7   │
│ fenxsb-alloy-2                 │ smelter-mk01           │   1   │  1.000 │ 100.0% │ 13x13 │
│ solder-0                       │ automated-factory-mk01 │   1   │  0.600 │  60.0% │ 7x7   │
│ nexelit-plate-2                │ advanced-foundry-mk01  │   1   │  0.334 │  33.4% │ 6x6   │
│ copper-cable                   │ automated-factory-mk01 │   1   │  0.292 │  29.2% │ 7x7   │
│ utility-box-mk01               │ automated-factory-mk01 │   1   │  0.200 │  20.0% │ 7x7   │
│ clay                           │ clay-pit-mk01          │   1   │  0.178 │  17.8% │ 7x7   │
│ tinned-cable                   │ automated-factory-mk01 │   1   │  0.167 │  16.7% │ 7x7   │
│ brake-mk01                     │ automated-factory-mk01 │   1   │  0.134 │  13.4% │ 7x7   │
│ iron-stick                     │ automated-factory-mk01 │   1   │  0.125 │  12.5% │ 7x7   │
│ controler-mk01                 │ automated-factory-mk01 │   1   │  0.100 │  10.0% │ 7x7   │
│ iron-gear-wheel                │ automated-factory-mk01 │   1   │  0.084 │   8.4% │ 7x7   │
│ (steam for clay)               │ oil-boiler-mk01        │   1   │  0.037 │   3.7% │ 5x5   │
│ ceramic                        │ hpf                    │   1   │  0.067 │   6.7% │ 7x7   │
│ bolts                          │ automated-factory-mk01 │   1   │  0.050 │   5.0% │ 7x7   │
│ mechanical-parts-01            │ assembling-machine-2   │   1   │  0.040 │   4.0% │ 3x3   │
│ small-parts-01                 │ automated-factory-mk01 │   1   │  0.034 │   3.4% │ 7x7   │
│ gearbox-mk01                   │ assembling-machine-2   │   1   │  0.034 │   3.4% │ 3x3   │
└────────────────────────────────┴────────────────────────┴───────┴────────┴────────┴───────┘
```

**18 buildings · 885 tiles · 6.14 MW electric + 11.09 acetylene/s (665.6/min)**

| | MW | source |
|---|--:|---|
| `smelter-mk01` ×1 @100 % | **10.00** | **acetylene — 10.00/s, 600/min** |
| `automated-factory-mk01` ×11 (Σfrac 2.786) | 5.57 | electric |
| `advanced-foundry-mk01` ×1 @33.4 % | 0.40 | electric |
| `hpf` ×1 @6.7 % | 0.13 | electric |
| `clay-pit-mk01` ×1 @17.8 % | 0.04 | electric |
| `oil-boiler-mk01` ×1 @3.7 % | 1.09 | **acetylene — 1.09/s, 65.6/min** |
| `assembling-machine-2` ×2 (Σfrac 0.074) | 0.01 | jerry — 0.07 acetylene-canister/min |

The solver reports **17.98 MW** and that figure is for the `py-electric-boiler` configuration it can
model — see § Solver command. The build swaps that row for `oil-boiler-mk01`, which moves 1.87 MW
off the electrical bus and adds 65.6 acetylene/min; the other seventeen rows are untouched.

*Fracs are solver output, read off a ×1000 target solve — that probe needs `water` raised to 1e9, or
the default cap starves it and every row returns zero. It also reports `shaft-mk01` at 1.001 from
accumulated float; at the real 1.2/min target the solve returns one machine, so the frac is 1.000.
The seven power rows sum to 18.02 against the reported 17.98.*

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

For scale: one smelter here is 600 acetylene/min, where design 39's *entire* block is 95.5/min.
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
| `small-parts-01` | 250 | 6 | **inline** — 1 building at 3.4 %, a station would cost more than the machine |
| `nexelit-plate` | 195 | 2 | inline — sole use here is fenxsb; foundry is 1.2 MW |
| `mechanical-parts-01` | 182 | 2 | **the product** |
| `duralumin` | 175 | 2 | **import** — Tier A bus item |
| `titanium-plate` | 190 | 2 | import |
| `solder` | 29 | 2 | inline — the one row with real load at 60 % |
| `tinned-cable` | 40 | 2 | inline |
| `shaft-mk01` | 18 | 2 | inline *(see above — export candidate)* |
| `ceramic` | 18 | 2 | **inline** — costs 3 buildings; carries clay + a boiler with it |
| `gearbox-mk01` | 15 | 2 | inline |
| `brake-mk01` | 11 | 2 | inline |
| `fenxsb-alloy` | **9** | 2 | **inline** — Tier D, and its only unlocked consumer is `shaft-mk01` |

Boundaries priced at 1.20/min:

| config | buildings | reported MW | |
|---|--:|--:|---|
| + `duralumin-1` also inline | 19 | 24.37 | 2 smelters |
| **fenxsb + ceramic inline, duralumin imported** | **18** | **17.98** | **chosen** |
| fenxsb imported, ceramic inline | 16 | 2.12 | 0 smelters |
| fenxsb inline, ceramic imported | 15 | 15.97 | 1 smelter |
| all alloys imported | 14 | 5.57 | 0 smelters |

Importing fenxsb looks like the bargain of the table — 2 buildings and **15.86 MW**, because it takes
the smelter and the foundry with it. It is not: a dedicated fenxsb block would have `shaft-mk01` as
its only unlocked customer, so it is this block's smelter with a station bolted on. `duralumin` is the opposite case — 175 consumers, genuinely a bus item, and its smelters
get amortised across everything else that wants it.

Ceramic sits between them at 18 consumers. Inlining trades one import lane (4.00 ceramic/min) for
three (0.80 coke + 265.90 water + 65.6 acetylene) and **+0.17 MW electric + 1.09 MW acetylene**,
nearly all of it the boiler — see below. It also closes a construction loop: the `smelter-mk01`
needs 50 ceramic to build, which is 12.5 minutes of the block's own output.

## The clay steam — `oil-boiler-mk01`

`clay` is **100 steam → 3**, so 4.00 ceramic/min pulls 7.98 clay/min and **265.90 steam/min
(4.43/s)**. That single number is the whole cost of inlining ceramic — the `hpf` and the clay pit
together are 0.17 MW.

```
4.43 steam@250/s  x  0.4935 MJ  =  2.19 MJ/s of steam energy
  oil-boiler-mk01, effectivity 2  ->  1.09 MW acetylene  =  65.6/min   <- chosen
  py-electric-boiler, 25 MW @7.5% ->  1.87 MW electric
```

Acetylene and electricity come out of the same fuel pool, and every plain-steam generator in Py is
effectivity 0.5 — so 1.87 MW electric costs roughly 3.7 MW of fuel upstream, against 1.09 MW burned
directly. That is ~3.4× in the boiler's favour, it adds no new import type (the block already moves
600 acetylene/min for the smelter, so this is +11 % on an existing lane), and it takes a 25 MW-rated
machine off the electrical peak of an otherwise 6 MW block. It costs 16 tiles — 5×5 against 3×3.

The one condition that flips this is molten-salt power at 7.39 MJe/MJ, which makes electricity the
cheap input. That is parked until rail reaches a salt mine; revisit the row then, it is a one-machine
swap either way.

**The heat exchanger is not worth it here.** `clay-pit-mk01`'s steam fluidbox has no filter and no
`minimum_temperature`, so clay counts steam **by volume** and is indifferent to temperature.
`cool-steam-250-to-150` (`py-heat-exchanger`, 0.5 MW, speed 2) is 200 steam@250 + 150 water →
340 steam@150, which is a real 1.70× on volume:

```
per clay craft (100 steam, temperature-blind)
  direct :  100 steam@250                 =  49.35 MJ of boiler energy
  via HX :  58.8 steam@250 + 44.1 water   =  29.03 MJ          -41.2 %
block     :  2.19 MW of steam  ->  1.29 MW
```

Energy is conserved across the exchanger (98.7 → 96.4 MJ); the gain is purely that cooling spreads it
over 1.7× the volume, and volume is what clay is billed in — the cooling-tower mechanic from
CLAUDE.md running in your favour instead of against you. But it saves 0.45 MW of acetylene against a
7×7 machine whose own build cost includes a `mechanical-parts-01`, i.e. the block would spend most of
a day's output buying it. Excluded. Revisit only if clay demand scales by an order of magnitude.

Note the recipe must also stay out of `--recipes`: the solver does not model fluid temperature, so
`200 steam → 340 steam` reads as an unbounded free multiplier and collapses the solve to 0 buildings.
The 41.2 % above is hand arithmetic.

## Imports — 20 + acetylene

| | /min | note |
|---|--:|---|
| **acetylene** | **665.60** | 11.09/s — 600.0 smelter + 65.6 boiler; *not in solver output* |
| **water** | **265.90** | → clay, via the boiler |
| iron-plate | 61.98 | |
| copper-plate | 48.98 | |
| tin-plate | 32.00 | → solder |
| lead-plate | 24.00 | → solder |
| steel-plate | 9.99 | |
| duralumin | 9.58 | brake 20/craft is most of it |
| fish-oil | 8.00 | design 29 |
| clean-nexelit | 6.00 | → nexelit-plate → fenxsb |
| glass | 5.59 | |
| sb-oxide | 3.00 | |
| electronic-circuit | 2.80 | |
| **ore-quartz** | **2.00** | **no producer in any current design — see risk 1** |
| plastic-bar | 2.00 | |
| titanium-plate | 1.60 | |
| battery-mk01 | 1.20 | |
| rubber | 1.20 | design 40 makes 15/min |
| coke | 0.80 | → ceramic |
| vitreloy | 0.80 | |
| acetylene-canister | 0.07 | `assembling-machine-2` fuel |

**Exports** (/min): **mechanical-parts-01 1.20** · empty-fuel-canister 0.07 *(return to the filler)*

Twenty import lanes on an 18-building block is the headline cost of a MAM-shaped design — the station
count exceeds the machine count outright, and every row below `steel-plate` is under 10/min. The
four plate lanes (iron, copper, tin, lead = 167/min combined) are 80 % of the solid mass.

## What 1.20 mechanical-parts/min actually buys

Shaft is the common currency, so price the consumers in shaft-equivalents
(`gearbox-mk01` = 2 shaft). The block runs **3.60 shaft-eq/min**:

| build | shaft-eq each | per min at this size |
|---|--:|--:|
| `mechanical-parts-01` | 3 | **1.20** ← as configured |
| `automated-factory-mk01` (2 gearbox + 2 shaft) | 6 | 0.60 |
| `locomotive` (1 gearbox + 4 shaft + 4 brake) | 6 | 0.60 |
| `cargo-wagon` / `fluid-wagon` (2 shaft + 2 brake) | 2 | 1.80 |
| `py-construction-robot-mk01` (1 gearbox) | 2 | 1.80 |
| `tidal-mk01` (10 mech-parts + 3 gearbox + 3 shaft) | 39 | 0.09 |

All 3.60 currently goes to `mechanical-parts-01`. Any export of raw shaft, gearbox or brake comes
out of that budget or off the marginal table above — `brake-mk01` is the cheap one, 2 buildings and
no smelter per 3/min.

For the molten-salt plan: `py-coal-powerplant-mk01` is 3 `mechanical-parts-01` and
`py-heat-exchanger` is 1, so 1.20/min is 0.40 powerplants/min — a full 6.4-powerplant turbine set
every 16 minutes.

## Solver command

**The `--factory` overrides are the load-bearing flags.** Drop them and the LP answers with
`assembling-machine-3`, `smelter-mk04` and `electric-furnace` — a block that cannot be built, since
`--unlocked` filters recipes but not the machines `--factory` would have pinned.

The boundary is set by **membership in `--recipes`**, not by the caps: `duralumin-1` is deliberately
absent, which is what makes `duralumin` an import. Removing *all* `--max-import` flags leaves every
rate and the MW unchanged and only moves a ceiling by one machine. The caps are kept to pin that
rounding, not to force anything internal.

`--fuel ...:acetylene-canister` on the two `assembling-machine-2` rows avoids the coal default and
its phantom ash. **`cool-steam-250-to-150` must stay out of `--recipes`** — it degenerates the solve
to 0 buildings (see the steam section). `--max-import "water:100000"` is a plain allowance, but note
it does not scale: a ×1000 frac probe overflows it and returns all zeros.

**The command models the steam with `py-electric-boiler`; the build uses `oil-boiler-mk01`.** The
latter is a boiler entity rather than a crafting machine, so there is no recipe for the LP to place
— keeping the electric route in the command is what makes the other seventeen rows reproducible.
The substitution is one row and is computed in § The clay steam: −1.87 MW electric, +65.6
acetylene/min, 3×3 → 5×5, every other rate unchanged.

```bash
npx tsx src/cli.ts solve \
  --recipes "mechanical-parts-01,controler-mk01,utility-box-mk01,gearbox-mk01,shaft-mk01,brake-mk01,tinned-cable,small-parts-01,iron-gear-wheel,copper-cable,bolts,iron-stick,solder-0,fenxsb-alloy-2,nexelit-plate-2,ceramic,clay,electric-boiler-water-to-steam" \
  --target "mechanical-parts-01:1.2" --time 60 \
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

Change `--target` to `mechanical-parts-01:2.4` for the double stamp — 21 buildings, 35.97 MW, adding
only a second `shaft-mk01`, a second `smelter-mk01` and a second `solder-0`.

## Intermediates

```
┌──────────────────┬────────────┬────────────────────────────────┬───────────────────────────────────────────────────┐
│ Item             │ Rate       │ Producer                       │ Consumer                                          │
├──────────────────┼────────────┼────────────────────────────────┼───────────────────────────────────────────────────┤
│ steam            │ 265.90/min │ oil-boiler-mk01 (4.43/s @250C) │ clay 265.90                                       │
│ copper-cable     │  69.98/min │ copper-cable                   │ tinned-cable 40.00, small-parts-01 29.99          │
│ bolts            │  29.99/min │ bolts                          │ small-parts-01 29.99                              │
│ iron-stick       │  29.99/min │ iron-stick                     │ bolts 29.99                                       │
│ tinned-cable     │  20.00/min │ tinned-cable                   │ utility-box-mk01 20.00                            │
│ small-parts-01   │  19.99/min │ small-parts-01                 │ mech-parts 10.00, shaft 6.00, brake 3.99          │
│ iron-gear-wheel  │  10.00/min │ iron-gear-wheel                │ small-parts-01 10.00                              │
│ clay             │   7.98/min │ clay                           │ ceramic 7.98                                      │
│ fenxsb-alloy     │   6.00/min │ fenxsb-alloy-2                 │ shaft-mk01 6.00                                   │
│ solder           │   6.00/min │ solder-0                       │ shaft-mk01 6.00                                   │
│ nexelit-plate    │   6.00/min │ nexelit-plate-2                │ fenxsb-alloy-2 6.00                               │
│ ceramic          │   3.99/min │ ceramic                        │ brake-mk01 3.99                                   │
│ shaft-mk01       │   1.20/min │ shaft-mk01                     │ mech-parts 0.40, gearbox-mk01 0.80                │
│ brake-mk01       │   0.40/min │ brake-mk01                     │ mechanical-parts-01 0.40                          │
│ controler-mk01   │   0.40/min │ controler-mk01                 │ mechanical-parts-01 0.40                          │
│ gearbox-mk01     │   0.40/min │ gearbox-mk01                   │ mechanical-parts-01 0.40                          │
│ utility-box-mk01 │   0.40/min │ utility-box-mk01               │ mechanical-parts-01 0.40                          │
└──────────────────┴────────────┴────────────────────────────────┴───────────────────────────────────────────────────┘
```

## Risks

1. **`ore-quartz` has no producer in any current design.** `controler-mk01` needs 5 per craft =
   2.00/min here, and design 39 hit the same wall. It is mined, not crafted: the `ore-quartz`
   resource takes no fluid, `quartz-rock` requires acetylene. A quartz outpost is a prerequisite for
   `mechanical-parts-01` at any rate — `gearbox-mk01`, `shaft-mk01` and `brake-mk01` are unaffected.
2. **`sb-oxide` and `clean-nexelit` (3.00 and 6.00/min) feed the only fenxsb route.** Both are
   single-route imports with no alternative, so a gap on either stops all shaft production and
   therefore the whole block.
3. **Acetylene supply is the scaling limit, not buildings.** One smelter is 10.00/s; the 2.40/min
   stamp wants 20/s before any shaft is exported.
4. **Water is a block input at 265.90/min**, and the whole ceramic branch stalls without it —
   `brake-mk01` is the only ceramic consumer, and `mechanical-parts-01` needs a brake per craft, so
   a dry boiler stops the product. `shaft-mk01` and `gearbox-mk01` keep running.
5. **Everything except shaft and fenxsb is idle capacity.** Sixteen of eighteen rows are below 60 %,
   nine below 15 %. That is the floor for a block with this many distinct recipes, not slack to
   reclaim — but it does mean the 2.40/min stamp is only +3 buildings, which is the better buy if
   demand supports it.

## Lever: efficiency modules

`smelter-mk01` allows `consumption` and has 1 module slot, as do `automated-factory-mk01`, `hpf` and
`clay-pit-mk01`. `oil-boiler-mk01` has **0 slots**, so the 1.09 MW boiler row is not reachable this
way. One `efficiency-module` (−30 % consumption, no speed penalty) in every slot that has one takes
the equivalent pre-ceramic block from **31.93 → 22.35 MW** at double this rate (solver-verified);
applied here it drops the smelter to 7.00 acetylene/s and the electric side to ~4.3 MW, for zero
extra buildings. `efficiency-module` is **not researched**; this is priced as an upgrade, not the
baseline. `productivity-module` is the wrong pick
here: ×1.2 consumption against ×0.825 throughput is 1.45× the fuel per fenxsb.

## Construction materials

Distinct items needed to build the 18 machines (none appear in the flow imports except
`electronic-circuit`, `steel-plate`, `iron-plate`, `copper-plate`, `titanium-plate` and `duralumin`):

| item | qty | for |
|---|--:|---|
| small-parts-01 | 315 | every machine type |
| steel-plate | 264 | |
| iron-plate | 220 | smelter, foundry, clay pit, boiler |
| stone-brick | 80 | smelter, foundry, hpf, clay pit |
| electronic-circuit | 66 | |
| ceramic | 50 | smelter-mk01 — *now made on site* |
| inserter | 33 | automated-factory ×11 |
| copper-cable | 30 | advanced-foundry |
| intermetallics | 32 | automated-factory ×11, oil-boiler-mk01 |
| **gearbox-mk01** | **22** | automated-factory ×11 |
| **shaft-mk01** | **22** | automated-factory ×11 |
| copper-plate | 20 | hpf |
| titanium-plate | 15 | smelter-mk01 |
| steam-engine | 13 | smelter, hpf, clay pit |
| stone-furnace | 10 | advanced-foundry |
| pipe | 10 | clay-pit-mk01 |
| duralumin | 10 | assembling-machine-2 ×2 |
| electric-mining-drill | 3 | oil-boiler-mk01 |
| inductor1 | 3 | hpf |
| burner-mining-drill | 2 | clay-pit-mk01 |
| assembling-machine-1 | 2 | |
| lab | 1 | oil-boiler-mk01 |
| gasifier | 1 | oil-boiler-mk01 |

**The block builds itself.** Its 11 `automated-factory-mk01` need 22 gearbox + 22 shaft = 66
shaft-equivalents, which is **18.3 minutes of its own 3.60 shaft-eq/min output**; the 50 ceramic for
the smelter is **12.5 minutes** of its own 4.00 ceramic/min. So the second stamp is nearly free and
the first is the one that has to come from somewhere else.
Construction-feasibility note, inferred: `intermetallics` (32), `inductor1` (3) and `vitreloy` (flow
import, 0.80/min) are the items here with no recorded producing design; design 41 runs
`intermetallics` internally via `advanced-foundry-mk01`, so that recipe is reachable, but none has a
standing supply. Build or confirm those three plus the `ore-quartz` outpost before committing the
stamp.
