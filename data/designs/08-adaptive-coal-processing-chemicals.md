# Adaptive coal processing + chemicals — 15/s raw-coal, 122 buildings

Multi-mode coal refining at one yellow belt throughput with integrated downstream chemistry.
Anthracene to gasoline+carbon-black OR creosote, coke recycled OR exported.
Syngas always on (plastic production). Self-powered via oil-boiler-mk01.

Consumers served: py-science (0.4/s, coke→acetylene via separate block), logistic science (0.1/s, aromatics/syngas/coke/hydrogen), e-circuit (creosote), future.

## Master recipe table

Max mk01 building count across all 4 modes. Solver-validated (input mode, 900 raw-coal/60s).

```
┌──────────────────────────────┬─────────────────────┬───────┬──────────────────────────┐
│ Recipe                       │ Factory             │ Count │ Driven by                │
├──────────────────────────────┼─────────────────────┼───────┼──────────────────────────┤
│ distilled-raw-coal           │ distilator          │     3 │ all                      │
│ coal-gas                     │ distilator          │     2 │ all                      │
│ coal-gas-from-coke           │ distilator          │    16 │ A1 cracking+coke+syngas  │
│ tar-refining                 │ tar-processing-unit │    12 │ A1 cracking+coke+syngas  │
│ pitch-refining               │ distilator          │    17 │ A1 cracking+coke+syngas  │
│ tar-refining-tops            │ tar-processing-unit │     3 │ A1/B1 coke recycled      │
│ light-oil-aromatics          │ distilator          │     4 │ A1/B1 coke recycled      │
│ anthracene-gasoline-cracking │ distilator          │    22 │ A1 cracking+coke+syngas  │
│ syngas                       │ gasifier            │    11 │ A1 cracking+coke+syngas  │
│ anthracene-oil-creosote      │ tar-processing-unit │     9 │ B1 creosote+coke+syngas  │
│ naphthalene-oil-creosote     │ tar-processing-unit │     5 │ B1 creosote+coke+syngas  │
│ carbolic-oil-creosote        │ tar-processing-unit │     2 │ B1 creosote+coke+syngas  │
│ aromatics-to-plastic         │ biofactory-mk01     │     1 │ downstream               │
│ polybutadiene                │ cracker-mk01        │     1 │ downstream               │
│ carbon-black                 │ reformer            │     1 │ downstream               │
│ vacuum                       │ vacuum-pump         │     1 │ downstream               │
│ (boilers)                    │ oil-boiler-mk01     │    12 │ A1 cracking+coke+syngas  │
└──────────────────────────────┴─────────────────────┴───────┴──────────────────────────┘
```

64 distilator + 31 tar-processing-unit + 11 gasifier + 1 biofactory-mk01 + 1 cracker-mk01 + 1 reformer + 1 vacuum-pump + 12 oil-boiler-mk01 = 122 buildings.
Max electric: 43.25 MW (mode A1).

## Modes

Two independent switches: anthracene destination (cracking+carbon-black/creosote) × coke handling (recycled/exported).

### Mode A1 — cracking + carbon-black, coke recycled (max throughput)

All anthracene → gasoline cracking (carbon-black takes a small share). All coke → coal-gas-from-coke loop. Double feedback (coke + syngas tar).

```
┌──────────────────────────────┬─────────────────────┬───────┐
│ Recipe                       │ Factory             │ Count │
├──────────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal           │ distilator          │     3 │
│ coal-gas                     │ distilator          │     2 │
│ coal-gas-from-coke           │ distilator          │    16 │
│ tar-refining                 │ tar-processing-unit │    12 │
│ pitch-refining               │ distilator          │    17 │
│ tar-refining-tops            │ tar-processing-unit │     3 │
│ light-oil-aromatics          │ distilator          │     4 │
│ anthracene-gasoline-cracking │ distilator          │    22 │
│ syngas                       │ gasifier            │    11 │
└──────────────────────────────┴─────────────────────┴───────┘
90 active, 32 idle (creosote buildings)
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 15.00 |
| | steam | 626.48 |
| | water | 340.66 |

| | Outputs | Rate/s |
|---|---|---|
| | syngas | 238.46 |
| | gasoline | 158.48 |
| | aromatics | 99.77 |
| | naphthalene-oil | 134.58 |
| | carbolic-oil | 34.80 |
| | creosote | 55.69 |
| | hydrogen | 32.48 |
| | ash | 6.52 |
| | iron-oxide | 0.44 |

Intermediates: coal 4.50, coal-gas 170.33, tar 232.03, coke 62.33 (all recycled), middle-oil 69.61, anthracene-oil 271.48, pitch 324.84, light-oil 99.77.

### Mode A2 — cracking + carbon-black, coke exported (primary operating mode)

All anthracene → gasoline cracking. Coke exported (coal-gas-from-coke OFF).

```
┌──────────────────────────────┬─────────────────────┬───────┐
│ Recipe                       │ Factory             │ Count │
├──────────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal           │ distilator          │     3 │
│ coal-gas                     │ distilator          │     2 │
│ tar-refining                 │ tar-processing-unit │     7 │
│ pitch-refining               │ distilator          │    10 │
│ tar-refining-tops            │ tar-processing-unit │     2 │
│ light-oil-aromatics          │ distilator          │     3 │
│ anthracene-gasoline-cracking │ distilator          │    13 │
│ syngas                       │ gasifier            │     7 │
└──────────────────────────────┴─────────────────────┴───────┘
47 active, 75 idle
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 15.00 |
| | steam | 357.21 |
| | water | 216.00 |

| | Outputs | Rate/s |
|---|---|---|
| | coke | 36.70 |
| | syngas | 151.20 |
| | gasoline | 90.36 |
| | aromatics | 56.89 |
| | naphthalene-oil | 76.73 |
| | carbolic-oil | 19.85 |
| | creosote | 31.75 |
| | hydrogen | 18.52 |
| | ash | 2.16 |
| | iron-oxide | 0.44 |

Intermediates: coal 4.50, coal-gas 108.00, tar 132.30, middle-oil 39.69, anthracene-oil 154.79, pitch 185.22, light-oil 56.89.

### Mode B1 — full creosote, coke recycled

All anthracene/naphthalene/carbolic → creosote. Coke recycled. Carbon-black OFF.

```
┌──────────────────────────┬─────────────────────┬───────┐
│ Recipe                   │ Factory             │ Count │
├──────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal       │ distilator          │     3 │
│ coal-gas                 │ distilator          │     2 │
│ coal-gas-from-coke       │ distilator          │     7 │
│ tar-refining             │ tar-processing-unit │     9 │
│ pitch-refining           │ distilator          │    13 │
│ tar-refining-tops        │ tar-processing-unit │     3 │
│ light-oil-aromatics      │ distilator          │     4 │
│ anthracene-oil-creosote  │ tar-processing-unit │     9 │
│ naphthalene-oil-creosote │ tar-processing-unit │     5 │
│ carbolic-oil-creosote    │ tar-processing-unit │     2 │
│ syngas                   │ gasifier            │     9 │
└──────────────────────────┴─────────────────────┴───────┘
66 active, 56 idle (cracking buildings)
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 15.00 |
| | steam | 475.35 |
| | water | 270.70 |

| | Outputs | Rate/s |
|---|---|---|
| | creosote | 212.32 |
| | syngas | 189.49 |
| | aromatics | 75.70 |
| | gasoline | 37.85 |
| | hydrogen | 24.65 |
| | ash | 4.07 |
| | iron-oxide | 0.44 |

Intermediates: coal 4.50, coal-gas 135.35, tar 176.06, coke 27.35 (all recycled), middle-oil 52.82, anthracene-oil 205.99, pitch 246.48, light-oil 75.70.

### Mode B2 — full creosote, coke exported

All oils → creosote. Coke exported.

```
┌──────────────────────────┬─────────────────────┬───────┐
│ Recipe                   │ Factory             │ Count │
├──────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal       │ distilator          │     3 │
│ coal-gas                 │ distilator          │     2 │
│ tar-refining             │ tar-processing-unit │     7 │
│ pitch-refining           │ distilator          │    10 │
│ tar-refining-tops        │ tar-processing-unit │     2 │
│ light-oil-aromatics      │ distilator          │     3 │
│ anthracene-oil-creosote  │ tar-processing-unit │     7 │
│ naphthalene-oil-creosote │ tar-processing-unit │     4 │
│ carbolic-oil-creosote    │ tar-processing-unit │     1 │
│ syngas                   │ gasifier            │     7 │
└──────────────────────────┴─────────────────────┴───────┘
46 active, 76 idle
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 15.00 |
| | steam | 357.21 |
| | water | 216.00 |

| | Outputs | Rate/s |
|---|---|---|
| | creosote | 159.55 |
| | syngas | 151.20 |
| | aromatics | 56.89 |
| | gasoline | 28.44 |
| | coke | 21.22 |
| | hydrogen | 18.52 |
| | ash | 2.16 |
| | iron-oxide | 0.44 |

Intermediates: coal 4.50, coal-gas 108.00, tar 132.30, middle-oil 39.69, anthracene-oil 154.79, pitch 185.22, light-oil 56.89.

## Downstream products

Integrated downstream chemistry — always built, active when feedstock is available. Building counts are constant across modes.

```
┌─────────────────────┬─────────────────┬───────┬──────────────────────────────────────────┐
│ Recipe              │ Factory         │ Count │ Consumes → Produces                      │
├─────────────────────┼─────────────────┼───────┼──────────────────────────────────────────┤
│ aromatics-to-plastic│ biofactory-mk01 │     1 │ aromatics + syngas → plastic-bar         │
│ polybutadiene       │ cracker-mk01    │     1 │ aromatics + titanium-plate → polybutadiene│
│ carbon-black        │ reformer        │     1 │ anthracene-oil + vacuum → carbon-black    │
│ vacuum              │ vacuum-pump     │     1 │ (none) → vacuum                          │
└─────────────────────┴─────────────────┴───────┴──────────────────────────────────────────┘
```

At logistic science (0.1/s) demand, all three run at <15% utilization. Consumption is negligible relative to coal chain outputs (<1% of aromatics, syngas, anthracene-oil). Net exports = mode outputs minus downstream consumption.

Carbon-black is OFF in B modes (all anthracene-oil goes to creosote).

Polybutadiene produces 1000 steam/craft as a byproduct — at typical utilization, ~5/s steam contribution to self-power.

**Imports for downstream:** titanium-plate ~0.07/s (polybutadiene), water (polybutadiene). No new fluid imports.

**Exports from downstream:** plastic-bar, polybutadiene, carbon-black.

## Energy

Oil-boiler-mk01: effectivity=2, max 29.61 MW heat = 60 steam/s. 12 boilers = 720 steam/s capacity.

**Water accounting.** The per-mode tables list `steam` and `water` as separate inputs because that is how the solver reports them, but steam is produced on-site by the boilers from water at 1:1. Real water import is `steam + water`:

| Mode | Steam (boiler feed) | Process water (syngas) | **Total water import** |
|------|--------:|--------:|--------:|
| A1 | 626.48/s | 340.66/s | **967.14/s** |
| A2 | 357.21/s | 216.00/s | **573.21/s** |
| B1 | 475.35/s | 270.70/s | **746.05/s** |
| B2 | 357.21/s | 216.00/s | **573.21/s** |

One offshore-pump (1200/s) covers every mode. Size the trunk pipe for A1.

Fuel values (MJ/unit): gasoline 1.20, syngas 0.40, aromatics 0.35, carbolic-oil 0.35, naphthalene-oil 0.30, anthracene-oil 0.25, coal-gas 0.20, hydrogen 0.10.

Steam per unit burned (×2 effectivity): gasoline 4.86, syngas 1.62, naphthalene 1.22, aromatics 1.42, carbolic 1.42, coal-gas 0.81, hydrogen 0.41.

### A modes (cracking) — burn naphthalene + carbolic first, gasoline for the balance

Naphthalene-oil and carbolic-oil have **no material consumer** in A modes (only creosote conversion or barreling) but both are fuels. Burning them is the primary sink — zero extra buildings — and it frees gasoline, the highest-value fuel per unit, for export.

**Boiler fuel priority: naphthalene-oil → carbolic-oil → gasoline.** Without this circuit priority the boilers burn gasoline preferentially and the two oils back up, stalling tar-refining-tops and pitch-refining.

| Mode | Steam need | Naphthalene | Carbolic | Gasoline burned | Gasoline exported |
|------|--------:|--------:|--------:|--------:|--------:|
| A1 | 626.48/s | 134.58/s (all) | 34.80/s (all) | 84.95/s | **73.53/s** |
| A2 | 357.21/s | 76.73/s (all) | 19.85/s (all) | 48.44/s | **41.92/s** |

The two oils cover 34% of steam demand in A2, 34% in A1. Both scale with tar throughput, as does steam demand, so the ratio is fixed — they are always fully consumed while the block runs. Gasoline export is 2.5× what gasoline-only burning yields.

### B modes (creosote) — gasoline + syngas cover steam

| Mode | Steam need | Gasoline burned | Syngas burned | Syngas exported |
|------|--------:|--------:|--------:|--------:|
| B1 | 475.35/s | 37.85/s (all) | 179.88/s | 9.61/s |
| B2 | 357.21/s | 28.44/s (all) | 135.18/s | 16.02/s |

In B modes, aromatics and hydrogen are preserved for export/downstream (not burned). Syngas export is dramatically reduced — most goes to fuel.

## Amplification from feedback loops

The syngas recipe (coal-gas → syngas + tar) and coke recycling (coke → coal-gas-from-coke → coal-gas + tar) create positive feedback loops through tar-refining.

| Configuration | Tar throughput | Amplification vs A2 | Active buildings |
|---|---:|---:|---:|
| A2 — syngas only | 132.30/s | 1.0× | 47 |
| B2 — syngas only, creosote | 132.30/s | 1.0× | 46 |
| B1 — syngas + coke recycled, creosote | 176.06/s | 1.33× | 66 |
| A1 — syngas + coke recycled, cracking | 232.03/s | 1.75× | 90 |

A1 achieves higher amplification than B1 because anthracene-gasoline-cracking produces additional coke (5 per craft) that feeds back into the recycling loop. In B modes, anthracene → creosote produces no coke, so only pitch-refining feeds the coke loop.

## Backup behavior

| Product | Can back up? | Worst case | Mitigation |
|---|---|---|---|
| Gasoline | Yes | 158.48/s (A1) | Overflow to boiler fuel — always consumed |
| Coke | Yes (A2/B2 only) | 36.70/s (A2) | Export station needed; switch to coke-recycled if no consumer |
| Syngas | In B modes | ~10-16/s (after fuel) | Minimal export; overflow to boiler |
| Naphthalene-oil | No (A modes) | 134.58/s (A1) | Boiler fuel, top priority — no non-fuel consumer exists besides creosote conversion |
| Carbolic-oil | No (A modes) | 34.80/s (A1) | Boiler fuel, top priority — same |
| Creosote | Yes (all modes) | 212.32/s (B1) | Priority: e-circuit export → sand-casting → treated-wood. Not a fuel (`fuel_value` 0), so it cannot be burned off like the other oils — a material sink is mandatory. Sand-casting ranks above treated-wood because it yields a perpetually-demanded smelting consumable for 2–11 buildings, where treated-wood needs 7–18 and only returns fuel |
| Plastic-bar | If no consumer | <1/s | Overflow to chest with circuit control |
| Polybutadiene | If no consumer | <5/s | Overflow to chest |
| Carbon-black | If no consumer | <1/s | Overflow to chest |
| Ash | Yes | 6.52/s (A1) | `log3` in the forestry sink (5 ash/log, also 1.5× logs per seedling vs log2); export remainder to planter-box consumers; `rich-clay` as third option |
| Iron-oxide | Yes | 0.44/s (all) | `iron-oxide-smelting` (20 → 10 iron-plate) = 0.22/s free iron plate |

No product can stall the block. Every fluid is either a fuel with boiler priority (naphthalene, carbolic, gasoline, syngas) or has a material sink (creosote → sand-casting/treated-wood, coke → recycle switch, ash → log3/planter-box, iron-oxide → smelting). The one thing that *must* be wired correctly is boiler fuel priority: naphthalene and carbolic before gasoline. Get that backwards and the two oils back up, stalling tar-refining-tops and pitch-refining — which halts the whole chain.

## Mode selection guide

| Need | Recommended mode |
|---|---|
| Coke for acetylene (24.4/s at 260/s acetylene) | **A2** — 36.70/s coke export |
| Max syngas export | **A1** — 238.46/s syngas |
| Max aromatics for downstream | **A1** — 99.77/s aromatics |
| Creosote for e-circuit | **B1** — 212.32/s creosote |
| Coke + creosote | **B2** — 21.22/s coke + 159.55/s creosote (coke may be insufficient for 28/s acetylene demand) |
| No acetylene demand, max output | **A1** — all coke recycled, max throughput |

## Optional third switch — naphthalene/carbolic → creosote in A modes

A modes default to burning naphthalene-oil and carbolic-oil (see Energy). Enabling `naphthalene-oil-creosote` + `carbolic-oil-creosote` instead converts them to creosote. Solver-validated at 900 raw-coal/60s: 52 active buildings, 23.41 MW.

| | A2 default (burn) | A2 + conversion |
|---|--:|--:|
| Creosote | 31.75/s | **97.64/s** |
| Gasoline exported | 41.92/s | 16.86/s |
| Naphthalene / carbolic out | 0 (burned) | 0 (converted) |
| Extra buildings | — | 4 naph + 1 carbolic |

**Costs zero additional master-table buildings** — the B-mode creosote units (5 naphthalene, 2 carbolic) already cover the 4+1 needed, and they are idle in A modes anyway.

The trade is 65.89/s more creosote for 25.06/s less gasoline export (30.07 MW of fuel value). Worth it when routed to sand-casting (6.59/s sand-castings, needs 16.47/s sand). **Not** worth it for treated-wood — 65.89/s creosote yields only ~10.5 MW as treated-wood, a third of the gasoline given up. Convert for material value, never for fuel value.

## Byproduct sinks

### Slacked lime → concrete + acetylene recycling

The acetylene block (separate) produces 25 slacked-lime per 100 acetylene via `slacked-lime-void` (60 slacked-lime → 1 lime + 1 gravel). The void recipe produces lime:gravel at 1:1, but concrete needs lime:gravel:sand:water at 1:2:2:20. Gravel is the bottleneck — which guarantees leftover lime.

Routing: all gravel splits between concrete (as-is) and sand (via `gravel-to-sand`: 4 gravel → 3 sand). Concrete needs gravel:sand at 1:1, so X gravel + (total-X)×0.75 sand where X = (total-X)×0.75 → X = 0.43 × total. Remaining lime (57% of production) feeds back into calcium-carbide → more acetylene, reducing coke demand by ~3.6%.

If concrete backs up, all lime routes to calcium-carbide. If acetylene demand drops, all lime routes to concrete. Neither path stalls.

### Creosote → sand-casting (smelting consumable)

Sand-casting (`5 sand + 20 creosote → 2 sand-casting`, 1s, tar-processing-unit) consumes both creosote and sand — two waste streams into a high-demand smelting item (iron-plate-1, aluminium-plate-3, chromium-01).

Slacked lime synergy: the acetylene block's slacked-lime-void produces gravel → sand (via `gravel-to-sand`: 4 gravel → 3 sand). At 260/s acetylene: 65/s slacked-lime → 1.08/s gravel → 0.81/s sand → absorbs 3.25/s creosote → 0.325/s sand-casting. Leftover lime recycles to calcium-carbide as before.

With imported sand, the full creosote stream can feed sand-casting:

| Creosote | Sand needed | Sand-casting out | TPU buildings |
|---|---|---|---|
| 31.75/s (A2 min) | 7.94/s | 3.18/s | 2 |
| 212.32/s (B1 max) | 53.08/s | 21.23/s | 11 |

Sand-casting has guaranteed perpetual demand (iron/aluminium smelting never stops). Priority: sand-casting first (value capture), treated-wood for remainder.

### Creosote → treated-wood (power sink)

Creosote not consumed by sand-casting or e-circuits converts to treated-wood for self-power fuel.

Chain: creosote + wood → treated-wood (4 MJ biomass, no burnt_result). Wood from log2 via fwf-mk01 (10 tree-mk01 modules, speed 1.0). Moss from Moss-1 via moss-farm-mk01 (15 moss modules, speed 1.0). Wood-seeds loop (wood → seeds → seedlings → logs → wood) consumes 3.1% of wood produced.

**Min (A2: 31.75/s creosote) — 7 buildings:**

```
┌───────────────┬─────────────────────┬──────────────────┬───────┐
│ Recipe        │ Factory             │ Rate             │ Count │
├───────────────┼─────────────────────┼──────────────────┼───────┤
│ treated-wood  │ tar-processing-unit │ 31.75/s creosote │     1 │
│ log-wood-fast │ wpu-mk01            │ 0.033/s log      │     1 │
│ log2          │ fwf-mk01 (10 tree)  │ 0.033/s log      │     1 │
│ wood-seedling │ botanical-nursery   │ 0.025/s seedling │     1 │
│ wood-seeds    │ assembler           │ 0.008/s seeds    │     1 │
│ Moss-1        │ moss-farm (15 moss) │ 0.041/s moss     │     1 │
│ muddy-sludge  │ washer              │ 0.51/s sludge    │     1 │
└───────────────┴─────────────────────┴──────────────────┴───────┘
```

Imports: soil 0.05/s, CO2 0.51/s, water. Output: 0.635/s treated-wood = 2.54 MW.

**Max (B1: 212.32/s creosote) — 18 buildings:**

```
┌───────────────┬─────────────────────┬──────────────────┬───────┐
│ Recipe        │ Factory             │ Rate             │ Count │
├───────────────┼─────────────────────┼──────────────────┼───────┤
│ treated-wood  │ tar-processing-unit │ 212.32/s creos.  │     5 │
│ log-wood-fast │ wpu-mk01            │ 0.219/s log      │     1 │
│ log2          │ fwf-mk01 (10 tree)  │ 0.219/s log      │     4 │
│ wood-seedling │ botanical-nursery   │ 0.164/s seedling │     2 │
│ wood-seeds    │ assembler           │ 0.055/s seeds    │     1 │
│ Moss-1        │ moss-farm (15 moss) │ 0.274/s moss     │     4 │
│ muddy-sludge  │ washer              │ 3.43/s sludge    │     1 │
└───────────────┴─────────────────────┴──────────────────┴───────┘
```

Imports: soil 0.34/s, CO2 3.43/s, water. Output: 4.25/s treated-wood = 16.97 MW.

CO2 from one `moondrop-co2` greenhouse — free, no inputs (see § Relation to logistic science). Use `log3` rather than `log2`: it consumes 5 ash/log (sinking this block's own ash) and yields 1.5× logs per seedling, shrinking the nursery and moss-farm counts above by ~33%. In practice, build for the min case — scale up forestry later if the creosote remainder after sand-casting justifies it.

## Relation to logistic science (design 07)

Design 07 is solved self-contained (218 buildings, its own 7.14/s raw-coal chain) to prove the chain closes — see design guide § "Solve whole, build in parts." This block **is** that design's coal slice, built oversized. Standing it up closes out design 07's "Coal & tar chemistry (17 buildings)" and "Mining fluid chain (5 buildings)" rows — 22 of its 218 buildings — and serves py-science and e-circuits at the same time.

Coverage check against design 07's actual draws (A2 mode):

| Item | Design 07 needs /s | A2 supplies /s | Margin |
|---|--:|--:|--:|
| syngas | 3.18 | 151.20 | 48× |
| aromatics | 13.25 | 56.89 | 4.3× |
| hydrogen | 13.31 | 18.52 | 1.4× |
| coke | ~1.9 + acetylene chain | 36.70 | covers both |
| creosote | 0.39 | 31.75 | 81× |
| coal (smelting fuel) | 1.72 | 4.50 (intermediate) | divert before coal-gas |
| carbon-black | ~0.20 | 1 reformer (2/s cap) | 10× |
| polybutadiene | 5.83 | 1 cracker (50/s cap) | 8.6× |
| **carbon-dioxide** | **8.17** | **0** | **gap — see below** |

**Hydrogen deletes design 07's electrolyzer.** Design 07 runs 1 electrolyzer at 0.61 utilization for 11.65/s hydrogen (plus 1.66/s from its own pitch-refining). A2's 18.52/s covers the full 13.31/s draw (ralesia 12.66 + diborane 0.65), removing both the electrolyzer and its 4.23/s surplus oxygen.

**CO2 is free, not a gap.** Design 07 sources 8.17/s carbon-dioxide from `tar-distilation` (feeding Moss-2 at 7.59/s), and this block runs `tar-refining` instead — so it produces no CO2. That is not a problem: `moondrop-co2` (moondrop-greenhouse, 5s) takes **no inputs at all** and yields 200 CO2 per craft. Design 07 already has 22 moondrop greenhouses and runs the recipe. CO2 is a free building wherever it's needed, never an import and never a constraint on this block.

For the forestry sink's moss chain here (0.51–3.43/s CO2), one greenhouse covers it. `coke-co2` (2 coke → 80 CO2, hpf — 0.20/s coke for 8.17/s CO2) is the alternative if you'd rather not put a bio building in a petrochemical block. Either way this supersedes the earlier byproduct-sinks claim that the CO2 came from the acetylene block's lime recipe.

Not covered by this block (other slices of design 07): bio/farming, urea cycle, smelting, electronics, battery chemistry.

## Notes

- Supersedes designs 04 (30 buildings, 7.5/s) and 05 (64 buildings, 7.5/s with syngas). Neither of those is built in-game; design 03 (single-mode) is the currently built version.
- Exactly 2× the rates of design 05 — feedback loops scale linearly as expected from LP.
- Cracking buildings (22 distilator) and creosote buildings (16 tpu) are mutually exclusive — one set always idle.
- Coal-gas-from-coke buildings (16) are idle in exported modes (A2/B2).
- Mode A1 drives 10 of 16 max building counts due to double feedback loop.
- B2 mode only exports 21.22/s coke — short of the 24.4/s that 260/s acetylene needs (10 coke per 100 acetylene, 9.375 with slacked-lime recycling). Use A2 when acetylene is active.
- Coke export and chemical output trade off continuously, not discretely. Each unit of coke recycled yields 0.411 additional coke through the tar→pitch→coke cascade (`a = 1 − 36.70/62.33`), so `export(f) = (1−f)×36.70 / (1 − 0.411f)` at recycling fraction f. Since a < 1 the loop never self-sustains — recycling more can only trade chemicals for coke, never grow total coke. 36.70/s (A2, f=0) is the hard ceiling; f≈0.35 gives 27.9/s coke with ~178/s syngas (18% above A2). Implement by circuit-gating how many of the 16 coal-gas-from-coke buildings are enabled on coke buffer level.
- Downstream consumers (plastic, polybutadiene, carbon-black) are negligible load on coal chain outputs at current demand. They're built for availability, not throughput.
- Creosote is **not** a fuel (fuel_value 0) — unlike every other block fluid. It needs a material sink (e-circuit demand, sand-casting, treated-wood); it cannot be burned off. This is why the forestry/sand-casting sinks are mandatory rather than optional.
- `py-limestone` (3 ash + 10 limestone + 35 creosote → 2 py-limestone) looks like an attractive dual ash+creosote sink but has **zero consumers** at current tech. Dead end — don't build it.
- Naphthalene-oil and carbolic-oil have no non-barrel consumer besides creosote conversion. Both are fuels; burning them is the default sink and requires boiler fuel priority (see Energy).

## Build materials

Distinct items needed to **construct** this block's buildings — separate from the flow imports,
and several appear nowhere in the solve. Quantities are omitted deliberately: the binding question is
whether you have *any*, since a small amount can be hand-fed or trickled while a zero is a hard stop.
Regenerate with `node scripts/build-materials.mjs data/designs/08-adaptive-coal-processing-chemicals.md`.

| Material | Needed by |
|---|---|
| `iron-plate` | botanical-nursery, cracker-mk01, distilator +5 |
| `small-parts-01` | biofactory-mk01, botanical-nursery, cracker-mk01 +5 |
| `steam-engine` | biofactory-mk01, cracker-mk01, distilator +4 |
| `inductor1` | botanical-nursery, distilator, gasifier +2 |
| `pipe` | distilator, gasifier, tar-processing-unit +1 |
| `steel-plate` | biofactory-mk01, gasifier, tar-processing-unit |
| `electronic-circuit` | biofactory-mk01, cracker-mk01 |
| `glass` | biofactory-mk01, botanical-nursery |
| `lab` | cracker-mk01, oil-boiler-mk01 |
| `titanium-plate` | biofactory-mk01, cracker-mk01 |
| `burner-mining-drill` | wpu-mk01 |
| `copper-cable` | wpu-mk01 |
| `copper-plate` | distilator |
| `duralumin` | biofactory-mk01 |
| `electric-mining-drill` | oil-boiler-mk01 |
| `fluid-drill-mk01` | botanical-nursery |
| `intermetallics` | oil-boiler-mk01 |
| `lead-plate` | cracker-mk01 |
| `log` | wpu-mk01 |
| `planter-box` | botanical-nursery |
| `soil-extractor-mk01` | botanical-nursery |
| `stone-brick` | washer |
| `stone-furnace` | tar-processing-unit |
