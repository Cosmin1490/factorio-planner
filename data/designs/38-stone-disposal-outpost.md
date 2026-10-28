# 38 — Stone disposal outpost — 15.00 stone/s, 17 buildings

Closes **design 31's risk 2** — *"10.6/s of surplus stone with no named consumer, the single largest
unresolved stream in the base once both outposts run."* Stone has **no voidable route under the
ruleset** (design 32 § byproducts), so the only answer is a chain that destroys it into something
wanted.

`sand-classification` is that chain's engine: **20 sand in, 4.55 units out.** The rest is gone. Every
product it does emit has a consumer, so nothing here is vented.

**The block is a dial, not an operating point.** Up to the full 15.00 stone/s goes to the glass route;
**0 to 4 washers** optionally leech off the top for `water-saline`. Both ends are buildable in one
stamp with no rebuild between them.

```
saline-water         [U] [washer,     20 s]  stone 10 + water 100  →  water-saline 50
stone-to-gravel      [U] [crusher,     1 s]  stone 4   →  gravel 3
gravel-to-sand       [U] [crusher,     1 s]  gravel 4  →  sand 3
sand-classification  [U] [classifier,  1 s]  sand 20   →  iron-oxide 1 (50%) + gravel 4
                                                          + crushed-quartz 1 (5%)
glass-2              [U] [glassworks,  4 s]  crushed-quartz 2  →  molten-glass 30
empty-petri-dish     [U] [glassworks,  3 s]  molten-glass 50   →  empty-petri-dish 1
molten-glass         [U] [glassworks,  3 s]  molten-glass 50   →  glass 5
iron-oxide-smelting  [U] [smelting,  3.5 s]  iron-oxide 20     →  iron-plate 10
```

## Recipe table

```
┌─────────────────────┬───────────────────────┬───────┬───────┬─────────────────┐
│ Recipe              │ Factory               │ Count │ util  │ util            │
│                     │                       │       │ @ N=0 │ @ N=4           │
├─────────────────────┼───────────────────────┼───────┼───────┼─────────────────┤
│ stone-to-gravel     │ jaw-crusher           │   4   │ 93.8% │ 81.3%           │
│ gravel-to-sand      │ jaw-crusher           │   4   │ 82.7% │ 71.7%           │
│ sand-classification │ classifier            │   1   │ 49.6% │ 43.0%           │
│ glass-2             │ glassworks-mk01       │   1   │  5.0% │  4.4%           │
│ empty-petri-dish    │ glassworks-mk01       │   1   │ 0-2.2%│ 0-2.0%  (dial)  │
│ molten-glass        │ glassworks-mk01       │   1   │ 0-2.2%│ 0-2.0%  (dial)  │
│ iron-oxide-smelting │ advanced-foundry-mk01 │   1   │  4.3% │  3.9%           │
│ saline-water        │ washer                │   4   │   0%  │  100%           │
└─────────────────────┴───────────────────────┴───────┴───────┴─────────────────┘
```

**17 buildings · 768 tiles · 7.48 MW (N=0) to 8.09 MW (N=4) electric + 0.62–0.72 acetylene/s**

No modules anywhere — `advanced-foundry-mk01` and `washer` have 1 slot each and **no speed,
productivity or effectivity module has an unlocked recipe.** Free retrofit later; at 4 % duty only the
foundry's would ever matter.

## Operating envelope

| washers | stone→saline | saline/s | water/s | stone→glass | glass/min | petri/min | iron-plate/s | electric |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **0** | 0.00 | 0.00 | 0.0 | **15.00** | 2.23 | 0.447 | 0.124 | 7.48 MW |
| 1 | 0.50 | 2.50 | 5.0 | 14.50 | 2.16 | 0.432 | 0.120 | 7.63 MW |
| 2 | 1.00 | 5.00 | 10.0 | 14.00 | 2.08 | 0.417 | 0.116 | 7.78 MW |
| 3 | 1.50 | 7.50 | 15.0 | 13.50 | 2.01 | 0.402 | 0.112 | 7.93 MW |
| **4** | 2.00 | **10.00** | 20.0 | 13.00 | 1.94 | 0.387 | 0.108 | 8.09 MW |

Crusher counts solver-verified at every stone rate in the column. `glass`/`petri`/`iron-plate` are
linear in `stone→glass`, anchored on solver output at 13.00 and 15.00.

**Diverting to washers raises grid draw and lowers acetylene.** Each washer adds 0.40 MW at full duty
while the crush chain sheds only ~0.3 MW; acetylene falls because less sand means less quartz means
less glass. Idle washers draw Factorio's ~1 % drain (~0.016 MW for all four), so parking them is free
beyond their build cost.

## The 4th gravel-to-sand crusher is what makes the dial free

Sized for 13.00 stone/s the crush branch solves to **4/3** crushers — and 3 `gravel-to-sand` caps at
12.00 gravel/s, which is **13.60 stone/s**:

```
stone 13.50 -> crushers 4/3   gravel 11.91/s
stone 13.60 -> crushers 4/3   gravel 12.00/s   <- exactly 3 x 4.00, the ceiling
stone 13.70 -> crushers 4/4   gravel 12.09/s
stone 15.00 -> crushers 4/4   gravel 13.24/s
```

At 4/3 the washers are **not optional** — at least 1.40 stone/s has to leech or the block backs up.
**The 4th crusher costs 1.00 MW rated, 49 tiles and 25 iron-plate / 30 steel / 10 small-parts /
4 steam-engine**, and buys the full 0-to-4 range plus headroom to 16.00 stone/s (`stone-to-gravel`
then binds at 4 × 4.00). Everything downstream already clears 15/s with room — classifier 50 %,
`glass-2` 5 %, glassworks 2 %, foundry 4 %.

## The glassworks are free on the grid

All three draw **zero electric**: `glassworks-mk01` is `fluid_energy_source`, `burns_fluid: true`,
effectivity 1. Its "10 MW" is acetylene at 1.0 MJ/unit, so **0.62–0.72 acetylene/s** across the dial —
a 40,000 L tank runs **17.8 h at N=4, 15.5 h at N=0**.

`totalPowerMW` folds this into the electric total, so the solver's single figure is a correct sum under
a wrong heading. The split in every table above is hand-separated as `duty × 10 MW ÷ 1.0 MJ`, and
`--fuel` is a silent no-op on fluid-burner entities.

## Three glassworks for one 0.30/s stream

`glass-2` emits 0.33–0.37 molten-glass/s. One glassworks handles **16.67/s**, so the two sinks are
never remotely capacity-bound — the third machine buys a **circuit-switchable ratio**, nothing else.

> **50 molten-glass = 5 glass OR 1 empty-petri-dish**

**The LP will not choose this split.** Both are terminal outputs the objective does not value, so with
all three glassworks in one solve it zeroes one and returns a clean-looking answer with an unmade
decision inside it. Both endpoints are solved separately; intermediate points are linear.

Leaning: `glass` is Tier A with 50+ consumers but 2.23/min is not a contribution to a glass bus, while
**`empty-petri-dish` has exactly one unlocked consumer** (`petri-dish` = 1 empty + 1 agar) and
**design 36 imports `petri-dish` at 0.83/min** — so all-dish covers **47–54 % of a real import** and
all-glass covers nothing in particular. The dish side is the better buy unless another glass source is
wanted.

## The saline correction

**Designs 30 and 31 both read "1.42/s for all saline". That is the stone, not the saline.** Design 30's
table has both columns; design 31 § risk 2 compresses them into one number and loses the distinction.

| consumer | water-saline | stone |
|---|--:|--:|
| design 25 (formica) | **6.000 /s** | 1.200 /s |
| design 26 | — | — |
| design 27 | — | — |
| design 36 | — | — |
| design 29 (fish) | 1.103 /s | 0.221 /s |
| **base-wide total** | **7.103 /s** | **1.421 /s** |

Designs 26, 27 and 36 need **none**. Nearly all of it is design 25 running `chlorine` [electrolyzer,
2 s] (100 water-saline → sodium-hydroxide 2 + chlorine 20) purely to get **0.12 sodium-hydroxide/s for
`fiberboard`** — one small need is 84 % of base-wide saline.

**4 washers = 10.00/s, 41 % headroom.** Three would cover the pooled 7.103 and the shared-bus file's
own count is 4 (3 for design 25 + 1 for design 29, sited separately), so 4 agrees with both documents
and covers **76 % of the complex at 2.0 circuits/s**. Saline is linear in circuits/s: 7.10 → 13.10 →
31.10 at 1.0 / 2.0 / 5.0 c/s, needing 3 / 6 / 13 washers.

**`saline-water` beats `gravel-saline-water` 2:1 here.** Gravel needs 15 per 50 saline against stone's
10, and that gravel costs 4 stone per 3 via `stone-to-gravel` — so 10.00 saline/s is **stone 2.00/s
direct or stone 4.00/s through gravel.** Design 29 and design 32 both list the gravel route as viable;
in a block whose purpose is disposing of stone it is strictly worse.

One inconsistency recorded: the shared-bus file credits design 29 with **0.431 stone/s** (= 2.155
saline/s), matching none of design 29's three variants (2.800 route-1, 0.958 upgraded, 1.103
upgraded + `breed-fish-2`). Design 29's own file and design 30's table both say **0.221**. Used 0.221.

## Terminal outputs and their sinks

| output | /s | sink chosen | cost | what it beat |
|---|--:|---|---|---|
| **water-saline** | 0–10.00 | **design 25 (6.000) + design 29 (1.103)** — the only consumers base-wide | 4 washers, 20 water/s, 0.40 MW each | `gravel-saline-water` — **2× the stone** for the same saline |
| **iron-plate** | 0.108–0.124 | **the bus** — Tier A | 1 foundry at 4 % | exporting `iron-oxide` raw: 50 % recovery beats a 4.5 h chest, and removes the block's worst backpressure gate |
| **empty-petri-dish** | 0–0.447/min | **design 36's `petri-dish` import** (0.83/min) | shares the glassworks | all-glass, which has no named consumer |
| **glass** | 0–2.23/min | **the bus** — Tier A | shares the glassworks | all-dish, if a glass source is wanted instead |
| `gravel` | 11.47–13.24 | **internal** — `sand-classification` returns 1.72–1.99/s of it, the loop partly feeds itself | — | — |

**Nothing is vented and nothing leaves unfinished.** Smelting the iron-oxide in-block is the single
most valuable structural choice: as an export it was a 0.20/s byproduct whose 4.5-hour chest gated the
whole 15 stone/s.

## Backpressure and risk order

| | risk | why |
|---|---|---|
| 1 | **stone supply is 12.00/s, intake is 15.00/s** | designs 30 (6.00) + 31 (6.00). Fed 12/s the block runs at **80 % duty** — washers drop to 8.00 saline/s, still above the 7.103 demand. **Degrades gracefully, never stalls.** Filling it needs 3.00/s more: design 24 exports 1.833/s and design 32 1.309/s, which together do it |
| 2 | **the glass/petri sink must drain** | if both back up, `glass-2` stalls → crushed-quartz backs up → **`sand-classification` stops and all 15 stone/s stops.** A 0.025/s byproduct gates the entire block. Buffers are generous — molten-glass in a 40,000 L tank is **29.9 h**, crushed-quartz in one iron chest is **35.8 h** — but it has to go somewhere eventually |
| 3 | **acetylene 0.62–0.72/s is a single thread** | three glassworks on one fluid; if it runs dry the glass chain stops and risk 2 follows. 40,000 L = 17.8 h |
| 4 | saline consumers may not exist yet | **this one is benign** — a saline backup simply stalls the washers, stone re-routes to the crush branch, and the block keeps disposing. The dial degrades in the safe direction |
| 5 | water 20.00/s at N=4 | one pump does 1,200/s. Not a constraint |

**Risk 4 is the design's best property.** The washers are the only branch that can fail without
consequence, because the crush chain absorbs anything they decline — so saline can be commissioned
whenever design 25 lands, not before.

## Build notes

- **This is the first block in the catalogue whose product is disposal.** The 387 iron-plate/h and
  2.23 glass/min are real but not the justification; absorbing 12.00 stone/s is.
- **185 stone-brick is made from stone** (`stone-brick`, 2 stone → 1), so **370 stone of the build cost
  comes out of the stream it exists to consume.** Pleasing, and worth 13 minutes of the block's own
  intake.
- **`gravel-to-sand` at 72–83 % is the tightest stage** once the 4th crusher is in. Everything else
  below the classifier is under 5 %.
- **The washers are the only 100 %-duty machines.** If saline demand grows past 10.00/s, a 5th washer
  needs 0.50 stone/s that the crush branch currently has, and at 4/4 crushers there is room to 16.00/s —
  so one more washer fits without touching the crush side.
- Stone is stack 50, so 15.00/s is 18 stacks/min — **one full yellow belt in, and it wants its own lane
  and load station.**

## Solver commands

Three runs. The washer and crush branches **share no intermediate**, so solving them separately is
exact rather than an approximation. Putting them in one solve lets the LP zero the washers —
`water-saline` is a terminal output it does not value, and a crusher disposes of 4.00 stone/s against a
washer's 0.50, so building-minimisation always prefers crushing.

```bash
# washer branch — 4 washers, water-saline 10.00/s. Scale --input linearly for N=1..3.
npx tsx src/cli.ts solve \
  --recipes "saline-water" \
  --input "stone:2" --time 1 \
  --factory "saline-water:washer" \
  --solver simplex \
  --unlocked
```

```bash
# crush branch, all-dish endpoint. --input "stone:15" for N=0, "stone:13" for N=4.
npx tsx src/cli.ts solve \
  --recipes "stone-to-gravel,gravel-to-sand,sand-classification,glass-2,empty-petri-dish,iron-oxide-smelting" \
  --input "stone:15" --time 1 \
  --factory "stone-to-gravel:jaw-crusher" \
  --factory "gravel-to-sand:jaw-crusher" \
  --factory "sand-classification:classifier" \
  --factory "glass-2:glassworks-mk01" \
  --factory "empty-petri-dish:glassworks-mk01" \
  --factory "iron-oxide-smelting:advanced-foundry-mk01" \
  --fuel "glass-2:acetylene" \
  --fuel "empty-petri-dish:acetylene" \
  --solver simplex \
  --unlocked
```

```bash
# crush branch, all-glass endpoint
npx tsx src/cli.ts solve \
  --recipes "stone-to-gravel,gravel-to-sand,sand-classification,glass-2,molten-glass,iron-oxide-smelting" \
  --input "stone:15" --time 1 \
  --factory "stone-to-gravel:jaw-crusher" \
  --factory "gravel-to-sand:jaw-crusher" \
  --factory "sand-classification:classifier" \
  --factory "glass-2:glassworks-mk01" \
  --factory "molten-glass:glassworks-mk01" \
  --factory "iron-oxide-smelting:advanced-foundry-mk01" \
  --fuel "glass-2:acetylene" \
  --fuel "molten-glass:acetylene" \
  --solver simplex \
  --unlocked
```

**`--input` and not `--target`** is load-bearing: this is a supply-driven block with four outputs, and
target mode would minimise buildings for one named product and silently drop branches.

Three figures are **not** direct solver output:

- **the petri-dish rate** — 0.006–0.007/s sits below the ~0.01/s display floor and vanishes. Verified
  in target mode instead: `--target "empty-petri-dish:0.0166667"` demands **33.58 stone/s**, and
  12/33.58 = 0.357/min matches the 12 stone/s input solve exactly.
- **the electric/acetylene split** — see § The glassworks are free on the grid.
- **the envelope's intermediate rows** — linear interpolation between solved endpoints.

## Build materials

Distinct construction materials across this block's 5 building types, separate from flow imports:

`copper-cable` · `copper-plate` · `electronic-circuit` · `inductor1` · `intermetallics` · `iron-plate` ·
`pipe` · `small-parts-01` · `steam-engine` · `steel-plate` · `stone-brick` · `stone-furnace` ·
`transport-belt`

```
 350x iron-plate      240x steel-plate     225x small-parts-01   185x stone-brick
 100x pipe             60x copper-plate     47x steam-engine      30x transport-belt
  30x copper-cable      23x inductor1       10x electronic-circuit
  10x stone-furnace      3x intermetallics
```

**`intermetallics` ×3 and `inductor1` ×23 are the only two to check** — everything else is bus material
or trivially craftable. `inductor1` comes from the electronics block (`inductor1` [electronic] is 2×
more copper-efficient than `inductor1-2` [crafting]); `intermetallics` sits in the MAM's 15-import
basket rather than being on hand. **225 small-parts-01 and 100 pipe are both sub-assemblies** the MAM
analysis pulled into their own block, so they are a dependency on that block existing rather than on
raw stock. Inferred from the recipe graph, not from save state.
