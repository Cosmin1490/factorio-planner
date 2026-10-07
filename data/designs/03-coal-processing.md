# Coal processing — full refining — 7.5/s raw-coal, 24 buildings

Full coal cracking chain: raw-coal → coal → coke → tar → pitch, with all coke recycled
and all intermediate oils refined to final products. No waste oils.

## Recipes

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
│ naphthalene-oil-creosote     │ tar-processing-unit │     2 │
│ carbolic-oil-creosote        │ tar-processing-unit │     1 │
│ light-oil-aromatics          │ distilator          │     1 │
└──────────────────────────────┴─────────────────────┴───────┘
```

9.20 MW electric. Solver-validated.

## Inputs

| Item | Rate |
|------|------|
| steam | 127.55/s |
| raw-coal | 7.50/s |

## Outputs

| Item | Rate |
|------|------|
| coal-gas | 67.49/s |
| creosote | 34.86/s |
| gasoline | 32.27/s |
| aromatics | 20.31/s |
| hydrogen | 6.61/s |
| ash | 0.67/s |
| iron-oxide | 0.22/s |

## Intermediates

| Item | Rate | Flow |
|------|------|------|
| coal | 2.25/s | distilled-raw-coal → coal-gas |
| coke | 13.49/s | coal-gas 1.35 + pitch-refining 6.61 + anthracene-cracking 5.53 → coal-gas-from-coke |
| tar | 47.24/s | distilled-raw-coal 22.5 + coal-gas 11.25 + coal-gas-from-coke 13.49 → tar-refining |
| middle-oil | 14.17/s | tar-refining → tar-refining-tops |
| anthracene-oil | 55.27/s | tar-refining 35.43 + pitch-refining 19.84 → anthracene-cracking |
| pitch | 66.14/s | tar-refining → pitch-refining |
| light-oil | 20.31/s | pitch-refining 13.23 + tar-refining-tops 7.09 → light-oil-aromatics |
| naphthalene-oil | 27.40/s | pitch-refining 13.23 + tar-refining-tops 14.17 → naphthalene-oil-creosote |
| carbolic-oil | 7.09/s | tar-refining-tops → carbolic-oil-creosote |

## Recycle loops

- **coke**: coal-gas produces 1.35/s fresh + pitch-refining recycles 6.61/s + anthracene-cracking recycles 5.53/s = 13.49/s total, all fed into coal-gas-from-coke. Zero coke leaves the block.
- All intermediate oils (middle-oil, anthracene-oil, naphthalene-oil, carbolic-oil, light-oil) fully consumed internally.

## Notes

- Already built in-game.
- Creosote at 34.86/s is ~5x what the circuit chain needs (6.67/s). Excess can supply other consumers or be converted to more creosote products.
- Gasoline and aromatics are the main valuable byproducts.
- Steam demand is high (127.55/s) — needs dedicated boiler infrastructure.
