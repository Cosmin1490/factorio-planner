---
name: pipeline
description: Solve a production pipeline with correct defaults, unlocked validation, cycle handling, and pipeline summary formatting. Use when asked to solve production rates, compute a pipeline, or run the solver.
---

# /pipeline — Production Pipeline Solver

Solve a production pipeline with correct defaults and guardrails.

## Usage

```
/pipeline <recipes> [options]
```

User provides: recipe list, target or input amounts, and optionally factory/module/constraint overrides.

## Context

Before solving, consult [`docs/pyanodon-methodology.md`](../../docs/pyanodon-methodology.md) for recipe selection rationale, byproduct management strategy, constraint decisions, and block boundary rules. The methodology is the authoritative reference for *what* to solve; this skill handles *how* to solve it.

## Workflow

### 1. Gather parameters

- **Recipes**: comma-separated recipe names (required)
- **Mode**: target (`--target item:amount`) or input (`--input item:amount`)
- **Factory overrides**: ask if user wants specific machines, otherwise solver picks defaults
- **Constraints**: ask about known byproducts to exclude

If any parameter is ambiguous, ask before proceeding.

### 2. Validate before solving

Before running the solver:

- **Check recipes exist**: run `npx tsx src/cli.ts recipes --produces <item> --unlocked` for each target item to confirm recipe names are valid and unlocked
- **Check factory names**: base-tier entities use bare names (`distilator`, `tar-processing-unit`), NOT `-mk01`. Higher tiers use `-mk02`/`-mk03`/`-mk04`. Verify against prototype data if unsure.
- **Check machine tier availability**: do NOT assume mk03/mk04 machines are available. Ask if unsure about the user's current tech level.

### 3. Build and run solve command

Always use these defaults:
- `--time 1` (per-second rates) unless user specifies otherwise
- `--unlocked` (always)
- `--solver simplex` (never suggest algebra)

```bash
npx tsx src/cli.ts solve \
  --recipes "<recipe1>,<recipe2>,..." \
  --target "<item>:<amount>" \
  --time 1 \
  --unlocked \
  [--factory "<recipe>:<entity>"] \
  [--constraint "<recipe>:<product>:exclude"] \
  [--max-import "<item>:<amount>"] \
  [--modules "<recipe>:<module>:<count>"] \
  [--beacons "<recipe>:<beacon>:<module>:<mCount>:<bCount>"] \
  [--export helmod]
```

### 4. Handle cycle warnings

If the solver emits cycle detection warnings:
- Read the suggested `--constraint exclude` fixes from the warning
- Explain to the user which cycles were detected (e.g., ash loops from burner factories)
- Re-run with the suggested excludes

### 5. Format output

Present results using the pipeline summary format from CLAUDE.md:

1. **Header**: `<target> — <rate>/s, <N> buildings`
2. **Recipe table** — ASCII box-drawing (┌─┬─┐ │ ├─┼─┤ └─┴─┘):
   - Columns: Recipe, Factory, Count (right-aligned), Modules (if any)
3. **Inputs**: one line, comma-separated: `item rate/s, item rate/s, ...`
4. **Byproducts**: one line, same format
5. **Intermediates table** — ASCII box-drawing:
   - Columns: Item, Rate, Producer, Consumer

### 6. Offer next steps

After presenting results:
- Offer Helmod export if not already included (`--export helmod`)
- Flag if building count > 40 (consider splitting into stamps)
- Note any imports that lack existing supplier blocks (check save inventory if available)
