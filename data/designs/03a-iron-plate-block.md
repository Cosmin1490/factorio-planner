# Iron plate block — 10.8/s output (BOF casting)

183 consumers — Tier A bus item. Feeds small-parts, pipe, rail, inserters, fenxsb-alloy, everything.

BOF casting route: 1.39:1 ore:plate ratio (vs 8:1 direct smelting). Sized to 15/s iron-ore (1 yellow belt input).

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| iron-plate-1 | casting-unit-mk01 | 1 |
| molten-iron-05 | bof-mk01 | 8 |
| grade-1-iron-crush | jaw-crusher | 6 |
| sand-casting | tar-processing-unit | 1 |
| hydrogen (for oxygen) | electrolyzer-mk01 | 11 |
| **TOTAL** | | **27** |

114 MW electric. BOF fuel: 8/s coke (burner, not modeled by solver — see notes).

## Stations (5)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| iron-ore | unload | iron-ore (item) | 15 |
| borax | unload | borax (item) | 5.94 |
| creosote | unload | creosote (fluid) | 1.8 |
| coke | unload | coke (item) | 8 |
| iron-plate | load | iron-plate (item) | 10.8 |

Water (324/s) piped — build near water or use mk02+ fluid wagon.

## Intermediates

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| processed-iron-ore | 9.0 | grade-1-iron-crush | molten-iron-05 |
| molten-iron | 18.0 | molten-iron-05 | iron-plate-1 |
| sand-casting | 0.18 | sand-casting (tar-proc) | iron-plate-1 |
| oxygen | 108.0 | hydrogen (electrolyzer) | molten-iron-05 |

## Byproducts

| Byproduct | Rate/s | Disposition |
|---|---|---|
| hydrogen | 216.0 | gas vent (low fuel value, not worth burning) |
| ash | 8.0 | pyvoid (from coke burnt_result in BOFs) |
| stone | 3.0 | pyvoid or export |

## Notes

- **BOF fuel**: 8 bof-mk01 at 5 MW each = 40 MW fuel. Coke (5 MJ): 8/s consumption → 8/s ash. Solver shows coal because it models coal as default burner fuel; actual coke rate is lower. Source: stalled tar refinery (coke surplus).
- **No self-power**: no high-value fluid byproducts. Hydrogen (216/s at 100 kJ) would only cover 37% of electric demand — not worth the boiler infrastructure.
- **Borax source**: borax block (02b) washes raw-borax into borax on-site. Iron block imports borax directly. At half-scale borax block (4.0/s borax), iron block runs at deficit (needs 5.94/s). Stamp borax block or build full-scale when demand warrants.
- **Creosote source**: borax block (02b) exports 27.8/s creosote. Iron block needs 1.8/s. Trivial demand.
- **No sludge**: borax-washing moved to borax block. Sludge voiding handled there.

## Tile footprint

1,252 tiles (1x casting-unit 49 + 8x bof 49 + 6x jaw-crusher 49 + 1x tar-processing-unit 121 + 11x electrolyzer 36). Very compact — fits one city block with ample room for voiding and routing.

## Scaling

- 10.8/s ≈ 0.72 yellow belt. Stamp for more throughput.
- Upgrade path: hotair-iron-plate-1 (75 plate per batch vs 60) gives 25% more output for same molten-iron, but needs hot-air infrastructure. Evaluate when warm-stone-brick chain is available.

## Helmod import string

```
eJzNlruO2zAQRXt9BaF6BZh+lGxSpEvjNlgYNDm2maU4ypDKRln436MHLdFyArhauxPvzIj3HgmUNDKLSlq2Ex8ZY8pK70X+DTXY/KUVfgF5g04su0UwJQjeXe3bobcdIYZ+bBz80un9IGNGi3zo41Fxsp3PT40mPIKLYmiqVowLfHdA42rf7CpCXasgDtJ6GNWDVAGpSVWPtvWaKupkrCZw0SFjWz5ejoa3oEwFcb+L6y1PBafht1hMwj9TTElofscYoaPIJ/VnLa0JjcgdUilt0n8JN3kd3X4dSknzxQ5YUIHQNn+AivJtwa96/r8ZY7LE2oU0IGNl69iCFx/nUTxP9T1IhS6pjrXt8l7CyxvCfE7YS6cLJX0w7vgklIOkot1IgfetqaJ2JjyG8+pezqsbzss55yNJDQUvDKErFNX+9CS0f8j3wQ/QYyiv76W8vqG8mlMu0QZwA+TF5kkI7/HwwMNicy/ezQ3e9Rxvz7WyMrRv8pPAjUdXf0p8PuUs6Yhxu3L8NLsjgTbgOi1OfB8YIkH+mgRN8HalOVoToLx6OlUdBN9cu8iik/5voDd5zghCTY7tMnD6LwboLPA=
```
