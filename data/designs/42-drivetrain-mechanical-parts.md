# 42 — Drivetrain (mechanical-parts / gearbox / shaft) — 0.75 mechanical-parts-01/min, 16 buildings

**The block is `shaft-mk01`.** Everything else is a thin assembler bolted on top of a shaft supply —
`gearbox-mk01` solved standalone at 3/min is 24 buildings, and *six of them are shaft factories*; the
gearbox assembler itself is one 3×3. `brake-mk01` at 3/min is 6 buildings. So the sizing question is
not "how many mechanical parts" but "how many shafts per minute", and the answer is priced in
acetylene, not buildings.

**0.75/min is where both collapse thresholds clear at once** — the thirteen assembler rows sum to
**0.924** (under one machine) and the two smelters to **0.667** (also under one). Above ~0.82 the
assemblers need a second machine; above ~0.90 the smelters do.

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
vitreloy            [U] [rawores-smelt, 10 s] sb-oxide 3 + duralumin 3 + nickel-plate 3
                                              + titanium-plate 3 + copper-plate 3           →  2
```

## Recipe table

```
┌─────────────────────┬───────────────────────┬────────┬───────┬────────┬───────┐
│ Recipe              │ Factory               │  frac  │ Count │  Util  │ Size  │
├─────────────────────┼───────────────────────┼────────┼───────┼────────┼───────┤
│ fenxsb-alloy-2      │ smelter-mk01          │  0.625 │   1   │  62.5% │ 13x13 │
│ shaft-mk01          │ assembling-machine-2  │  0.313 │   1   │  31.3% │ 3x3   │
│ nexelit-plate-2     │ advanced-foundry-mk01 │  0.209 │   1   │  20.9% │ 6x6   │
│ solder-0            │ assembling-machine-2  │  0.188 │   1   │  18.8% │ 3x3   │
│ copper-cable        │ assembling-machine-2  │  0.092 │   1   │   9.2% │ 3x3   │
│ utility-box-mk01    │ assembling-machine-2  │  0.063 │   1   │   6.3% │ 3x3   │
│ tinned-cable        │ assembling-machine-2  │  0.053 │   1   │   5.3% │ 3x3   │
│ brake-mk01          │ assembling-machine-2  │  0.042 │   1   │   4.2% │ 3x3   │
│ vitreloy            │ smelter-mk01          │  0.042 │   1   │   4.2% │ 13x13 │
│ iron-stick          │ assembling-machine-2  │  0.040 │   1   │   4.0% │ 3x3   │
│ controler-mk01      │ assembling-machine-2  │  0.032 │   1   │   3.2% │ 3x3   │
│ iron-gear-wheel     │ assembling-machine-2  │  0.027 │   1   │   2.7% │ 3x3   │
│ mechanical-parts-01 │ assembling-machine-2  │  0.026 │   1   │   2.6% │ 3x3   │
│ gearbox-mk01        │ assembling-machine-2  │  0.021 │   1   │   2.1% │ 3x3   │
│ bolts               │ assembling-machine-2  │  0.016 │   1   │   1.6% │ 3x3   │
│ small-parts-01      │ assembling-machine-2  │  0.011 │   1   │   1.1% │ 3x3   │
└─────────────────────┴───────────────────────┴────────┴───────┴────────┴───────┘
```

**16 buildings · 491 tiles · 0.25 MW electric · 400 acetylene/min · 138 kW jerry**

The 0.25 MW electric is *only* the `advanced-foundry-mk01`. Every assembler runs on canisters and
both smelters on acetylene, so the block barely touches the grid.

## This block is a MAM — everything fits in three machines

| | Σ frac | as tabled | if circuit-switched |
|---|--:|--:|--:|
| `assembling-machine-2` (13 rows) | **0.924** | 13 | **1** |
| `smelter-mk01` (fenxsb + vitreloy) | 0.667 | 2 | **1** |
| `advanced-foundry-mk01` | 0.209 | 1 | 1 |
| | | **16** | **3** |

`shaft-mk01` alone is a third of the assembler sum (0.313) and `solder-0` another fifth (0.188) —
those two are 54 % of all the crafting in the block.

What stops a literal 3-building collapse is delivery, not rates: the one assembler would need
**26 distinct ingredients**, twelve of which it makes itself, so every intermediate round-trips
through its own buffer. At 1.2 items/s per inserter the input side is the wall. That is an inserter
and buffer-layout decision, unpriced here.

## The real price of a shaft is 8.33 acetylene/s

`fenxsb-alloy-2` is the **only** unlocked route to `fenxsb-alloy`, its category is
`py-rawores-smelter`, and the only machines in that category are `smelter-mk01`…`mk04`. A
`smelter-mk01` is a 13×13 fluid burner at a flat **10 MW = 10.00 acetylene/s** (acetylene is
1 MJ/unit), and it turns out 2 fenxsb per 20 s = 6/min. A shaft eats 5 fenxsb.

```
1 shaft/min  =  5 fenxsb/min  =  0.833 smelter  =  8.33 acetylene/s  =  500 acetylene/min
```

Scaling is linear. The marginal cost of **exported** shaft, on top of this block:

| per +1 shaft-mk01/min | |
|---|--:|
| buildings | +2.5 |
| acetylene | +8.33/s |
| electric | +3.21 MW |

Design 41 makes `shaft-mk01` internally too and pays for its own fenxsb smelter. `shaft-mk01` has
18 consumers base-wide against `fenxsb-alloy`'s 9 — if both blocks get built, hoisting shaft into
one shared supply is the structural move. The acetylene does not go away, but it stops being bought
twice at partial utilisation. Same argument for `vitreloy`: **one smelter at 0.173 could serve 41
and 42 together** rather than one each at 0.131 and 0.042.

## Boundary

Consumer counts over **all** recipes (the lens rule 16 asks for, since boundaries must survive
unlocks):

| item | all | unlocked | call |
|---|--:|--:|---|
| `small-parts-01` | 250 | 6 | **inline** — 1.1 % of one machine; a station costs more |
| `nexelit-plate` | 195 | 2 | inline — sole use here is fenxsb |
| `mechanical-parts-01` | 182 | 2 | **the product** |
| `duralumin` | 175 | 2 | **import** — Tier A bus item |
| `titanium-plate` | 190 | 2 | import |
| `solder` | 29 | 2 | inline |
| `tinned-cable` | 40 | 2 | inline |
| `shaft-mk01` | 18 | 2 | inline *(export candidate — see above)* |
| `ceramic` | 18 | 2 | **import** — see below |
| `gearbox-mk01` | 15 | 2 | inline |
| `brake-mk01` | 11 | 2 | inline |
| `fenxsb-alloy` | **9** | 2 | **inline** — Tier D, only unlocked consumer is `shaft-mk01` |
| `vitreloy` | 7 | 2 | **inline** — 1 smelter at 4.2 % |

Importing fenxsb would take the smelter and foundry with it, but a dedicated fenxsb block would have
`shaft-mk01` as its only unlocked customer — it would be this smelter with a station bolted on.
`duralumin` is the opposite case: 175 consumers, genuinely a bus item, smelters amortised elsewhere.

**Ceramic is imported, and that is a reversal.** Inlining it costs 3 buildings — `ceramic` (hpf),
`clay` (clay-pit) and a boiler — because `clay` is **100 steam → 3**, so 2.50 ceramic/min pulls
~166 steam/min. Three machines and a water lane for 2.50/min of something with 18 consumers is the
wrong trade in a block this small; it was inlined in an earlier revision and taken back out.

> **Kept from that revision, because it is not recorded anywhere else:** `clay-pit-mk01`'s steam
> fluidbox has no filter and no `minimum_temperature`, so **clay counts steam by volume and is
> indifferent to temperature**. `cool-steam-250-to-150` (200 steam@250 + 150 water → 340 steam@150)
> is therefore a real **1.70× on steam volume** into clay — 49.35 MJ of boiler energy per clay craft
> direct against 29.03 MJ via the exchanger, −41.2 %. Energy is conserved (98.7 → 96.4 MJ); the gain
> is that cooling spreads it over 1.7× the volume. **The solver cannot see this** — it does not model
> fluid temperature, so `200 steam → 340 steam` reads as an unbounded free multiplier and collapses
> the solve to 0 buildings. Hand arithmetic. Matters to whichever block ends up making clay at scale.
>
> The same revision also settled the boiler choice, if clay ever comes back: **`oil-boiler-mk01` at
> effectivity 2 beats `py-electric-boiler`** — 1.09 MW of acetylene against 1.87 MW electric for the
> same steam, because every plain-steam generator in Py is effectivity 0.5, so electric costs ~3.7 MW
> of fuel upstream. Flips only once molten-salt power is online.

## Imports — 20

| | /min | note |
|---|--:|---|
| **acetylene** | **400** | 6.67/s, the two smelters. *Not in solver output* |
| iron-plate | 38.75 | |
| copper-plate | 31.38 | |
| tin-plate | 20.00 | → solder |
| lead-plate | 15.00 | → solder |
| duralumin | 6.75 | brake 20/craft + vitreloy |
| steel-plate | 6.25 | |
| fish-oil | 5.00 | → gearbox. Design 29 makes 78/min |
| clean-nexelit | 3.75 | → nexelit-plate → fenxsb |
| glass | 3.50 | |
| sb-oxide | 2.63 | fenxsb + vitreloy |
| ceramic | 2.50 | → brake |
| electronic-circuit | 1.75 | |
| titanium-plate | 1.75 | gearbox + vitreloy |
| **ore-quartz** | **1.25** | **no producer in any current design — see risks** |
| plastic-bar | 1.25 | |
| acetylene-canister | 0.82 | **net zero** — the empties come back |
| battery-mk01 | 0.75 | |
| rubber | 0.75 | design 40 makes 15/min |
| nickel-plate | 0.75 | vitreloy only |

**Exports** (/min): **mechanical-parts-01 0.75** · empty-fuel-canister 0.82 *(return to the filler)*

`fill-acetylene-canister` is `1 empty-fuel-canister + 10 acetylene → 1`, unlocked under `plastics`,
so canisters cycle and the only real consumption is 8.2 acetylene/min folded into the top row — 2 %
of what the smelters burn.

## What 0.75 mechanical-parts/min buys

Shaft is the common currency, so price consumers in shaft-equivalents (`gearbox-mk01` = 2 shaft).
The block runs **2.25 shaft-eq/min**:

| build | shaft-eq each | per min at this size |
|---|--:|--:|
| `mechanical-parts-01` | 3 | **0.75** ← as configured |
| `automated-factory-mk01` (2 gearbox + 2 shaft) | 6 | 0.375 |
| `locomotive` (1 gearbox + 4 shaft + 4 brake) | 6 | 0.375 |
| `cargo-wagon` / `fluid-wagon` (2 shaft + 2 brake) | 2 | 1.125 |
| `steam-turbine-mk01` (3 gearbox + 1 shaft) | 7 | 0.321 |
| `tidal-mk01` (10 mech-parts + 3 gearbox + 3 shaft) | 39 | 0.058 |

For the molten-salt plan: a 472.8 MW set is 6.4 `py-coal-powerplant-mk01` (3 mech-parts each) +
1 `py-heat-exchanger` (1) + 1 `steam-turbine-mk01` = **20.2 mechanical-parts + 7 shaft-eq**, so
**one turbine set every 27 minutes**. Note the turbine is a drivetrain consumer *directly*, not only
through mechanical-parts.

## Solver command

**The `--factory` overrides are load-bearing.** Drop them and the LP answers with
`assembling-machine-3`, `smelter-mk04` and `electric-furnace` — a block that cannot be built, since
`--unlocked` filters recipes but not the machines `--factory` would have pinned.

The boundary is set by **membership in `--recipes`**: `duralumin-1` and the `ceramic`/`clay`/boiler
chain are deliberately absent, which is what makes those imports.

```bash
npx tsx src/cli.ts solve \
  --recipes "mechanical-parts-01,controler-mk01,utility-box-mk01,gearbox-mk01,shaft-mk01,brake-mk01,tinned-cable,small-parts-01,iron-gear-wheel,copper-cable,bolts,iron-stick,solder-0,fenxsb-alloy-2,nexelit-plate-2,vitreloy" \
  --target "mechanical-parts-01:0.75" --time 60 \
  --max-import "controler-mk01:0.001" --max-import "utility-box-mk01:0.001" \
  --max-import "gearbox-mk01:0.001" --max-import "shaft-mk01:0.001" --max-import "brake-mk01:0.001" \
  --max-import "tinned-cable:0.001" --max-import "small-parts-01:0.001" \
  --max-import "iron-gear-wheel:0.001" --max-import "copper-cable:0.001" --max-import "bolts:0.001" \
  --max-import "iron-stick:0.001" --max-import "solder:0.001" \
  --max-import "fenxsb-alloy:0.001" --max-import "nexelit-plate:0.001" \
  --max-import "vitreloy:0.001" \
  --factory "mechanical-parts-01:assembling-machine-2" \
  --factory "gearbox-mk01:assembling-machine-2" \
  --factory "controler-mk01:assembling-machine-2" \
  --factory "utility-box-mk01:assembling-machine-2" \
  --factory "shaft-mk01:assembling-machine-2" \
  --factory "brake-mk01:assembling-machine-2" \
  --factory "tinned-cable:assembling-machine-2" \
  --factory "small-parts-01:assembling-machine-2" \
  --factory "iron-gear-wheel:assembling-machine-2" \
  --factory "copper-cable:assembling-machine-2" \
  --factory "bolts:assembling-machine-2" \
  --factory "iron-stick:assembling-machine-2" \
  --factory "solder-0:assembling-machine-2" \
  --factory "fenxsb-alloy-2:smelter-mk01" \
  --factory "vitreloy:smelter-mk01" \
  --factory "nexelit-plate-2:advanced-foundry-mk01" \
  --fuel "mechanical-parts-01:acetylene-canister" \
  --fuel "gearbox-mk01:acetylene-canister" \
  --fuel "controler-mk01:acetylene-canister" \
  --fuel "utility-box-mk01:acetylene-canister" \
  --fuel "shaft-mk01:acetylene-canister" \
  --fuel "brake-mk01:acetylene-canister" \
  --fuel "tinned-cable:acetylene-canister" \
  --fuel "small-parts-01:acetylene-canister" \
  --fuel "iron-gear-wheel:acetylene-canister" \
  --fuel "copper-cable:acetylene-canister" \
  --fuel "bolts:acetylene-canister" \
  --fuel "iron-stick:acetylene-canister" \
  --fuel "solder-0:acetylene-canister" \
  --solver simplex --unlocked
```

Run at `--target mechanical-parts-01:750` and divide counts by 1000 for the fractional values.

### Invocation notes

- **Thirteen `--fuel` flags, not one.** Every row is on `assembling-machine-2`, which burns
  chemical/biomass/jerry and **defaults to coal**. Miss any flag and the solve returns `coal` in and
  `ash` out from nowhere. The tell is a coal line in a block with no coal input.
- **`--fuel "...:acetylene"` throws** — `"acetylene" is not a valid fuel item`. It is a fluid; only
  `acetylene-canister` works as a solid fuel, and only on jerry-capable machines.
- **`smelter-mk01` is a fluid burner and the solve does not say so.** Its fuel lands in
  `totalPowerMW` under an electric heading — of the reported 6.92 MW, 6.67 is acetylene.
- **`automated-factory-mk01` also handles `advanced-crafting`** and is electric, so `gearbox-mk01`
  and `mechanical-parts-01` never *needed* a burner. The swap to `assembling-machine-2` is worth it
  anyway — see below.

## Why `assembling-machine-2` over `automated-factory-mk01`

Speed 2 halves every assembler frac and 3×3 against 7×7 saves most of the footprint:

| | automated-factory-mk01 @1.2 | assembling-machine-2 @0.75 |
|---|--:|--:|
| buildings | 18 | **16** |
| tiles | 1,136 | **491** |
| electric | 16.01 MW | **0.25 MW** |
| acetylene | 665/min | **400/min** |
| switched floor | 7 | **3** |

It also **removes the self-building loop**: `automated-factory-mk01` costs 2 gearbox + 2 shaft each,
so the old 13-machine version needed 26 gearbox + 26 shaft + 26 intermetallics to construct itself.
`assembling-machine-2` costs an `assembling-machine-1` instead.

## Risks

1. **`ore-quartz` has no producer in any current design.** `controler-mk01` needs 5 per craft =
   1.25/min here, and design 39 hit the same wall at 19.50/min. It is mined, not crafted: the
   `ore-quartz` resource takes no fluid, `quartz-rock` requires acetylene. A quartz outpost is a
   prerequisite for `mechanical-parts-01` at any rate — `gearbox-mk01`, `shaft-mk01` and
   `brake-mk01` are unaffected, so a quartz-free variant still delivers the drivetrain parts. One
   outpost covers this 1.25 plus design 39's 19.50.
2. **`sb-oxide`, `clean-nexelit` and `nickel-plate` are single-route imports** with no alternative.
   A gap on sb-oxide or clean-nexelit stops all shaft production and therefore the block; a gap on
   nickel-plate stops only `vitreloy` → `brake`.
3. **Acetylene is the scaling limit, not buildings.** Two smelters at 6.67/s here; the assembler
   side has headroom to ~0.82/min and the smelters to ~0.90 before anything doubles.

## Lever: efficiency modules

`smelter-mk01` allows `consumption` with 1 slot. `assembling-machine-2` has **0 module slots**, so
the thirteen assembler rows are not reachable this way — but they are only 138 kW between them.
One `efficiency-module` (−30 % consumption, no speed penalty) in each smelter takes acetylene from
**400 → 280/min** for zero extra buildings. `efficiency-module` is **not researched**; priced as an
upgrade, not the baseline. `productivity-module` is the wrong pick: ×1.2 consumption against ×0.825
throughput is 1.45× the fuel per fenxsb.

## Construction materials

Distinct items needed to build the 16 machines:

| item | qty | for |
|---|--:|---|
| small-parts-01 | 175 | all three machine types |
| iron-plate | 110 | smelters + foundry |
| steel-plate | 106 | |
| ceramic | 100 | smelter-mk01 ×2 |
| duralumin | 65 | assembling-machine-2 ×13 |
| stone-brick | 60 | smelters + foundry |
| electronic-circuit | 49 | |
| titanium-plate | 30 | smelter-mk01 ×2 |
| copper-cable | 30 | advanced-foundry |
| steam-engine | 20 | smelter-mk01 ×2 |
| assembling-machine-1 | 13 | |
| stone-furnace | 10 | advanced-foundry |

**No `gearbox-mk01`, `shaft-mk01` or `intermetallics` in the build cost** — that is the
`assembling-machine-2` swap paying off twice, since the previous `automated-factory-mk01` version
needed 26 of each of the first two to construct itself.
Construction-feasibility note, inferred: `ceramic` (100, also a flow import) and
`assembling-machine-1` (13) are the two items with no recorded producing design, though both are
early recipes. Confirm those plus the `ore-quartz` outpost before committing the stamp.
