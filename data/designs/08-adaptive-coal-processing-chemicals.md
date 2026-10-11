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

Fuel values (MJ/unit): gasoline 1.20, syngas 0.40, aromatics 0.35, carbolic-oil 0.35, naphthalene-oil 0.30, anthracene-oil 0.25, coal-gas 0.20, hydrogen 0.10.

Steam per unit burned (×2 effectivity): gasoline 4.86, syngas 1.62, naphthalene 1.22, aromatics 1.42, carbolic 1.42, coal-gas 0.81, hydrogen 0.41.

### A modes (cracking) — gasoline covers steam

| Mode | Steam need | Gasoline burned | Gasoline exported | Fuel surplus |
|------|--------:|--------:|--------:|---|
| A1 | 626.48/s | 128.90/s | 29.58/s | all other products free |
| A2 | 357.21/s | 73.50/s | 16.86/s | all other products free |

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
| Naphthalene-oil | Yes (A modes) | 134.58/s (A1) | Export or convert to creosote (switch to B mode) |
| Carbolic-oil | Yes (A modes) | 34.80/s (A1) | Export or convert to creosote (switch to B mode) |
| Creosote | Yes (B modes) | 212.32/s (B1) | Export station needed |
| Plastic-bar | If no consumer | <1/s | Overflow to chest with circuit control |
| Polybutadiene | If no consumer | <5/s | Overflow to chest |
| Carbon-black | If no consumer | <1/s | Overflow to chest |
| Ash | Yes | 6.52/s (A1) | Pyvoid (py-burner) — negligible rate |
| Iron-oxide | Yes | 0.44/s (all) | Pyvoid or export — negligible rate |

Primary stall risk: in A modes, naphthalene-oil and carbolic-oil have no internal consumer. They must be exported or the mode switch to creosote engaged. In B modes, creosote must be exported.

## Mode selection guide

| Need | Recommended mode |
|---|---|
| Coke for acetylene (28+/s) | **A2** — 36.70/s coke export |
| Max syngas export | **A1** — 238.46/s syngas |
| Max aromatics for downstream | **A1** — 99.77/s aromatics |
| Creosote for e-circuit | **B1** — 212.32/s creosote |
| Coke + creosote | **B2** — 21.22/s coke + 159.55/s creosote (coke may be insufficient for 28/s acetylene demand) |
| No acetylene demand, max output | **A1** — all coke recycled, max throughput |

## Notes

- Supersedes designs 04 (30 buildings, 7.5/s) and 05 (64 buildings, 7.5/s with syngas). Neither of those is built in-game; design 03 (single-mode) is the currently built version.
- Exactly 2× the rates of design 05 — feedback loops scale linearly as expected from LP.
- Cracking buildings (22 distilator) and creosote buildings (16 tpu) are mutually exclusive — one set always idle.
- Coal-gas-from-coke buildings (16) are idle in exported modes (A2/B2).
- Mode A1 drives 10 of 16 max building counts due to double feedback loop.
- B2 mode only exports 21.22/s coke — insufficient for 28/s acetylene demand. Use A2 when acetylene is needed.
- Downstream consumers (plastic, polybutadiene, carbon-black) are negligible load on coal chain outputs at current demand. They're built for availability, not throughput.
