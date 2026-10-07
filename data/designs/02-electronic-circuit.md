# electronic-circuit — 0.1/s, 25 buildings

Target: 0.1/s electronic-circuit (~13% of 1 chipshooter-mk01).
Inline sub-components, formica chain, and moondrop methane. CO2 imported free.

## Power breakdown

```
┌────────────────────────────────┬──────────────────────────────┬───────┬──────────┬──────────┐
│ Recipe                         │ Factory                      │ Count │ Per (MW) │ Total MW │
├────────────────────────────────┼──────────────────────────────┼───────┼──────────┼──────────┤
│ ELECTRIC (~30 MW)              │                              │       │          │          │
│ electric-boiler-water-to-steam │ py-electric-boiler           │     1 │    25.00 │    25.00 │
│ ceramic                        │ hpf                          │     1 │     2.00 │     2.00 │
│ graphite                       │ hpf                          │     1 │     2.00 │     2.00 │
│ methanal                       │ hpf                          │     1 │     2.00 │     2.00 │
│ moondrop-1                     │ moondrop-greenhouse-mk01     │     3 │     0.45 │     1.35 │
│ fiber-01                       │ wpu-mk01                     │     2 │     0.50 │     1.00 │
│ vacuum                         │ vacuum-pump-mk01             │     1 │     1.00 │     1.00 │
│ methane-co2                    │ moondrop-greenhouse-mk01     │     2 │     0.45 │     0.90 │
│ capacitor1                     │ electronics-factory-mk01     │     1 │     0.50 │     0.50 │
│ inductor1                      │ electronics-factory-mk01     │     1 │     0.50 │     0.50 │
│ resistor1                      │ electronics-factory-mk01     │     1 │     0.50 │     0.50 │
│ vacuum-tube                    │ electronics-factory-mk01     │     1 │     0.50 │     0.50 │
│ treated-wood                   │ tar-processing-unit          │     1 │     0.50 │     0.50 │
│ pcb1                           │ pcb-factory-mk01             │     1 │     0.40 │     0.40 │
│ clay                           │ clay-pit-mk01                │     1 │     0.20 │     0.20 │
│ formica                        │ pulp-mill-mk01               │     1 │     0.15 │     0.15 │
│ electronic-circuit             │ chipshooter-mk01             │     1 │     0.15 │     0.15 │
│ moondrop-seeds                 │ botanical-nursery            │     1 │     0.13 │     0.13 │
├────────────────────────────────┼──────────────────────────────┼───────┼──────────┼──────────┤
│ COAL-BURNER                    │                              │       │          │          │
│ battery-mk00                   │ assembling-machine-1         │     1 │          │        — │
│ solder-0                       │ assembling-machine-1         │     1 │          │        — │
│ copper-cable                   │ assembling-machine-1         │     1 │          │        — │
└────────────────────────────────┴──────────────────────────────┴───────┴──────────┴──────────┘
```

Energy summary: ~30 MW electric (25 MW boiler for clay), 3 coal-burner assemblers.

## Recipes

```
┌────────────────────────────────┬──────────────────────────────┬───────┬──────────────┐
│ Recipe                         │ Factory                      │ Count │ Modules      │
├────────────────────────────────┼──────────────────────────────┼───────┼──────────────┤
│ electronic-circuit             │ chipshooter-mk01             │     1 │              │
│ battery-mk00                   │ assembling-machine-1         │     1 │              │
│ capacitor1                     │ electronics-factory-mk01     │     1 │              │
│ inductor1                      │ electronics-factory-mk01     │     1 │              │
│ resistor1                      │ electronics-factory-mk01     │     1 │              │
│ pcb1                           │ pcb-factory-mk01             │     1 │              │
│ vacuum-tube                    │ electronics-factory-mk01     │     1 │              │
│ solder-0                       │ assembling-machine-1         │     1 │              │
│ vacuum                         │ vacuum-pump-mk01             │     1 │              │
│ ceramic                        │ hpf                          │     1 │              │
│ graphite                       │ hpf                          │     1 │              │
│ copper-cable                   │ assembling-machine-1         │     1 │              │
│ clay                           │ clay-pit-mk01                │     1 │              │
│ electric-boiler-water-to-steam │ py-electric-boiler           │     1 │              │
│ formica                        │ pulp-mill-mk01               │     1 │              │
│ treated-wood                   │ tar-processing-unit          │     1 │              │
│ fiber-01                       │ wpu-mk01                     │     2 │              │
│ methanal                       │ hpf                          │     1 │              │
│ methane-co2                    │ moondrop-greenhouse-mk01     │     2 │ 16x moondrop │
│ moondrop-1                     │ moondrop-greenhouse-mk01     │     3 │ 16x moondrop │
│ moondrop-seeds                 │ botanical-nursery            │     1 │              │
└────────────────────────────────┴──────────────────────────────┴───────┴──────────────┘
```

## Inputs

| Item | Rate |
|------|------|
| water | 17.86/s |
| carbon-dioxide | 10.00/s |
| water-saline | 8.33/s |
| creosote | 6.67/s |
| wood | 1.73/s |
| copper-plate | 1.13/s |
| saps | 0.67/s |
| coke | 0.40/s |
| zinc-plate | 0.33/s |
| tin-plate | 0.31/s |
| lead-plate | 0.27/s |
| iron-plate | 0.25/s |
| cellulose | 0.17/s |
| glass | 0.17/s |
| coal | 0.02/s |

## Byproducts

ash 0.02/s

## Intermediates

```
┌────────────────┬─────────┬────────────────────────────────────────────┬─────────────────────────────────────────┐
│ Item           │ Rate    │ Producer                                   │ Consumer                                │
├────────────────┼─────────┼────────────────────────────────────────────┼─────────────────────────────────────────┤
│ battery-mk00   │ 0.03/s  │ battery-mk00                               │ electronic-circuit                      │
│ capacitor1     │ 0.17/s  │ capacitor1                                 │ electronic-circuit                      │
│ inductor1      │ 0.10/s  │ inductor1                                  │ electronic-circuit                      │
│ resistor1      │ 0.20/s  │ resistor1                                  │ electronic-circuit                      │
│ pcb1           │ 0.03/s  │ pcb1                                       │ electronic-circuit                      │
│ vacuum-tube    │ 0.10/s  │ vacuum-tube                                │ electronic-circuit                      │
│ solder         │ 0.07/s  │ solder-0                                   │ electronic-circuit                      │
│ ceramic        │ 0.10/s  │ ceramic                                    │ capacitor1 0.06, inductor1 0.04         │
│ graphite       │ 0.10/s  │ graphite                                   │ vacuum-tube                             │
│ copper-cable   │ 0.40/s  │ copper-cable                               │ inductor1                               │
│ formica        │ 0.07/s  │ formica                                    │ pcb1                                    │
│ vacuum         │ 4.17/s  │ vacuum                                     │ pcb1 1.67, vacuum-tube 2.50             │
│ clay           │ 0.19/s  │ clay                                       │ ceramic                                 │
│ steam          │ 6.37/s  │ electric-boiler-water-to-steam             │ clay                                    │
│ treated-wood   │ 0.13/s  │ treated-wood                               │ formica                                 │
│ raw-fiber      │ 0.33/s  │ fiber-01                                   │ formica                                 │
│ methanal       │ 3.33/s  │ methanal                                   │ formica                                 │
│ methane        │ 4.00/s  │ methane-co2                                │ methanal                                │
│ moondrop-seeds │ 0.16/s  │ moondrop-seeds                             │ methane-co2 0.10, moondrop-1 0.06       │
│ moondrop       │ 0.06/s  │ moondrop-1                                 │ moondrop-seeds                          │
└────────────────┴─────────┴────────────────────────────────────────────┴─────────────────────────────────────────┘
```

## Closed loops

- **moondrop <> seeds**: self-sustaining cycle, 0.16 seeds/s produced, split between methane (0.10) and growth (0.06)

## Module cost

80 moondrop (5 greenhouses x 16 each)

## Notes

- Electric boiler is 83% of total power — importing clay would save 25 MW and 2 buildings
- Creosote at 6.67/s is the most exotic import (from tar processing)
- moondrop-1-cu variant (adds copper-ore) would cut 3 growing greenhouses to ~1-2
