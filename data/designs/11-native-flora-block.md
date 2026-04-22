# Native-flora block — 15/s output (mining outpost, 15 flora-collectors)

Pure mining block: flora-collectors on ore-bioreserve patch, no processing recipes. Native-flora is a cross-cutting bio/science commodity — 20 unlocked consumers (85 total including locked farming/animal recipes). Demand grows significantly as bio techs unlock.

## Recipe table

```
(no recipes — mining only)
```

15 flora-collector-mk01, 1.5 MW electric

## Stations (1)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| native-flora | load | native-flora (item) | 15.0 |

## Mining math

- ore-bioreserve: mining_time = 1s, yields 1 native-flora, no fluid required
- flora-collector-mk01: mining_speed = 1
- Rate per collector: 1/s native-flora
- 15 collectors: 15/s native-flora
- Power: 100 kW per collector × 15 = 1.5 MW

## Native-flora consumers

| Consumer | Rate/s | Phase | Permanent? |
|---|---|---|---|
| automation-science (0.6/s) | 6.0 | Phase 6 | Yes |
| auog pooping-1 (14 paddocks) | 5.6 | Phase 7a | Yes (upgrades to pooping-2) |
| auog-food-01 (4 factories) | 2.0 | Phase 7a-food | Yes |
| bio-sample, vrauks, workers-food | ~1–2 | Phase 7+ | Yes |

Near-term peak: ~14/s. 15/s provides small headroom. Most demand is permanent — native-flora stays a staple input as bio/farming techs unlock (85 total recipes).

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| flora-collector-mk01 | 5×5 | 15 | 375 |

375 tiles. Smallest block in the save. Placement constrained by ore-bioreserve patch location, not tile budget.

## Upgrade path (rule 23)

- flora-collector-mk02 (mining_speed=2): halves to 8 collectors for same output, or doubles to 30/s with same count.
- Additional collectors: ore patch permitting, scales linearly. Add collectors as bio demand grows.

## Methodology self-review

- Rule 4: no recipe alternatives (mined resource)
- Rule 5: no byproducts
- Rule 14: 20 unlocked / 85 total consumers → dedicated block justified
- Rule 20: 375 tiles, 15 buildings — trivially fits
- Rule 24: 15/s covers near-term ~14/s demand with headroom for bio scaling
