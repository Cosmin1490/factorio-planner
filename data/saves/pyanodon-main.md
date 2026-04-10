# pyanodon-main — Block Inventory

## Blocks

| Block | Output | Rate | Stations | Buildings | Notes |
|---|---|---|---|---|---|
| Seaweed farm | seaweed | 6.4/s | 2 (water in, seaweed out) | 32 seaweed-crop-mk01 (seaweed-1) | 10 seaweed modules each |
| Moss farm | moss | 12.0/s | 2 (stone in, moss out) | 60 moss-farm (Moss-2), 4 washer (muddy-sludge), 4 soil-extractor, 2 moondrop-greenhouse (moondrop-co2) | 15 moss modules each, soil/muddy-sludge/CO2 inlined |
| Methanal | methanal (fluid) | 8.9/s | 3 (water, copper-plate in; methanal out) | 7 moondrop-greenhouse (moondrop-1), 4 moondrop-greenhouse (methane-co2), 1 moondrop-greenhouse (moondrop-co2), 1 botanical-nursery (moondrop-seeds), 1 hpf (methanal) | Methane-limited (4 greenhouses), HFP can do 12.5/s |
| Log | log | 1.5/s | 4 (water, ash, moss in; log out) | 10 fwf-mk01 (log3), 5 botanical-nursery (wood-seedling), 1 assembling-machine-1 (wood-seeds), 1 wpu (log-wood-fast) | 10 tree-mk01 modules each, seedling supply exactly balanced |
| PCB1 | pcb1 | 0.125/s | 5 (creosote, log, methanal, copper-plate in; pcb1 out) | 50 sap-extractor (sap-01), 7 wpu (fiber-01), 1 wpu (log-wood-fast), 3 pulp-mill (formica), 1 tar-processing (treated-wood), 1 pcb-factory (pcb1), 1 vacuum-pump | 2 sap-tree modules each, sap-limited |
| Tar refinery | middle-oil 60/s, creosote 48/s, gasoline 60/s, coke 15/s, pitch 280/s | 200/s tar in | 8 (tar, water in; 5 outputs + anthracene consumed) | 10 tar-processing (tar-refining), 12 distilator (anthracene-gasoline-cracking), 4 oil-boiler, 1 py-electric-boiler | Anthracene fully cracked to gasoline+coke, self-powered via oil boilers |
| Copper plate | copper-plate | 3.2/s | 3 (water, raw-coal in; copper-plate out) | 8 electric-mining-drill, 10 screener (grade-2-copper), 6 jaw-crusher (grade-1-copper-crush), 6 washer (saline-water), 6 stone-furnace (copper-plate-4) | On-site at ore patch, washers for stone disposal, mining-limited |

## Designed (not yet built)

| Block | Output | Rate | Status |
|---|---|---|---|
| Electronic circuit | electronic-circuit | 0.9/s | Designed, 24 buildings, 11 stations |
| Solder | solder | 0.6/s | Designed, 4 buildings, 3 stations |
| Iron plate | iron-plate | — | Designed only |
| Tin plate | tin-plate | — | Designed only |
| Small-parts-01 | small-parts-01 | — | Designed only |
| Glass | glass | — | Designed only |
| Battery | battery-mk01 | 0.05/s | Designed, 18 buildings |
| Rubber | rubber | 0.24/s | Designed, 21 buildings |
| Auog farm | caged-auog | 0.1/s | Designed, ~8 buildings |
| Vrauks farm | formic-acid | — | Designed, ~21 buildings |
