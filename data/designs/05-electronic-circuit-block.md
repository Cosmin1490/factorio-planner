# Electronic circuit block — two-phase design

219 consumers — Tier A bus item. Feeds locomotive (10), train-stop (5), splitter (1), fast-inserter (4), substation (5), combinators, and hundreds of buildings.

Two recipe variants share all sub-components, differ only in battery type + output:
- `electronic-circuit` (battery-mk00, 3/craft) — Phase 1
- `electronic-circuit-2` (battery-mk01, 5/craft) — Phase 2 retrofit

Per rule 23 recipe-variant staging: battery-mk00 has 1 consumer (inline, teardown at Phase 2), battery-mk01 has 11 consumers (import as bus item in Phase 2).

---

## Phase 1 — battery-mk00 route, 2/s output

### Recipe table

┌────────────────────┬──────────────────────────┬───────┐
│ Recipe             │ Factory                  │ Count │
├────────────────────┼──────────────────────────┼───────┤
│ electronic-circuit │ chipshooter-mk01         │     3 │
│ battery-mk00       │ automated-factory-mk01   │     7 │
│ capacitor1         │ electronics-factory-mk01 │     6 │
│ inductor1          │ electronics-factory-mk01 │     2 │
│ resistor1          │ electronics-factory-mk01 │     7 │
│ vacuum-tube        │ electronics-factory-mk01 │     7 │
│ solder-0           │ automated-factory-mk01   │     8 │
│ vacuum             │ vacuum-pump-mk01         │     1 │
│ copper-cable       │ automated-factory-mk01   │     2 │
└────────────────────┴──────────────────────────┴───────┘

43 buildings, 45 MW electric

### Stations (13)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| pcb1 | unload | pcb1 (item) | 0.67 |
| cellulose | unload | cellulose (item) | 3.33 |
| zinc-plate | unload | zinc-plate (item) | 6.67 |
| water-saline | unload | water-saline (fluid) | 166.67 |
| ceramic | unload | ceramic (item) | 1.91 |
| tin-plate | unload | tin-plate (item) | 6.22 |
| coke | unload | coke (item) | 2.67 |
| glass | unload | glass (item) | 3.33 |
| graphite | unload | graphite (item) | 2.00 |
| copper-plate | unload | copper-plate (item) | 12.67 |
| iron-plate | unload | iron-plate (item) | 5.00 |
| lead-plate | unload | lead-plate (item) | 5.33 |
| electronic-circuit | load | electronic-circuit (item) | 2.00 |

### Intermediates

| Item | Rate/s | Producer | Consumer |
|---|---|---|---|
| battery-mk00 | 0.67 | battery-mk00 (auto-factory) | electronic-circuit |
| capacitor1 | 3.33 | capacitor1 (electronics-factory) | electronic-circuit |
| inductor1 | 2.00 | inductor1 (electronics-factory) | electronic-circuit |
| resistor1 | 4.00 | resistor1 (electronics-factory) | electronic-circuit |
| vacuum-tube | 2.00 | vacuum-tube (electronics-factory) | electronic-circuit |
| solder | 1.33 | solder-0 (auto-factory) | electronic-circuit |
| copper-cable | 8.00 | copper-cable (auto-factory) | inductor1 |
| vacuum | 50.00 | vacuum (vacuum-pump) | vacuum-tube |

### Helmod import string (Phase 1)

```
eJztlz9v2zAQxXd/CsJzBVjy3wxcOnTr4rUoDIq8NEQokiWPaY3A3720LEuKaAOaUg3exHd39ns/UbYoDFGGM0UO9H1GCFfMezr/bgSo+ZcovIHz0mhanBcoK6D5+aqMQ68HZwzWY+3g17NeDxIiBZ1f+vJG0SzOz7mxFlzGWamgKeDRxkKzMH80uHZVHg/WGRE4UnQBWvGZcTTuSJ+Z8o3qjYp2+wp/kUo40I1JQvZ5e9l63gOX9urkanyf9wUt4C9ddMLd4F0YdzwU5sUZ5h5p/4WpCQe6V0bVzPV6r4E7P63jr5dSr/nqiQW0FUcQWTOeVa+L/EPjfW+kxFWmaOwnnaSKthV4+n5qRVLXL4Fxo3vVtravoaIuEtR5EPUb4yFUc6EcUbPZcJn/qBd5Ns9SgXtMscZHB8SdvJwJ4GndYtVYzOuE87LWLo5Q9DOZnQAFXJ35krtJiGa/Rd0uGK+G7G14mWPe/AHqTtnVGILz/Mw6SAK6yV8gvR3LepuQ3iQvHMwyrh+o76DejUW9S1Bvh6hLhgiXNI9/xRT109hUT0nV+yHqbiNlXDoeJE4EeDw9WP8Szzjx1ejTUc96HU1a39r/cQvaz1660WQlQvXhFtmAtLhlQupfDoQEjY3NWq8PeLVwmjnA4DQ5zECLfx5+qxU=
```

### Phase 1 notes

- 43 buildings, 13 stations. Fits in 2 city blocks (sub-components in one, battery production + chipshooters in the other).
- Cellulose imported (3.33/s). 34 hpf if dedicated block, needs 23.3/s wood + 13.3/s limestone. Wood is the bottleneck — current log block produces 1.47/s, needs major scaling. Cellulose has 8 consumers, borderline Tier B boundary item.
- Water-saline imported as fluid (166.67/s). Stone-washer route at 2.5/s per washer needs 67 washers — dedicated commodity block. Copper plate block already produces some water-saline.
- Copper-plate at 12.67/s is the highest solid import — battery-mk00 alone consumes 6.67/s. Current copper block produces 3.16/s, needs 4× scaling.
- Zinc-plate at 6.67/s is entirely for battery-mk00. Needs zinc ore processing block (not yet designed).

---

## Phase 2 — battery-mk01 retrofit, 3.33/s output

When the battery-mk01 supply chain is ready (cyanic-acid/urea/auog bio chain), swap the recipe on the chipshooters and replace the battery source.

### Retrofit steps

1. **Remove**: 7 automated-factory-mk01 (battery-mk00 production) — tear out
2. **Remove stations**: cellulose, water-saline, zinc-plate (all battery-mk00 only)
3. **Add station**: battery-mk01 (import, 0.67/s)
4. **Recipe swap**: chipshooters change `electronic-circuit` → `electronic-circuit-2`
5. **Output**: 0.667 crafts/s × 5 = **3.33/s electronic-circuit** (free +67% from oversized sub-components)

### Recipe table (Phase 2)

┌────────────────────────┬──────────────────────────┬───────┐
│ Recipe                 │ Factory                  │ Count │
├────────────────────────┼──────────────────────────┼───────┤
│ electronic-circuit-2   │ chipshooter-mk01         │     3 │
│ capacitor1             │ electronics-factory-mk01 │     6 │
│ inductor1              │ electronics-factory-mk01 │     2 │
│ resistor1              │ electronics-factory-mk01 │     7 │
│ vacuum-tube            │ electronics-factory-mk01 │     7 │
│ solder-0               │ automated-factory-mk01   │     8 │
│ vacuum                 │ vacuum-pump-mk01         │     1 │
│ copper-cable           │ automated-factory-mk01   │     2 │
└────────────────────────┴──────────────────────────┴───────┘

36 buildings (-7), 38 MW electric (-7 MW)

### Stations (10)

| Station | Direction | Item | Rate/s |
|---|---|---|---|
| pcb1 | unload | pcb1 (item) | 0.67 |
| battery-mk01 | unload | battery-mk01 (item) | 0.67 |
| ceramic | unload | ceramic (item) | 1.91 |
| tin-plate | unload | tin-plate (item) | 6.22 |
| coke | unload | coke (item) | 2.67 |
| glass | unload | glass (item) | 3.33 |
| graphite | unload | graphite (item) | 2.00 |
| copper-plate | unload | copper-plate (item) | 6.00 |
| iron-plate | unload | iron-plate (item) | 5.00 |
| lead-plate | unload | lead-plate (item) | 5.33 |
| electronic-circuit | load | electronic-circuit (item) | 3.33 |

### Import delta (Phase 1 → Phase 2)

| Import | Phase 1 | Phase 2 | Change |
|---|---|---|---|
| battery-mk01 | — | 0.67/s | **NEW** |
| cellulose | 3.33/s | — | **REMOVED** |
| water-saline | 166.67/s | — | **REMOVED** |
| zinc-plate | 6.67/s | — | **REMOVED** |
| copper-plate | 12.67/s | 6.00/s | -6.67/s |
| e-circuit output | 2.00/s | 3.33/s | **+67%** |
| All others | unchanged | unchanged | — |

### Helmod import string (Phase 2)

```
eJztlztv2zAUhXf/CkJzVFiSH1m4ZMjWxWtQGBR50xDhq3ykNQL/99K2TCmSBWhqNXgTz73XPucTZdFMI6EpEWiPPxcIUUGcw9l3zUBkD1H4AOu4Vrg8LTyXgIvTVR2H3vdWa38eS4NPJ/08iBBnOLv0FY2iSJzPqDYGbE5JLaAp+IOJhWahfyuwaVUf9sZqFqjH3gZI4iuhXtsDfiXCNarTItrtKvSNC2ZBNSYR2hXpMnneAeXm6uRqfFd0BcXgD162wmiQNoztf2qT4gSzaNVfgQjuDzhT2koiOv3XgK3f5Pj5Uuo0Xy2R4LUkHljejOfyfVl8aRz/RoSI1EH5blKEZLQtwOHPYxKPbb0GQrXqVFNtV05FXQ5QF33UH4SGIGcC+WImN0Ga/4i3moq3GuAt+3jjk8PiTl7OBPCcdvFqKubVAHN1exfnPtRz+b0AAdRbrTh1M2C9nsp6PWC96rO24LiLeYo76RukN1NJbwak133SUQ70TnqE9HYq6e2A9GZw4CCGUH5HPYL6cSrqxwHqbR91myyn3NLAfV7OBHo81Br3Fo/e8Y39z2EvOh1NWpfsv9zAlv3opBtjOyDLPcgvN8kEj6tvVXXLB1c/LTAOyjdOj+kvylk4Liz4YBXaL0Cxv628UOo=
```

### Phase 2 notes

- 36 buildings, 10 stations. Comfortably fits 1-2 city blocks. Freed space from 7 removed battery factories.
- battery-mk01 (0.67/s) from dedicated block. That block also serves combinators, logistic science, accumulators, roboports (11 total consumers). Upstream: cyanic-acid/melamine chemical core (6 buildings) + auog bio chain (14 paddocks + 12 support buildings) + pbsb-alloy.
- Copper-plate drops from 12.67 to 6.00/s — significant reduction.
- 3 stations freed (cellulose, water-saline, zinc-plate), 1 added (battery-mk01). Net -2 stations.
- All sub-component factories are oversized (built for 0.667 crafts/s, Phase 2 only needs 0.4 for 2/s). Running at full rate gives 3.33/s — free capacity upgrade.
- To throttle to 2/s: idle 1 chipshooter, reduce sub-component feeds. Saves power but wastes building capacity.

---

## Upstream dependency status

### Phase 1 imports

| Import | Rate/s | Existing supplier? | Notes |
|---|---|---|---|
| pcb1 | 0.67 | PCB1 block (0.125/s) | **Needs 5.4× scaling** |
| cellulose | 3.33 | None | **New block needed** — 34 hpf, 23.3/s wood, 13.3/s limestone |
| zinc-plate | 6.67 | None | **New block needed** — zinc ore processing |
| water-saline | 166.67 | Copper block (partial) | **New commodity block or scaling** |
| ceramic | 1.91 | None | **New block needed** |
| tin-plate | 6.22 | None | **New block needed** |
| coke | 2.67 | Tar refinery (15/s) | Available (after Phase 0 fix) |
| glass | 3.33 | Glass block (2/s designed) | **Needs 1.7× scaling** |
| graphite | 2.00 | None | **New block needed** — 6 hpf from coke, trivial |
| copper-plate | 12.67 | Copper block (3.16/s) | **Needs 4× scaling** |
| iron-plate | 5.00 | Iron block (10.8/s designed) | Available |
| lead-plate | 5.33 | None | **New block needed** |

### Phase 2 additional imports

| Import | Rate/s | Notes |
|---|---|---|
| battery-mk01 | 0.67 | New block: chemical core (6 buildings) + auog bio chain (~26 buildings) + pbsb-alloy |

Phase 1 has 7 undesigned upstream blocks. Phase 2 adds the battery-mk01 chain. The critical path is cellulose (wood scaling problem) and copper-plate (4× current capacity).
