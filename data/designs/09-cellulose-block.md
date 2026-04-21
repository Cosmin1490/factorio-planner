# Cellulose block — 2/s design capacity (log-gated to ~1.17/s actual)

20 hpf running cellulose-00 (wood + limestone → cellulose) + 1 wpu-mk01 for log→wood conversion. Actual throughput gated by log supply — existing log block has ~0.82/s free after PCB1, yielding ~1.17/s cellulose. Log stamp deferred until more throughput is needed.

## Recipe table

```
┌───────────────┬──────────┬───────┐
│ Recipe        │ Factory  │ Count │
├───────────────┼──────────┼───────┤
│ cellulose-00  │ hpf      │    20 │
│ log-wood-fast │ wpu-mk01 │     1 │
└───────────────┴──────────┴───────┘
```

21 buildings, 40 MW electric

## Stations (3)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| log | unload | log (item) | 1.4 |
| limestone | unload | limestone (item) | 8.0 |
| cellulose | load | cellulose (item) | 2.0 |

## Production math

- cellulose-00: 7 wood + 4 limestone → 1 cellulose in 10s
- Per hpf (speed=1): 0.1/s cellulose, 0.7/s wood, 0.4/s limestone
- 20 hpf: 2.0/s cellulose, 14.0/s wood, 8.0/s limestone
- log-wood-fast: 4 log → 40 wood in 1s
- Per wpu-mk01 (speed=0.5): 20/s wood capacity (needs 14/s — 70% util)
- Log demand: 14/s wood ÷ 10 wood/log = 1.4/s log

## Log supply — intentionally deferred

Current log block: 1.47/s export. PCB1 consumes 0.65/s → 0.82/s available.
At full 2/s capacity: 1.4/s log needed → deficit 0.6/s → log stamp required.
**Decision: don't build log stamp now.** Block runs at ~1.17/s cellulose on available supply. Add log stamp only if more e-circuit throughput is needed before Phase 8 retrofit.

## Limestone supply

Limestone block (2a, 15/s): cellulose takes 8/s, leaving 7/s for iron plate + glass. Verify during Phase 3.

## Cellulose consumers

| Consumer | Cellulose/s | Phase | Permanent? |
|---|---|---|---|
| E-circuit Phase 1 (battery-mk00) | 3.33 | Phase 4 | No — drops to 0 after Phase 8 retrofit |
| py-science fawogae-substrate | 0.72 | Phase 6 | Yes |
| vrauks-food-01 | small | Phase 7+ | Yes |

Peak ~4/s is temporary. 2/s design capacity is a compromise — e-circuit runs at ~60% cellulose, block stays useful long-term.

## Tile footprint

| Component | Size | Count | Tiles |
|---|---|---|---|
| hpf | 5×5 | 20 | 500 |
| wpu-mk01 | 5×5 | 1 | 25 |
| **Total** | | **21** | **525** |

Comfortable in one city block. Uniform hpf grid layout.

## Recipe alternatives (rule 4)

2 unlocked cellulose recipes:
- **cellulose-00 (chosen)**: 7 wood + 4 limestone → 1 cellulose (hpf, 10s). Clean — no byproducts.
- **cellulose-02 (rejected)**: 10 wood + 3 sodium-hydroxide → 2 cellulose (biofactory, 5s). Half the buildings but produces chlorine + hydrogen byproducts requiring voiding, and needs 300/s water-saline.

## Upgrade path (rule 23)

- hpf-mk02 (speed=2): halves to 10 hpf for same output. Drop-in replacement.
- Additional hpf stamp: scales to 4/s if peak demand materializes.

## Methodology self-review

- Rule 4: 2 recipes, cellulose-00 chosen (no byproducts, simpler inputs)
- Rule 5: no byproducts
- Rule 14: 4 unlocked consumers → dedicated block justified
- Rule 20: 525 tiles, 21 buildings — fits easily
- Rule 24: 2/s design, log-gated to ~1.17/s. Intentional undersupply with deferred scaling.

## Helmod import string

Solver command: `npx tsx src/cli.ts solve --recipes "cellulose-00,log-wood-fast" --target "cellulose:2" --time 1 --unlocked --factory "cellulose-00:hpf" --factory "log-wood-fast:wpu-mk01" --export helmod`

```
eJzNU8tugzAQvPMVFuciAXdfeeutF34AGXtJrBgv9aMpivj3QuIYJ2mknqrevDM77MxICCQKOVOkpaeMEK6YtTR/RwEqf1mATzBWoqb1Ojg5AK3WV7eIDq1BdGdZFL6u+FlIiBQ0v+xVAdFs0ecKd8UURQ9sy4wbhoXJgx41GDi1E3taFB47qgzHiLYM+7QTLRnygbUolr8pgjfSyUM6OCSkKaKz2i6AS5HCOeuzpsqBbSAL1puwPMkWxpz/9kQY62z2tAPz5R0E801moGpZP+acDMcLb9dqGT56uk4+mI4lNUN9fwGIWxAr10ajpBhMarA0tMcwXnjO2AcdcJGrql/22790G513y4HpbxCC0VZ/pNy92P/p71myUYIaKPj2E+S4a65h9qkg+Gm+dE7Wv90TuqdASFBu2Bojv/9GZgzA84bTdoMtPgGcE8c+Q==
```
