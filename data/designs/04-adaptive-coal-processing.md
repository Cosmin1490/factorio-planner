# Adaptive coal processing — 7.5/s raw-coal, 30 buildings

Multi-mode coal refining with circuit-controlled recipe switching.
Anthracene to gasoline OR creosote, coke recycled OR exported, oils burned or cracked.
Self-powered via oil-boiler-mk01.

## Master recipe table

Max mk01 building count across all 4 modes. Solver-validated.

```
┌──────────────────────────────┬─────────────────────┬───────┐
│ Recipe                       │ Factory             │ Count │
├──────────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal           │ distilator          │     2 │
│ coal-gas                     │ distilator          │     1 │
│ coal-gas-from-coke           │ distilator          │     4 │
│ tar-refining                 │ tar-processing-unit │     3 │
│ pitch-refining               │ distilator          │     4 │
│ tar-refining-tops            │ tar-processing-unit │     1 │
│ anthracene-gasoline-cracking │ distilator          │     5 │
│ anthracene-oil-creosote      │ tar-processing-unit │     2 │
│ naphthalene-oil-creosote     │ tar-processing-unit │     1 │
│ carbolic-oil-creosote        │ tar-processing-unit │     1 │
│ light-oil-aromatics          │ distilator          │     1 │
│ coal-gas-void                │ hpf                 │     2 │
│ (boilers)                    │ oil-boiler-mk01     │     3 │
└──────────────────────────────┴─────────────────────┴───────┘
```

17 distilator + 8 tar-processing-unit + 2 hpf + 3 oil-boiler-mk01 = 30 buildings.
Max electric: 8.51 MW (mode A1).

## Modes

Four modes from two independent switches: anthracene destination (cracking/creosote) × coke handling (recycle/export).

### Mode A1 — full cracking, coke recycled (max throughput)

All anthracene → gasoline cracking. All coke → coal-gas-from-coke loop.

```
┌──────────────────────────────┬─────────────────────┬───────┐
│ Recipe                       │ Factory             │ Count │
├──────────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal           │ distilator          │     2 │
│ coal-gas                     │ distilator          │     1 │
│ coal-gas-from-coke           │ distilator          │     4 │
│ tar-refining                 │ tar-processing-unit │     3 │
│ pitch-refining               │ distilator          │     4 │
│ tar-refining-tops            │ tar-processing-unit │     1 │
│ anthracene-gasoline-cracking │ distilator          │     5 │
│ light-oil-aromatics          │ distilator          │     1 │
└──────────────────────────────┴─────────────────────┴───────┘
21 active, 9 idle (creosote buildings)
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 127.55 |

| | Outputs | Rate/s |
|---|---|---|
| | gasoline | 32.27 |
| | aromatics | 20.31 |
| | naphthalene-oil | 27.40 |
| | coal-gas | 67.49 |
| | creosote | 11.34 |
| | carbolic-oil | 7.09 |
| | hydrogen | 6.61 |
| | ash | 0.67 |
| | iron-oxide | 0.22 |

Intermediates: coal 2.25, tar 47.24, coke 13.49, middle-oil 14.17, anthracene-oil 55.27, pitch 66.14, light-oil 20.31.

### Mode A2 — full cracking, coke exported

All anthracene → gasoline cracking. Coke exported (coal-gas-from-coke OFF).

```
┌──────────────────────────────┬─────────────────────┬───────┐
│ Recipe                       │ Factory             │ Count │
├──────────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal           │ distilator          │     2 │
│ coal-gas                     │ distilator          │     1 │
│ tar-refining                 │ tar-processing-unit │     2 │
│ pitch-refining               │ distilator          │     3 │
│ tar-refining-tops            │ tar-processing-unit │     1 │
│ anthracene-gasoline-cracking │ distilator          │     4 │
│ light-oil-aromatics          │ distilator          │     1 │
└──────────────────────────────┴─────────────────────┴───────┘
14 active, 16 idle
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 91.13 |

| | Outputs | Rate/s |
|---|---|---|
| | gasoline | 23.05 |
| | aromatics | 14.51 |
| | naphthalene-oil | 19.57 |
| | coal-gas | 54.00 |
| | coke | 10.02 |
| | creosote | 8.10 |
| | carbolic-oil | 5.06 |
| | hydrogen | 4.72 |
| | iron-oxide | 0.22 |

### Mode B1 — all-creosote, coke recycled

All anthracene/naphthalene/carbolic → creosote. Coke recycled. Gasoline net-zero (all burned for steam).

```
┌──────────────────────────┬─────────────────────┬───────┐
│ Recipe                   │ Factory             │ Count │
├──────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal       │ distilator          │     2 │
│ coal-gas                 │ distilator          │     1 │
│ coal-gas-from-coke       │ distilator          │     2 │
│ tar-refining             │ tar-processing-unit │     3 │
│ pitch-refining           │ distilator          │     3 │
│ tar-refining-tops        │ tar-processing-unit │     1 │
│ anthracene-oil-creosote  │ tar-processing-unit │     2 │
│ naphthalene-oil-creosote │ tar-processing-unit │     1 │
│ carbolic-oil-creosote    │ tar-processing-unit │     1 │
│ light-oil-aromatics      │ distilator          │     1 │
└──────────────────────────┴─────────────────────┴───────┘
17 active, 13 idle (cracking buildings)
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 110.20 |

| | Outputs | Rate/s |
|---|---|---|
| | creosote | 49.22 |
| | coal-gas | 61.06 |
| | aromatics | 17.55 |
| | gasoline | 8.77 |
| | hydrogen | 5.71 |
| | ash | 0.35 |
| | iron-oxide | 0.22 |

Gasoline net-zero energy balance: burn gasoline (8.77/s) + aromatics (17.55) + hydrogen (5.71) → 69.86/s steam. Deficit 40.34/s covered by burning 49.78/s coal-gas. Void remaining 11.28/s coal-gas via HPF.

### Mode B2 — all-creosote, coke exported

All oils → creosote. Coke exported. Gasoline net-zero.

```
┌──────────────────────────┬─────────────────────┬───────┐
│ Recipe                   │ Factory             │ Count │
├──────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal       │ distilator          │     2 │
│ coal-gas                 │ distilator          │     1 │
│ tar-refining             │ tar-processing-unit │     2 │
│ pitch-refining           │ distilator          │     3 │
│ tar-refining-tops        │ tar-processing-unit │     1 │
│ anthracene-oil-creosote  │ tar-processing-unit │     2 │
│ naphthalene-oil-creosote │ tar-processing-unit │     1 │
│ carbolic-oil-creosote    │ tar-processing-unit │     1 │
│ light-oil-aromatics      │ distilator          │     1 │
└──────────────────────────┴─────────────────────┴───────┘
14 active, 16 idle
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 91.13 |

| | Outputs | Rate/s |
|---|---|---|
| | creosote | 40.70 |
| | coal-gas | 54.00 |
| | aromatics | 14.51 |
| | gasoline | 7.26 |
| | coke | 6.07 |
| | hydrogen | 4.72 |
| | iron-oxide | 0.22 |

Burn gasoline (7.26) + aromatics (14.51) + hydrogen (4.72) → 57.79/s steam. Deficit 33.34/s covered by 41.13/s coal-gas. Void 12.87/s.

## Energy

Oil-boiler-mk01: effectivity=2, max 29.61 MW heat = 60 steam/s. 3 boilers = 180 steam/s capacity.

Fuel values (MJ/unit): gasoline 1.20, light-oil 0.90, aromatics 0.35, carbolic-oil 0.35, naphthalene-oil 0.30, anthracene-oil 0.25, coal-gas 0.20, hydrogen 0.10.

Steam per unit burned (with ×2 effectivity): gasoline 4.86, naphthalene 1.22, aromatics 1.42, carbolic 1.42, coal-gas 0.81, hydrogen 0.41.

Modes A1/A2 (cracking): gasoline alone covers all steam demand. Burn ~26/s gasoline, export ~6/s. Oils + coal-gas also available as fuel — flexible.

Modes B1/B2 (all-creosote): gasoline + aromatics + hydrogen + ~50/s coal-gas covers steam. Net-zero on gasoline. ~11-13/s coal-gas voided via HPF.

## Backup behavior

Only gasoline can back up — all other fluids have internal sinks (coke loop, creosote, boilers, HPF void).
Worst-case gasoline backup: 32.27/s (mode A1) when export is blocked. 25k tank fills in ~13 minutes.

## Notes

- Supersedes design 03 (single-mode full cracking). Design 03 is already built in-game.
- Anthracene cracking (5 distilators) and creosote buildings (4 tpu) are mutually exclusive — one set always idle.
- Coal-gas-from-coke buildings scale with mode: 4 in A1, 2 in B1, 0 in exported modes.
- Creosote output: 11-49/s depending on mode (e-circuit needs 6.67/s).
