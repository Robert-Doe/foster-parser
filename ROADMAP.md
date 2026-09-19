# ROADMAP — Foster Parenting: Build the HTML Parser's Table-Relocation Engine, Then Break Sanitizers With It

Course subject: the WHATWG HTML Standard's **foster parenting** rule (§13.2.6) — the tree-construction
algorithm's one mechanism that moves a DOM node to a position the source markup never specified — built
from scratch, verified against real browser output, then used to understand why it is a recurring root
cause of **mutation XSS (mXSS)**.

Source of truth for scope/content fidelity: `foster-parenting-course.html` (your attached file). Its
modules 00–13 are spec-accurate and become the backbone of Track 1's *reading* content; this roadmap adds
the *building* and *applied-security* layers your prompt template requires on top of it.

---

## Track 1 — The Corridor Engine (core: hand-built tokenizer + tree constructor)

A minimal, hand-rolled HTML tokenizer and tree-construction engine in JavaScript, scoped tightly enough to
correctly reproduce every table/foster-parenting behavior in the attached file — verified module-by-module
against a real browser's `DOMParser` output, not assumed from the spec text.

| # | Module name | What it proves | Directory | Status |
|---|---|---|---|---|
| 00 | Tokens & the DOM node shape | Proves our token/node data structures can represent every input the later modules throw at them | `track1-core/00_tokens_and_nodes` | Done |
| 01 | The stack of open elements & insertion-mode dispatch loop | Proves a minimal dispatch loop can drive `in body` well enough to reach `in table` for the first time | `track1-core/01_stack_and_dispatch` | Done |
| 02 | Two conditions, one gate | Proves the foster-parenting flag + current-node check, alone, is necessary but not sufficient without §03 | `track1-core/02_two_conditions_one_gate` | Done |
| 03 | The flag: enable → process → disable | Proves the flag's one-token lifetime by instrumenting the dispatch loop and logging its on/off transitions | `track1-core/03_the_flag_lifetime` | Done |
| 04 | Why exactly five elements | Proves the five-element membership list is derivable, not memorized, by testing all table-family elements as current node | `track1-core/04_five_elements` | Done |
| 05 | The seven substeps (adjusted insertion location) | Proves our engine computes the exact same insertion point as a real browser for nested/templated/detached-table cases | `track1-core/05_seven_substeps` | Done |
| 06 | What gets fostered | Proves HTML elements, character tokens, and foreign (SVG/MathML) elements all route through the same relocation path | `track1-core/06_what_gets_fostered` | Done |
| 07 | What refuses to be fostered | Proves `<style>`/`<script>`/`<template>`/`<input type=hidden>`/`<form>` are explicitly intercepted before reaching the fostering branch | `track1-core/07_what_refuses` | Done |
| 08 | `in table text` & the whitespace trap | Proves the all-or-nothing buffered-run decision by round-tripping the exact whitespace test case from the attached file | `track1-core/08_in_table_text` | Done |
| 09 | Text-node fusion | Proves our engine merges fostered text into `table.previousSibling` instead of creating a duplicate node | `track1-core/09_text_fusion` | Done |
| 10 | Active formatting elements & the triple `<b>` | Proves our engine reproduces the spec's own 3×`<b>` canonical example, byte-for-byte against a real browser | `track1-core/10_formatting_triple_b` | Done |
| 11 | Templates, fragments, detached tables | Proves the `innerHTML`-vs-document-parse inversion by running the *same* markup through both code paths in our engine | `track1-core/11_templates_fragments` | Done |
| 12 | The containment atlas | Proves our engine's per-element dispatch table matches all seven recovery tactics (FOSTER/CLOSE/IGNORE/etc.), not just the five fostering ones | `track1-core/12_containment_atlas` | Done |
| 13 | Scope & why table is a wall | Proves the four scope variants correctly block/allow the historical `<p>`/`<div>` leak cases | `track1-core/13_scope` | Done |
| 14 | The adoption agency algorithm | Proves the full misnested-formatting-element repair algorithm — cheap "no furthest block" exit vs. full clone-and-relocate — against real browser output, with a dedicated treatment of how the parser handles malformed HTML generally | `track1-core/14_adoption_agency` | Done *(added after Track 1's original 00–13 close, by explicit request)* |

## Track 2 — Breaking Sanitizers (applied: mXSS, built on Track 1)

Uses the Track-1 engine as ground truth to understand — and defend against — mXSS: cases where a
sanitizer's *serialize → reparse* round-trip changes tree shape because of foster parenting and related
tree-construction recovery tactics.

| # | Module name | What it proves | Directory | Depends on (Track 1) | Status |
|---|---|---|---|---|---|
| T2-01 | What mXSS actually is | Proves a concrete sanitize→serialize→reparse cycle can turn inert markup into an executing payload | `track2-mxss/01_what_mxss_is` | 05, 06 | Done |
| T2-02 | Foster-parenting-shaped payloads vs. a naive sanitizer | Proves a hand-built naive allowlist sanitizer can be defeated using only fostering behavior from modules 06–08 | `track2-mxss/02_naive_sanitizer_break` | 06, 07, 08 | Done |
| T2-03 | Whitespace-run & text-fusion vectors | Proves the all-or-nothing buffering (module 08) and text fusion (module 09) can hide/merge attacker content across a sanitizer's node boundaries | `track2-mxss/03_whitespace_fusion_vectors` | 08, 09 | Done |
| T2-04 | Defense patterns: idempotent serialization | Proves a "reparse-and-diff" idempotency check (the pattern DOMPurify-style sanitizers use) catches every payload from T2-02/03 | `track2-mxss/04_idempotent_serialization` | 05–12 | Done |
| T2-05 | Case studies from disclosed mXSS bugs | Proves our engine can reproduce the tree-shape behavior behind 2–3 real, publicly disclosed mXSS writeups | `track2-mxss/05_case_studies` | all | Done |

## Prerequisites Layer (Phase 1)

Root index: `prerequisites/index.html`, one page per idea, linked into from every module tutorial via
short tag-links (never re-taught inline):

- `prereq_tokens.html` — what a token is, the five token kinds the tokenizer emits
- `prereq_dom_node_shape.html` — element/text/comment node shape our engine uses
- `prereq_stack_of_open_elements.html` — the stack as a data structure (push/pop/current node)
- `prereq_insertion_modes.html` — the "states" you asked about: full list of ~20 insertion modes, what a mode *is* (a token-dispatch table, not a rendering state), how the parser switches between them
- `prereq_appropriate_place.html` — the "appropriate place for inserting a node" algorithm as the single chokepoint everything (§Track 1 modules 05+) hangs off of

## Cross-Module Concept Clusters (Phase 3)

Built once several Track 1 modules exist, since these ideas span module boundaries:

- `lessons/01_insertion_mode_statechart/` — the full ~20-state machine as one diagram + deepdives on mode-switching vs. token-reprocessing vs. redirection
- `lessons/02_scope_and_active_formatting/` — how scope (module 13) and the active-formatting list (module 10) interact to produce the adoption agency algorithm

## Vocabulary Web (Phase 4)

Triggered by Track 1 module 10, where "foster parenting," "adoption agency," "reconstruction," and the
unrelated DOM API sense of "reparenting" collide and get conflated:

- `track1-core/10_formatting_triple_b/concept_foster_parenting.html`
- `.../concept_adoption_agency.html`
- `.../concept_reconstruction.html`
- `.../concept_reparenting_dom_api.html`
- `.../concept_how_they_connect.html` — hub page with side-by-side grid + confused-pairs table + scenario quiz

## Recommended Stopping Points

| Goal | Stop at |
|---|---|
| Just want the mental model, no code | Track 1 modules 00–04 tutorials (skip the build steps) |
| Want to stop writing sanitizer bugs shaped like this | Track 1 through 08, then T2-02 |
| Full spec-reading fluency (interviews, parser code review) | End of Track 1 (module 13) |
| Building or auditing a production sanitizer | Full course through T2-05 |

## Tools / Architecture Target

- **Language/runtime:** JavaScript, Node.js ≥ 20, zero dependencies — the parser itself is hand-rolled so every decision is visible.
- **Ground truth:** every module's claimed output is checked against a real browser's native `DOMParser` (via this environment's browser tool), never asserted from spec text alone.
- **Docs:** static `tutorial.html` files reusing the attached file's exact design system (Newsreader/Space Grotesk/IBM Plex Mono, paper-grid background, "THE PICTURE"/"THE MECHANISM" blocks, stamp lozenges, `.rail`/`.stk`/`.tree` stack visualizations) — extracted once into a shared template, no framework, no build step.
- **Explicitly out of scope:** the full ~80-state tokenizer (we implement only enough to correctly drive table-family tree construction); non-table insertion modes are stubbed except where a module needs them (`in body`, minimal `in head`); rendering/layout; XML parsing; production-grade sanitizer implementation (Track 2 builds a *teaching* sanitizer to break, not a shippable one).

---

## Course complete

All 20 modules (Track 1: 00–14, Track 2: T2-01–T2-05), the prerequisites layer, both cross-module concept
clusters, and the vocabulary web are built, tested, and documented. Every module's `test/demo.js` passes;
every browser-verifiable claim was checked against real `DOMParser`/`innerHTML` output before being
written up. Five real bugs were found and either fixed (Module 01's DOCTYPE reprocessing, Module 05's
`<tr><td>` double-insertion, Module 11's template-redirect gap, T2-04's explicit-`<tbody>` gap, Module 14's
`insertNode`/move-semantics gap) or honestly routed around and documented (Module 11's `in template`
mode-dispatch nuance; T2-05's general form-element-pointer tracking gap, which doubles as the course's
closing lesson about the idempotent-serialization defense's own limits).

**Module 14 — the adoption agency algorithm — was added after this "complete" status was first reached**,
by explicit request, specifically to cover the one algorithm every prior module deliberately scoped out
(see Module 10's `concept_adoption_agency.html`), and to give a dedicated, thorough answer to "how does the
parser handle malformed HTML" — this course's single most requested clarification. Its build hit three real
bugs and two self-caught test-transcription errors, all documented in full, including two corrections that
required checking parse5's actual reference-implementation source rather than trusting a literal reading of
spec prose; see `track1-core/14_adoption_agency/DECISIONS.md` for the complete narrative.

Start at [prerequisites/index.html](prerequisites/index.html) or jump straight to
[Track 1 Module 00](track1-core/00_tokens_and_nodes/tutorial.html). See the Recommended Stopping Points
table above if you don't need the full path.
