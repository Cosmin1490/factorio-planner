# py-science-pack-1 — 0.2/s, 132 buildings

Target: 1 research-center-mk01 (0.2/s py-science-pack-1).
Full inline chain, mk01 factories, no hot-air path. Vrauks for formic acid. CO2 imported free.

## Power breakdown

```
┌────────────────────────────────┬──────────────────────┬───────┬──────────┬──────────┐
│ Recipe                         │ Factory              │ Count │ Per (MW) │ Total MW │
├────────────────────────────────┼──────────────────────┼───────┼──────────┼──────────┤
│ ELECTRIC (68 MW)               │                      │       │          │          │
│ electric-boiler-water-to-steam │ py-electric-boiler   │     1 │    25.00 │    25.00 │
│ cellulose-00                   │ hpf                  │     4 │     2.00 │     8.00 │
│ seaweed-1                      │ seaweed-crop-mk01    │    11 │     0.45 │     4.95 │
│ log2                           │ fwf-mk01             │     9 │     0.45 │     4.05 │
│ agar                           │ hpf                  │     2 │     2.00 │     4.00 │
│ latex                          │ hpf                  │     2 │     2.00 │     4.00 │
│ vrauks-1                       │ vrauks-paddock-mk01  │    16 │     0.25 │     4.00 │
│ Moss-1                         │ moss-farm-mk01       │    32 │     0.10 │     3.20 │
│ sap-01                         │ sap-extractor-mk01   │    14 │     0.15 │     2.10 │
│ sodium-alginate                │ hpf                  │     1 │     2.00 │     2.00 │
│ vrauks-cocoon-1                │ rc-mk01              │     4 │     0.50 │     2.00 │
│ py-science-pack-1              │ research-center-mk01 │     1 │     0.80 │     0.80 │
│ creamy-latex                   │ washer               │     2 │     0.40 │     0.80 │
│ soil-washing                   │ washer               │     2 │     0.40 │     0.80 │
│ petri-dish-bacteria            │ micro-mine-mk01      │     5 │     0.15 │     0.75 │
│ latex-slab                     │ distilator           │     1 │     0.50 │     0.50 │
│ log-wood                       │ wpu-mk01             │     1 │     0.50 │     0.50 │
│ wood-seedling                  │ botanical-nursery    │     3 │     0.13 │     0.38 │
│ full-render-vrauks             │ slaughterhouse-mk01  │     1 │     0.30 │     0.30 │
│ water-barrel                   │ barrel-machine-mk01  │     1 │     0.20 │     0.20 │
├────────────────────────────────┼──────────────────────┼───────┼──────────┼──────────┤
│ FLUID-BURNER (130 MW)          │                      │       │          │          │
│ glass-1                        │ glassworks-mk01      │    11 │    10.00 │   110.00 │
│ empty-petri-dish               │ glassworks-mk01      │     1 │    10.00 │    10.00 │
│ flask                          │ glassworks-mk01      │     1 │    10.00 │    10.00 │
├────────────────────────────────┼──────────────────────┼───────┼──────────┼──────────┤
│ COAL-BURNER                    │                      │       │          │          │
│ fawogae-substrate              │ assembling-machine-1 │     1 │          │        — │
│ petri-dish                     │ assembling-machine-1 │     2 │          │        — │
│ stopper                        │ assembling-machine-1 │     1 │          │        — │
│ caged-vrauks                   │ assembling-machine-1 │     1 │          │        — │
│ wood-seeds                     │ assembling-machine-1 │     1 │          │        — │
└────────────────────────────────┴──────────────────────┴───────┴──────────┴──────────┘
```

Energy summary: 68 MW electric, 130 MW acetylene (130/s), 6 coal-burner assemblers.

## Recipes

```
┌────────────────────────────────┬──────────────────────┬───────┬───────────────┐
│ Recipe                         │ Factory              │ Count │ Modules       │
├────────────────────────────────┼──────────────────────┼───────┼───────────────┤
│ py-science-pack-1              │ research-center-mk01 │     1 │               │
│ fawogae-substrate              │ assembling-machine-1 │     1 │               │
│ cellulose-00                   │ hpf                  │     4 │               │
│ log-wood                       │ wpu-mk01             │     1 │               │
│ petri-dish                     │ assembling-machine-1 │     2 │               │
│ petri-dish-bacteria            │ micro-mine-mk01      │     5 │               │
│ empty-petri-dish               │ glassworks-mk01      │     1 │               │
│ agar                           │ hpf                  │     2 │               │
│ seaweed-1                      │ seaweed-crop-mk01    │    11 │ 10x seaweed   │
│ Moss-1                         │ moss-farm-mk01       │    32 │ 15x moss      │
│ flask                          │ glassworks-mk01      │     1 │               │
│ glass-1                        │ glassworks-mk01      │    11 │               │
│ stopper                        │ assembling-machine-1 │     1 │               │
│ latex                          │ hpf                  │     2 │               │
│ latex-slab                     │ distilator           │     1 │               │
│ sodium-alginate                │ hpf                  │     1 │               │
│ creamy-latex                   │ washer               │     2 │               │
│ sap-01                         │ sap-extractor-mk01   │    14 │ 2x sap-tree   │
│ full-render-vrauks             │ slaughterhouse-mk01  │     1 │               │
│ caged-vrauks                   │ assembling-machine-1 │     1 │               │
│ vrauks-1                       │ vrauks-paddock-mk01  │    16 │ 10x vrauks    │
│ vrauks-cocoon-1                │ rc-mk01              │     4 │ 2x vrauks     │
│ electric-boiler-water-to-steam │ py-electric-boiler   │     1 │               │
│ water-barrel                   │ barrel-machine-mk01  │     1 │               │
│ soil-washing                   │ washer               │     2 │               │
│ log2                           │ fwf-mk01             │     9 │ 10x tree-mk01 │
│ wood-seedling                  │ botanical-nursery    │     3 │               │
│ wood-seeds                     │ assembling-machine-1 │     1 │               │
└────────────────────────────────┴──────────────────────┴───────┴───────────────┘
```

## Inputs

| Item | Rate |
|------|------|
| water | 435/s |
| acetylene (glassworks fuel) | 130/s |
| carbon-dioxide | 32/s |
| ore-quartz | 13.20/s |
| soil | 9.46/s |
| limestone | 2.64/s |
| native-flora | 1.25/s |
| stone | 1.00/s |
| coal | 0.55/s |

## Byproducts

sand 3.15/s, meat 0.20/s, guts 0.20/s, chitin 0.10/s, brain 0.10/s, ash 0.04/s

## Intermediates

```
┌─────────────────────┬──────────┬────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Item                │ Rate     │ Producer                                   │ Consumer                                                                                    │
├─────────────────────┼──────────┼────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┤
│ flask               │  0.20/s  │ flask                                      │ py-science-pack-1                                                                           │
│ fawogae-substrate   │  1.20/s  │ fawogae-substrate                          │ py-science-pack-1                                                                           │
│ cellulose           │  0.36/s  │ cellulose-00                               │ fawogae-substrate                                                                           │
│ petri-dish-bacteria │  0.24/s  │ petri-dish-bacteria                        │ fawogae-substrate                                                                           │
│ moss                │  2.52/s  │ Moss-1                                     │ fawogae-substrate 0.60, vrauks-1 0.25, vrauks-cocoon-1 1.00, wood-seedling 0.67             │
│ wood                │  2.69/s  │ log-wood                                   │ cellulose-00 2.52, wood-seeds 0.17                                                          │
│ log                 │  0.54/s  │ log2                                       │ log-wood                                                                                    │
│ wood-seedling       │  0.40/s  │ wood-seedling                              │ log2                                                                                        │
│ wood-seeds          │  0.13/s  │ wood-seeds                                 │ wood-seedling                                                                               │
│ petri-dish          │  0.24/s  │ petri-dish                                 │ petri-dish-bacteria                                                                         │
│ empty-petri-dish    │  0.24/s  │ empty-petri-dish                           │ petri-dish                                                                                  │
│ agar                │  0.24/s  │ agar                                       │ petri-dish                                                                                  │
│ molten-glass        │ 22.00/s  │ glass-1                                    │ empty-petri-dish 12.00, flask 10.00                                                         │
│ seaweed             │  2.20/s  │ seaweed-1                                  │ agar 1.20, sodium-alginate 1.00                                                             │
│ steam               │ 54.00/s  │ electric-boiler-water-to-steam             │ agar 24.00, latex 30.00                                                                     │
│ muddy-sludge        │ 31.53/s  │ soil-washing                               │ Moss-1                                                                                      │
│ stopper             │  0.40/s  │ stopper                                    │ flask                                                                                       │
│ latex               │  0.20/s  │ latex                                      │ stopper                                                                                     │
│ latex-slab          │  0.20/s  │ latex-slab                                 │ latex                                                                                       │
│ sodium-alginate     │  0.20/s  │ sodium-alginate                            │ latex-slab                                                                                  │
│ creamy-latex        │ 20.00/s  │ creamy-latex                               │ latex-slab                                                                                  │
│ formic-acid         │ 20.00/s  │ full-render-vrauks                         │ latex-slab                                                                                  │
│ saps                │  0.70/s  │ sap-01                                     │ creamy-latex 0.40, vrauks-cocoon-1 0.30                                                     │
│ cage                │  0.10/s  │ full-render-vrauks                         │ caged-vrauks                                                                                │
│ caged-vrauks        │  0.10/s  │ caged-vrauks                               │ full-render-vrauks                                                                          │
│ vrauks              │  0.10/s  │ vrauks-1                                   │ caged-vrauks                                                                                │
│ barrel              │  0.55/s  │ vrauks-1 0.15 + vrauks-cocoon-1 0.40       │ water-barrel                                                                                │
│ water-barrel        │  0.55/s  │ water-barrel                               │ vrauks-1 0.15, vrauks-cocoon-1 0.40                                                         │
│ cocoon              │  0.50/s  │ vrauks-cocoon-1                            │ vrauks-1                                                                                    │
└─────────────────────┴──────────┴────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Closed loops

- **cage**: full-render-vrauks outputs cage → caged-vrauks consumes cage (net zero)
- **barrel**: vrauks-1/vrauks-cocoon-1 output barrels → water-barrel refills them (net zero)
- **wood-seeds**: 6% of wood feeds back to seeds → seedlings → logs

## Module cost

480 moss + 160 vrauks + 110 seaweed + 90 tree-mk01 + 28 sap-tree + 8 vrauks (rc) = 876 bio modules
