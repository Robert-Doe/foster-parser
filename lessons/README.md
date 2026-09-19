# lessons/ — cross-module concept clusters

Phase 3 of this course. Each subfolder here covers an idea that spans more than one Track 1 module and
doesn't belong entirely to any single one of them — reading any one module's tutorial in isolation would
either re-explain the shared idea shallowly (bloating that module) or silently assume it (confusing a
reader who hasn't seen the other modules that touch it). These clusters exist to hold that shared context
in one place, cross-linked from every module that relies on it.

## `01_insertion_mode_statechart/`

**Spans:** Prerequisite P4, and Modules 01, 03, 05, 08, 10, 11, 12, 13 — every module that added a mode, a
mode-switch, or a mode-collapsing simplification.

**Why it lives centrally:** no single Track 1 module owns "the insertion mode state machine" as a whole.
Module 01 builds the first six modes; Module 05 collapses three real modes (`in table body`, `in row`,
`in cell`) into one (`in table`) as a load-bearing simplification; Module 08 adds `in table text`; Module 11
runs into that collapsing decision's first real cost (the `in template` mode-dispatch nuance it routes
around). Explaining the full state machine — real spec modes vs. what this engine actually built, and
exactly where and why they diverge — inside any ONE of those modules would either repeat the same diagram
seven times or leave six of the seven modules assuming context they never stated.

## `02_scope_and_active_formatting/`

**Spans:** Modules 02, 04, 10, 13.

**Why it lives centrally:** scope (Module 13) and the active formatting elements list (Module 10) are built
four modules apart, by design — but they're the two halves of one mechanism the real spec calls the
adoption agency algorithm (not built by this course; see Module 10's vocabulary web). Understanding *why*
both exist, and how they'd combine if this course did build the adoption agency, requires seeing them next
to each other — which Module 13's own tutorial, arriving last, can gesture at but can't fully unpack without
either duplicating Module 10's content or leaving the connection implicit.

---

Both clusters follow the same structure as a Track 1 module's `tutorial.html` (same design system, same
"Big Analogy" / "The Mechanism" grammar) but are topic-scoped rather than module-scoped: `01_explainer.html`
gives the overview, and numbered `*_deepdive.html` files each go further into one facet (history,
alternative implementations, security implications, performance tradeoffs) than any single module's own
code motivates.
