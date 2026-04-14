# Syngas block — 310/s syngas, 273/s tar, cascade coal-gas

Coal chain block: raw-coal → coal-gas → syngas. Coal and coke recycled internally. Tar exported directly. Coal-gas cascades to export when syngas demand is met.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| distilled-raw-coal | distilator | 6 |
| coal-gas | distilator | 3 |
| coal-gas-from-coke | distilator | 2 |
| syngas | gasifier | 14 |
| **TOTAL** | | **25** |

12 MW electric. No steam, no self-power needed.

## Stations (4)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| raw-coal | unload | raw-coal (item) | 30 |
| syngas | load | syngas (fluid) | up to 310 |
| coal-gas | load (cascade) | coal-gas (fluid) | up to 221 overflow |
| tar | load | tar (fluid) | 273 |

Water (443/s) piped — build near water or use mk02+ fluid wagon.

## Cascade behavior

Coal-gas pipe feeds gasifiers (syngas) with priority. Overflow valve routes surplus coal-gas to export station. Three operating modes:

1. **Full syngas demand**: all 221/s coal-gas → syngas. Export: 310/s syngas + 273/s tar + 0 coal-gas.
2. **No syngas demand**: gasifiers idle, all coal-gas overflows to export. Export: 0 syngas + 273/s tar + 221/s coal-gas.
3. **Partial**: runtime split based on consumer pull. Tar always exports at full rate regardless of mode.

## Intermediates

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| coal | 9.0 | distilled-raw-coal | coal-gas (distilator) |
| coal-gas | 221.4 | distilled-raw-coal 180.0 + coal-gas 36.0 + coal-gas-from-coke 5.4 | syngas (gasifier) or cascade export |
| coke | 5.4 | coal-gas | coal-gas-from-coke |

## Byproducts

| Byproduct | Rate/s | Disposition |
|---|---|---|
| iron-oxide | 0.87 | pyvoid |
| ash | 4.7 | pyvoid |

## Tile footprint

1,600 tiles (11x distilator 64 + 14x gasifier 64). Very compact — fits one city block with room to spare.

## Notes

- 310/s syngas supports 9 borax miners (300/s consumed, 10/s surplus).
- 273/s tar feeds tar refinery network (pitch, creosote, coke production). Significant contribution — tar refinery currently processes 200/s tar input.
- Coal-gas is also a mining fluid (used by some ore patches directly). Cascade export makes it available without dedicated production.
- Stamp for more throughput. Second copy doubles to 60/s raw-coal (2 red belts).

## Helmod import string

```
eJztlTFvwyAQhXf/CuS5lmI7K0uHbl28VpVF4JyiYHABN7Wi/Pdim2CSNFK2Vmo37t2dee/zAFNIKEoEqvEhQYgKYgxOnxUDkT444QO04UriYiwsbwHn42njlna1VspOa2HxcdSnRYQ4w+k8l3tFErefmkFuifGSHTon+ULtJehQbYa604r11OKGCANBbQi1Sg+xapRwTmOFvnHBNEjvD6EqD8dgtwLKO/D3nTxXeSxIBp94tQjfZFhy6Mvv+QAjwXxR33siuB1wKpVuiYjmT9EWp8Hr09yKhk9mnBPecNBnrdt3IERa1Usbp0KodUYFGHw4BvG49DdAqJJRN/Sq4l6sxRXW/BIrVURkLk7WaNVmVO3glyBm3FguiOv+DOTyXsjlFeTiFuR/tBPa9b1o11doy0u0cxYBLNNkn42g/zbkJJrwOce2fx/kVgPjIEfNb7ykAdxrlHAOcZMpt9Ce/Zyut7hcnbtIvJPpSZpMHhMNttcS1QlI9gU9M81h
```
