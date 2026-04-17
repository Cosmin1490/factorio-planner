# Borax block — 15/s borax output (mining + washing + sludge recycling)

Mining block: borax ore → raw-borax → borax. Imports syngas as mining fluid. Muddy-sludge recycled back to water (rule 5a), cutting water demand by 67% and enabling trained-in water (no water body placement constraint). Pyvoid fueled by syngas canister closed loop (rule 9 jerry container pattern).

## Recipe table

┌────────────────────────────────┬───────────────────┬───────┐
│ Recipe                         │ Factory           │ Count │
├────────────────────────────────┼───────────────────┼───────┤
│ borax (mining)                 │ borax-mine        │    12 │
│ borax-washing                  │ washer            │    11 │
│ muddy-sludge-void-electrolyzer │ electrolyzer-mk01 │     5 │
│ soil-pyvoid                    │ py-burner         │     3 │
│ ash-pyvoid                     │ py-burner         │     1 │
│ fill-syngas-canister           │ barrel-machine-mk01│     1 │
│ oxygen-pyvoid-gas              │ py-gas-vent       │     1 │
└────────────────────────────────┴───────────────────┴───────┘

34 buildings, ~54.4 MW electric

## Stations (3)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| syngas | unload | syngas (fluid) | 41.8 |
| water | unload | water (fluid) | 71.4 |
| borax | load | borax (item) | 15.0 |

Water trained in — 71.4/s is below mk01 fluid wagon threshold (75/s per rule 25). Block can go anywhere on a borax patch.

## Mining math

- Borax resource: `mining_time=1.5`, `required_fluid=syngas`, `fluid_amount=25`
- borax-mine: `mining_speed=2`
- Per miner: `2 × 25 / (10 × 1.5)` = 3.333/s syngas, `2 / 1.5` = 1.333/s raw-borax
- 12 miners: 16.0/s raw-borax, 40.0/s syngas
- Mining productivity (+20%) gives headroom above 15/s target

## Washing math

- borax-washing: 10 raw-borax + 150 water → 10 borax + 100 muddy-sludge in 7s
- Per washer (crafting_speed=1): 1.429/s raw-borax → 1.429/s borax
- 11 washers: 15.71/s capacity (96% util at 15/s target)
- Water consumed: 11 × 150/7 = 235.7/s (full capacity), 214.3/s at 15/s target
- Muddy-sludge produced: 142.9/s at 15/s target

## Water recycling (rule 5a)

muddy-sludge-void-electrolyzer: 100 muddy-sludge → 100 water + 5 soil + 10 oxygen in 3s

- Per electrolyzer-mk01 (crafting_speed=1): 33.33/s sludge → 33.33/s water
- 5 electrolyzers: 166.7/s capacity (86% util at 142.9/s sludge)
- Water returned: 142.9/s
- **Net water import: 214.3 - 142.9 = 71.4/s** (67% reduction)

Water loop: washers → muddy-sludge pipe → electrolyzers → water pipe → back to washers. Fresh water import tops up the 71.4/s deficit.

## Byproduct classification (rule 5)

| Byproduct | Rate/s | Classification | Handling |
|---|---|---|---|
| oxygen | 14.29 | (d) pure waste | 1 py-gas-vent (void_energy_source, no fuel) |
| soil | 7.14 | (d) pure waste | 3 py-burners (soil-pyvoid) |
| ash (from soil-pyvoid) | 1.43 | (d) pure waste | 1 py-burner (ash-pyvoid) |

Oxygen: no consumer in this block, 14.29/s not worth a station. Vent.
Soil: checked consumers (`recipes --consumes soil`) — moss farms, soil-separation, landfill. None in this block, 7.14/s not worth a station. Pyvoid.

## Pyvoid fuel: syngas canister closed loop

Per rule 9: jerry fuels follow the container pattern — fill at source, burn at consumer, empty canister returns. No net canister consumption.

1. barrel-machine-mk01 fills syngas-canisters (1 empty-fuel-canister + 25 syngas → 1 syngas-canister, 0.2s)
2. Belt syngas-canisters to py-burner fuel slots
3. Py-burners burn canisters, empty-fuel-canister drops as burnt_result
4. Belt empty-fuel-canisters back to barrel machine
5. **Closed loop — seed once with ~10 canisters, runs forever**

Fuel math:
- 4 py-burners × 180kW = 720kW total
- Canister rate: 720,000 / 10,000,000 = 0.072/s (1 every 14s)
- Syngas for fuel: 0.072 × 25 = 1.8/s
- Total syngas: 40.0 (mining) + 1.8 (fuel) = 41.8/s

## Ash convergence

soil-pyvoid: 80% destroyed per cycle (1 in → 0.2 out)
- 7.14/s soil → 1.43/s ash → 0.29/s ash → 0.057/s → ~0

Ash burner (1 py-burner, speed 5) handles 3.33/s — 43% util for 1.43/s input. Uses ash loop pattern from methodology: ash recirculates on the same belt, converges exponentially.

## Power

| Component | MW |
|---|---|
| 5 electrolyzer-mk01 | 50.0 |
| 11 washers | 4.4 |
| 12 borax-mines | ~0.005 |
| 1 barrel machine | ~0.002 |
| Gas vent | 0 (void_energy_source) |
| 4 py-burners | 0 (fuel-powered) |
| **Total electric** | **~54.4** |

Electrolyzers dominate. This is the cost of water recycling — 50 MW for 67% water reduction + placement freedom.

## Tile footprint

12× borax-mine (9×9, 972) + 11× washer (6×6, 396) + 5× electrolyzer-mk01 (6×6, 180) + 4× py-burner (3×3, 36) + 1× barrel-machine-mk01 (3×3, 9) + 1× py-gas-vent (3×3, 9) = **~1,602 tiles**. Fits one city block with room for piping and belt routing.

## Notes

- Must be placed on a borax ore patch with 12+ mining positions.
- 15/s borax supports 2.5 iron plate blocks (each needs 5.94/s borax via iron-plate-1 / molten-iron-05).
- Syngas block (02b) produces 310/s. This block uses 41.8/s — massive surplus for other consumers.
- Helmod export covers washers + electrolyzers only. Miners are manual placement on ore patch. Pyvoid chain is manual.

## vs Previous design

| | Old | New |
|---|---|---|
| Output | 12/s borax | 15/s borax (+25%) |
| Buildings | 18 | 34 |
| Syngas import | 30/s | 41.8/s |
| Water import | 193/s (piped, near water) | 71.4/s (trained, anywhere) |
| Stations | 2 | 3 |
| Sludge | sinkhole 128.6/s | recycled → water |
| Electric | 7.4 MW | 54.4 MW |
