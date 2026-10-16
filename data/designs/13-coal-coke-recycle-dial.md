# 13 — Coal chemicals with a coke recycle dial

15/s raw-coal → **180–440 MW** and **1.14–2.00 plastic-bar/s of feedstock**, 359 buildings.

Design 10 sized for `f=0, x=1, n=0, g=0` with **all 36.70 coke/s committed to acetylene**. It has no
route for coke when acetylene is not wanted, so throttling acetylene stalls `calcium-carbide`, backs
coke up into `pitch-refining` and `anthracene-gasoline-cracking`, and takes the refining tree — and
therefore the aromatics that feed plastic — down with it. This design adds the missing valve and
sizes the plant so the split is a **continuous dial**, not a switch.

The new recipe is the whole of the change:

```
coal-gas-from-coke   [distilator, 5 s]   coke 20  →  coal-gas 20 + tar 20 + ash 1
```

Same shape as design 10, same recipe set plus one, more buildings.

## Configuration dial

| Dial | Range | Meaning |
|---|---|---|
| **r** — coke recycled | **0 → 1** | 0 = all coke to acetylene (design 10). 1 = all coke back to tar, no acetylene. |
| f, x, n, g | as design 10 | `f=0` (no coal-gas sold), `x=1` (all anthracene cracked), `n=0` (burn naphthalene/carbolic), `g=0` |

`r` is set in game by priority-splitting coke between `calcium-carbide` and `coal-gas-from-coke`.
Both banks are built; neither is removed.

## The coke recursion — why everything upstream grows

Recycled coke does not leave the system. It returns as tar **and** as coal-gas, the coal-gas becomes
syngas which makes *more* tar, and that tar makes more coke. Per 20 coke into `coal-gas-from-coke`:

```
coke 20                    → coal-gas 20 + tar 20
coal-gas 20 → syngas       → tar 12            (coal-gas 50 → syngas 70 + tar 30)
                             ───────
new tar                      32
tar 32      → tar-refining  → pitch 44.8, anthracene-oil 24
pitch 44.8  → pitch-refining→ coke 4.48, anthracene-oil 13.44
anthracene 37.44 → cracking → coke 3.74
                             ───────
coke returned                 8.22   →  41.1 % per pass
```

So the coke rate is a fixed point, not a constant:

```
C(r) = 36.70 / (1 − 0.411 r)        coke/s
R(r) = r · C(r)                     coke/s entering coal-gas-from-coke
tar(r) = 132.30 + 1.6 · R(r)        tar/s   (1.6 = 32 new tar per 20 coke)
```

**Endpoints are solver-validated**: `C(0) = 36.70` matches design 10's published coke flow, and
`C(1) = 62.33` reproduces the solver exactly. The loop **converges** — 41.1 % < 100 % — so there is no
deadlock at any `r`.

### Everything downstream is linear in tar

Coefficients taken from the `r=1` solve, then checked against design 10's published `r=0` figures:

| per tar/s | coeff | model @ tar 132.30 | design 10 published |
|---|--:|--:|--:|
| aromatics | 0.430 | 56.9 | **56.89** |
| gasoline | 0.683 | 90.4 | **90.36** |
| naphthalene-oil | 0.580 | 76.7 | **76.73** |
| carbolic-oil | 0.150 | 19.8 | **19.85** |
| hydrogen | 0.140 | 18.5 | **18.52** |
| creosote | 0.240 | 31.8 | **31.75** |
| process steam | 2.700 | 357.2 | **357.21** |

Seven independent matches. Syngas and acetylene are not purely tar-driven:

```
syngas(r)    = 151.20 + 1.4 · R(r)
acetylene(r) = 10.667 · (1 − r) · C(r)
CO2(r)       = 61.98 · acetylene(r) / 391.48     (all CO2 comes from `lime`)
```

**The CO2 problem dials itself away.** At `r=1` the lime branch is idle and carbon-dioxide is **zero**.

## The dial

**MW and plastic are alternatives, not a package** — diverting aromatics and syngas to
`aromatics-to-plastic` removes them from `F`. Both corners are shown:

| r | coke/s | tar/s | aromatics/s | acetylene/s | CO2/s | **F (MJ/s)** | **MW** (burn all) | **max plastic/s** | **MW** at max plastic |
|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **0.00** | 36.70 | 132.3 | 56.9 | **391.5** | 61.98 | 612.1 | **440** | 1.14 | 375 |
| 0.25 | 40.90 | 148.7 | 63.9 | 327.2 | 51.8 | 573.4 | 397 | 1.28 | 324 |
| 0.50 | 46.19 | 169.3 | 72.8 | 246.4 | 39.0 | 524.7 | 343 | 1.46 | 260 |
| 0.75 | 53.05 | 196.0 | 84.3 | 141.5 | 22.4 | 461.5 | 274 | 1.69 | 177 |
| **1.00** | 62.31 | 232.0 | **99.8** | **0** | **0** | 376.2 | **180** | **2.00** | **65** |

`MW = F − 0.24675 · S − draw`, the design 10 identity, with `S = 2.700 · tar` and
`draw = 0.1814 · tar + 60 · acetylene/391.48`. It reproduces 440 MW at `r=0` to the digit.

Plastic capacity is **always aromatics-limited** (`aromatics/50` vs `syngas/100`), which gives the two
marginal rates that should drive how you operate the plant:

```
diverting existing aromatics :  50×0.35 + 100×0.40  =  57.5 MW per plastic-bar/s   (constant, any r)
dialling r upward            :  (440−180) / (2.00−1.14)  =  303 MW per plastic-bar/s
```

**Divert before you dial — it is 5.3× cheaper per plastic-bar.** Sit at `r=0` and take the full
1.14 plastic-bar/s out of design 10's existing aromatics for 65 MW; only move `r` once that is
exhausted and you still need more. The dial's real job is not plastic economics — it is keeping the
tree alive when acetylene or its 60 MW of draw is unwanted, and de-risking the 10.B coke diversion.

## Recipe table — the envelope

Each recipe sized for its maximum across `r ∈ [0,1]`. The tar-driven block peaks at `r=1`; the
acetylene block peaks at `r=0`.

```
┌──────────────────────────────┬─────────────────────┬───────┬──────────┬───────────┐
│ Recipe                       │ Factory             │ Count │ peaks at │ MW (peak) │
├──────────────────────────────┼─────────────────────┼───────┼──────────┼───────────┤
│ distilled-raw-coal           │ distilator          │     3 │ both     │           │
│ coal-gas                     │ distilator          │     2 │ both     │           │
│ coal-gas-from-coke           │ distilator          │    16 │ r=1      │           │
│ syngas                       │ gasifier            │    11 │ r=1      │      5.50 │
│ tar-refining                 │ tar-processing-unit │    12 │ r=1      │           │
│ pitch-refining               │ distilator          │    17 │ r=1      │           │
│ tar-refining-tops            │ tar-processing-unit │     3 │ r=1      │           │
│ light-oil-aromatics          │ distilator          │     4 │ r=1      │           │
│ anthracene-gasoline-cracking │ distilator          │    22 │ r=1      │           │
├──────────────────────────────┼─────────────────────┼───────┼──────────┼───────────┤
│ extract-limestone-01         │ soil-extractor-mk01 │    16 │ r=0      │      6.20 │
│ lime                         │ hpf                 │     4 │ r=0      │      8.00 │
│ calcium-carbide              │ hpf                 │    16 │ r=0      │     32.00 │
│ acetylene                    │ gasifier            │    32 │ r=0      │     16.00 │
│ slacked-lime-void            │ evaporator          │     4 │ r=0      │      4.00 │
├──────────────────────────────┼─────────────────────┼───────┼──────────┼───────────┤
│ (oil-boiler-mk01)            │ 5×5                 │    55 │ per-fuel │         0 │
│ (steam-engine)               │ 3×5                 │   142 │ r=0      │         0 │
└──────────────────────────────┴─────────────────────┴───────┴──────────┴───────────┘
162 process + 197 power island = 359 buildings · 42–84 MW draw
```

**+56 buildings over design 10's 303** — 43 in the tar-refining block (including the 16 new
`coal-gas-from-coke` distilators) and 13 more oil-boilers from fuel affinity. Nothing is removed.

### Boilers — fuel affinity, not just fragmentation

A boiler has **one fluid fuel box**, and in practice it is plumbed to one fuel line and never
re-piped when the dial moves. So the envelope is **Σ over fuels of max over r**, not max over r of
Σ — each fuel's boiler group must carry *its own* peak, wherever on the dial that falls:

**Build this table. No boiler ever changes fuel.**

| Fuel | MJ/unit | **boilers to build** | needed @ `r=0` | needed @ `r=0.5` | needed @ `r=1` | sized by |
|---|--:|--:|--:|--:|--:|---|
| **acetylene** | 1.00 | **27** | **26.44** | 16.64 | 0 | `r=0` |
| **gasoline** | 1.20 | **13** | 7.33 | 9.37 | **12.84** | `r=1` |
| **syngas** | 0.40 | **7** | 4.09 | 4.96 | **6.44** | `r=1` |
| **naphthalene-oil** | 0.30 | **3** | 1.55 | 1.99 | **2.73** | `r=1` |
| **aromatics** | 0.35 | **3** | 1.34 | 1.72 | **2.36** | `r=1` |
| **carbolic-oil** | 0.35 | **1** | 0.47 | 0.60 | **0.82** | `r=1` |
| **hydrogen** | 0.10 | **1** | 0.13 | 0.17 | **0.22** | `r=1` |
| **total** | | **55** | 41.35 | 35.45 | 25.41 | |

Every column sits at or under its built count at every `r`, so the bank is valid across the whole dial
with **fixed fuel assignment** — pipe each group once and never touch it. Venting hydrogen
(pre-approved, 0.10 MJ is noise) removes one boiler → **54**.

**Acetylene peaks at `r=0` and every other fuel peaks at `r=1`** — opposite ends of the dial. That is
the whole reason affinity matters: the 27 acetylene boilers and the 28 tar-fuel boilers are never both
fully loaded, so neither group can be sized against a blended total. Bank utilisation is **75 % at
`r=0`, 64 % at `r=0.5`, 46 % at `r=1`**.

`Σ ceil(MJ/14.805)` evaluated *at a single r* gives 46 at `r=0` and 28 at `r=1`; taking the max of
those (**46**) is wrong, because it assumes 18 boilers migrate from the acetylene line to the tar-fuel
lines as the dial turns. **55 is the number that builds.** Venting hydrogen (pre-approved, 0.10 MJ is
noise) removes one boiler → **54**.

**Engines have no affinity problem.** All boiler steam is 250 °C into a common header, so engines pool
freely across every fuel. Steam-to-engines peaks at `r=0` (2,123.5/s) and falls monotonically to
898/s at `r=1`, so design 10's **142 engines cover the whole range unchanged**; at `r=1` only 61 are
loaded.

So the island grows by **+13 boilers over design 10's published 42**, and not at all on engines.
Diverting aromatics and syngas for plastic only ever lowers the load — **nothing on either axis can
overload it.**

## Solver commands

Both endpoints were solved; intermediate rows are the recursion above, which reproduces design 10's
seven published figures at `r=0` and the solver's output at `r=1`. The `coal-gas-from-coke` recipe is
the only addition to design 10's set — **its absence is what makes design 10 un-throttleable**, and
`--max-import` must be omitted throughout because the coke↔tar loop is a closed self-sustaining cycle
that the LP mishandles when over-constrained.

**r = 1 (all coke recycled, no acetylene):**

```bash
npx tsx src/cli.ts solve \
  --recipes "distilled-raw-coal,coal-gas,coal-gas-from-coke,syngas,tar-refining,pitch-refining,tar-refining-tops,light-oil-aromatics,anthracene-gasoline-cracking" \
  --input "raw-coal:15" --time 1 \
  --factory "distilled-raw-coal:distilator" --factory "coal-gas:distilator" \
  --factory "coal-gas-from-coke:distilator" --factory "syngas:gasifier" \
  --factory "tar-refining:tar-processing-unit" --factory "pitch-refining:distilator" \
  --factory "tar-refining-tops:tar-processing-unit" --factory "light-oil-aromatics:distilator" \
  --factory "anthracene-gasoline-cracking:distilator" \
  --solver simplex --unlocked
```

**r = 0 (design 10 baseline, for the coke flow):**

```bash
npx tsx src/cli.ts solve \
  --recipes "distilled-raw-coal,coal-gas,syngas,tar-refining,pitch-refining,tar-refining-tops,light-oil-aromatics,anthracene-gasoline-cracking,extract-limestone-01,lime,calcium-carbide,acetylene,slacked-lime-void" \
  --input "raw-coal:15" --time 1 \
  --factory "distilled-raw-coal:distilator" --factory "coal-gas:distilator" --factory "syngas:gasifier" \
  --factory "tar-refining:tar-processing-unit" --factory "pitch-refining:distilator" \
  --factory "tar-refining-tops:tar-processing-unit" --factory "light-oil-aromatics:distilator" \
  --factory "anthracene-gasoline-cracking:distilator" --factory "extract-limestone-01:soil-extractor-mk01" \
  --factory "lime:hpf" --factory "calcium-carbide:hpf" --factory "acetylene:gasifier" \
  --factory "slacked-lime-void:evaporator" \
  --solver simplex --unlocked
```

## Byproducts and sinks

| Byproduct | r=0 | r=1 | Sink chosen | What it beat |
|---|--:|--:|---|---|
| gasoline, syngas, naphthalene-oil, aromatics, carbolic-oil, hydrogen | — | — | **burn** (in `F`) | selling coal-gas (`f>0`); the fuel is worth more as power |
| **aromatics** (diverted) | 0–56.9 | 0–99.8 | **`aromatics-to-plastic`** (2 biofactory-mk01 per 1.33 plastic-bar/s) | burning it at 0.35 MJ — plastic is the scarce good |
| **creosote** | 31.8 | **55.7** | **external sink** — owner-confirmed as handled at 55.7/s | the three on-site sinks below, all of which cost buildings this design would otherwise not need |
| ash | 2.16 | **6.52** | **`ash-separation`** (design 12) — 1 solid-separator at 65 % duty | `rich-clay` (ash 25 + water 500 → rich-clay 10), which needs its own rich-clay sink; planter-box export |
| carbon-dioxide | 61.98 | **0** | dials to zero as `r → 1` | design 10's greenhouse add-on, unnecessary at high `r` |
| slacked-lime | 137.1 | 0 | `slacked-lime-void` evaporator | — |

**Creosote scales with `r`** — 31.8/s at `r=0` to **55.69/s** at `r=1` — and `fuel_value: 0` means it
cannot be burned. It is disposed of externally, as in design 10. Recorded for reference, the on-site
sinks that were available and not taken:

| sink | cost at 55.69 creosote/s |
|---|---|
| `py-limestone` [smelting] `ash 3 + limestone 10 + creosote 35 → py-limestone 2` | 1.59 crafts/s; also absorbs 4.77 ash/s, but wants **limestone 15.9/s** = ~40 `extract-limestone-01` against the 16 built (+24, +9.3 MW) |
| `sand-casting` [tar] `sand 5 + creosote 20 → sand-casting 2` | 3 tar-processing-units + **sand 13.9/s**, needing a soil→sand chain this design does not have |
| `treated-wood` [tar] `wood 1 + creosote 100 → treated-wood 2` | 0.56 crafts/s and wood 0.56/s — cheap, but treated-wood then needs its own sink |

`creosote-to-aromatics` (`creosote 150 → aromatics 50`) would be the ideal answer — it would feed the
plastic line directly instead of needing disposal at all — but it is **locked with no technology
listed in the export**, so it cannot be planned around. Worth revisiting if that changes.

## Backpressure

**The valve is the point of the design, so verify it before relying on it.** Terminal outputs and the
sink each needs, `t = min(sink_i / rate_i)` over all of them at `r=1`:

| Output | rate | sink | binding? |
|---|--:|---|---|
| electricity | 180 MW | grid | no |
| aromatics + syngas | 99.8 + 238.4 | biofactories / boilers | no |
| creosote | **55.7/s** | external disposal line | **no — but it is the only off-block dependency** |
| ash | 6.52/s | `ash-separation` (design 12), 1 separator | no |
| gasoline, naphthalene, carbolic, hydrogen | — | boilers | no |

**Nothing inside the block is binding at any `r`.** The limiter sits off-block: blocked creosote
stalls `tar-refining`, which stalls the whole tree — the same failure the coke valve exists to
prevent, one step further down. Creosote is a fluid, so 55.7/s is a pipe rather than a belt problem,
but the line has to scale 1.75× with `r` (31.8 → 55.7/s). **Size the creosote run for `r=1` even if
you intend to sit at `r=0`**, since that is the one thing dialling up can break.

Secondary: at `r=1` the 68 idle buildings of the acetylene branch hold inventory. `calcium-carbide`
and `acetylene` should be circuit-disabled rather than starved, so they do not sit full of
part-consumed coke when `r` is dialled back down.

## Additional build materials

Over design 10's bill, this design adds **33 distilators** (16 `coal-gas-from-coke`, 7 pitch-refining,
9 cracking, 1 aromatics), **4 gasifiers**, **6 tar-processing-units** and **13 oil-boiler-mk01**. The
acetylene branch, the limestone extractors and the 142 engines are unchanged from design 10.

Distilators, gasifiers, tar-processing-units, hpf, evaporators and soil-extractors all carry **zero
intermetallics**, so the 43-building process expansion is free on the material that gates design 10.

**The 13 extra boilers are not free: `oil-boiler-mk01` is 10 intermetallics each → +130.** That takes
the plant from design 10's 420 to **550 intermetallics**, and it is the only part of this design that
competes with the 10.B powerplant upgrade for that material. If intermetallics are the binding
constraint, build the 42 boilers first and add the other 13 when you actually intend to move `r`
above ~0.3 — below that the tar-fuel groups are still inside design 10's existing allocation.

## Notes and risks

- **The dial is one-directional in confidence.** `r=0` is design 10, which is lab-validated. `r=1` is
  solver-validated. Intermediate `r` is the recursion, which matches both ends and seven of design
  10's published figures — but has not been built.
- **Why the plant is bigger than design 10 at every `r`**: the envelope sizes the tar block for
  `r=1`, so at `r=0` it runs at 57 % duty. If you never intend to leave `r=0`, build design 10. This
  design exists to make `r` free to move.
- **It de-risks the 10.B upgrade.** Routing coke to `py-coal-powerplant-mk01` needs coke to be
  *divertible*; with this valve, coke not wanted by the powerplants recycles instead of stalling, and
  the plastic feedstock survives either way. Design 10 cannot do that.
- `C(r)` is a fixed point, so **`r` is not linear in anything**. Dialling from 0.75 to 1.00 moves coke
  by 9.3/s where 0.00 to 0.25 moves it by 4.2/s. Size belts for `r=1`.
