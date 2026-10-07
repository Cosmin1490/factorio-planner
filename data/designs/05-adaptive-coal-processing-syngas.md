# Adaptive coal processing with syngas — 7.5/s raw-coal, 64 buildings

Multi-mode coal refining with syngas conversion. All coal-gas → syngas (tar feedback amplifies entire chain 1.4–2.5×).
Anthracene to gasoline OR creosote, coke recycled OR exported, syngas ON or OFF (fallback to HPF void).
Self-powered via oil-boiler-mk01.

## Master recipe table

Max mk01 building count across all 8 modes (4 syngas + 4 non-syngas fallback). Solver-validated.

```
┌──────────────────────────────┬─────────────────────┬───────┬──────────────────────────┐
│ Recipe                       │ Factory             │ Count │ Driven by                │
├──────────────────────────────┼─────────────────────┼───────┼──────────────────────────┤
│ distilled-raw-coal           │ distilator          │     2 │ all                      │
│ coal-gas                     │ distilator          │     1 │ all                      │
│ coal-gas-from-coke           │ distilator          │     8 │ C1 cracking+coke+syngas  │
│ pitch-refining               │ distilator          │     9 │ C1 cracking+coke+syngas  │
│ anthracene-gasoline-cracking │ distilator          │    11 │ C1 cracking+coke+syngas  │
│ light-oil-aromatics          │ distilator          │     2 │ syngas modes             │
│ tar-refining                 │ tar-processing-unit │     6 │ C1 cracking+coke+syngas  │
│ tar-refining-tops            │ tar-processing-unit │     2 │ C1/D1 coke+syngas        │
│ anthracene-oil-creosote      │ tar-processing-unit │     5 │ D1 creosote+coke+syngas  │
│ naphthalene-oil-creosote     │ tar-processing-unit │     3 │ D1 creosote+coke+syngas  │
│ carbolic-oil-creosote        │ tar-processing-unit │     1 │ creosote modes           │
│ syngas                       │ gasifier            │     6 │ C1 cracking+coke+syngas  │
│ coal-gas-void                │ hpf                 │     2 │ non-syngas fallback      │
│ (boilers)                    │ oil-boiler-mk01     │     6 │ C1 cracking+coke+syngas  │
└──────────────────────────────┴─────────────────────┴───────┴──────────────────────────┘
```

33 distilator + 17 tar-processing-unit + 6 gasifier + 2 hpf + 6 oil-boiler-mk01 = 64 buildings.
Max electric: 21.62 MW (mode C1).

## Syngas recipe

syngas (gasifier, 3s): 50 coal-gas + 100 water → 70 syngas + 30 tar + 1 ash.
Syngas fuel value: 0.40 MJ (2× coal-gas). Tar feeds back into tar-refining.

The tar feedback creates a positive amplification loop. With coke recycling, the double feedback (coke + tar) amplifies throughput 2.5× vs non-syngas. Without coke recycling, 1.4× amplification.

## Modes — syngas ON

### Mode C1 — full cracking, coke recycled, syngas (max throughput)

```
┌──────────────────────────────┬─────────────────────┬───────┐
│ Recipe                       │ Factory             │ Count │
├──────────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal           │ distilator          │     2 │
│ coal-gas                     │ distilator          │     1 │
│ coal-gas-from-coke           │ distilator          │     8 │
│ tar-refining                 │ tar-processing-unit │     6 │
│ pitch-refining               │ distilator          │     9 │
│ tar-refining-tops            │ tar-processing-unit │     2 │
│ anthracene-gasoline-cracking │ distilator          │    11 │
│ light-oil-aromatics          │ distilator          │     2 │
│ syngas                       │ gasifier            │     6 │
└──────────────────────────────┴─────────────────────┴───────┘
47 active, 17 idle (creosote + hpf)
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 313.24 |
| | water | 170.33 |

| | Outputs | Rate/s |
|---|---|---|
| | syngas | 119.23 |
| | gasoline | 79.24 |
| | naphthalene-oil | 67.29 |
| | aromatics | 49.89 |
| | creosote | 27.84 |
| | carbolic-oil | 17.40 |
| | hydrogen | 16.24 |
| | ash | 3.26 |
| | iron-oxide | 0.22 |

Energy: gasoline alone → 385/s steam vs 313 needed. Burn ~64/s gasoline, export ~15/s. Or burn syngas/oils to save more gasoline.

Intermediates: coal 2.25, coal-gas 85.17 (→syngas), tar 116.02, coke 31.17, middle-oil 34.80, anthracene-oil 135.74, pitch 162.42, light-oil 49.89.

### Mode C2 — full cracking, coke exported, syngas

```
┌──────────────────────────────┬─────────────────────┬───────┐
│ Recipe                       │ Factory             │ Count │
├──────────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal           │ distilator          │     2 │
│ coal-gas                     │ distilator          │     1 │
│ tar-refining                 │ tar-processing-unit │     4 │
│ pitch-refining               │ distilator          │     5 │
│ tar-refining-tops            │ tar-processing-unit │     1 │
│ anthracene-gasoline-cracking │ distilator          │     7 │
│ light-oil-aromatics          │ distilator          │     2 │
│ syngas                       │ gasifier            │     4 │
└──────────────────────────────┴─────────────────────┴───────┘
26 active
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 178.60 |
| | water | 108.00 |

| | Outputs | Rate/s |
|---|---|---|
| | syngas | 75.60 |
| | gasoline | 45.18 |
| | naphthalene-oil | 38.37 |
| | aromatics | 28.44 |
| | coke | 18.35 |
| | creosote | 15.88 |
| | carbolic-oil | 9.92 |
| | hydrogen | 9.26 |
| | ash | 1.08 |
| | iron-oxide | 0.22 |

Energy: gasoline → 220/s steam vs 178.60 needed. Burn ~37/s, export ~8/s.

### Mode D1 — all-creosote, coke recycled, syngas

```
┌──────────────────────────┬─────────────────────┬───────┐
│ Recipe                   │ Factory             │ Count │
├──────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal       │ distilator          │     2 │
│ coal-gas                 │ distilator          │     1 │
│ coal-gas-from-coke       │ distilator          │     4 │
│ tar-refining             │ tar-processing-unit │     5 │
│ pitch-refining           │ distilator          │     7 │
│ tar-refining-tops        │ tar-processing-unit │     2 │
│ anthracene-oil-creosote  │ tar-processing-unit │     5 │
│ naphthalene-oil-creosote │ tar-processing-unit │     3 │
│ carbolic-oil-creosote    │ tar-processing-unit │     1 │
│ light-oil-aromatics      │ distilator          │     2 │
│ syngas                   │ gasifier            │     5 │
└──────────────────────────┴─────────────────────┴───────┘
37 active, 27 idle (cracking + hpf)
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 237.68 |
| | water | 135.35 |

| | Outputs | Rate/s |
|---|---|---|
| | creosote | 106.16 |
| | syngas | 94.74 |
| | aromatics | 37.85 |
| | gasoline | 18.93 |
| | hydrogen | 12.32 |
| | ash | 2.04 |
| | iron-oxide | 0.22 |

Energy: gasoline + aromatics + hydrogen → 150.72/s steam vs 237.68 needed. Deficit 86.96/s covered by burning 53.65/s syngas (1.62 steam/unit). Export remaining 41.09/s syngas.

### Mode D2 — all-creosote, coke exported, syngas

```
┌──────────────────────────┬─────────────────────┬───────┐
│ Recipe                   │ Factory             │ Count │
├──────────────────────────┼─────────────────────┼───────┤
│ distilled-raw-coal       │ distilator          │     2 │
│ coal-gas                 │ distilator          │     1 │
│ tar-refining             │ tar-processing-unit │     4 │
│ pitch-refining           │ distilator          │     5 │
│ tar-refining-tops        │ tar-processing-unit │     1 │
│ anthracene-oil-creosote  │ tar-processing-unit │     4 │
│ naphthalene-oil-creosote │ tar-processing-unit │     2 │
│ carbolic-oil-creosote    │ tar-processing-unit │     1 │
│ light-oil-aromatics      │ distilator          │     2 │
│ syngas                   │ gasifier            │     4 │
└──────────────────────────┴─────────────────────┴───────┘
26 active
```

| | Inputs | Rate/s |
|---|---|---|
| | raw-coal | 7.50 |
| | steam | 178.60 |
| | water | 108.00 |

| | Outputs | Rate/s |
|---|---|---|
| | creosote | 79.78 |
| | syngas | 75.60 |
| | aromatics | 28.44 |
| | gasoline | 14.22 |
| | coke | 10.61 |
| | hydrogen | 9.26 |
| | ash | 1.08 |
| | iron-oxide | 0.22 |

Energy: gasoline + aromatics + hydrogen → 113.22/s steam. Deficit 65.38/s from 40.33/s syngas. Export 35.27/s syngas.

## Modes — syngas OFF (non-syngas fallback)

When syngas gasifiers are OFF, coal-gas voids via HPF. Same as design 04 modes.

### Mode A1 — full cracking, coke recycled

21 active. Outputs: gasoline 32.27, aromatics 20.31, naphthalene 27.40, coal-gas 67.49 (void), creosote 11.34, carbolic 7.09, hydrogen 6.61. Steam 127.55/s.

### Mode A2 — full cracking, coke exported

14 active. Outputs: gasoline 23.05, aromatics 14.51, naphthalene 19.57, coal-gas 54.00 (void), coke 10.02, creosote 8.10, carbolic 5.06, hydrogen 4.72. Steam 91.13/s.

### Mode B1 — all-creosote, coke recycled

17 active. Outputs: creosote 49.22, coal-gas 61.06 (burn 49.78 + void 11.28), aromatics 17.55, gasoline 8.77 (burn all), hydrogen 5.71. Steam 110.20/s. Gasoline net-zero.

### Mode B2 — all-creosote, coke exported

14 active. Outputs: creosote 40.70, coal-gas 54.00 (burn 41.13 + void 12.87), aromatics 14.51, gasoline 7.26 (burn all), coke 6.07, hydrogen 4.72. Steam 91.13/s. Gasoline net-zero.

## Energy

Oil-boiler-mk01: effectivity=2, max 29.61 MW heat = 60 steam/s. 6 boilers = 360 steam/s capacity.

Fuel values (MJ/unit): gasoline 1.20, syngas 0.40, aromatics 0.35, carbolic-oil 0.35, naphthalene-oil 0.30, anthracene-oil 0.25, coal-gas 0.20, hydrogen 0.10.

Steam per unit burned (×2 effectivity): gasoline 4.86, syngas 1.62, naphthalene 1.22, aromatics 1.42, carbolic 1.42, coal-gas 0.81, hydrogen 0.41.

Syngas modes (C1/C2): gasoline alone covers steam. Burn partial gasoline, export rest + all syngas + oils.
Syngas+creosote modes (D1/D2): burn gasoline + aromatics + hydrogen + partial syngas for steam. Export remaining syngas + all creosote.
Non-syngas modes: see design 04 energy section.

## Amplification from syngas tar feedback

The syngas recipe returns 30 tar per 50 coal-gas consumed. This tar feeds back into tar-refining, producing more of everything including more coal-gas.

| | No syngas | Syngas, coke exported | Syngas, coke recycled |
|---|---|---|---|
| Amplification | 1.0× | 1.4× | 2.5× |
| Tar throughput | 33-47/s | 66/s | 116/s |
| Total buildings | 14-21 | 26 | 47 |

Coke recycling + syngas creates a double feedback loop (coke → coal-gas-from-coke → tar, syngas → tar) that drives the 2.5× amplification and the 47-building peak.

## Notes

- Extends design 04 with syngas conversion capability. Design 04 (30 buildings) is the simpler non-syngas variant.
- Mode C1 (cracking + coke + syngas) drives 10 of 14 max building counts due to double feedback loop.
- Cracking buildings (11 distilator) and creosote buildings (9 tpu) are mutually exclusive — one set always idle.
- Syngas consumers: canister for train export, or aromatics-to-plastic (50 aromatics + 100 syngas → 1 plastic-bar in biofactory).
- Water demand significant in syngas modes: 108-170/s on top of steam.
