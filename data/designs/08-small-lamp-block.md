# Small-lamp block — 2/s output (reserve block for future bio scaling)

Small-lamp is a crafted building consumed as a continuous production ingredient by bio/farming recipes. Currently 9 unlocked consumers (breed-fish-1, zogna-bacteria, codexes, buildings), but 151 total including 142 locked farming recipes (phadai breeding, kicalk, guar, fish-mk02+, etc.). Unique property: only mall-crafted building that crosses into continuous production ingredient. Dedicated block justified by future consumer explosion, not current demand.

## Recipe table

```
+---------------+------------------------+-------+
| Recipe        | Factory                | Count |
+---------------+------------------------+-------+
| small-lamp    | automated-factory-mk01 |     1 |
| copper-cable  | automated-factory-mk01 |     1 |
+---------------+------------------------+-------+
```

2 buildings, <1 MW electric

## Stations (4)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| copper-plate | unload | copper-plate (item) | 5.0 |
| iron-plate | unload | iron-plate (item) | 2.0 |
| glass | unload | glass (item) | 4.0 |
| small-lamp | load | small-lamp (item) | 2.0 |

## Production math

- small-lamp: 3 copper-cable + 2 glass + 1 copper-plate + 1 iron-plate -> 1 small-lamp in 0.5s
- Per automated-factory-mk01 (speed=1): 2/s small-lamp
- copper-cable: 1 copper-plate -> 2 copper-cable in 0.5s
- Per auto-factory: 4/s cable (demand 6/s at full lamp rate -> 1 machine at ~75% util when lamp machine also runs below capacity)
- Copper-plate: 3/s (cable) + 2/s (direct) = 5.0/s
- Glass: 2/s x 2 = 4.0/s
- Iron-plate: 2/s x 1 = 2.0/s

1 lamp assembler + 1 cable assembler. Both auto-factory-mk01 (crafting category).

## Current vs future demand

| Consumer | Rate/s | Status |
|---|---|---|
| breed-fish-1 (fish-oil block) | 0.09 | designed |
| zogna-bacteria (bio chain) | ~0.2 | Phase 7, not built |
| 142 locked farming recipes | TBD | unlocks with animal/farming techs |

Current demand: 0.09/s = **4.5% utilization**. Block is a placeholder that scales when farming techs unlock.

## Train logistics

- Stack size: 50. Cargo wagon: 20 slots = **1,000 lamps per wagon**.
- At 0.09/s demand: 1 wagon lasts **~3 hours**. Negligible network load.
- At full 2/s output: 1 wagon fills in **~8 minutes**.
- Single inserter (~2.5 items/s) fills a wagon in ~7 minutes. No throughput constraints.

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| automated-factory-mk01 | 5x5 | 2 | 50 |

50 tiles. Block is essentially empty — reserve space for future use.

## Why a dedicated block

Small-lamp looks like a mall item (crafted building, simple ingredients) but behaves like a bus item in Pyanodon. The 9->151 consumer growth when farming techs unlock means every bio block will need a small trickle of lamps. Inlining lamp production in each consumer block duplicates 4 input stations per block. One dedicated block with shared inputs serves all consumers via train.

Alternative considered: mall production. Viable for current demand but doesn't scale — mall is batch-oriented with recipe swapping (MAM pattern), not suited for continuous low-rate supply to 10+ blocks simultaneously.

## Upgrade path (rule 23)

- automated-factory-mk02 (speed=2) doubles output to 4/s with same building count.
- If demand exceeds 2/s, add a second lamp assembler (same block, plenty of space).
- Block can absorb other "lamp-like" shared supplies if any emerge (planter-box, petri-dish).

## Methodology self-review

- Rule 4 (alternatives): 1 unlocked recipe for small-lamp. No alternatives.
- Rule 14 (inline vs dedicated): 9 unlocked / 151 total consumers. Dedicated block justified by future growth, not current throughput.
- Rule 20 (space budget): 50 tiles, 2 buildings. Trivially fits. Reserve block.
- Rule 24 (sizing): sized at 2/s (1 machine max rate). Current demand is 4.5% util. Intentional oversizing for locked tech headroom.
