# Glass block — 2/s output

174 consumers — Tier A bus item. Feeds brake-mk01 (mall), resistor1 (e-circuit), vacuum-tube (e-circuit), battery-mk01 (logistic science).

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| glass-2 (crushed-quartz → molten-glass) | glassworks-mk01 | 2 |
| molten-glass (molten-glass → glass) | glassworks-mk01 | 3 |

5 buildings, 39 MW electric

## Stations (2)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| crushed-quartz | unload | crushed-quartz (item) | 1.33 |
| glass | load | glass (item) | 2 |

## Intermediates

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| molten-glass | 20 | glass-2 | molten-glass (casting) |

## Notes

- 5 glassworks-mk01. Very compact block.
- crushed-quartz at 1.33/s is trivial throughput. Needs quartz crushing upstream (ore-quartz → crushed-quartz).
- Alternative: glass-1 recipe uses ore-quartz directly (6 ore → 10 molten-glass) but lower yield. glass-2 (2 crushed-quartz → 30 molten-glass) is 2.5× more efficient.
- hotair-molten-glass variant gives 7 glass vs 5 (40% more) but needs hot-air infrastructure. Worth it at higher volumes.
- glassworks is a specialized building — **cannot be handcrafted or MAM'd**.
