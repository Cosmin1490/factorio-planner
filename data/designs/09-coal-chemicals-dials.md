# Coal chemicals — 15/s raw-coal, dial-controlled, 111 buildings

Supply-driven block: one yellow belt of raw-coal in, continuously-variable product mix out.
Supersedes the mode framing of designs 04/05/08 — see § Relation to design 08.

**Primary role: mining fluid hub.** This block produces the mining fluid for 6 of the 14 fluid-mined
ores directly, and feeds the acetylene chain that covers 3 more. Chemicals are the co-product.

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

**Every maximum lands at a corner, and `f=1` drives all but two.** The envelope assumes each recipe's
count is monotonic in each dial. That holds structurally — more recycling raises throughput with no
negative term, and more of a branch raises that branch's buildings — but interior dial positions were
not solved. The one non-obvious case confirms the prediction: `naphthalene-oil-creosote` peaks at
`x=1`, not `x=0`, because cracking produces coke → stronger recycle loop → more pitch → more
naphthalene. If any recipe did peak in the interior, the corner envelope would under-size it; worth one
interior run before committing the blueprint.

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
| **syngas left to export** /s | **151.20** | **238.46** | **238.46** | **15.97** | **20.80** |
| **net power MW** | **+203.7** | **+330.3** | **+221.8** | **−16.7** | **−3.7** |

**`x = 0` cannibalises the mining fluid supply — and this matters more than the power swing.** At
`x = 1` the gasoline from cracking covers process steam outright, so the entire syngas output is free
to export. At `x = 0` there is no cracking gasoline, so syngas must be burned to raise steam: 173.52/s
of it at R4, collapsing exportable syngas from 238.46/s to **15.97/s — a 93% cut.** Since syngas is the
mining fluid for borax, phosphate-rock, chromium and nickel, turning the anthracene dial toward
creosote quietly throttles four ore supply lines. Nothing stalls and no alarm fires; the ore outposts
simply run dry.

**The anthracene dial swings the block from a 330 MW exporter to a 17 MW importer.** Cracking upgrades
anthracene (0.25 MJ) into gasoline (1.20 MJ) — 154.79/s anthracene becomes 61.92/s gasoline, turning
38.7 MJ/s into 74.3 MJ/s plus coke. Routing it to creosote instead produces a non-fuel. So `x` is not
merely a product-mix choice; it is the block's energy budget.

**The block cannot self-power in full-creosote mode.** At `x=0` (R4/R5) surplus fuel no longer covers
the block's own electric draw and grid import is required. Plan the power connection for this even if
you intend to run `x=1`.

**Boiler fuel priority: naphthalene → carbolic → gasoline → syngas.** Naphthalene and carbolic have no
non-fuel consumer besides creosote conversion, so they must burn first. Get this backwards and they
back up, stalling `tar-refining-tops` and `pitch-refining` — which halts the chain. The two cover 34%
of process steam at `n=0`.

**Process boilers: 11** (sized for R2/R3's 626.48 steam/s). Power island: boiler+turbine pairs to taste,
each pair 60 steam/s → 29.61 MW. Two pairs make the block self-sufficient at every dial position; 13
pairs would capture all of R2's surplus.

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

**Conclusion: do not serve aluminium from this block's coal-gas.** 1/s aluminium-plate consumes roughly
half the block's entire chemical output. Options, in order of preference:

1. **Check whether aluminium needs ore-aluminium at all.** `aluminium-plate-3` casts from
   molten-aluminium + sand-casting at 1:50 versus the ore route's 10:1. If molten-aluminium comes from
   a bauxite/alumina chain, the coal-gas mining draw disappears entirely. Resolve this before sizing
   anything — it is the decision that determines whether dial `g` matters.
2. **Dedicated coal-gas at the aluminium outpost.** 1 distilator = 5/s raw-coal → 30/s coal-gas. But it
   also yields 15/s tar needing the full refining chain, so this exports the byproduct problem rather
   than solving it.
3. **A second stamp of this block** if aluminium is wanted at scale alongside the chemicals.

Size the coal-gas station and pipe for a tap, but leave `g = 0` until option 1 is resolved.

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
│ polybutadiene        │ cracker-mk01    │     1 │ 8.6× (50/s cap vs 5.83/s)        │
│ carbon-black         │ reformer-mk01   │     1 │ 10× (2/s cap vs ~0.2/s)          │
│ vacuum               │ vacuum-pump-mk01│     1 │ feeds carbon-black               │
└──────────────────────┴─────────────────┴───────┴──────────────────────────────────┘
```

75.1 kW combined — negligible against the core chain's 21–47 MW.

**`sand-casting` deferred.** It is the best creosote sink (perpetual smelting demand, 2–11 TPU), but
needs 7.94–53/s sand against design 07's 3.61/s surplus. Gated on a sand supply decision, not on
capacity here.

**Imports for value routes:** titanium-plate ~0.07/s (design 07 produces it), water.

## Byproduct sinks

| Product | Sink | Notes |
|---|---|---|
| naphthalene-oil, carbolic-oil | boiler fuel, top priority | no non-fuel consumer except creosote conversion |
| gasoline, syngas, hydrogen | boiler → turbine, or export | syngas also a mining fluid — prefer export |
| creosote | e-circuit → sand-casting → treated-wood | **not a fuel**; material sink mandatory |
| coke | acetylene chain, or recycle via `f` | 36.70/s ceiling |
| ash | `log3` in forestry (5 ash/log, 1.5× logs/seedling vs log2); planter-box export; `rich-clay` | 2.16–6.52/s |
| iron-oxide | `iron-oxide-smelting` (20 → 10 iron-plate) | 0.435/s → 0.22/s free plate |

No sinkholes. `py-limestone` (3 ash + 10 limestone + 35 creosote) looks like an ideal dual ash+creosote
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
