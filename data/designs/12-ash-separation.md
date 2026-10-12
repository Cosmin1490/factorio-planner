# Ash separation — 9.96 ash/s, 8 buildings

A disposal block, not a production block. Ash and iron-oxide are the two most common
byproducts in a coal-fired Py base — every solid coal fuel returns ash 1:1 via `burnt_result`,
and **4,072 of the 4,073 `py-incineration` recipes emit `1 ash @0.2`**, so the incinerator
concentrates all solid waste into ash rather than removing it. `ash-separation` is the only
recipe that destroys ash in bulk.

It pays for itself in plates, and it leaves one residue you must ship out: **coal-dust**.

Six stone-furnaces burn the block's own coal-dust, so the only electricity is the two separators.
The `iron-oxide-smelting` furnace runs at 0.9% and has 5.66 iron-oxide/s of free headroom —
see § Iron-oxide headroom, which is a large part of why this block is worth placing.

## Block boundary

| Item | Class |
|---|---|
| ash | **import** — the block's reason to exist; readily available from every coal burner in the base |
| iron-oxide | **must-consume-internally**, with optional import (§ Iron-oxide headroom) |
| soot | must-consume-internally — no other consumer exists, and `soot-pyvoid` only renames it to ash |
| iron-ore, copper-ore, ore-aluminium, ore-zinc, ore-lead | must-consume-internally — 0.01–0.02/s is far below shipping scale |
| coal-dust | **export** — no recipe consumer at current tech (§ Coal-dust) |
| iron-plate, copper-plate, aluminium-plate, zinc-plate, lead-plate | export |

No water, soil, or external fuel crosses the boundary. Nothing is voided or vented.

## Recipe table

All 8 buildings solver-validated (simplex, target mode).

```
┌─────────────────────┬─────────────────┬───────┬─────────┬──────────┐
│ Recipe              │ Factory         │ Count │   Exact │     Util │
├─────────────────────┼─────────────────┼───────┼─────────┼──────────┤
│ ash-separation      │ solid-separator │     1 │ 1.00000 │   100.0% │
│ soot-separation     │ solid-separator │     1 │ 0.10000 │    10.0% │
│ iron-oxide-smelting │ stone-furnace   │     1 │ 0.00875 │     0.9% │
│ iron-plate          │ stone-furnace   │     1 │ 0.02500 │     2.5% │
│ copper-plate        │ stone-furnace   │     1 │ 0.02500 │     2.5% │
│ aluminium-plate-1   │ stone-furnace   │     1 │ 0.00600 │     0.6% │
│ zinc-plate-1        │ stone-furnace   │     1 │ 0.01500 │     1.5% │
│ lead-plate-1        │ stone-furnace   │     1 │ 0.01667 │     1.7% │
└─────────────────────┴─────────────────┴───────┴─────────┴──────────┘
```

**8 buildings, 1.650 MW electric, 122 tiles** (2 × 49 separator + 6 × 4 furnace).

Power is separators only — `ash-separation` 1.500 MW + `soot-separation` 0.150 MW. The six
furnaces are burners and draw no electricity.

## Key recipes — both separations are probabilistic

This is the fact that governs the whole design:

- **ash-separation** (solid-separator, 1s): 10 ash → `1 coal-dust @0.5` + `1 iron-oxide @0.05` + `1 soot @0.2`
- **soot-separation** (solid-separator, 1s): 2 soot → `1 iron-ore @0.2` + `1 copper-ore @0.2` + `1 ash @0.3` + `1 ore-aluminium @0.1` + `1 ore-zinc @0.1` + `1 ore-lead @0.1`

Expected yield is **0.75 items from 10 ash — 92.5% of the mass is destroyed.** `ash-separation`
isn't an ore recipe that happens to void; it *is* the void, with a coal-dust dividend.

The yield is also badly skewed: coal-dust comes out at 0.5/s while each ore comes out at
0.01–0.02/s. That skew is why the smelting load can never absorb the coal-dust (§ Coal-dust).

Smelting side:

- **iron-oxide-smelting** (smelting, 3.5s): 20 iron-oxide → 10 iron-plate
- **iron-plate** (smelting, 10s): 8 iron-ore → 1 iron-plate
- **copper-plate** (smelting, 10s): 8 copper-ore → 1 copper-plate
- **aluminium-plate-1** (smelting, 6s): 10 ore-aluminium → 1 aluminium-plate
- **zinc-plate-1** (smelting, 60s): 40 ore-zinc → 4 zinc-plate
- **lead-plate-1** (smelting, 10s): 6 ore-lead → 1 lead-plate

## Intermediate flows

All rates /s.

| Item | /s | From | To |
|---|---|---|---|
| coal-dust | 0.50000 | ash-separation | 6 furnaces (0.00643), **export (0.49357)** |
| iron-oxide | 0.05000 | ash-separation | iron-oxide-smelting |
| soot | 0.20000 | ash-separation | soot-separation |
| ash | 10.00000 | import (9.96357) + recycle (0.03643) | ash-separation |
| iron-ore | 0.02000 | soot-separation | iron-plate |
| copper-ore | 0.02000 | soot-separation | copper-plate |
| ore-aluminium | 0.01000 | soot-separation | aluminium-plate-1 |
| ore-zinc | 0.01000 | soot-separation | zinc-plate-1 |
| ore-lead | 0.01000 | soot-separation | lead-plate-1 |

## Ash loop

The separator is pinned at its ceiling — one `solid-separator` at speed 1 runs the 1s recipe
once per second, so **10.00 ash/s is a hard cap per building.** Recycled ash therefore
*displaces* imported ash rather than adding throughput.

| Source | Ash /s |
|---|---|
| soot-separation (`1 ash @0.3` per 2 soot) | 0.03000 |
| iron-plate furnace | 0.00167 |
| copper-plate furnace | 0.00167 |
| lead-plate-1 furnace | 0.00111 |
| zinc-plate-1 furnace | 0.00100 |
| iron-oxide-smelting furnace | 0.00058 |
| aluminium-plate-1 furnace | 0.00040 |
| **Total recycled** | **0.03643** (0.36%) |
| **External ash import** | **9.96357** |
| **Separator throughput** | **10.00000** |

The six furnace rows are `burnt_result` ash from burning coal-dust — 1 ash per coal-dust item,
so they equal the coal-dust consumption exactly. Unlike design 06 this is solved natively, not
overlaid by hand (§ Solver command).

## Imports

| Item | /s |
|---|---|
| ash | 9.96357 |

That is the whole import list — no water, no soil, no external fuel. The furnaces eat the
block's own coal-dust.

## Exports

| Item | /s | Sink chosen | What it beat |
|---|---|---|---|
| **coal-dust** | **0.49357** | **export as fuel (3.00 MJ, stack 100)** | burning it — see § Coal-dust |
| iron-plate | 0.02750 | bus | — |
| copper-plate | 0.00250 | bus | — |
| lead-plate | 0.00167 | bus | — |
| aluminium-plate | 0.00100 | bus | — |
| zinc-plate | 0.00100 | bus | — |

Nothing is voided. The plates are a trickle — 1.65 iron-plate and 0.15 copper-plate *per minute* —
but the ores arrive at 0.01–0.02/s, which is far below anything worth a train, so smelting them
inline is the only way to get value out. Six stone-furnaces is 24 tiles and ~19 kW of coal-dust.

## Coal-dust — the residue you still have to handle

**Coal-dust has zero recipe consumers at current tech.** Every sink — `gasify-coal-dust`,
`coaldust-ash`, `silicon`, `active-carbon` — sits behind **coal-processing-3** (prereq
chemical-science-pack). Until that research lands, the only dispositions are burn it or ship it.

The intuition that smelting could absorb it does not survive the arithmetic: the six furnaces
burn **0.00643/s, or 1.29% of production.** Even with the one large furnace driven to 100%
(§ Iron-oxide headroom) it is 14.50%. The reason is the probability skew — a stone-furnace is
only 200 kW while coal-dust arrives carrying 1.50 MW of fuel value.

Stated as furnaces: one `stone-furnace` at 100% eats **0.06667 coal-dust/s** (0.2 MW ÷ 3.00 MJ,
= 4/min, one item burning for 15s). So 0.50000/s would keep **7.5 furnaces running flat out**,
against the 0.0964 furnace-equivalents of real smelting work this block contains — it makes
roughly **78× more fuel than it can burn.**

Burning it elsewhere doesn't close the loop either, because coal-dust's `burnt_result` is ash
at 1:1 — whatever burns it hands the ash straight back. Ash per MJ across the solid fuels:

| Fuel | MJ | ash/MJ |
|---|---|---|
| coal-dust, raw-coal | 3 | 0.333 |
| coal | 4 | 0.250 |
| coke | 5 | 0.200 |
| solid-fuel | 12 | 0.083 |
| coal-briquette | 60 | 0.017 |
| wood / treated-wood / biomass | 2 / 4 / 0.25 | **0** |

So export is the chosen sink: 3.00 MJ at **stack 100** makes it a better fuel per slot than
raw-coal (3.00 MJ at stack 50). At 0.49357/s it rides a shared waste/fuel lane — a yellow belt
is ~30× oversized — and it is the one output that needs a guaranteed destination (§ Backpressure).

## Iron-oxide headroom

`iron-oxide-smelting` is the single most useful thing in this block and it runs at 0.9%.
One stone-furnace at speed 1 does 20/3.5 = **5.71429 iron-oxide/s** at 100%; the separator
supplies 0.05000/s. **Headroom: 5.66429/s with zero extra buildings.**

Worth filling for the iron, independent of ash: at 2 iron-oxide per plate in 3.5s,
`iron-oxide-smelting` beats `iron-plate`'s 8 iron-ore per plate in 10s by **4× on yield and
2.9× on speed per plate** — the best iron recipe currently unlocked. Any spare iron-oxide
stream belongs here.

The 100% column is arithmetic on the solver-validated base, not a separate solve — no solver
formulation forces a furnace to consume more than demand requires, so target mode will not
build it. Both arithmetic inputs cross-check against the recorded run: furnace capacity is
`20 / 3.5 = 5.71429` iron-oxide/s from recipe data, and coal-dust burn is
`0.2 MW / 3 MJ = 0.06667`/s at count 1.0, which matches the solver's 0.00058/s at count 0.00875
exactly.

| | as designed | that furnace at 100% |
|---|---|---|
| iron-oxide fed | 0.05000/s | 5.71429/s |
| iron-plate out (that furnace) | 0.02500/s | **2.85714/s** |
| coal-dust burned, block total | 0.00643/s | **0.07252/s** |
| coal-dust % consumed | 1.29% | **14.50%** |
| coal-dust exported | 0.49357/s | **0.42748/s** |
| ash recycled | 0.03643/s | 0.10252/s |
| **external ash import** | **9.96357/s** | **9.89748/s** |

Two consequences of the separator being capped at 10.00 ash/s:

1. The extra furnace ash **reduces the ash you need to import** (9.964 → 9.898/s) instead of
   raising throughput. More recirculation, same separator.
2. **Coal-dust production does not change** — it is set by separator throughput alone. Filling
   the furnace raises the share you burn, not the amount you make.

The ceiling is sharp: 5.714/s is one furnace, and 5.715/s needs a second.

## Backpressure

**Coal-dust is the binding constraint.** If it backs up, `ash-separation` stalls and the entire
block stops — including the iron-oxide smelting you may be relying on. Every other terminal
output is under 0.03/s and any sink absorbs it. `t = min(sink_i / rate_i)` is decided by the
coal-dust lane alone; sizing that lane *is* sizing the block.

Ash is the input, so it cannot back up — if ash runs short the block simply idles, which is the
correct behaviour for a disposal block.

## Scale

One separator covers the current base with roughly 3× headroom. Existing ash: design 06 ~3.25/s
surplus, designs 03/04/05 at 0.35–3.26/s each, designs 01/02 negligible.

Stamping is linear and clean — a second separator is another 10.00 ash/s, another 0.50
coal-dust/s, and its own soot-separation at 10% util. No shared infrastructure to resize.

## Solver command

**Target mode is required, not stylistic.** Input mode forces coal-dust to balance to zero —
it isn't a terminal output there, so the forward-propagation simplex scales whichever recipe
burns it until all 0.50/s is consumed. A `stone-furnace` eats 0.06667 coal-dust/s at 100%
(0.2 MW ÷ 3 MJ), so 0.50/s supports **7.5 furnaces flat out** — needing **42.86 iron-oxide/s**
against the 0.05/s the separator makes, with the LP importing the difference for free. Confirmed
localized to the fuel assignment: put coal-dust on `zinc-plate-1` alone and *that* recipe goes
to 8 furnaces instead.
Target mode's real LP constrains intermediates to `production >= consumption`, which lets
coal-dust be surplus *and* fuel at the same time.

Flags whose absence changes the answer:

- `--max-import "ash:600"` is the real scale control; the `coal-dust:30` target is what makes it
  bind at exactly one separator at 100%.
- The seven `--max-import "<item>:0"` caps are what keep target mode from **dropping the five
  non-iron smelting branches** — they don't feed coal-dust, so the LP would skip them. Cap-zero
  makes the solver scale up each ore's consumer to absorb its surplus.
- The six `--fuel "<recipe>:coal-dust"` overrides close the coal-dust → ash → coal-dust loop
  inside the LP. Without them the solver defaults to `coal` (4 MJ), which understates the
  returned ash by 25% per MJ.

```bash
npx tsx src/cli.ts solve \
  --recipes "ash-separation,soot-separation,iron-oxide-smelting,iron-plate,copper-plate,aluminium-plate-1,zinc-plate-1,lead-plate-1" \
  --target "coal-dust:30" --time 60 \
  --max-import "ash:600" \
  --max-import "iron-oxide:0" --max-import "soot:0" --max-import "iron-ore:0" --max-import "copper-ore:0" \
  --max-import "ore-aluminium:0" --max-import "ore-zinc:0" --max-import "ore-lead:0" \
  --factory "ash-separation:solid-separator" \
  --factory "soot-separation:solid-separator" \
  --factory "iron-oxide-smelting:stone-furnace" \
  --factory "iron-plate:stone-furnace" \
  --factory "copper-plate:stone-furnace" \
  --factory "aluminium-plate-1:stone-furnace" \
  --factory "zinc-plate-1:stone-furnace" \
  --factory "lead-plate-1:stone-furnace" \
  --fuel "iron-oxide-smelting:coal-dust" \
  --fuel "iron-plate:coal-dust" \
  --fuel "copper-plate:coal-dust" \
  --fuel "aluminium-plate-1:coal-dust" \
  --fuel "zinc-plate-1:coal-dust" \
  --fuel "lead-plate-1:coal-dust" \
  --solver simplex \
  --unlocked
```

The solver emits a cycle warning for `ore-lead → … → coal-dust`. That cycle is real
(coal-dust → furnace → ash → separator → coal-dust) and its gain is 0.36%, so it converges;
the warning is informational here, not a defect.

## Furnace choice

`stone-furnace` on all six smelting recipes:

| Furnace | Speed | Energy | Size | Verdict |
|---|---|---|---|---|
| stone-furnace | 1 | 0.20 MW **burner** (chemical, eff 1) | 2×2 | **chosen** — only smelting entity that burns a solid |
| advanced-foundry-mk01 | 1 | 1.20 MW electric | 6×6 | same speed, 9× footprint, adds electric draw |
| steel-furnace | 4 | 6.00 MW **fluid** burner (eff 1) | 2×2 | speed is useless at ≤2.5% util, and a fluid fuel import defeats the block |

Burning the local coal-dust is the whole point, and `stone-furnace` is the only option that can.

## Notes

- **Alternative to this entire block: `ash-pyvoid`.** It is *not* a no-op — `1 ash → 1 ash @0.2`,
  i.e. 80% destruction per pass. Recirculating the 20%, net 10 ash/s needs 12.5 ash/s fed =
  4 `py-burner` at 0.72 MW and 36 tiles with zero output. Against this block's 1.650 MW and
  122 tiles for 0.50 coal-dust/s, incineration is *cheaper on plain steam* (the coal-dust is
  worth ~0.74 MW through a `boiler` + `steam-engine` at 0.5 effectivity, less than the 0.94 MW
  extra draw). But `py-burner` on a solid is "ask, and expect no" under the house ruleset, so
  separation is the compliant route — and it is the only one that recovers the iron.
- **This makes design 06's "Voided: excess ash ~3.25/s" (line 121) a ruleset exception**, since
  that is `py-burner` on a solid. Routing that 3.25/s here instead uses 33% of one separator.
  Design 06's published rates are unaffected; only the disposal line needs revisiting.
- Coal-dust is 3.00 MJ / `chemical` / stack 100, and `py-coal-powerplant-mk01`'s burner is
  `{chemical}` — so it is eligible for better conversion chains than a steam engine. Not costed
  here; that belongs with a power design, not a disposal block.
- `soot-separation` is kept rather than `soot-pyvoid` (`1 soot → 1 ash @0.2`): separation turns
  2 soot into 1.0 expected items including only 0.3 ash, so it destroys ~85% of soot mass while
  pyvoid destroys none of it — it just renames soot to ash and sends it back to the separator.
- 4,072 of the 4,073 `py-incineration` recipes emit `1 ash @0.2` (sole exception:
  `zipir1-pyvoid-hatchery` → `1 processed-ash @0.8`). That is why ash is a *circulating load* in
  a coal base rather than a terminal waste, and why this block scales with the base rather than
  with any one producer. The only fuels that break the cycle are the ashless ones: `wood`,
  `treated-wood`, `biomass`.
- Ash recycle is small enough (0.36%) that scaling is effectively linear, but it is solved
  natively rather than assumed — do not hand-estimate it when re-deriving at other scales,
  because the furnace share grows with iron-oxide throughput (0.36% → 1.03% at 100% util).

## Build materials you may not have

Construction materials for this block's buildings, filtered against what the built base
demonstrably already has — designs 01/03/06: their buildings, what those cost to place, and what
they produce. Quantities omitted: the binding question is whether you have *any*, since a small
amount can be hand-fed while a zero is a hard stop.
Regenerate with `node scripts/build-materials.mjs data/designs/12-ash-separation.md` (edit `BUILT` in the script as the base grows).

_Nothing — every construction material is already available._

- `solid-separator` = 3 steam-engine + 30 inductor1 + 50 small-parts-01 + 50 steel-plate + 20 iron-plate
  (`inductor1` comes from design 02)
- `stone-furnace` = 5 stone

The generator currently reports three items — `intermetallics`, `mechanical-parts-01`,
`refined-concrete` — but all three trace to `py-coal-powerplant-mk01` and `steel-furnace`, which
appear only in § Furnace choice and § Notes as rejected alternatives. Neither is placed by this
design. This is the known TODO 8 false positive (prose-mentioned entities read as buildings-in-use).
