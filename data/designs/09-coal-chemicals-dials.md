# Coal chemicals — 15/s raw-coal, dial-controlled, 111 buildings

Supply-driven block: one yellow belt of raw-coal in, continuously-variable product mix out.
Supersedes the mode framing of designs 04/05/08 — see § Relation to design 08.

**Foundational block — it sits upstream of ore extraction, power, and chemistry at once.**

- **Mining fluid** for 6 of the 14 fluid-mined ores directly (syngas → borax, phosphate-rock, chromium,
  nickel; coal-gas → aluminium; aromatics → zinc), plus 3 more through the coke → acetylene chain.
- **Power** — up to 221.70 MJ/s of drawable energy, a ~330 MW ceiling, off a chain that multiplies
  raw-coal's fuel value 4.5× versus burning it directly.
- **Materials** — coke, aromatics, creosote, plastic, polybutadiene, carbon-black, rubber feedstock.

No single one of these is "the" output. The dials decide which of the three the block is currently
serving, and the drawable-energy budget is what they are all trading against.

All solver runs fresh (input mode, `--input raw-coal:900 --time 60`). Nothing carried over from design 08.

## Dials

Operation is not a menu of modes. Four continuous dials, each implemented in-game as a splitter or
valve ratio. The corners are solver-validated; interior positions are blends.

| Dial | Definition | Range | Bound by |
|---|---|---|---|
| **f** | coke recycled via `coal-gas-from-coke` | 0 = export all → 1 = recycle all | capacity — must handle 100% |
| **x** | anthracene cracked vs → creosote | 0 = all creosote → 1 = all cracked | capacity — must handle 100% |
| **n** | naphthalene + carbolic → creosote vs burned | 0 = burn → 1 = convert | capacity — must handle 100% |
| **g** | coal-gas tapped for aluminium mining | 0 → demand | **demand** — see § Coal-gas tap |

`syngas` is **not** a dial. Voiding coal-gas (`coal-gas-void`) is strictly dominated: it loses the same
30 tar per 50 coal-gas as not gasifying, and forfeits the syngas too. Even burning coal-gas directly
(0.81 steam/unit × 108/s = 87.5 steam/s) loses to gasifying first and burning the syngas (245 steam/s)
— 2.8× the steam **plus** 64.8/s of tar. Run the gasifiers at 100% always. The only legitimate reason
to divert coal-gas is dial `g`, which sends it to a real consumer rather than destroying it.

### Why disposal routes are capacity-bound and value routes are demand-bound

A dial's upper limit is `min(upstream capacity, max plausible demand)`. Which term binds depends on
whether the route is pressure relief or value capture:

- **Disposal route** → size for 100% of upstream flow. If it can't absorb everything, the dial has a
  dead zone and the chain stalls when you need it most.
- **Value route** → size to max plausible demand. The dial physically cannot exceed that, so capacity
  beyond it is dead building.

**Cracking is the disposal route, not creosote.** This inverts the natural reading. Trace the
obligations: cracking yields gasoline (burnable, or electricity) + coke (acetylene, or export) — both
self-absorb, no downstream obligation. Creosote is **not a fuel** (`fuel_value: 0`, the only such fluid
here) and requires sand-casting or a 7–18 building forestry. Carbon-black needs vacuum and has
negligible demand. So cracking is where anthracene goes when you don't know what else to do with it,
and `x = 1` is the safe default.

## Building envelope

Max count per recipe across all dial corners. 12 core recipes, **107 buildings**, max 46.63 MW electric.

```
┌──────────────────────────────┬─────────────────────┬───────┬──────────────────┐
│ Recipe                       │ Factory             │ Count │ Peaks at         │
├──────────────────────────────┼─────────────────────┼───────┼──────────────────┤
│ distilled-raw-coal           │ distilator          │     3 │ all              │
│ coal-gas                     │ distilator          │     2 │ all              │
│ coal-gas-from-coke           │ distilator          │    16 │ f=1 x=1          │
│ syngas                       │ gasifier            │    11 │ f=1 x=1          │
│ tar-refining                 │ tar-processing-unit │    12 │ f=1 x=1          │
│ pitch-refining               │ distilator          │    17 │ f=1 x=1          │
│ tar-refining-tops            │ tar-processing-unit │     3 │ f=1 (any x)      │
│ light-oil-aromatics          │ distilator          │     4 │ f=1 (any x)      │
│ anthracene-gasoline-cracking │ distilator          │    22 │ f=1 x=1          │
│ anthracene-oil-creosote      │ tar-processing-unit │     9 │ f=1 x=0          │
│ naphthalene-oil-creosote     │ tar-processing-unit │     6 │ f=1 x=1 n=1      │
│ carbolic-oil-creosote        │ tar-processing-unit │     2 │ f=1 n=1          │
└──────────────────────────────┴─────────────────────┴───────┴──────────────────┘
```

64 distilator + 32 tar-processing-unit + 11 gasifier = 107, plus 4 value-route buildings = **111**.
Boilers and turbines sized separately (§ Energy).

**Every maximum lands at a corner, and `f=1` drives all but two.**

Taking the max across corners is only valid if each recipe's count is **monotonic** in each dial — if
any recipe peaked at an interior setting, the envelope would under-size it and the shortfall would only
appear in-game at intermediate dial positions. Verified analytically:

- **Eleven of twelve are trivially monotonic.** They scale with tar throughput, which rises with both
  `f` and `x` with no negative term, so they peak at `f=1, x=1`. `naphthalene-oil-creosote` confirms the
  direction — it peaks at `x=1`, not `x=0`, because cracking makes coke → stronger recycle loop → more
  pitch → more naphthalene.
- **`anthracene-oil-creosote` is the only one at risk**, because it has opposing factors: it takes
  `(1−x)` of the anthracene, but total anthracene *rises* with `x` (205.99/s at `x=0` → 271.48/s at
  `x=1`). A shrinking fraction of a growing pool can peak in the middle. It does not:

  ```
  anthracene_to_creosote(x) ≈ (1−x)(205.99 + 65.49x) = 205.99 − 140.50x − 65.49x²
  d/dx = −140.50 − 130.98x  <  0   for all x ∈ [0,1]
  ```

  Strictly decreasing, so its max is at `x=0` — a solved corner (9 buildings). Anthracene would have to
  grow faster than `1/(1−x)` to create an interior peak, and it grows only 32% across the full range.

**The 107-building envelope is sound; no interior solver run is needed.**

## Coupling structure

The dials are not independent, but the dependency is hierarchical rather than tangled — which is what
makes the block tractable. The ordering principle: **dials that tap upstream of the tar loop cost more
than dials that split downstream of it.**

| Dial | Position relative to tar loop | Effect |
|---|---|---|
| **g** | **upstream of the loop** | Reduces the loop's input. Most expensive — see below. |
| **f** | **the loop gain itself** | Scales tar ~`1/(1−0.411f)`. Moves every downstream building count. |
| **x** | downstream of tar-refining | Redistributes anthracene. Modulates f's gain (cracking makes coke → feeds loop). **Also the power dial.** |
| **n** | downstream, terminal | Energy only — removes 121.5 steam/s from the fuel pool. Zero effect on tar. |

`x` modulates `f` because cracking produces coke, which is what `f` recycles. At `f=0` this coupling
vanishes; at `f=1` it is the R2-vs-R4 tar gap (232.03 vs 176.06/s).

## Corner reference

Five solver-validated corners. All consume exactly 900 raw-coal/60s.

| | **R1** | **R2** | **R3** | **R4** | **R5** |
|---|--:|--:|--:|--:|--:|
| dials (f, x, n) | 0, 1, 0 | 1, 1, 0 | 1, 1, 1 | 1, 0, 1 | 0, 0, 1 |
| active buildings | 47 | 90 | 98 | 66 | 46 |
| electric MW | 21.48 | 43.25 | 46.63 | 29.48 | 20.31 |
| tar throughput /s | 132.30 | 232.03 | 232.03 | 176.06 | 132.30 |
| **coke** /s | **36.70** | 0 | 0 | 0 | **21.22** |
| **syngas** /s | 151.20 | **238.46** | **238.46** | 189.49 | 151.20 |
| **aromatics** /s | 56.89 | **99.77** | **99.77** | 75.70 | 56.89 |
| **gasoline** /s | 90.36 | **158.48** | **158.48** | 37.85 | 28.44 |
| **creosote** /s | 31.75 | 55.69 | 171.24 | **212.32** | 159.55 |
| hydrogen /s | 18.52 | 32.48 | 32.48 | 24.65 | 18.52 |
| naphthalene /s | 76.73 | 134.58 | 0 | 0 | 0 |
| carbolic /s | 19.85 | 34.80 | 0 | 0 | 0 |
| ash /s | 2.16 | 6.52 | 6.52 | 4.07 | 2.16 |
| iron-oxide /s | 0.435 | 0.435 | 0.435 | 0.435 | 0.435 |
| process steam /s | 357.21 | 626.48 | 626.48 | 475.35 | 357.21 |
| process water /s | 216.00 | 340.66 | 340.66 | 270.70 | 216.00 |

Coke is fully recycled (0 export) at `f=1` in R2/R3/R4 — 62.33/s internally in R2/R3, 27.35/s in R4.

## Energy — and why `x` is the power dial

`oil-boiler-mk01`: effectivity 2, 60 steam/s, 250°C. `steam-turbine-mk01`: 60 steam/s, effectivity 1,
accepts up to 1000°C — so **one turbine per boiler, 1:1, ~29.61 MW electric each.**

Steam per unit burned (`fuel_value × 2 / 0.4935`): gasoline 4.863, syngas 1.621, carbolic 1.418,
naphthalene 1.216, hydrogen 0.405. **Creosote is not a fuel and cannot be burned off.**

| | R1 | R2 | R3 | R4 | R5 |
|---|--:|--:|--:|--:|--:|
| fuel available (steam/s) | 813.50 | 1383.47 | 1170.48 | 501.20 | 390.88 |
| process steam (steam/s) | 357.21 | 626.48 | 626.48 | 475.35 | 357.21 |
| non-syngas fuel (steam/s) | 568.4 | 996.9 | 783.9 | 194.1 | 145.8 |
| **syngas burned** /s | **0** | **0** | **0** | **173.52** | **130.40** |
| syngas left to export /s (aromatics reserved) | 151.20 | 238.46 | 238.46 | 15.97 | 20.80 |
| **syngas export, surplus aromatics burned** /s | **151.20** | **238.46** | **238.46** | **64.7** | **53.1** |
| **net power MW** | **+203.7** | **+330.3** | **+221.8** | **−16.7** | **−3.7** |

**`x = 0` cannibalises the mining fluid supply — and this matters more than the power swing.** At
`x = 1` the gasoline from cracking covers process steam outright, so the entire syngas output is free
to export. At `x = 0` there is no cracking gasoline, so syngas must be burned to raise steam: 173.52/s
of it at R4, collapsing exportable syngas from 238.46/s to **15.97/s — a 93% cut.** Since syngas is the
mining fluid for borax, phosphate-rock, chromium and nickel, turning the anthracene dial toward
creosote quietly throttles four ore supply lines. Nothing stalls and no alarm fires; the ore outposts
simply run dry. Burning surplus aromatics ahead of syngas recovers most of it (15.97 → 64.7/s at R4) —
see the fuel priority below. The collapse is a consequence of burn *order*, not of the dial alone.

**The anthracene dial swings the block from a 330 MW exporter to a 17 MW importer.** Cracking upgrades
anthracene (0.25 MJ) into gasoline (1.20 MJ) — 154.79/s anthracene becomes 61.92/s gasoline, turning
38.7 MJ/s into 74.3 MJ/s plus coke. Routing it to creosote instead produces a non-fuel. So `x` is not
merely a product-mix choice; it is the block's energy budget.

**The block cannot self-power in full-creosote mode.** At `x=0` (R4/R5) surplus fuel no longer covers
the block's own electric draw and grid import is required. Plan the power connection for this even if
you intend to run `x=1`.

### Boiler fuel priority — order by opportunity cost, not fuel value

**naphthalene-oil → carbolic-oil → surplus hydrogen → gasoline → surplus aromatics → syngas.**

Rank by what burning *destroys*, not by MJ/unit. Gasoline is the densest fuel here (1.20 MJ) but it has
no material use at all, so it should burn before aromatics (0.35 MJ) and syngas (0.40 MJ) even though
they are "cheaper" per unit — those two are mining fluids, and burning them competes directly with ore
extraction. Coke (5.00 MJ) is never burned; it is acetylene feedstock.

Naphthalene and carbolic go first because they have no non-fuel consumer whatsoever besides creosote
conversion. This is a **correctness** requirement, not an optimization: get it backwards and they back
up, stalling `tar-refining-tops` and `pitch-refining`, which halts the chain. The two cover 34% of
process steam at `n=0`.

**Burning surplus aromatics is how you protect syngas export in creosote mode.** Aromatics is the
largest stream with no consumer — at R2, 99.77/s produced against ~16.5/s drawn (polybutadiene 11.67,
plastic 1.59, zinc mining fluid 3.23). Reserving ~20/s for those and burning the rest:

| Corner | syngas export, aromatics reserved | syngas export, **surplus aromatics burned** |
|---|--:|--:|
| R1, R2, R3 | 151.20 / 238.46 / 238.46 | unchanged — gasoline already covers process steam |
| **R4** | 15.97 | **64.7** |
| **R5** | 20.80 | **53.1** |

A 4× recovery at the creosote corners. The trade is one ore's fluid (zinc, 4/ore) against four
(borax, phosphate-rock, chromium, nickel), so burning aromatics ahead of syngas is clearly right. At
R1–R3 it never triggers: cracking gasoline covers process steam outright and both mining fluids stay
fully exportable.

**Process boilers: 11** (sized for R2/R3's 626.48 steam/s). Power island: boiler+turbine pairs to taste,
each pair 60 steam/s → 29.61 MW. Two pairs make the block self-sufficient at every dial position; 13
pairs would be required to burn all of R2's surplus.

**Surplus fuel is only surplus *power* if something draws it.** Generators consume steam in proportion
to electrical load — build 13 pairs into a grid that wants 40 MW and the other 330 MW of capacity sits
idle, steam backs up, boilers stop, and the fuel backing up behind them throttles the chain. The net
power figures above are therefore a *ceiling* on what the block could supply, not a quantity it
produces unconditionally. Any surplus the grid does not absorb must leave as a fluid export instead.
Size the turbine bank to real load and treat the remainder as fluid to export.

## Mining fluid role

Of the 14 fluid-mined ore patches, this block supplies the fluid for 6 directly and 3 more via coke:

| Fluid | From | Ores served (fluid per ore) |
|---|---|---|
| **syngas** | this block | borax (2.5), phosphate-rock (5), ore-chromium (4), ore-nickel (4) |
| **aromatics** | this block | ore-zinc (4) |
| **coal-gas** | this block, dial `g` | ore-aluminium (10) |
| **acetylene** | coke → separate block | ore-lead (10), ore-titanium (4), quartz-rock (3) |

Rates are per ore mined, already divided by 10 — prototype `fluid_amount` is per 10 mining operations
(`src/commands/inventory.ts:267`).

This is why syngas export matters beyond fuel value: it is the mining fluid for nickel, chromium,
borax and phosphate-rock. Burning syngas for steam competes directly with ore extraction.

### Coal-gas tap (dial `g`) — the expensive one

`ore-aluminium` requires 10 coal-gas per ore, and `aluminium-plate-1` smelts 10 ore → 1 plate. So
**1/s aluminium-plate costs 100/s coal-gas** — against the block's 108/s total at `f=0`.

Tapping is linear at `f=0`: `tar = 67.5 + 0.6 × (108 − g)`. Per 1/s coal-gas diverted you lose 1.4/s
syngas directly, plus 0.4535% of every tar-derived product. At `g = 100` (one aluminium plate per
second):

| Product | at g=0 | at g=100 | change |
|---|--:|--:|--:|
| syngas | 151.20 | 11.20 | −93% |
| coke | 36.70 | 20.06 | −45% |
| aromatics | 56.89 | 31.09 | −45% |
| gasoline | 90.36 | 49.37 | −45% |
| creosote | 31.75 | 17.35 | −45% |

**The `aluminium-plate-3` escape route is not available at current tech** — the ore route and its
coal-gas mining fluid are the only option, so dial `g` is real and must be planned for.

**Do not serve it from this block's coal-gas at any meaningful rate.** 1/s aluminium-plate consumes
roughly half the block's entire chemical output. The two viable options:

1. **Dedicated coal-gas at the aluminium outpost.** 1 distilator = 5/s raw-coal → 30/s coal-gas, so
   ~3.3 distilators and 16.7/s raw-coal covers 100/s. The catch is 50/s of tar as a byproduct needing
   the full refining chain — this relocates the byproduct problem rather than solving it, unless the
   tar is shipped back here.
2. **A second stamp of this block**, which handles its own tar by construction. At 15/s raw-coal a
   stamp yields 108/s coal-gas — almost exactly 1/s aluminium-plate's requirement, with the rest of the
   chemical output as the dividend.

Option 2 is the cleaner answer precisely *because* coal-gas is so expensive here: anything that
produces 100/s of it is, by construction, nearly a whole coal block. Treat aluminium demand as sizing
input for stamp count, not as a dial position on an existing stamp. Size the coal-gas station and pipe
for a tap regardless, so a partial draw is available without a rebuild.

## Feasibility envelope

Not every combination of targets is reachable. Check policy feasibility before wiring control for it
(design guide § Power & energy).

**Infeasible: net-zero gasoline *and* net-zero syngas simultaneously.** Process steam demand is
357.21/s at R1. Naphthalene + carbolic + syngas alone supply 366.6 steam/s — already over, before
gasoline is counted. No dial position consumes both fully. Surplus fuel is structural: export it as
fuel, or convert it to electricity. Do not try to tune it to zero.

**Infeasible: full coke export at `f > 0`.** Each unit recycled yields 0.411 additional coke through
the tar→pitch→coke cascade, so `export(f) = (1−f) × 36.70 / (1 − 0.411f)`. Since the gain is below 1
the loop never self-sustains — recycling can only trade chemicals for coke, never grow total coke.
**36.70/s (f=0) is a hard ceiling.**

**Tight: coke for acetylene.** 260/s acetylene needs 24.4/s coke (10 coke per 100 acetylene; 9.375 with
slacked-lime recycling). R5 yields only 21.22/s — short. Acetylene demand requires `x=1` as well as
`f=0`, i.e. corner R1.

## Operating policies

Worked dial positions for common intents.

| Policy | Dials | Result |
|---|---|---|
| **Max coke** (acetylene active) | f=0, x=1, n=0 | 36.70/s coke, +204 MW, R1 |
| **Max chemicals** | f=1, x=1, n=0 | 238/s syngas, 99.8/s aromatics, +330 MW, R2 |
| **Max creosote** | f=1, x=0, n=1 | 212.32/s creosote, −16.7 MW, R4 |
| **Max power export** | f=1, x=1, n=0 | +330 MW, R2 |
| **Net-zero gasoline** | f=0, **x≈0.32**, n=0 | 0 gasoline export, 73.85/s creosote, 26.23/s coke |

### Single-export policy — gasoline as the only exported fluid

A stated preference: if exactly one fluid must leave as surplus, make it gasoline. **This is feasible —
but it is conditional on grid electricity demand, not free.** The non-gasoline surplus has to go
somewhere, and the only non-fluid destination is a turbine. Generators draw steam in proportion to
actual electrical load, so electricity is a sink **only up to what the grid consumes**:

```
E  ≤  S  +  D / 0.4935
```

`E` = non-gasoline burnable (steam/s), `S` = process steam, `D` = total grid demand (MW), including the
block's own draw.

| | non-gasoline `E` | process `S` | excess | **grid demand required** | beyond block draw |
|---|--:|--:|--:|--:|--:|
| R1 | 425.97 | 357.21 | 68.76 | **33.9 MW** | 12.4 MW |
| R2 | 725.48 | 626.48 | 99.00 | **48.9 MW** | 5.6 MW |

Satisfied comfortably in practice — design 07 alone imports 79 MW — but verify it rather than assume it.

**If the condition fails, the block throttles rather than simply exporting more.** Syngas is last in
burn priority, so it backs up first. A full syngas buffer stalls the gasifiers; that backs up coal-gas
*and* drops tar by 49%, since the gasifier supplies half of it. The whole chain slows. The relief valve
is exporting syngas — precisely the second export this policy exists to avoid. Size the turbine bank
and confirm the load before committing to gasoline-only.

At R1 (`f=0, x=1, n=0` — creosote already at its floor), with named taps at design-07 scale
(aromatics ~16.5/s, hydrogen 13.31/s) and everything else burned:

| non-gasoline fuel burned | steam/s |
|---|--:|
| syngas (untapped) | 245.11 |
| naphthalene (no choice) | 93.29 |
| carbolic (no choice) | 28.16 |
| surplus aromatics | 57.30 |
| surplus hydrogen | 2.11 |
| **total** | **425.97** |
| process steam needed | −357.21 |
| **excess → turbines** | **68.76** (33.9 MW) |

Result: **export 90.36/s gasoline — 100% of production — with every other fluid consumed internally
and +12.4 MW net power** after the block's own 21.48 MW draw.

**Exchange rate: 3 syngas = 1 gasoline, exactly.** Both burn in the same boiler at the same
effectivity, so fuel exports trade at their fuel-value ratio (1.20 / 0.40 = 3). The first 42.4/s of
syngas tap is free — it comes out of the 68.76 steam/s excess. Past that, each 3/s syngas exported
costs 1/s of gasoline export:

| syngas tapped /s | gasoline export /s | net power MW |
|---|--:|--:|
| 0 | **90.36** | +12.4 |
| 42.4 | **90.36** | −21.5 |
| 151.20 (all) | **54.09** | −21.5 |

Generally `1 gasoline = 3 syngas = 3.43 aromatics = 4 naphthalene = 12 hydrogen`. Since energy is
conserved across the choice, **which** fluid to export is decided purely by non-fuel value and
throughput density — and gasoline wins the latter outright at 1.20 MJ/unit, 3× syngas per unit of pipe
or train capacity. One station instead of three.

**This is a weaker constraint than the infeasible one.** Net-zero on gasoline *and* syngas
simultaneously is impossible (§ Feasibility envelope). Net-zero on everything *except* gasoline is
straightforward, because gasoline absorbs all the slack. Burning the other streams is what makes the
single-export policy work, not what obstructs it.

**Net-zero gasoline** is interpolated, not solved. Gasoline is linear in `x`: `28.44 + 61.92x` (the
28.44 floor comes from `light-oil-aromatics`, independent of the split). Burning naphthalene + carbolic
covers 121.5 steam/s of the 357.21 needed, leaving 48.48/s of gasoline to burn — set production equal
to that and `x ≈ 0.32`. Valid because the LP is linear and R1/R5 share identical steam demand, but
confirm before trusting the coke margin: 26.23/s against acetylene's 24.4/s is only ~7%, and pushing
below `x ≈ 0.29` starves acetylene before gasoline shows any sign of trouble.

## Value routes (demand-bounded)

Sized to plausible demand, not upstream capacity. Counts constant across dials.

```
┌──────────────────────┬─────────────────┬───────┬──────────────────────────────────┐
│ Recipe               │ Factory         │ Count │ Headroom vs design 07 draw       │
├──────────────────────┼─────────────────┼───────┼──────────────────────────────────┤
│ aromatics-to-plastic │ biofactory-mk01 │     1 │ ~20×                             │
│ polybutadiene        │ cracker-mk01    │     1 │ feedstock-capped — see below     │
│ carbon-black         │ reformer-mk01   │     1 │ 2.7× what rubber can consume     │
│ vacuum               │ vacuum-pump-mk01│     1 │ feeds carbon-black (100/s cap)   │
└──────────────────────┴─────────────────┴───────┴──────────────────────────────────┘
```

75.1 kW combined — negligible against the core chain's 21–47 MW.

### Draw ceilings

What the block *could* supply if these routes were pushed to the feedstock limit. The two are not
symmetric, because of which node each taps.

**Polybutadiene — cheap, bounded by aromatics.** `1 titanium-plate + 200 aromatics + 1000 water →
100 polybutadiene + 1000 steam` (2s, cracker-mk01). One cracker at full draws 100/s aromatics → 50/s
polybutadiene.

| Corner | Aromatics /s | Max polybutadiene /s | Crackers | Titanium-plate /s |
|---|--:|--:|--:|--:|
| R1 / R5 | 56.89 | 28.45 | 0.57 | 0.28 |
| **R2 / R3** | **99.77** | **49.89** | **1.00** | 0.50 |
| R4 | 75.70 | 37.85 | 0.76 | 0.38 |

**One cracker is the entire ceiling at every corner** — feedstock binds, never the building. Hidden
cost is titanium: `titanium-plate-1` is 40 ore → 4 plate and ore-titanium needs 4 acetylene/ore, so
0.50/s titanium-plate works back to roughly **2/s coke** through the acetylene chain. Structurally
cheap otherwise: aromatics never enters the fuel budget at R1–R3.

**Carbon-black — expensive, bounded by anthracene-oil.** `200 anthracene-oil + 100 vacuum →
4 carbon-black` (2s, reformer-mk01). One reformer draws 100/s anthracene → 2/s carbon-black. The ratio
is brutal — 50 anthracene per carbon-black.

| Corner | Anthracene /s | Max carbon-black /s | Reformers | Vacuum /s |
|---|--:|--:|--:|--:|
| R1 / R5 | 154.79 | 3.10 | 1.55 | 77 |
| R2 | 271.48 | 5.43 | 2.71 | 136 |
| R4 | 205.99 | 4.12 | 2.06 | 103 |

**Carbon-black is effectively a fifth dial on the `x` node** and inherits all of `x`'s coupling. One
reformer takes 65% of R1's anthracene, starving cracking — which produces the gasoline that covers
process steam, which is what keeps syngas exportable. At R1 with one reformer running, non-syngas fuel
falls to 373.8 steam/s against 357.21 needed: survivable, but the margin is nearly gone. Treat any
second reformer as a deliberate trade against syngas export.

### Rubber ceiling — the number that matters

`rubber-01` is `1 latex + 2 carbon-black + 50 polybutadiene → 1 rubber` (heavy-oil-refinery-mk01,
electric 16.7 kW, 13×13). That ratio is 25 polybutadiene per carbon-black, so **polybutadiene binds**:

- from polybutadiene: 49.89 / 50 = **1.00/s rubber**
- from carbon-black: 5.43 / 2 = 2.72/s rubber

**1 cracker + 1 reformer + 1 vacuum-pump → ~1.0/s rubber ceiling**, which is 8.5× design 07's 0.117/s
draw. Carbon-black at one reformer already supplies 2.7× what rubber can absorb — there is no reason
to build a second.

**Keep polybutadiene, carbon-black and vacuum here; put `rubber-01` and `stopper-2` where latex is.**
That places the boundary at the bio dependency rather than mid-tar-chain, and ships two finished items
instead of two awkward intermediates (anthracene-oil especially).

### Polybutadiene steam is 150°C — not usable as process steam

Polybutadiene emits 1000 steam/craft, 500/s at full tilt, which looks like it would cover 80% of
process steam for free. It will not: that steam carries `temperature: 150`, and `tar-refining` requires
`minimum_temperature: 250`. This is why design 07 routes it to a cooling tower.

It is not worthless. Reheating 150°C steam to 250°C costs `(250−150) × 2100 = 210 kJ/unit` against
`(250−15) × 2100 = 493.5 kJ/unit` from cold water — a 57%-preheated feedstock, worth ~140 MW of heat at
full flow. Needs an exchanger that accepts steam rather than water; unverified whether
`py-heat-exchanger` does. This is the concrete instance of the open pipe-temperature-mixing question.

### `sand-casting` — sand supply resolved, covers ~56% of minimum creosote

Sand comes from the acetylene block's slacked-lime waste, via gravel:

```
260/s acetylene → 65/s slacked-lime
  slacked-lime-void   60 slacked-lime → 1 lime + 1 gravel   →  1.083/s gravel + 1.083/s lime
  gravel-to-sand      4 gravel → 3 sand                     →  0.8125/s sand
  sand-casting        5 sand + 20 creosote → 2 sand-casting →  3.25/s creosote sunk, 0.325/s castings
```

| sand source | sand /s | creosote sunk /s | % of 31.75/s minimum |
|---|--:|--:|--:|
| slacked-lime → gravel → sand | 0.81 | 3.25 | 10% |
| design 07 soil-separation surplus | 3.61 | 14.44 | 45% |
| **combined** | **4.42** | **17.69** | **56%** |

So sand-casting handles a bit over half the creosote floor; the remainder still needs treated-wood or
export. It does not scale with creosote either — the slacked-lime term is pinned to acetylene
production, so pushing creosote higher does not bring more sand with it.

**Route all gravel to sand, none to concrete.** With sand-casting as the priority there is no gravel
left for concrete, which is the simpler configuration anyway: all 1.083/s lime then recycles to
calcium-carbide, cutting coke demand ~3.6%, and the awkward 1:2 lime:gravel mismatch with the concrete
recipe never arises. Concrete becomes an overflow destination for lime only if the acetylene chain
backs up.

**Imports for value routes:** titanium-plate ~0.07/s (design 07 produces it), water.

## Byproduct sinks

| Product | Sink | Notes |
|---|---|---|
| naphthalene-oil, carbolic-oil | boiler fuel, top priority | no non-fuel consumer except creosote conversion |
| gasoline | boiler → turbine, or export as fuel | no material use, so burn it before either mining fluid |
| **aromatics** | polybutadiene + plastic + zinc mining (~20/s), **burn the surplus** | largest unconsumed stream — 83/s spare at R2. Burning it ahead of syngas is what lifts R4/R5 syngas export 4× |
| syngas | export as mining fluid; burn only as last resort | serves 4 ores — the most expensive fluid to burn |
| hydrogen | ralesia + diborane (13.31/s), burn surplus | ~5/s spare |
| creosote | e-circuit → sand-casting → treated-wood | **not a fuel**; material sink mandatory |
| coke | acetylene chain, or recycle via `f` | 36.70/s ceiling |
| ash | `log3` in forestry (5 ash/log, 1.5× logs/seedling vs log2); planter-box export; `rich-clay` | 2.16–6.52/s |
| iron-oxide | `iron-oxide-smelting` (20 → 10 iron-plate) | 0.435/s → 0.22/s free plate |

No sinkholes (project ruleset; tier-1 gases may be vented, liquids and solids may not — CLAUDE.md § Rules). `py-limestone` (3 ash + 10 limestone + 35 creosote) looks like an ideal dual ash+creosote
sink but has **zero consumers** at current tech — dead end.

Full forestry and slacked-lime/concrete sink details carry over unchanged from design 08 § Byproduct
sinks; they are independent of the dial framing.

## Relation to design 08

Design 08 was the learning experiment — it established the chain structure, the recipe set, and the
byproduct sinks, and it is where the naphthalene/carbolic stall, the creosote `fuel_value: 0` fact, and
the water under-reporting were found. Its four "modes" are corners R1, R2/R3, R4, R5 of this dial space.

All solver work here is fresh. The fresh runs reproduced design 08's core counts exactly except for one
recipe:

- `naphthalene-oil-creosote` envelope is **6**, not 5 — the peak is at `f=1 x=1 n=1` (R3), a position
  design 08's mode set never ran. Core envelope is therefore **107** against design 08's **106**.

The value routes are the same 4 buildings in both docs; demand-bounding did not shrink them, it only
made the justification explicit and recorded *why* they stop at 1 each. The real gains here are not
fewer buildings but the couplings the mode table hid: the power swing, the syngas-export collapse at
`x = 0`, and dial `g`'s cost.

## The drawable-energy budget

The four production dials (`f`, `x`, `n`, `g`) are only half the control surface. The other half is the
**draw dials** — how much of each product leaves as material rather than going to the boilers. These are
not independent of each other: every fuel-capable product drawn as material removes its fuel value from
the steam supply, so they all compete in **one shared budget**.

```
Σ (draw_i × fuel_value_i)  ≤  Σ (production_i × fuel_value_i)  −  process_steam × 0.24675
```

The 0.24675 is MJ of fuel per unit of steam (0.4935 ÷ 2 for oil-boiler effectivity). Each draw is
priced at its own fuel value, so a unit of gasoline drawn costs 3× a unit of syngas drawn.

### Budget by dial position

| f | x | n | creosote /s | **drawable budget MJ/s** |
|---|---|---|--:|--:|
| 1 | 1 | 0 | 55.69 | **221.70** |
| 1 | 1 | 1 | 171.24 | **169.15** |
| 0 | 1 | 0 | 31.75 | **132.49** |
| 0 | 1 | 1 | 97.64 | **102.53** |
| 0 | 0 | 0 | 93.66 | **58.19** |
| 1 | 0 | 1 | 212.32 | **32.89** |
| 0 | 0 | 1 | 159.55 | **28.22** |

**Max creosote cuts the drawable budget to 13% of maximum.** Creosote is the only non-fuel product in
the block, so every unit is energy permanently removed from the budget — and then it costs buildings to
dispose of on top of that.

Note the `f=1, x=0, n=1` row: coke recycling nearly doubles tar throughput and adds ~20 active
buildings, yet raises the drawable budget only from 28.22 to 32.89 MJ/s, because the entire
amplification lands in creosote. **At `x=0`, recycling coke is close to energetically pointless** — it
buys creosote volume, not capability.

### Worked example

`f=0, x=0, n=1`, drawing all aromatics and all hydrogen:

| | MJ/s |
|---|--:|
| gasoline 28.44 × 1.20 | 34.13 |
| syngas 151.20 × 0.40 | 60.48 |
| aromatics 56.89 × 0.35 | 19.91 |
| hydrogen 18.52 × 0.10 | 1.85 |
| **total fuel produced** | **116.37** |
| process steam (357.21 steam/s) | −88.15 |
| **drawable budget** | **28.22** |
| draw all aromatics | −19.91 |
| draw all hydrogen | −1.85 |
| **remaining for syngas** | **6.46** → **16.17/s** |

Aromatics alone consumes 71% of the budget at this dial position. Hydrogen is a rounding error at
1.85 MJ/s — at 0.10 MJ/unit it is the worst fuel in the block and should be treated as material-only.

## Creosote route ordering

The three creosote recipes destroy very different amounts of fuel value per unit produced. This was not
obvious from volume ratios alone:

| Route | ratio | **MJ destroyed per creosote** |
|---|---|--:|
| `carbolic-oil-creosote` | 50 → 50 | **0.35** |
| `naphthalene-oil-creosote` | 50 → 30 | **0.50** |
| `anthracene-oil-creosote` | 50 → 20 | **0.625** |

**Take creosote from carbolic first, then naphthalene, then anthracene.** Carbolic is 1:1 by volume and
cheapest energetically. Anthracene is worst on both counts *and* it is the stream that would otherwise
have become gasoline and coke, so it carries an opportunity cost the other two do not.

This is the underlying reason `x=1, n=1` outperforms `x=0` across every policy tested in this document:
`n=1` buys creosote from the two streams that have no alternative use, while `x=0` buys it from the one
that was producing your fuel and your coke.

## Dials considered and rejected

Three further dials exist in the recipe space. All are currently unusable, but two are worth revisiting
as tech unlocks.

**`tar-distilation` — the zero-creosote route. Blocked on flue-gas disposal.**
`350 tar → 1 rich-clay + 500 flue-gas + 100 carbon-dioxide + 100 aromatics` (2.5s, distilator). It
produces **no creosote at all** — which would take the 31.75/s floor to actual zero, plus aromatics
directly with no steam input. The blocker is flue-gas: 500 per 350 tar, and its only unlocked consumer
is barreling. `fluegas-filtration` (100 → 2 ash) and `fluegas-to-syngas` (3000 + active-carbon → 300
syngas) are both confirmed locked in `force.recipes`. So it is a post-filtration upgrade, and a strong
one: it converts the creosote disposal problem into syngas.

Available, but out of scope — deferred on the flue-gas sink, not the recipe.

**`tar-to-carbolic` — zero creosote, no flue-gas, but anti-aligned with the gasoline preference.**
`1 raw-coal + 100 tar + 100 steam → 1 rich-clay + 1 ash + 35 coal-gas + 10 carbolic-oil` (5s, distilator).
Unlocked, no flue-gas, and it recycles tar back into coal-gas (which re-enters the gasifier, making more
tar — a second feedback path). But it yields no anthracene, pitch, or light-oil, so it produces **no
gasoline and no coke**. It crushes creosote to zero at the cost of everything the single-export policy
depends on. Only relevant if creosote disposal ever becomes the binding constraint.

**`syngas2` — strictly better than `syngas`, but locked.**
`50 coal-gas + 60 oxygen + 100 water → 1 ash + 100 syngas + 30 tar`. Same coal-gas, same 30 tar, but
**100 syngas instead of 70** — a 43% boost for 60 oxygen per craft. Confirmed locked. Worth switching to
the moment it unlocks *and* an oxygen supply exists; at 11 gasifiers that is a large oxygen draw
(~120–180/s), so it needs a dedicated source rather than electrolyser surplus. Note the block's
hydrogen output already displaces design 07's electrolyser, which removes the incidental oxygen that
would otherwise have been available — worth revisiting together.

## Notes

- Water: the solver reports `steam` and `water` separately, but boilers make steam from water 1:1. Real
  water import is `steam + water` — 573.21/s at R1, **967.14/s at R2/R3**. One offshore pump (1200/s)
  covers every position; size the trunk pipe for R2.
- Syngas supplies 49% of all tar at `f=0` (64.80 of 132.30/s). It is the tar amplifier, not a byproduct.
- Raw-coal is 3.00 MJ. Burning 15/s directly gives 45 MW; processing it yields 200.73 MJ/s in fluid
  fuels plus 36.70/s coke — a 4.5× energy multiplier before counting materials. Coal-to-power directly
  is a trap; the multiplier lives in the chain.
- Only `anthracene-gasoline-cracking` (22) and `anthracene-oil-creosote` (9) are mutually exclusive —
  31 buildings of which one set is always idle, the cost of a capacity-sized disposal route. The
  naphthalene and carbolic creosote units (8) are **not** exclusive with cracking: R3 runs all three
  together, which is exactly why the `naphthalene-oil-creosote` envelope is 6 rather than 5.
- Idle buildings cost nothing (design guide rule 13). The envelope is deliberately the max.

## Build materials

Distinct items needed to **construct** this block's buildings — separate from the flow imports,
and several appear nowhere in the solve. Quantities are omitted deliberately: the binding question is
whether you have *any*, since a small amount can be hand-fed or trickled while a zero is a hard stop.
Regenerate with `node scripts/build-materials.mjs data/designs/09-coal-chemicals-dials.md`.

| Material | Needed by |
|---|---|
| `small-parts-01` | biofactory-mk01, cracker-mk01, distilator +6 |
| `iron-plate` | cracker-mk01, distilator, gasifier +4 |
| `pipe` | distilator, gasifier, py-heat-exchanger +3 |
| `steam-engine` | biofactory-mk01, cracker-mk01, distilator +3 |
| `steel-plate` | biofactory-mk01, gasifier, reformer-mk01 +3 |
| `electronic-circuit` | biofactory-mk01, cracker-mk01, py-heat-exchanger +2 |
| `inductor1` | distilator, gasifier, tar-processing-unit |
| `intermetallics` | oil-boiler-mk01, py-heat-exchanger, steam-turbine-mk01 |
| `duralumin` | biofactory-mk01, steam-turbine-mk01 |
| `lab` | cracker-mk01, oil-boiler-mk01 |
| `titanium-plate` | biofactory-mk01, cracker-mk01 |
| `automated-factory-mk01` | py-heat-exchanger |
| `brake-mk01` | steam-turbine-mk01 |
| `copper-plate` | distilator |
| `electric-mining-drill` | oil-boiler-mk01 |
| `gearbox-mk01` | steam-turbine-mk01 |
| `glass` | biofactory-mk01 |
| `lead-plate` | cracker-mk01 |
| `mechanical-parts-01` | py-heat-exchanger |
| `py-tank-7000` | py-heat-exchanger |
| `shaft-mk01` | steam-turbine-mk01 |
| `stone-furnace` | tar-processing-unit |
| `utility-box-mk01` | steam-turbine-mk01 |
