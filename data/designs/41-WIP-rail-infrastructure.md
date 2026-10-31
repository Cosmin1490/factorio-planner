# 41 — WIP — Rail infrastructure one-stop shop — 67 buildings

> **WIP.** Rates are placeholders, not decisions. Two open questions: `solder-0` is pinned at
> **99.2 %** and `rail-support`'s rate drives the whole intermetallics chain — see § Where this
> was heading.

One block, **ten** rail products, everything inlined to plates. **Design intent is explicitly
one-stop**: no splitting. `fast-inserter` is the only candidate for separation and that is undecided.

**The goal is "cheap" in build-time, not in resources** — everything the network needs comes out of
one circuit-switched block so none of it is hand-crafted.

**Placeholder build rates** (rail-heavy, trains rare):
rail 60/min · rail-signal 6 · rail-chain-signal 6 · train-stop 2 · inserter 20 ·
**rail-support 3 · rail-ramp 0.5** · cargo-wagon 0.6 · locomotive 0.2 · fluid-wagon 0.2

> **Elevated rail costs 5 buildings.** Adding `rail-support` and `rail-ramp` took the block 62 → 67:
> +1 each of `fenxsb-alloy-2`, `intermetallics`, `nexelit-plate-2`, `refined-concrete`, `concrete`.
> `lime`, `gravel` and `sand` are the only new imports, and gravel/sand are two crushers off stone.
> `elevated-rail` is **160 u with no outstanding prerequisites** — the cheapest tech in the plan.

```
rail               [U] [crafting, 0.5s]  stone 1 + treated-wood 2 + bolts 4
                                         + steel-plate 1 + solder 5          →  3
rail-signal        [U] [crafting, 0.5s]  electronic-circuit 1 + iron-plate 5 →  1
rail-chain-signal  [U] [crafting, 0.5s]  electronic-circuit 1 + iron-plate 5 →  1   ← identical
train-stop         [U] [crafting, 0.5s]  iron-stick 6 + electronic-circuit 5
                                         + steel-plate 3 + iron-plate 6      →  1
inserter           [U] [crafting, 0.5s]  burner-inserter 1 + electronic-circuit 2
                                         + small-parts-01 3 + duralumin 1    →  1
locomotive         [U] [crafting,   4s]  pipe 20 + steam-engine 2 + intermetallics 5
                                         + brake-mk01 4 + gearbox-mk01 1 + shaft-mk01 4
                                         + electronic-circuit 10 + small-parts-01 20
                                         + steel-plate 30 + duralumin 25     →  1
cargo-wagon        [U] [crafting,   1s]  intermetallics 5 + brake-mk01 2 + shaft-mk01 2
                                         + small-parts-01 10 + steel-plate 20
                                         + duralumin 10 + titanium-plate 50
                                         + iron-plate 20                     →  1
fluid-wagon        [U] [crafting, 1.5s]  storage-tank 1 + pipe 8 + intermetallics 5
                                         + brake-mk01 2 + shaft-mk01 2 + small-parts-01 10
                                         + steel-plate 16 + duralumin 10
                                         + titanium-plate 50                 →  1
rail-support       [U] [crafting, 0.5s]  refined-concrete 20 + intermetallics 10
                                        + bolts 10 + steel-plate 10 + solder 10  ->  1
rail-ramp          [U] [crafting, 0.5s]  rail 8 + refined-concrete 100 + intermetallics 10
                                        + bolts 10 + steel-plate 10 + solder 10  ->  1
refined-concrete   [U] [crafting-with-fluid, 15s]  concrete 5 + iron-stick 8 + steel-plate 1
                                        + water 100  ->  10
concrete           [U] [crafting-with-fluid, 0.5s] lime 5 + gravel 10 + sand 10 + water 100  ->  5
```

## Machines — 67

```
┌───────────────────┬──────────────────────────┬────────┬───────┬────────┐
│ Recipe            │ Factory                  │  frac  │ Count │  Util  │
├───────────────────┼──────────────────────────┼────────┼───────┼────────┤
│ solder-0          │ automated-factory-mk01   │ 11.900 │  12   │  99.2% │ <- PINNED
│ duralumin-1       │ smelter-mk01             │  5.740 │   6   │  95.7% │
│ fenxsb-alloy-2    │ smelter-mk01             │  4.010 │   5   │  80.2% │
│ intermetallics    │ advanced-foundry-mk01    │  2.520 │   3   │  84.0% │
│ shaft-mk01        │ automated-factory-mk01   │  2.340 │   3   │  78.0% │
│ iron-stick        │ automated-factory-mk01   │  1.540 │   2   │  77.0% │
│ nexelit-plate-2   │ advanced-foundry-mk01    │  1.340 │   2   │  67.0% │
│ clay              │ clay-pit-mk01            │  1.080 │   2   │  54.0% │
│ copper-cable      │ automated-factory-mk01   │  0.960 │   1   │  96.0% │
│ brake-mk01        │ automated-factory-mk01   │  0.810 │   1   │  81.0% │
│ iron-gear-wheel   │ automated-factory-mk01   │  0.640 │   1   │  64.0% │
│ refined-concrete  │ assembling-machine-2     │  0.630 │   1   │  63.0% │
│ bolts             │ automated-factory-mk01   │  0.550 │   1   │  55.0% │
│ ceramic           │ hpf                      │  0.410 │   1   │  41.0% │
│ small-parts-01    │ automated-factory-mk01   │  0.260 │   1   │  26.0% │
│ rail              │ automated-factory-mk01   │  0.170 │   1   │  17.0% │
│ inserter          │ automated-factory-mk01   │  0.170 │   1   │  17.0% │
│ burner-inserter   │ automated-factory-mk01   │  0.170 │   1   │  17.0% │
│ breed-fish-1      │ fish-farm-mk01           │  0.160 │   1   │  16.0% │ 7x fish
│ pipe              │ automated-factory-mk01   │  0.060 │   1   │   6.0% │
│ rail-signal       │ automated-factory-mk01   │  0.050 │   1   │   5.0% │
│ rail-chain-signal │ automated-factory-mk01   │  0.050 │   1   │   5.0% │
│ breed-fish-egg-1  │ fish-farm-mk01           │  0.050 │   1   │   5.0% │ 7x fish
│ phytoplankton     │ plankton-farm            │  0.040 │   1   │   4.0% │
│ concrete          │ assembling-machine-2     │  0.030 │   1   │   3.0% │
│ full-render-fish  │ slaughterhouse-mk01      │  0.030 │   1   │   3.0% │
│ train-stop        │ automated-factory-mk01   │  0.020 │   1   │   2.0% │
│ locomotive        │ automated-factory-mk01   │  0.020 │   1   │   2.0% │
│ gearbox-mk01      │ assembling-machine-2     │  0.020 │   1   │   2.0% │
│ rail-ramp         │ automated-factory-mk01   │  0.010 │   1   │   1.0% │
│ cargo-wagon       │ automated-factory-mk01   │  0.010 │   1   │   1.0% │
│ fluid-wagon       │ automated-factory-mk01   │  0.010 │   1   │   1.0% │
│ storage-tank      │ automated-factory-mk01   │  0.010 │   1   │   1.0% │
│ hydrogen          │ electrolyzer-mk01        │  0.010 │   1   │   1.0% │
│ biomass-skin / -guts / -bones / -meat        │   1 ea │  2.0% │
│ guts-to-chlorine · waste-water-void          │   1 ea │  2.0% │
└───────────────────┴──────────────────────────┴────────┴───────┴────────┘
```

**67 buildings.** The ten product factories are under 30 % combined — circuit-switched they collapse
into one or two, taking the block to **~58 buildings**.


## Two rows are the block

**`solder-0` ×12 at 99.2 %** — a fifth of the block, and now **pinned**. Rail is 5 solder per 3,
`rail-support` wants 10 each and `rail-ramp` 10 each; solder is `4 lead-plate + 2 tin-plate → 1`.
At these rates: **~420 lead-plate + 210 tin-plate per minute**, the largest single demand in the
design. **Rail is a lead-and-tin product that happens to contain steel** — 6.67 lead + 3.33 tin per
rail, twenty times its iron content. Any rate increase anywhere needs a 13th machine.

**11 `smelter-mk01`** (`duralumin-1` ×6 + `fenxsb-alloy-2` ×5), all 13×13 and all **fluid burners at
10 MW rated** — duty-weighted ≈ **98 MW of acetylene**, the energy story of the block. Driven by the
**20 `duralumin` in every `brake-mk01`** (4 aluminium + 2 copper each: 436 aluminium per locomotive)
and now also by `rail-support`'s **10 `intermetallics`**, which runs through `fenxsb-alloy` → nexelit.

> **`rail-support`'s rate is the most sensitive number in the design.** At 20/min the block solves to
> **135 buildings** — 50 advanced-foundries on intermetallics alone. At 3/min it is 5 extra buildings.
> The concrete is trivial; the intermetallics is not.

## Fuel

| machine | fuel | note |
|---|---|---|
| `smelter-mk01` ×10 | **acetylene** | `fluid_energy_source`, 10 MW each — the bulk |
| `assembling-machine-2` (gearbox) | **acetylene-canister** | jerry, 10 MJ. **Without `--fuel` it coal-defaults and emits ash** |
| `atomizer-mk01` (guts-to-chlorine) | **biomass** | accepts chemical/biomass **only** — no jerry, so the canister physically does not fit. Self-supplied by the fish renders |
| `clay-pit-mk01` ×2 | steam ← acetylene boiler | `clay` is 100 steam → 3 |

## Imports

**Plates:** iron · copper · aluminium · steel · lead · tin · titanium
**Specialty:** electronic-circuit · vitreloy · glass · coke · **clean-nexelit** · stone · treated-wood ·
steam-engine · **lime · gravel · sand** (gravel and sand are two crushers off stone)
**Fluids:** acetylene · water

`fish-oil` is inlined (11 buildings, design 29's chain, serving `gearbox-mk01`'s 20 per locomotive).
`fenxsb-alloy` closes on site off imported `clean-nexelit` — going deeper hits `nexelit-ore` from
digosaurus dig sites, which is script-driven and absent from the export.

## Where this was heading

- **`solder-mk02` is the thing to price.** `solder-0` is 12 of 67 buildings and now **pinned at 99.2 %** — elevated rail wants 10 solder per support and 10 per ramp, on top of rail's 5 per 3. The casting route is
  `50 molten-solder → 5 solder` against `solder-0`'s 6 plates per 1, and `molten-solder-1` is
  `10 molten-tin + 20 molten-lead + 30 tar → 40`. **If `solder-mk02` is cheap this deletes eleven
  buildings.** Not yet costed.
- **Rates are placeholders.** Nothing here was sized against an actual city-block rollout.
- **`rail-support` 3/min and `rail-ramp` 0.5/min are guesses.** They set the intermetallics chain
  (10 per support), which is 10 of the 67 buildings. How much elevated rail a block grid eats per
  hour is the number that would settle it.
- **`fast-inserter` undecided.** 11 unresearched techs / 2,240 units via `alloys-mk02` → `niobium` →
  `nbfe-alloy`. It shares `small-parts-01`, `electronic-circuit`, `inserter` and `vitreloy` with this
  block, so **folding it in later is one more product factory, not a second block** — the decision
  costs nothing to defer.
- **Footprint not computed.** 10 of the machines are 13×13 smelters, so it will be large.
- **Build materials not computed.**

## Solver command

**No single command produces this.** The solver takes one target, and a MAM is a union of
circuit-switched products. The table above is **eight separate solves summed by fractional machine
count** at the placeholder rates — which is exactly how the block behaves, since shared intermediates
(`solder`, `duralumin`, `small-parts-01`) sum while the product factories switch.

Per-product template — substitute `$P` and `$R`:

```bash
npx tsx src/cli.ts solve \
  --recipes "$P,small-parts-01,iron-gear-wheel,copper-cable,bolts,iron-stick,pipe,brake-mk01,duralumin-1,intermetallics,shaft-mk01,gearbox-mk01,solder-0,ceramic,clay,storage-tank,inserter,burner-inserter,nexelit-plate-2,fenxsb-alloy-2,refined-concrete,concrete,breed-fish-1,breed-fish-egg-1,phytoplankton,full-render-fish,biomass-skin,biomass-guts,biomass-bones,biomass-meat,guts-to-chlorine,waste-water-void,hydrogen" \
  --target "$P:$R" --time 60 \
  --max-import "small-parts-01:0.001" --max-import "iron-gear-wheel:0.001" \
  --max-import "copper-cable:0.001" --max-import "bolts:0.001" --max-import "iron-stick:0.001" \
  --max-import "pipe:0.001" --max-import "brake-mk01:0.001" --max-import "duralumin:0.001" \
  --max-import "intermetallics:0.001" --max-import "shaft-mk01:0.001" \
  --max-import "gearbox-mk01:0.001" --max-import "solder:0.001" \
  --max-import "ceramic:0.001" --max-import "clay:0.001" --max-import "storage-tank:0.001" \
  --max-import "inserter:0.001" --max-import "burner-inserter:0.001" \
  --max-import "nexelit-plate:0.001" --max-import "fenxsb-alloy:0.001" \
  --max-import "refined-concrete:0.001" --max-import "concrete:0.001" \
  --max-import "fish-oil:0.001" --max-import "fish:0.001" --max-import "fish-egg:0.001" \
  --max-import "phytoplankton:0.001" --max-import "biomass:0.001" \
  --max-import "water:100000" \
  --fuel "guts-to-chlorine:biomass" --fuel "gearbox-mk01:acetylene-canister" \
  --fuel "refined-concrete:acetylene-canister" --fuel "concrete:acetylene-canister" \
  --factory "$P:automated-factory-mk01" \
  --factory "small-parts-01:automated-factory-mk01" \
  --factory "iron-gear-wheel:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "pipe:automated-factory-mk01" \
  --factory "brake-mk01:automated-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "shaft-mk01:automated-factory-mk01" \
  --factory "storage-tank:automated-factory-mk01" \
  --factory "inserter:automated-factory-mk01" \
  --factory "burner-inserter:automated-factory-mk01" \
  --factory "duralumin-1:smelter-mk01" \
  --factory "fenxsb-alloy-2:smelter-mk01" \
  --factory "nexelit-plate-2:advanced-foundry-mk01" \
  --factory "intermetallics:advanced-foundry-mk01" \
  --factory "gearbox-mk01:assembling-machine-2" \
  --factory "refined-concrete:assembling-machine-2" \
  --factory "concrete:assembling-machine-2" \
  --factory "ceramic:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "breed-fish-1:fish-farm-mk01" \
  --factory "breed-fish-egg-1:fish-farm-mk01" \
  --factory "phytoplankton:plankton-farm" \
  --factory "full-render-fish:slaughterhouse-mk01" \
  --factory "biomass-skin:compost-plant-mk01" \
  --factory "biomass-guts:compost-plant-mk01" \
  --factory "biomass-bones:compost-plant-mk01" \
  --factory "biomass-meat:compost-plant-mk01" \
  --factory "guts-to-chlorine:atomizer-mk01" \
  --factory "waste-water-void:quenching-tower" \
  --factory "hydrogen:electrolyzer-mk01" \
  --modules "breed-fish-1:fish:7" --modules "breed-fish-egg-1:fish:7" \
  --solver simplex --unlocked
```

Run at `$R × 1000` and divide counts by 1000 for the fractional values, then sum across products.

### Invocation notes

- **`--fuel "gearbox-mk01:acetylene-canister"` is load-bearing.** Without it `assembling-machine-2`
  coal-defaults and the LP emits ash from nowhere. Third occurrence of this trap in the catalogue.
- **`--fuel "...:acetylene"` throws** — `"acetylene" is not a valid fuel item`. It is a fluid; only
  `acetylene-canister` works as a solid fuel, and only on jerry-capable machines.
- **`smelter-mk01` is a fluid burner and the solve does not say so** — its fuel lands in
  `totalPowerMW` under an electric heading, same as `glassworks-mk01`. With 10 of them that is ~89 MW
  mislabelled.
- **`recipe-info solder` reports `Unlocked: no`** — that is the molten-route recipe sharing the name.
  **`solder-0` is live.** Force state is the authority.
