# Logistic science pack — 0.1/s, 226 buildings (WIP)

Fully self-contained chain from raw resources. mk01 buildings, stone furnaces, bio modules on all farms.
Block splitting into 3 blocks (battery/chemistry, bio/farming, assembly) not yet done.

All factories mk01 tier. Stone furnaces for smelting (iron, copper, lead, tin, zinc, titanium, nexelit). Advanced-foundry-mk01 for steel (stone-furnace can't do advanced-foundry category). Bio modules on all farms/paddocks at mk01 slot counts.

## Flow diagram

```
                         ┌─────────────────────────────────────┐
                         │     LOGISTIC-SCIENCE-PACK (0.1/s)   │
                         │  1x research-center-mk01            │
                         └──┬────────┬────────┬────────┬───────┘
                            │        │        │        │
                   animal-  │  alien- │  solidif│  battery
                   sample   │  sample │  -sarco│  -mk01
                   (0.02/s) │ (0.02/s)│ (0.01) │ (0.03/s)
                            │        │        │        │
        ┌───────────────────┘        │        │        └──────────────────┐
        ▼                            ▼        ▼                          ▼
  ┌───────────┐              ┌──────────┐  ┌──────────┐        ┌──────────────────┐
  │ANIMAL-    │              │ALIEN-    │  │COTTONGUT-│        │BATTERY-MK01      │
  │SAMPLE-01  │              │SAMPLE01  │  │SCIENCE-  │        │0.27x chem-plant  │
  │0.17x      │              │          │  │RED-SEEDS │        │                  │
  │genlab     │              │bio-sample│  │          │        │needs: graphite,  │
  │           │              │ground-   │  │needs:    │        │cyanic-acid, zinc,│
  │needs:     │              │sample    │  │plasmids, │        │melamine, pbsb-   │
  │blood,guts,│              │          │  │fawogae-  │        │alloy, glass,bolts│
  │meat,skin, │              │          │  │substrate,│        └─┬──┬──┬──┬──┬────┘
  │bones,fat, │              │          │  │depoly-org│          │  │  │  │  │
  │brain,     │              │          │  └──────────┘          │  │  │  │  │
  │plasmids   │              └──────────┘                        │  │  │  │  │
  └─────┬─────┘                                                 │  │  │  │  │
        │                                                       │  │  │  │  │
        ▼                                                       │  │  │  │  │
  ┌─────────────────────────────────────────────────────────────┐│  │  │  │  │
  │                    BIO / FARMING (102 bldgs)                ││  │  │  │  │
  │                                                            ││  │  │  │  │
  │  COTTONGUT  11x prandium + 1x rc + 1x slaughterhouse       ││  │  │  │  │
  │  VRAUKS    10x paddock + 3x rc + 1x slaughterhouse         ││  │  │  │  │
  │  MOONDROP  22x greenhouse + 1x methane-co2                 ││  │  │  │  │
  │  RALESIA   16x plantation + 2x botanical-nursery           ││  │  │  │  │
  │  MOSS       7x moss-farm                                   ││  │  │  │  │
  │  SEAWEED    6x seaweed-crop                                ││  │  │  │  │
  │  SAP        9x sap-extractor                               ││  │  │  │  │
  │  WOOD       2x fwf + 1x wpu + 1x nursery                  ││  │  │  │  │
  │  AUOG       2x auog-paddock ──▶ manure ──▶ urea cycle      ││  │  │  │  │
  │  SOIL       4x soil-extractor + 1x limestone + 1x separator││  │  │  │  │
  └────────────────────────────────────────────────────────────┘│  │  │  │  │
                                                                │  │  │  │  │
        ┌───────────────────────────────────────────────────────┘  │  │  │  │
        ▼                                                          │  │  │  │
  ┌──────────────────┐                                             │  │  │  │
  │ UREA CYCLE       │◄── auog manure                              │  │  │  │
  │ (4 bldgs)        │                                             │  │  │  │
  │                  │                                             │  │  │  │
  │ manure ──▶ liquid-manure ──▶ urea ──▶ urea-decomposition      │  │  │  │
  │                                       ├──▶ cyanic-acid ────────┘  │  │  │
  │ muddy-sludge ◄── clean-nexelit        └──▶ ammonia ──▶ melamine──┘  │  │
  │      └──▶ Moss-2                                                   │  │
  └──────────────────┘                                                 │  │
                                                                       │  │
        ┌──────────────────────────────────────────────────────────────┘  │
        ▼                                                                │
  ┌────────────────────────────────────────┐                             │
  │ COAL & TAR CHEMISTRY (13 bldgs)        │                             │
  │                                        │                             │
  │ raw-coal ──▶ distilled-raw-coal (4x)   │                             │
  │              ├──▶ coke ──▶ graphite ───┼──▶ battery-mk01             │
  │              ├──▶ tar ──┬──▶ tar-distilation ──▶ aromatics           │
  │              │          │    └──▶ carbon-dioxide ──▶ Moss-2          │
  │              │          └──▶ tar-refining ──▶ creosote ──▶ treated-  │
  │              │               └──▶ anthracene-oil ──▶ carbon-black   │
  │              └──▶ coal (byproduct, fuel for smelting)                │
  │                                        │                             │
  │ syngas ──▶ aromatics-to-plastic ──▶ plastic ──▶ sb-oxide            │
  │ aromatics ──▶ polybutadiene ──▶ rubber ──▶ lab-instrument           │
  │ carbon-black + latex ──▶ rubber-01                                  │
  │ treated-wood + methanal + raw-fiber ──▶ formica ──▶ pcb1            │
  └────────────────────────────────────────┘                             │
                                                                         │
        ┌────────────────────────────────────────────────────────────────┘
        ▼
  ┌────────────────────────────────────────┐
  │ SMELTING & METALS (48 bldgs)           │
  │                                        │
  │ 7x iron    ──▶ iron-stick ──▶ bolts, cage                  │
  │ 7x lead    ──▶ solder, pbsb-alloy                         │
  │ 6x tin     ──▶ solder, capacitor, equipment-chassi         │
  │ 6x titanium──▶ cage, polybutadiene                         │
  │ 2x copper  ──▶ cable, pcb, vacuum-tube                     │
  │ 2x zinc    ──▶ battery-mk01                                │
  │ 4x glass   ──▶ battery, lamp, flask, petri-dish            │
  │                                        │
  │ ANTIMONY (8 bldgs):                    │
  │ antimonium-ore ──▶ sb-grade-01 (6x)    │
  │ ──▶ 02 ──▶ 03 ──▶ 04 ──▶ sb-oxide     │
  │ ──▶ pbsb-alloy ──▶ battery             │
  │ ──▶ fenxsb-alloy ──▶ equipment-chassi  │
  └────────────────────────────────────────┘

  ┌────────────────────────────────────────┐
  │ ELECTRONICS & ASSEMBLY (17 bldgs)      │
  │                                        │
  │ ceramic ──▶ capacitor1, inductor1      │
  │ formica ──▶ pcb1 ──┐                   │
  │ vacuum-tube ───────┤                   │
  │ resistor1 ─────────┼──▶ e-circuit-2    │
  │ capacitor1 ────────┤  └──▶ equip-chassi│
  │ inductor1 ─────────┘     └──▶ lab-inst │
  │                                        │
  │ copper-cable ──▶ small-lamp ──▶ zogna  │
  │ iron-gear+bolts ──▶ small-parts ──▶ lab│
  │ lens (glass) ──▶ lab-instrument        │
  └────────────────────────────────────────┘
```

## Recipe tables

226 buildings solver-validated (simplex). Self-power not yet computed.

### Bio — farms & paddocks (102 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| moondrop-1 | moondrop-greenhouse-mk01 | 22 | 16x moondrop |
| moondrop-seeds | botanical-nursery | 1 (0.41) | |
| ralesia-1 | ralesia-plantation-mk01 | 16 | 12x ralesia |
| ralesia-seeds | botanical-nursery | 2 | |
| caged-cottongut-1 | prandium-lab-mk01 | 11 | 20x cottongut-mk01 |
| cottongut-cub-1 | rc-mk01 | 1 | 2x cottongut-mk01 |
| vrauks-1 | vrauks-paddock-mk01 | 10 | 10x vrauks |
| vrauks-cocoon-1 | rc-mk01 | 3 | 2x vrauks |
| Moss-2 | moss-farm-mk01 | 7 | 15x moss |
| seaweed-1 | seaweed-crop-mk01 | 6 | 10x seaweed |
| sap-01 | sap-extractor-mk01 | 9 | 2x sap-tree |
| log2 | fwf-mk01 | 2 | 10x tree-mk01 |
| log-wood-fast | wpu-mk01 | 1 (0.02) | |
| wood-seedling | botanical-nursery | 1 (0.34) | |
| wood-seeds | automated-factory-mk01 | 1 (0.37) | |
| auog-pooping-1 | auog-paddock-mk01 | 2 | 4x auog |
| methane-co2 | moondrop-greenhouse-mk01 | 1 (0.09) | 16x moondrop |
| soil | soil-extractor-mk01 | 4 | |
| extract-limestone-01 | soil-extractor-mk01 | 1 (0.44) | |
| soil-separation-2 | solid-separator | 1 | |

### Bio — processing (18 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| full-render-cottongut | slaughterhouse-mk01 | 1 | |
| full-render-vrauks | slaughterhouse-mk01 | 1 | |
| caged-vrauks | automated-factory-mk01 | 1 (0.03) | |
| cage | automated-factory-mk01 | 1 (0.23) | |
| bone-to-bonemeal-2 | fbreactor-mk01 | 1 (0.04) | |
| cellulose-00 | hpf | 1 (0.08) | |
| depolymerized-organics | reformer-mk01 | 1 (0.01) | |
| fawogae-substrate | automated-factory-mk01 | 1 (0.01) | |
| fiber-01 | wpu-mk01 | 1 (0.10) | |
| agar | hpf | 1 (0.46) | |
| sodium-alginate | hpf | 1 | |
| creamy-latex | washer | 1 | |
| latex | hpf | 2 | |
| latex-slab | distilator | 1 | |
| rubber-01 | heavy-oil-refinery-mk01 | 1 (0.39) | |
| carbon-black | reformer-mk01 | 1 (0.10) | |
| polybutadiene | cracker-mk01 | 1 (0.10) | |

### Bio — science ingredients (13 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| animal-sample-01 | genlab-mk01 | 1 (0.17) | |
| alien-sample01 | automated-factory-mk01 | 1 (0.04) | |
| bio-sample01 | automated-factory-mk01 | 1 (0.02) | |
| ground-sample01 | automated-factory-mk01 | 1 (0.03) | |
| cottongut-science-red-seeds | incubator-mk01 | 1 (0.04) | |
| plasmids | biofactory-mk01 | 1 (0.16) | |
| petri-dish-bacteria | micro-mine-mk01 | 1 | |
| petri-dish | automated-factory-mk01 | 1 (0.46) | |
| empty-petri-dish | glassworks-mk01 | 1 (0.28) | |
| zogna-bacteria | incubator-mk01 | 1 (0.15) | |
| flask | glassworks-mk01 | 1 (0.03) | |
| stopper | automated-factory-mk01 | 1 (0.05) | |
| lab-instrument | automated-factory-mk01 | 1 (0.07) | |

### Urea cycle (4 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| urea-from-liquid-manure | bio-reactor-mk01 | 1 (0.16) | |
| liquid-manure | bio-reactor-mk01 | 1 (0.17) | |
| urea-decomposition | distilator | 1 (0.23) | |
| melamine | fbreactor-mk01 | 1 (0.03) | |

### Coal & tar chemistry (13 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| distilled-raw-coal | distilator | 4 | |
| tar-distilation | distilator | 1 (0.28) | |
| tar-refining | tar-processing-unit | 1 | |
| coke-coal | hpf | 1 (0.12) | |
| graphite | hpf | 1 (0.13) | |
| syngas | gasifier | 1 (0.14) | |
| aromatics-to-plastic | biofactory-mk01 | 1 (0.05) | |
| treated-wood | tar-processing-unit | 1 (0.01) | |
| formica | pulp-mill-mk01 | 1 (0.04) | |
| methanal | hpf | 1 (0.02) | |

### Smelting & metals (48 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| iron-plate | stone-furnace | 7 | |
| copper-plate | stone-furnace | 2 | |
| lead-plate-1 | stone-furnace | 7 | |
| tin-plate-1 | stone-furnace | 6 | |
| zinc-plate-1 | stone-furnace | 2 | |
| titanium-plate-1 | stone-furnace | 6 | |
| steel-plate | advanced-foundry-mk01 | 1 (0.00) | |
| nexelit-plate-2 | stone-furnace | 1 (0.03) | |
| clean-nexelit | washer | 1 (0.22) | |
| glass-1 | glassworks-mk01 | 4 | |
| molten-glass | glassworks-mk01 | 1 (0.06) | |
| sb-grade-01 | automated-screener-mk01 | 6 | |
| sb-grade-02 | jaw-crusher | 1 (0.00) | |
| sb-grade-03 | automated-screener-mk01 | 1 | |
| sb-grade-04 | secondary-crusher-mk01 | 1 (0.05) | |
| sb-oxide-01 | bof-mk01 | 1 (0.32) | |
| pbsb-alloy | smelter-mk01 | 1 (0.27) | |
| fenxsb-alloy-2 | smelter-mk01 | 1 (0.10) | |

### Battery & chemistry (11 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| battery-mk01 | chemical-plant-mk01 | 1 (0.27) | |
| hydrogen | electrolyzer-mk01 | 1 | |
| solder-0 | automated-factory-mk01 | 1 | |
| boron-trioxide | hpf | 1 (0.03) | |
| boric-acid | electrolyzer-mk01 | 1 (0.01) | |
| diborane | electrolyzer-mk01 | 1 (0.02) | |
| borax-washing | washer | 1 (0.02) | |
| vacuum | vacuum-pump-mk01 | 1 (0.05) | |
| pressured-air | vacuum-pump-mk01 | 1 (0.01) | |
| pressured-water | vacuum-pump-mk01 | 1 (0.02) | |
| subcritical-water-01 | py-heat-exchanger | 1 (0.42) | |

### Electronics & assembly (17 buildings)

| Recipe | Factory | Count | Modules |
|---|---|---:|---|
| electronic-circuit-2 | chipshooter-mk01 | 1 (0.01) | |
| capacitor1 | electronics-factory-mk01 | 1 (0.02) | |
| inductor1 | electronics-factory-mk01 | 1 (0.01) | |
| resistor1 | electronics-factory-mk01 | 1 (0.02) | |
| pcb1 | pcb-factory-mk01 | 1 (0.01) | |
| vacuum-tube | electronics-factory-mk01 | 1 (0.02) | |
| ceramic | hpf | 1 (0.01) | |
| clay | clay-pit-mk01 | 1 (0.01) | |
| copper-cable | automated-factory-mk01 | 1 (0.05) | |
| small-lamp | automated-factory-mk01 | 1 (0.01) | |
| small-parts-01 | automated-factory-mk01 | 1 (0.00) | |
| iron-gear-wheel | automated-factory-mk01 | 1 (0.01) | |
| iron-stick | automated-factory-mk01 | 1 (0.26) | |
| bolts | automated-factory-mk01 | 1 (0.02) | |
| equipment-chassi | automated-factory-mk01 | 1 (0.07) | |
| lens | glassworks-mk01 | 1 (0.03) | |
| logistic-science-pack | research-center-mk01 | 1 | |

## Intermediate flows

All rates /s. Only intermediates >= 0.01/s shown.

### High-volume flows (>= 1/s)

| Item | /s | Produced by | Consumed by |
|---|---:|---|---|
| coal-gas | 102.39 | distilled-raw-coal | syngas |
| tar | 52.56 | syngas (1.36), distilled-raw-coal (51.19) | tar-distilation (39.59), tar-refining (12.96) |
| hydrogen | 13.30 | hydrogen (electrolyzer) | diborane (0.65), ralesia-1 (12.66) |
| creamy-latex | 11.67 | creamy-latex (washer) | latex-slab |
| formic-acid | 11.67 | full-render-vrauks | latex-slab |
| carbon-dioxide | 11.39 | tar-distilation (11.31), melamine (0.08) | Moss-2 (7.59), methane-co2 (0.58) |
| aromatics | 11.31 | tar-distilation | aromatics-to-plastic (1.59), polybutadiene (9.72) |
| anthracene-oil | 9.72 | tar-refining | carbon-black |
| muddy-sludge | 7.59 | clean-nexelit (7.19), melamine (0.13), borax (0.26) | Moss-2 |
| soil | 7.52 | soil (extractor) | soil-separation-2 (5.56), ralesia-1 (1.90) |
| molten-glass | 7.50 | glass-1 | empty-petri-dish (4.60), flask, lens, molten-glass |
| oxygen | 6.65 | hydrogen (electrolyzer) | sb-oxide-01 |
| pressured-water | 5.56 | pressured-water (pump) | subcritical-water-01 |
| coal | 5.12 | distilled-raw-coal | smelting fuel (multiple furnaces) |
| vacuum | 5.10 | vacuum (pump) | carbon-black (4.86), pcb1, vacuum-tube |
| polybutadiene | 4.86 | polybutadiene (cracker) | rubber-01 |
| syngas | 3.18 | syngas (gasifier) | aromatics-to-plastic |
| sb-grade-02 | 3.15 | sb-grade-01 | sb-grade-03 |
| creosote | 3.11 | tar-refining | treated-wood |
| liquid-manure | 2.12 | liquid-manure (bio-reactor) | urea-from-liquid-manure (1.99), depolymerized-organics (0.14) |
| stone | 2.10 | sb-grade-01 | sodium-alginate (0.58), Moss-2 (1.52) |
| ralesia-seeds | 2.03 | ralesia-seeds (nursery) | ralesia-1 (1.01), cottongut-cub (0.73), caged-cottongut (0.21), bio-sample (0.07) |
| blood | 2.00 | full-render-cottongut | animal-sample-01 |
| boric-acid | 1.94 | boric-acid (electrolyzer) | boron-trioxide |
| pressured-air | 1.47 | pressured-air (pump) | zogna-bacteria |
| subcritical-water | 1.39 | subcritical-water-01 (heat-exchanger) | depolymerized-organics |
| ralesia | 1.27 | ralesia-1 | ralesia-seeds |
| moss | 1.21 | Moss-2 | vrauks-cocoon (0.58), auog (0.39), vrauks-1 (0.15), wood-seedling (0.08), fawogae (0.01) |
| seaweed | 1.04 | seaweed-1 | sodium-alginate (0.58), agar (0.46) |
| iron-stick | 1.03 | iron-stick | cage (0.87), bolts (0.15) |

### Medium-volume flows (0.01–1/s)

| Item | /s | Produced by | Consumed by |
|---|---:|---|---|
| cyanic-acid | 0.86 | urea-decomposition | battery-mk01 (0.81), melamine (0.05) |
| ammonia | 0.86 | urea-decomposition | melamine |
| biomass | 0.83 | soil-separation-2 | subcritical-water-01 |
| limestone | 0.73 | extract-limestone (0.18), soil-separation (0.56) | sodium-alginate, creamy-latex, cellulose |
| wood | 0.67 | log-wood-fast | wood-seeds (0.37), zogna-bacteria (0.15), fiber-01 (0.10), cellulose (0.06) |
| lead-plate | 0.64 | lead-plate-1 | solder-0 (0.48), pbsb-alloy (0.16) |
| iron-plate | 0.64 | iron-plate | iron-stick (0.51), iron-gear (0.05), small-lamp (0.03), fenxsb (0.03) |
| moondrop-seeds | 0.61 | moondrop-seeds | moondrop-1 (0.60), methane-co2 (0.01) |
| moondrop | 0.60 | moondrop-1 | caged-cottongut (0.28), moondrop-seeds (0.23), cottongut-cub (0.10) |
| urea | 0.60 | urea-from-liquid-manure | urea-decomposition (0.57), bio-sample01 (0.02) |
| zogna-bacteria | 0.59 | zogna-bacteria (incubator) | plasmids (0.39), urea-from-liquid-manure (0.20) |
| cottongut-pup | 0.49 | cottongut-cub-1 | caged-cottongut-1 |
| saps | 0.45 | sap-01 | creamy-latex (0.23), vrauks-cocoon (0.17), formica (0.04) |
| cottongut | 0.42 | caged-cottongut-1 | cottongut-cub (0.19), full-render-cottongut (0.17), cottongut-science (0.06) |
| diborane | 0.39 | diborane (electrolyzer) | boric-acid |
| tin-plate | 0.35 | tin-plate-1 | solder-0 (0.24), equipment-chassi (0.10), capacitor1 (0.01) |
| titanium-plate | 0.34 | titanium-plate-1 | cage (0.29), polybutadiene (0.05) |
| sb-grade-04 | 0.32 | sb-grade-03 (0.28), sb-grade-04 (0.04) | sb-oxide-01 |
| cocoon | 0.29 | vrauks-cocoon-1 | vrauks-1 |
| wood-seeds | 0.29 | wood-seeds | caged-cottongut (0.28), wood-seedling (0.02) |
| coke | 0.24 | coke-coal | graphite (0.22), resistor1 (0.01), boron-trioxide (0.01) |
| methane | 0.23 | methane-co2 | methanal |
| manure | 0.21 | auog-pooping-1 | liquid-manure |
| carbon-black | 0.19 | carbon-black (reformer) | rubber-01 |
| methanal | 0.19 | methanal (hpf) | formica |
| copper-cable | 0.18 | copper-cable | small-lamp (0.09), small-parts-01 (0.07), inductor1 (0.02) |
| bones | 0.17 | full-render-cottongut | animal-sample-01 (0.08), bone-to-bonemeal-2 (0.08) |
| copper-plate | 0.16 | copper-plate | copper-cable (0.09), small-lamp (0.03), methanal (0.02), pcb1 (0.01), vacuum-tube (0.01) |
| bolts | 0.15 | bolts | battery-mk01 (0.08), small-parts-01 (0.07) |
| depolymerized-organics | 0.14 | depolymerized-organics (reformer) | cottongut-science-red-seeds |
| solder | 0.12 | solder-0 | cage (0.12), electronic-circuit-2 (0.00) |
| latex | 0.12 | latex (hpf) | rubber-01 (0.10), stopper (0.02) |
| cage | 0.12 | cage (0.06), full-render-vrauks (0.06) | caged-vrauks |
| latex-slab | 0.12 | latex-slab (distilator) | latex |
| sodium-alginate | 0.12 | sodium-alginate (hpf) | latex-slab |
| rich-clay | 0.11 | tar-distilation | ground-sample01 |
| rubber | 0.10 | rubber-01 | lab-instrument |
| glass | 0.10 | molten-glass | small-lamp (0.06), battery-mk01 (0.03), vacuum-tube (0.01) |
| empty-petri-dish | 0.09 | empty-petri-dish (glassworks) | petri-dish |
| agar | 0.09 | agar (hpf) | petri-dish |
| petri-dish | 0.09 | petri-dish | petri-dish-bacteria (0.03), zogna-bacteria (0.06) |
| graphite | 0.09 | graphite (hpf) | battery-mk01 (0.08), vacuum-tube (0.01) |
| zinc-plate | 0.08 | zinc-plate-1 | battery-mk01 |
| log | 0.07 | log2 | log-wood-fast |
| vrauks | 0.06 | vrauks-1 | caged-vrauks |
| caged-vrauks | 0.06 | caged-vrauks | full-render-vrauks |
| melamine | 0.05 | melamine (fbreactor) | battery-mk01 |
| wood-seedling | 0.05 | wood-seedling (nursery) | log2 |
| small-parts-01 | 0.05 | small-parts-01 | lab-instrument |
| bonemeal | 0.04 | bone-to-bonemeal-2 | bio-sample01 |
| stopper | 0.04 | stopper | flask |
| pbsb-alloy | 0.03 | pbsb-alloy (smelter) | battery-mk01 |
| battery-mk01 | 0.03 | battery-mk01 (chem-plant) | logistic-science-pack (0.03), electronic-circuit-2 (0.00) |
| plastic-bar | 0.03 | aromatics-to-plastic | sb-oxide-01 |
| petri-dish-bacteria | 0.03 | petri-dish-bacteria (micro-mine) | plasmids (0.02), bio-sample (0.01), fawogae-substrate (0.01) |
| sb-oxide | 0.03 | sb-oxide-01 | pbsb-alloy (0.03), fenxsb-alloy (0.00) |
| borax | 0.03 | borax-washing | diborane |
| lens | 0.03 | lens (glassworks) | lab-instrument |
| small-lamp | 0.03 | small-lamp | zogna-bacteria |
| lab-instrument | 0.02 | lab-instrument | plasmids |
| equipment-chassi | 0.02 | equipment-chassi | lab-instrument |
| plasmids | 0.02 | plasmids (biofactory) | animal-sample-01, cottongut-science-red-seeds |
| flask | 0.02 | flask (glassworks) | plasmids |
| raw-fiber | 0.02 | fiber-01 | formica |
| alien-sample01 | 0.02 | alien-sample01 | logistic-science-pack |
| animal-sample-01 | 0.02 | animal-sample-01 | logistic-science-pack |
| bio-sample01 | 0.02 | bio-sample01 | alien-sample01 |
| iron-gear-wheel | 0.02 | iron-gear-wheel | small-parts-01 |
| resistor1 | 0.01 | resistor1 | electronic-circuit-2 |
| nexelit-plate | 0.01 | nexelit-plate-2 | fenxsb-alloy-2 |
| fenxsb-alloy | 0.01 | fenxsb-alloy-2 | equipment-chassi |
| boron-trioxide | 0.01 | boron-trioxide (hpf) | lens |
| capacitor1 | 0.01 | capacitor1 | electronic-circuit-2 |
| electronic-circuit | 0.01 | electronic-circuit-2 | equipment-chassi |
| solidified-sarcorus | 0.01 | cottongut-science-red-seeds | logistic-science-pack |
| cellulose | 0.01 | cellulose-00 | fawogae-substrate |
| treated-wood | 0.01 | treated-wood | formica |
| vacuum-tube | 0.01 | vacuum-tube | electronic-circuit-2 |
| inductor1 | 0.01 | inductor1 | electronic-circuit-2 |

## Imports

All raw mined resources — no processed items.

| Resource | /s |
|---|---:|
| water | 566.68 |
| steam | 41.71 |
| raw-coal | 17.65 |
| antimonium-ore | 10.50 |
| iron-ore | 5.13 |
| ore-quartz | 4.50 |
| ore-lead | 3.86 |
| ore-tin | 3.49 |
| ore-titanium | 3.40 |
| native-flora | 1.57 |
| copper-ore | 1.25 |
| ore-zinc | 0.81 |
| water-barrel | 0.80 |
| nexelit-ore | 0.22 |
| raw-borax | 0.03 |

## Exports

| Item | /s |
|---|---:|
| logistic-science-pack | 0.10 |

## Byproducts (wasted)

| Byproduct | /s | Notes |
|---|---:|---|
| coal-gas | 100.12 | from coal distillation — self-power fuel candidate |
| flue-gas | 56.56 | from smelting |
| steam | 48.61 | from various processes |
| pitch | 18.15 | tar byproduct — fuel or tar recycling |
| sb-grade-01 | 5.25 | antimony screening waste |
| oxygen | 5.06 | from electrolysis |
| middle-oil | 3.89 | tar-refining byproduct, no consumer in chain |
| sand | 3.61 | |
| coal | 3.37 | from coal processing (net after smelting fuel) |
| carbon-dioxide | 3.22 | excluded from melamine |
| creosote | 2.72 | tar byproduct |
| sb-grade-02 | 2.59 | antimony screening waste |
| ammonia | 0.81 | from urea decomposition |

## Key design decisions

- **Urea cycle closes without dedicated muddy-sludge recipe.** LP scales up clean-nexelit production to get enough muddy-sludge as a byproduct. The urea demand is driven by cyanic-acid for batteries (0.81/s), not melamine (0.05/s).
- **Bio modules are the dominant factor.** Without modules: 1000+ buildings. With mk01 modules: 226. The 5-21x speed multiplier on farms dwarfs the mk01-mk04 building tier difference.
- **Growth cycles self-sustaining.** Cottongut, wood, ralesia, moondrop seed loops are all net-positive. No seed imports needed.
- **Two solver constraints required:**
  - `full-render-vrauks:cage:exclude` — prevents cage recycling loop from vrauks rendering
  - `melamine:carbon-dioxide:exclude` — prevents melamine CO2 from feeding back into the urea cycle
- **Coal chain provides petrochemistry backbone.** Coke for graphite (battery electrode), tar for plastics/rubber/PCBs. 100/s coal-gas byproduct is massive self-power fuel.

## Solver command

```bash
npx tsx src/cli.ts solve \
  --recipes "logistic-science-pack,battery-mk01,animal-sample-01,alien-sample01,cottongut-science-red-seeds,pbsb-alloy,sb-oxide-01,sb-grade-01,sb-grade-02,sb-grade-03,sb-grade-04,melamine,urea-decomposition,graphite,coke-coal,bolts,iron-stick,glass-1,molten-glass,zinc-plate-1,lead-plate-1,aromatics-to-plastic,syngas,distilled-raw-coal,tar-distilation,hydrogen,ground-sample01,rich-clay,soil,electronic-circuit-2,capacitor1,inductor1,resistor1,pcb1,vacuum-tube,solder-0,tin-plate-1,ceramic,clay,formica,treated-wood,fiber-01,methanal,vacuum,pressured-air,plasmids,flask,stopper,lab-instrument,equipment-chassi,fenxsb-alloy-2,lens,small-parts-01,iron-gear-wheel,copper-cable,small-lamp,petri-dish-bacteria,petri-dish,empty-petri-dish,agar,zogna-bacteria,rubber-01,carbon-black,polybutadiene,latex,latex-slab,sodium-alginate,creamy-latex,boron-trioxide,boric-acid,diborane,borax-washing,iron-plate,copper-plate,titanium-plate-1,steel-plate,nexelit-plate-2,clean-nexelit,seaweed-1,sap-01,tar-refining,bio-sample01,bone-to-bonemeal-2,full-render-cottongut,full-render-vrauks,caged-vrauks,vrauks-1,vrauks-cocoon-1,cage,fawogae-substrate,cellulose-00,depolymerized-organics,fawogae-1,fawogae-spore,pressured-water,extract-limestone-01,soil-separation-2,subcritical-water-01,Moss-2,methane-co2,liquid-manure,auog-pooping-1,urea-from-liquid-manure,caged-cottongut-1,cottongut-cub-1,log-wood-fast,log2,wood-seedling,wood-seeds,ralesia-1,ralesia-seeds,moondrop-1,moondrop-seeds" \
  --constraint "full-render-vrauks:cage:exclude" \
  --constraint "melamine:carbon-dioxide:exclude" \
  --target "logistic-science-pack:6" --time 60 \
  --solver simplex --unlocked \
  --factory "logistic-science-pack:research-center-mk01" \
  --factory "battery-mk01:chemical-plant-mk01" \
  --factory "animal-sample-01:genlab-mk01" \
  --factory "alien-sample01:automated-factory-mk01" \
  --factory "cottongut-science-red-seeds:incubator-mk01" \
  --factory "pbsb-alloy:smelter-mk01" \
  --factory "sb-oxide-01:bof-mk01" \
  --factory "sb-grade-01:automated-screener-mk01" \
  --factory "sb-grade-02:jaw-crusher" \
  --factory "sb-grade-03:automated-screener-mk01" \
  --factory "sb-grade-04:secondary-crusher-mk01" \
  --factory "melamine:fbreactor-mk01" \
  --factory "urea-decomposition:distilator" \
  --factory "graphite:hpf" \
  --factory "coke-coal:hpf" \
  --factory "bolts:automated-factory-mk01" \
  --factory "iron-stick:automated-factory-mk01" \
  --factory "glass-1:glassworks-mk01" \
  --factory "molten-glass:glassworks-mk01" \
  --factory "zinc-plate-1:stone-furnace" \
  --factory "lead-plate-1:stone-furnace" \
  --factory "aromatics-to-plastic:biofactory-mk01" \
  --factory "syngas:gasifier" \
  --factory "distilled-raw-coal:distilator" \
  --factory "tar-distilation:distilator" \
  --factory "hydrogen:electrolyzer-mk01" \
  --factory "ground-sample01:automated-factory-mk01" \
  --factory "rich-clay:automated-factory-mk01" \
  --factory "soil:soil-extractor-mk01" \
  --factory "electronic-circuit-2:chipshooter-mk01" \
  --factory "capacitor1:electronics-factory-mk01" \
  --factory "inductor1:electronics-factory-mk01" \
  --factory "resistor1:electronics-factory-mk01" \
  --factory "pcb1:pcb-factory-mk01" \
  --factory "vacuum-tube:electronics-factory-mk01" \
  --factory "solder-0:automated-factory-mk01" \
  --factory "tin-plate-1:stone-furnace" \
  --factory "ceramic:hpf" \
  --factory "clay:clay-pit-mk01" \
  --factory "formica:pulp-mill-mk01" \
  --factory "treated-wood:tar-processing-unit" \
  --factory "fiber-01:wpu-mk01" \
  --factory "methanal:hpf" \
  --factory "vacuum:vacuum-pump-mk01" \
  --factory "pressured-air:vacuum-pump-mk01" \
  --factory "plasmids:biofactory-mk01" \
  --factory "flask:glassworks-mk01" \
  --factory "stopper:automated-factory-mk01" \
  --factory "lab-instrument:automated-factory-mk01" \
  --factory "equipment-chassi:automated-factory-mk01" \
  --factory "fenxsb-alloy-2:smelter-mk01" \
  --factory "lens:glassworks-mk01" \
  --factory "small-parts-01:automated-factory-mk01" \
  --factory "iron-gear-wheel:automated-factory-mk01" \
  --factory "copper-cable:automated-factory-mk01" \
  --factory "small-lamp:automated-factory-mk01" \
  --factory "petri-dish-bacteria:micro-mine-mk01" \
  --factory "petri-dish:automated-factory-mk01" \
  --factory "empty-petri-dish:glassworks-mk01" \
  --factory "agar:hpf" \
  --factory "zogna-bacteria:incubator-mk01" \
  --factory "rubber-01:heavy-oil-refinery-mk01" \
  --factory "carbon-black:reformer-mk01" \
  --factory "polybutadiene:cracker-mk01" \
  --factory "latex:hpf" \
  --factory "latex-slab:distilator" \
  --factory "sodium-alginate:hpf" \
  --factory "creamy-latex:washer" \
  --factory "boron-trioxide:hpf" \
  --factory "boric-acid:electrolyzer-mk01" \
  --factory "diborane:electrolyzer-mk01" \
  --factory "borax-washing:washer" \
  --factory "iron-plate:stone-furnace" \
  --factory "copper-plate:stone-furnace" \
  --factory "titanium-plate-1:stone-furnace" \
  --factory "steel-plate:advanced-foundry-mk01" \
  --factory "nexelit-plate-2:stone-furnace" \
  --factory "clean-nexelit:washer" \
  --factory "seaweed-1:seaweed-crop-mk01" \
  --factory "sap-01:sap-extractor-mk01" \
  --factory "tar-refining:tar-processing-unit" \
  --factory "bio-sample01:automated-factory-mk01" \
  --factory "bone-to-bonemeal-2:fbreactor-mk01" \
  --factory "full-render-cottongut:slaughterhouse-mk01" \
  --factory "full-render-vrauks:slaughterhouse-mk01" \
  --factory "caged-vrauks:automated-factory-mk01" \
  --factory "vrauks-1:vrauks-paddock-mk01" \
  --factory "vrauks-cocoon-1:rc-mk01" \
  --factory "cage:automated-factory-mk01" \
  --factory "fawogae-substrate:automated-factory-mk01" \
  --factory "cellulose-00:hpf" \
  --factory "depolymerized-organics:reformer-mk01" \
  --factory "fawogae-1:fawogae-plantation-mk01" \
  --factory "fawogae-spore:spore-collector-mk01" \
  --factory "pressured-water:vacuum-pump-mk01" \
  --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "soil-separation-2:solid-separator" \
  --factory "subcritical-water-01:py-heat-exchanger" \
  --factory "Moss-2:moss-farm-mk01" \
  --factory "methane-co2:moondrop-greenhouse-mk01" \
  --factory "liquid-manure:bio-reactor-mk01" \
  --factory "auog-pooping-1:auog-paddock-mk01" \
  --factory "urea-from-liquid-manure:bio-reactor-mk01" \
  --factory "caged-cottongut-1:prandium-lab-mk01" \
  --factory "cottongut-cub-1:rc-mk01" \
  --factory "log-wood-fast:wpu-mk01" \
  --factory "log2:fwf-mk01" \
  --factory "wood-seedling:botanical-nursery" \
  --factory "wood-seeds:automated-factory-mk01" \
  --factory "ralesia-1:ralesia-plantation-mk01" \
  --factory "ralesia-seeds:botanical-nursery" \
  --factory "moondrop-1:moondrop-greenhouse-mk01" \
  --factory "moondrop-seeds:botanical-nursery" \
  --modules "seaweed-1:seaweed:10" \
  --modules "sap-01:sap-tree:2" \
  --modules "vrauks-1:vrauks:10" \
  --modules "vrauks-cocoon-1:vrauks:2" \
  --modules "Moss-2:moss:15" \
  --modules "methane-co2:moondrop:16" \
  --modules "auog-pooping-1:auog:4" \
  --modules "caged-cottongut-1:cottongut-mk01:20" \
  --modules "cottongut-cub-1:cottongut-mk01:2" \
  --modules "log2:tree-mk01:10" \
  --modules "ralesia-1:ralesia:12" \
  --modules "moondrop-1:moondrop:16"
```

## TODO

- [ ] Split into 3 blocks (battery/chemistry, bio/farming, assembly)
- [ ] Compute self-power for each block
- [ ] Block boundary declarations (imports/exports between blocks)
