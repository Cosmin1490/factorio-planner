# Electronic circuit block — 2/s output

219 consumers — Tier A bus item. Feeds locomotive (10), train-stop (5), splitter (1), fast-inserter (4), substation (5), combinators, and hundreds of buildings.

## Recipe table

| Recipe | Factory | Count |
|---|---|---|
| electronic-circuit-2 | chipshooter-mk01 | 2 |
| battery-mk01 | chemical-plant-mk01 | 4 |
| capacitor1 | electronics-factory-mk01 | 4 |
| inductor1 | electronics-factory-mk01 | 2 |
| resistor1 | electronics-factory-mk01 | 4 |
| vacuum-tube | electronics-factory-mk01 | 5 |
| solder-0 | automated-factory-mk01 | 5 |
| vacuum | vacuum-pump-mk01 | 1 |
| bolts | automated-factory-mk01 | 1 |
| copper-cable | automated-factory-mk01 | 2 |
| iron-stick | automated-factory-mk01 | 1 |
| **TOTAL** | | **31** |

24 MW electric

## Stations (14)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| pcb1 | unload | pcb1 (item) | 0.40 |
| pbsb-alloy | unload | pbsb-alloy (item) | 0.40 |
| melamine | unload | melamine (item) | 0.80 |
| graphite | unload | graphite (item) | 2.40 |
| glass | unload | glass (item) | 2.40 |
| zinc-plate | unload | zinc-plate (item) | 1.20 |
| cyanic-acid | unload | cyanic-acid (fluid) | 12.0 |
| ceramic | unload | ceramic (item) | 1.15 |
| tin-plate | unload | tin-plate (item) | 3.73 |
| coke | unload | coke (item) | 1.60 |
| copper-plate | unload | copper-plate (item) | 3.60 |
| iron-plate | unload | iron-plate (item) | 3.60 |
| lead-plate | unload | lead-plate (item) | 3.20 |
| electronic-circuit | load | electronic-circuit (item) | 2.0 |

## Intermediates (inlined)

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| battery-mk01 | 0.40 | battery-mk01 (chemical-plant) | electronic-circuit-2 |
| capacitor1 | 2.00 | capacitor1 (electronics-factory) | electronic-circuit-2 |
| inductor1 | 1.20 | inductor1 (electronics-factory) | electronic-circuit-2 |
| resistor1 | 2.40 | resistor1 (electronics-factory) | electronic-circuit-2 |
| vacuum-tube | 1.20 | vacuum-tube (electronics-factory) | electronic-circuit-2 |
| solder | 0.80 | solder-0 (automated-factory) | electronic-circuit-2 |
| bolts | 1.20 | bolts (automated-factory) | battery-mk01 |
| copper-cable | 4.80 | copper-cable (automated-factory) | inductor1 |
| vacuum | 30.0 | vacuum (vacuum-pump) | vacuum-tube |
| iron-stick | 1.20 | iron-stick (automated-factory) | bolts |

## Notes

- 31 buildings, 13 import stations + 1 export = **14 stations**. This is the most complex block in the plan. Will likely need 2 city blocks or creative station sharing.
- Uses electronic-circuit-2 recipe (battery-mk01 variant, 5 output per craft) over electronic-circuit (battery-mk00, 3 output). 67% more efficient but requires pbsb-alloy and melamine.
- Upstream blockers: pcb1 (already producing 0.125/s, needs scaling to 0.4/s), pbsb-alloy (needs sb-oxide + lead-plate), melamine (needs urea decomposition chain), graphite (needs coke → hpf), ceramic (needs clay + coke → hpf), cyanic-acid (needs coal + methane + ammonia).
- cyanic-acid at 12/s is a fluid — needs fluid wagon station. This is the highest-volume input.
- Many sub-components use specialized buildings (chipshooter, electronics-factory, chemical-plant) — **electronic circuits cannot be handcrafted**.
- Consider splitting: battery-mk01 sub-chain (pbsb-alloy, melamine, graphite, bolts, glass, zinc-plate, cyanic-acid) as a separate block exporting battery-mk01, to reduce station count on the main chip block.
