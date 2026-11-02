# 41 — Rail rolling stock — 3 trains/hour, 18 buildings

**Rolling stock only.** Locomotives and wagons; no rail, signals, train-stops, inserters,
`rail-support` or `rail-ramp`. Those were the previous version of this file and are gone — see
§ What the cut removed.

Two train types, built 50/50:

```
cargo train  =  1 locomotive + 2 cargo-wagon
fluid train  =  1 locomotive + 2 fluid-wagon
```

which makes the product ratio **locomotive : cargo-wagon : fluid-wagon = 1 : 1 : 1**, at
**0.05/min each**.

**"3 trains/hour" means 1.5 of each type, not 3 of each** — 3 locomotives, 3 cargo-wagons and
3 fluid-wagons per hour assemble into 1.5 cargo trains + 1.5 fluid trains, i.e. one complete train
every 20 minutes, or 3 of each type every two hours. The locomotive rate equals the train rate
because every train takes exactly one.

Note this is *not* a 5-car train — two locos per pair of trains is what sets the sizing, and the
locomotive is the heaviest single item on the binding row.

```
locomotive    [U] [crafting,   4s]  pipe 20 + steam-engine 2 + intermetallics 5
                                    + brake-mk01 4 + gearbox-mk01 1 + shaft-mk01 4
                                    + electronic-circuit 10 + small-parts-01 20
                                    + steel-plate 30 + duralumin 25              →  1
cargo-wagon   [U] [crafting,   1s]  intermetallics 5 + brake-mk01 2 + shaft-mk01 2
                                    + small-parts-01 10 + steel-plate 20
                                    + duralumin 10 + titanium-plate 50
                                    + iron-plate 20                              →  1
fluid-wagon   [U] [crafting, 1.5s]  storage-tank 1 + pipe 8 + intermetallics 5
                                    + brake-mk01 2 + shaft-mk01 2 + small-parts-01 10
                                    + steel-plate 16 + duralumin 10
                                    + titanium-plate 50                          →  1
brake-mk01    [U] [crafting,  20s]  vitreloy 2 + ceramic 10 + small-parts-01 10
                                    + steel-plate 5 + duralumin 20 + glass 10
                                    + copper-plate 10                            →  1
duralumin-1   [U] [rawores-smelt, 4s]  aluminium-plate 4 + copper-plate 2         →  1
vitreloy      [U] [rawores-smelt, 10s] sb-oxide 3 + duralumin 3 + nickel-plate 3
                                       + titanium-plate 3 + copper-plate 3       →  2
intermetallics[U] [foundry]            fenxsb-alloy 1 + vitreloy 1               →  1
storage-tank  [U] [crafting,   3s]  steel-plate 5 + duralumin 20 + lead-plate 10 →  1
```

## Recipe table

```
┌───────────────────────┬───────────────────────┬────────┬───────┬────────┬───────┐
│ Recipe                │ Factory               │  frac  │ Count │  Util  │ Size  │
├───────────────────────┼───────────────────────┼────────┼───────┼────────┼───────┤
│ duralumin-1           │ smelter-mk01          │  0.920 │   1   │  92.0% │ 13x13 │
│ fenxsb-alloy-2        │ smelter-mk01          │  0.542 │   1   │  54.2% │ 13x13 │
│ shaft-mk01            │ assembling-machine-2  │  0.209 │   1   │  20.9% │ 3x3   │
│ intermetallics        │ advanced-foundry-mk01 │  0.189 │   1   │  18.9% │ 6x6   │
│ nexelit-plate-2       │ advanced-foundry-mk01 │  0.182 │   1   │  18.2% │ 6x6   │
│ vitreloy              │ smelter-mk01          │  0.131 │   1   │  13.1% │ 13x13 │
│ solder-0              │ assembling-machine-2  │  0.125 │   1   │  12.5% │ 3x3   │
│ brake-mk01            │ assembling-machine-2  │  0.068 │   1   │   6.8% │ 3x3   │
│ iron-stick            │ assembling-machine-2  │  0.031 │   1   │   3.1% │ 3x3   │
│ copper-cable          │ assembling-machine-2  │  0.031 │   1   │   3.1% │ 3x3   │
│ iron-gear-wheel       │ assembling-machine-2  │  0.022 │   1   │   2.2% │ 3x3   │
│ bolts                 │ assembling-machine-2  │  0.013 │   1   │   1.3% │ 3x3   │
│ small-parts-01        │ assembling-machine-2  │  0.009 │   1   │   0.9% │ 3x3   │
│ pipe                  │ assembling-machine-2  │  0.009 │   1   │   0.9% │ 3x3   │
│ gearbox-mk01          │ assembling-machine-2  │  0.005 │   1   │   0.5% │ 3x3   │
│ 3 products (switched) │ assembling-machine-2  │  0.004 │   1   │   0.4% │ 3x3   │
│ storage-tank          │ assembling-machine-2  │  0.002 │   1   │   0.2% │ 3x3   │
│ steam-engine          │ assembling-machine-2  │  0.001 │   1   │   0.1% │ 3x3   │
└───────────────────────┴───────────────────────┴────────┴───────┴────────┴───────┘
```

**18 buildings · 696 tiles · 0.45 MW electric · 960.4 acetylene/min · 79 kW jerry**

The 0.45 MW electric is *only* the two `advanced-foundry-mk01`. Every assembler runs on canisters and
every smelter on acetylene, so the block draws almost nothing from the grid.

## This block is a MAM — the crafting is half a machine

Summed by machine type:

| | Σ frac | as tabled | if circuit-switched |
|---|--:|--:|--:|
| `assembling-machine-2` (13 rows) | **0.529** | 13 | **1** |
| `smelter-mk01` (3 rows) | 1.593 | 3 | 2 |
| `advanced-foundry-mk01` (2 rows) | 0.371 | 2 | 1 |
| | | **18** | **4** |

**All thirteen assembler rows together are 52.9 % of one machine.** Crafting speed is not what sizes
this block — three smelters are, and they are there for one reason (below).

What stops a literal 4-building collapse is not rates but delivery: that one assembler would need
**26 distinct ingredients**, twelve of which it makes itself, so every intermediate is a round trip
through its own buffer. `locomotive` alone wants 10 simultaneously. At 1.2 items/s per inserter the
input side is the wall. A sane middle is three switched groups — the deep chain
(shaft/solder/brake + feeders, Σ 0.517), the three products, and the smelters/foundry left alone —
which lands near 6–7 buildings without asking one machine to juggle 26 lanes. That is an inserter
and buffer-layout decision, not a rate one.

## Duralumin is the block

`duralumin-1` is **1 output per 4 s = 15/min** in a 13×13 smelter, and the block wants 13.8/min. It
is the only row that ever needs a second machine below ~8 trains/hour.

**`aluminium-plate` is a pure 4:1 proxy for it** — `duralumin-1` is the sole aluminium consumer in
the block, and 55.10 ÷ 4 = 13.775 against the row's 13.800. So every duralumin figure converts
straight across:

| consumer | duralumin/min | aluminium/min | share |
|---|--:|--:|--:|
| **brake-mk01** | **8.01** | **32.0** | **57 %** |
| vitreloy | 2.45 | 9.8 | 17 % *(≈half returns to brake)* |
| the three products directly | 2.17 | 8.7 | 15 % |
| storage-tank | 1.33 | 5.3 | 9 % |
| gearbox-mk01 | 0.13 | 0.5 | 1 % |

Attributing vitreloy to where it is consumed, **`brake-mk01` is ~66 % of all duralumin** — about 36
of the 55 aluminium-plate/min. A locomotive carries 4 brakes and each wagon 2, at 20 duralumin each;
that is fixed per vehicle and there is no cheaper brake (`brake-mk02`+ take a `brake-mk01` as an
ingredient, so they are upgrades, not alternatives).

### The two wagons are nearly the same part

Six of ten ingredients match exactly, including all three expensive ones (50 titanium-plate,
2 brake, 2 shaft). Reduced to raw inputs — `storage-tank` is 5 steel + 20 duralumin + 10 lead, and
`pipe` is 1 iron-plate:

```
fluid-wagon  =  cargo-wagon  − 12 iron-plate  + 1 steel-plate  + 20 duralumin  + 10 lead-plate
```

Those 20 duralumin are 80 aluminium-plate + 40 copper-plate, which is why the fluid wagon pulls 31 %
more of the binding row while looking almost identical on the recipe card. Even so the two train
types are within 16 % of each other (17.04 vs 19.71 duralumin-fractions per train/min), so **the
cargo/fluid split barely moves the block** — 80/20 either way shifts `duralumin-1` under 7 %. The
locomotive is what costs, at 8.57 per unit against 4.24 and 5.57.

## Imports — 16

| | /min | note |
|---|--:|---|
| **acetylene** | **960.4** | 955.8 smelters + 4.6 canister fill. *Not in solver output* |
| **aluminium-plate** | **55.10** | → `duralumin-1`, its only consumer |
| copper-plate | 40.84 | duralumin + copper-cable + vitreloy |
| iron-plate | 31.54 | |
| lead-plate | 10.50 | solder + storage-tank |
| titanium-plate | 7.51 | 50/wagon + gearbox + vitreloy |
| steel-plate | 5.80 | |
| tin-plate | 5.00 | → solder |
| ceramic | 4.00 | → brake |
| glass | 4.00 | → brake |
| sb-oxide | 3.95 | fenxsb + vitreloy |
| clean-nexelit | 3.25 | → nexelit-plate → fenxsb |
| nickel-plate | 2.31 | vitreloy only |
| fish-oil | 1.00 | → gearbox. Design 29 makes 78/min |
| electronic-circuit | 0.50 | locomotive only |
| acetylene-canister | 0.46 | **net zero** — the empties come back |

**Exports** (/min): locomotive 0.050 · cargo-wagon 0.050 · fluid-wagon 0.050 ·
empty-fuel-canister 0.460 *(return to the filler)*

`fill-acetylene-canister` is `1 empty-fuel-canister + 10 acetylene → 1`, unlocked under `plastics`.
So canisters cycle and the only real consumption is the 4.6 acetylene/min folded into the top row —
0.5 % of what the smelters already burn.

## Scaling

`duralumin-1` is the only row that binds. Everything else stays at one machine far past any rate
worth building.

| trains/h | each product /min | buildings | duralumin-1 |
|--:|--:|--:|--:|
| 2 | 0.0333 | 18 | 0.61 |
| **3** | **0.0500** | **18** | **0.92** ← chosen |
| 4 | 0.0667 | 19 | 1.23 |
| 6 | 0.1000 | 20 | 1.84 |
| 8 | 0.1333 | 21 | 2.45 |
| 12 | 0.2000 | 23 | 3.68 |
| 20 | 0.3333 | 30 | 6.13 |

18 buildings covers everything to 3.27 trains/h. The block is nearly all fixed cost — doubling to
6/h costs 2 buildings — so if 3/hour reads thin, going higher is cheap.

## Batch cycle — one whole train, flattened

The rate view above says *how fast*; this says *what to make in one pass*. It is the input for a
batch controller that runs each recipe once per train rather than switching on buffer dips — which
is what a quick-and-dirty prototype gets wrong, because switching cost is paid per visit and most
recipes here produce almost nothing per visit.

**Integer crafts, rounding cascaded.** Each level rounds up to whole crafts and the rounded figure
is what the level below has to supply — so these are not the fractional machine-counts from the
rate table. `needs + spare = makes` on every row.
`*` = dedicated machine, never switches. `per` = output per craft.

```
                                    CARGO train                 FLUID train
 tier  recipe             needs crafts makes spare    needs crafts makes spare  per
───── tier 0 ───────────────────────────────────────────────────────────────────────
   *  duralumin-1           257    257   257     0      297    297   297     0    1
      iron-stick            280    140   280     0      280    140   280     0    2
      copper-cable          279    140   280     1      279    140   280     1    2
      iron-gear-wheel        93     93    93     0       93     93    93     0    1
      solder-0               50     50    50     0       50     50    50     0    1
      pipe                   30     30    30     0       46     46    46     0    1
   *  nexelit-plate-2        66      4    72     6       66      4    72     6   18
───── tier 1 ───────────────────────────────────────────────────────────────────────
      bolts                 279    140   280     1      279    140   280     1    2
   *  fenxsb-alloy-2         65     33    66     1       65     33    66     1    2
   *  vitreloy               31     16    32     1       31     16    32     1    2
      storage-tank            —      —     —     —        2      2     2     0    1
───── tier 2 ───────────────────────────────────────────────────────────────────────
      small-parts-01        186     93   186     0      186     93   186     0    2
   *  intermetallics         15     15    15     0       15     15    15     0    1
───── tier 3 ───────────────────────────────────────────────────────────────────────
      shaft-mk01             10     10    10     0       10     10    10     0    1
      brake-mk01              8      8     8     0        8      8     8     0    1
      steam-engine            2      2     2     0        2      2     2     0    1
───── tier 4 ───────────────────────────────────────────────────────────────────────
      cargo-wagon             2      2     2     0        —      —     —     —    1
      fluid-wagon             —      —     —     —        2      2     2     0    1
      gearbox-mk01            1      1     1     0        1      1     1     0    1
───── tier 5 ───────────────────────────────────────────────────────────────────────
      locomotive              1      1     1     0        1      1     1     0    1
────────────────────────────────────────────────────────────────────────────────────
      TOTAL crafts                1,035                        1,093
```

### Raw imports per train

| | cargo | fluid | delta | | | cargo | fluid |
|---|--:|--:|--:|---|---|--:|--:|
| **aluminium-plate** | 1,028 | **1,188** | +160 | | tin-plate | 100 | 100 |
| copper-plate | 782 | 862 | +80 | | sb-oxide | 81 | 81 |
| **iron-plate** | 647 | **623** | −24 | | ceramic | 80 | 80 |
| lead-plate | 200 | 220 | +20 | | glass | 80 | 80 |
| titanium-plate | 152 | 152 | 0 | | clean-nexelit | 72 | 72 |
| steel-plate | 115 | 117 | +2 | | nickel-plate | 48 | 48 |
| | | | | | fish-oil | 20 | 20 |
| | | | | | electronic-circuit | 10 | 10 |

### What the batch view shows that the rate view does not

**The two cycles are one program with four parameters.** Eleven recipes have identical craft counts;
only `duralumin-1` (257 → 297), `pipe` (30 → 46), `storage-tank` (0 → 2) and the wagon swap differ.
Nine of fourteen import lanes are byte-identical. Build one controller, not two.

**Pull the five dedicated machines out and the rotation is 13–14 recipes**, of which `iron-stick` →
`bolts` → `small-parts-01` plus `copper-cable` and `iron-gear-wheel` is **606 of ~730 crafts — 83 %
of the switching work in five recipes that all converge on `small-parts-01`.** The remaining eight
or nine recipes are 24 crafts combined. That asymmetry is where a naive switcher bleeds: it pays
full overhead on a tail that produces almost nothing.

**`duralumin-1` is 257 of 1,035 crafts — 25 % of the cycle in one recipe** — and it is a dedicated
smelter that never switches, so it should start first and run continuously through the whole cycle
rather than being part of any rotation. It is also the row at 92 % in the rate table, so it is
simultaneously the longest batch and the tightest machine: it can only lose to input starvation, not
to switching. Size its aluminium buffer for 1,028–1,188 plate.

**Spare accumulates on five rows**, ten items per cycle: `nexelit-plate-2` +6, then `copper-cable`,
`bolts`, `fenxsb-alloy-2`, `vitreloy` +1 each. Only nexelit matters — 6 banked per cycle means
**after 11 cycles you have 66 and can skip that batch entirely**, so it wants a stock check rather
than an unconditional craft. The other four just sit.

## Solver command

**No single command produces this.** The solver takes one target and this is three circuit-switched
products. The table is **three separate solves summed by fractional machine count**, which is how
the block behaves: shared intermediates sum while the product factories switch.

Run per product with `$R × 1000`, divide counts by 1000, then sum across the three.

```bash
P="$1"; R="$2"
npx tsx src/cli.ts solve \
  --recipes "$P,small-parts-01,iron-gear-wheel,copper-cable,bolts,iron-stick,pipe,brake-mk01,duralumin-1,intermetallics,shaft-mk01,gearbox-mk01,solder-0,storage-tank,nexelit-plate-2,fenxsb-alloy-2,vitreloy,steam-engine" \
  --target "$P:$R" --time 60 \
  --max-import "small-parts-01:0.001" --max-import "iron-gear-wheel:0.001" \
  --max-import "copper-cable:0.001" --max-import "bolts:0.001" --max-import "iron-stick:0.001" \
  --max-import "pipe:0.001" --max-import "brake-mk01:0.001" --max-import "duralumin:0.001" \
  --max-import "intermetallics:0.001" --max-import "shaft-mk01:0.001" \
  --max-import "gearbox-mk01:0.001" --max-import "solder:0.001" \
  --max-import "storage-tank:0.001" --max-import "steam-engine:0.001" \
  --max-import "nexelit-plate:0.001" --max-import "fenxsb-alloy:0.001" \
  --max-import "vitreloy:0.001" \
  --factory "$P:assembling-machine-2" \
  --factory "small-parts-01:assembling-machine-2" \
  --factory "iron-gear-wheel:assembling-machine-2" \
  --factory "copper-cable:assembling-machine-2" \
  --factory "bolts:assembling-machine-2" \
  --factory "iron-stick:assembling-machine-2" \
  --factory "pipe:assembling-machine-2" \
  --factory "brake-mk01:assembling-machine-2" \
  --factory "solder-0:assembling-machine-2" \
  --factory "shaft-mk01:assembling-machine-2" \
  --factory "storage-tank:assembling-machine-2" \
  --factory "gearbox-mk01:assembling-machine-2" \
  --factory "steam-engine:assembling-machine-2" \
  --factory "duralumin-1:smelter-mk01" \
  --factory "fenxsb-alloy-2:smelter-mk01" \
  --factory "vitreloy:smelter-mk01" \
  --factory "nexelit-plate-2:advanced-foundry-mk01" \
  --factory "intermetallics:advanced-foundry-mk01" \
  --fuel "$P:acetylene-canister" \
  --fuel "small-parts-01:acetylene-canister" \
  --fuel "iron-gear-wheel:acetylene-canister" \
  --fuel "copper-cable:acetylene-canister" \
  --fuel "bolts:acetylene-canister" \
  --fuel "iron-stick:acetylene-canister" \
  --fuel "pipe:acetylene-canister" \
  --fuel "brake-mk01:acetylene-canister" \
  --fuel "solder-0:acetylene-canister" \
  --fuel "shaft-mk01:acetylene-canister" \
  --fuel "storage-tank:acetylene-canister" \
  --fuel "gearbox-mk01:acetylene-canister" \
  --fuel "steam-engine:acetylene-canister" \
  --solver simplex --unlocked
```

Invoked as `<script> locomotive 50`, `<script> cargo-wagon 50`, `<script> fluid-wagon 50`
for the 3 trains/hour figures above.

### Invocation notes

- **Thirteen `--fuel` flags, not one.** With every row on `assembling-machine-2` the coal default
  applies to all of them. Miss any and the solve comes back with `coal` in and `ash` out from
  nowhere — it did exactly that here, the fourth occurrence of this trap in the catalogue, and the
  tell was `coal 1.16/min · ash 1.16/min` in a block with no coal input.
- **`--fuel "...:acetylene"` throws** — `"acetylene" is not a valid fuel item`. It is a fluid; only
  `acetylene-canister` works as a solid fuel, and only on jerry-capable machines.
- **`automated-factory-mk01` also handles `advanced-crafting`** and is electric, so `gearbox-mk01`
  never needed a burner. The earlier version of this block used it for everything; the swap to
  `assembling-machine-2` is worth it anyway — see below.
- **`smelter-mk01` is a fluid burner and the solve does not say so.** Its fuel lands in
  `totalPowerMW` under an electric heading. With three of them that is 15.93 MW mislabelled.
- **`recipe-info solder` reports `Unlocked: no`** — that is the molten-route recipe sharing the
  name. `solder-0` is live. Force state is the authority.

## Why `assembling-machine-2` over `automated-factory-mk01`

Same building count, but speed 2 halves every assembler frac and 3×3 against 7×7 saves 520 tiles:

| | automated-factory-mk01 | assembling-machine-2 |
|---|--:|--:|
| buildings | 18 | 18 |
| **tiles** | 1,216 | **696** (−43 %) |
| **electric** | 2.53 MW | **0.45 MW** (−82 %) |
| jerry fuel | — | 79 kW (0.46 canister/min) |
| acetylene | 956/min | 960.4/min |

It also scales better: 12 trains/h is 23 buildings instead of 24, and 20/h is 30.

## Open levers

- **`duralumin-2` — 20 duralumin per craft against `duralumin-1`'s 1**, same 4 s, so 300/min per
  smelter instead of 15. Needs `alloys-mk02` (275 u) *and* `copper-mk02` (160 u) for
  `molten-copper-04`; `molten-aluminium-01` is **already researched** under `aluminium-mk01`.
  `alloys-mk02`'s chain runs `niobium` → `organic-solvent` → `coal-processing-2` → `nichrome` →
  `nitrogen-mk01`, plus `lead-mk02`. **Not cheaper in metal** — 100 molten-aluminium per 20
  duralumin is 5 per unit against 4 aluminium-plate — it buys throughput and skips the plate stage.
- **`smelter-mk02` — 700 u, speed 2, 20 MW, 2 module slots.** Blunter but one tech, and it halves
  all three smelter rows at once. Does not change any ratio.
- **The MAM collapse to ~4–7 buildings** (above) — an inserter and buffer question, unpriced.
- **Rates are still placeholders.** 3 trains/hour was chosen because it is where `duralumin-1`
  reaches 92 % and every row is one machine, not because a rollout was measured against it.

## What the cut removed

The previous version of this file was a ten-product one-stop shop at 67 buildings: `rail` 60/min,
`rail-signal` 6, `rail-chain-signal` 6, `train-stop` 2, `inserter` 20, `rail-support` 3,
`rail-ramp` 0.5 alongside the three vehicles. Dropping the seven non-vehicle products removed:

- **`solder-0` ×12 at 99.2 %, the pinned row** — rail was 5 solder per 3, `rail-support` 10 each and
  `rail-ramp` 10 each. Solder now only feeds `shaft-mk01` and sits at 12.5 % of one machine.
- **`refined-concrete` and `concrete`**, and with them the `lime`, `gravel` and `sand` imports.
- **`inserter` and `burner-inserter`**.
- The whole elevated-rail question. `rail-support`'s rate was the most sensitive number in the old
  design — at 20/min it solved to 135 buildings, 50 advanced-foundries on intermetallics alone.

Separately, `ceramic` and `fish-oil` became imports (removing the `clay` row, a boiler, and the
entire 11-building fish chain plus `hydrogen`, `waste-water-void` and `guts-to-chlorine`), and
`vitreloy` became local (one smelter, bringing `nickel-plate` in as a new import).

### `solder-mk02` — priced, and now moot here

The old file listed this as the thing to price. It is **495 u across three unresearched techs**:
`tin-mk02` 160 + `lead-mk02` 160 + `solder-mk02` 175, all at the automation + py-1 + logistic tier,
with `logistic-science-pack` already done. `solder-mk02` alone unlocks `solder` (casting),
`hotair-solder`, `molten-solder-0` and `molten-solder-1`; the two metal techs cover `molten-tin-01`,
`molten-lead-01` and the `tin-dust` / `lead-dust` / ore-grade recipes that feed them.

The throughput case is real — `solder-0` is 10/min in a 2 MW machine, `solder` casting is 75/min and
`hotair-solder` 105/min in a 0.5 MW `casting-unit-mk01`, a 7.5–10.5× jump. But with rail gone this
block needs 0.125 of one solder machine, so **the 495 u buys nothing here.** Recorded for whichever
block ends up making rail.
