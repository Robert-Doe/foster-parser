# foster-parser

A hand-built HTML5 tree-construction engine, kept honest against a real
browser, used to explain why mutation XSS keeps recurring.

## What this is, and why the odd name

"Foster parenting" is not a metaphor here — it is the WHATWG HTML Standard's
own term (§13.2.6) for the one mechanism in the tree-construction algorithm
that relocates a DOM node to a position the source markup never specified:
misnested content inside a `<table>` gets kicked out and re-inserted as a
sibling of the table instead. This repository builds that mechanism from
scratch in JavaScript — tokenizer, stack of open elements, insertion-mode
dispatch, the foster-parenting flag, active formatting elements, the
adoption agency algorithm — verifies every claimed behavior against a real
browser's native `DOMParser` output, and then uses the finished engine as
ground truth to explain a recurring root cause of mutation XSS (mXSS):
sanitizers whose serialize → reparse round trip silently changes tree shape
because of foster parenting and related error-recovery tactics.

The scope is deliberately narrow and spec-accurate rather than a full
parser: only enough of the tokenizer and non-table insertion modes exist to
correctly drive table-family tree construction. That narrowness is what
makes every claim checkable — there is nowhere for an untested code path to
hide.

## Module / track map

**Track 1 — the corridor engine** (`track1-core/`): builds the parser.

| # | Module | Proves |
|---|---|---|
| 00 | Tokens & the DOM node shape | The token/node data structures represent every later input |
| 01 | Stack of open elements & dispatch loop | A minimal dispatch loop can reach `in table` from `in body` |
| 02 | Two conditions, one gate | The foster-parenting flag + current-node check is necessary but not sufficient alone |
| 03 | The flag: enable → process → disable | The flag's one-token lifetime, by logging its transitions |
| 04 | Why exactly five elements | The five-element fostering membership list is derivable, not memorized |
| 05 | The seven substeps | The engine computes the same adjusted insertion location as a real browser |
| 06 | What gets fostered | HTML elements, text, and foreign (SVG/MathML) elements share one relocation path |
| 07 | What refuses to be fostered | `<style>`/`<script>`/`<template>`/hidden `<input>`/`<form>` are intercepted first |
| 08 | `in table text` & the whitespace trap | The all-or-nothing buffered-run decision, round-tripped against the spec's own case |
| 09 | Text-node fusion | Fostered text merges into `table.previousSibling` instead of duplicating a node |
| 10 | Active formatting elements & the triple `<b>` | Reproduces the spec's canonical 3×`<b>` example byte-for-byte |
| 11 | Templates, fragments, detached tables | The `innerHTML`-vs-document-parse inversion, same markup through both paths |
| 12 | The containment atlas | The per-element dispatch table matches all seven recovery tactics, not just fostering |
| 13 | Scope & why table is a wall | The four scope variants correctly gate the historical `<p>`/`<div>` leak cases |
| 14 | The adoption agency algorithm | The full misnested-formatting-element repair algorithm against real browser output |

**Track 2 — breaking sanitizers** (`track2-mxss/`): applies the engine.

| # | Module | Proves |
|---|---|---|
| T2-01 | What mXSS actually is | A concrete sanitize→serialize→reparse cycle turns inert markup into an executing payload |
| T2-02 | Foster-parenting-shaped payloads vs. a naive sanitizer | A hand-built allowlist sanitizer falls to fostering behavior alone |
| T2-03 | Whitespace-run & text-fusion vectors | Buffered whitespace and text fusion hide/merge attacker content across sanitizer node boundaries |
| T2-04 | Idempotent serialization as a defense | A reparse-and-diff idempotency check (the DOMPurify-style pattern) catches every T2-02/03 payload |
| T2-05 | Case studies from disclosed mXSS bugs | The engine reproduces the tree-shape behavior behind real, publicly disclosed mXSS writeups |

Supporting material: `prerequisites/` (tokens, DOM node shape, the stack of
open elements, insertion modes, "appropriate place for inserting a node"),
`lessons/` (the full ~20-state insertion-mode statechart, and how scope +
active formatting elements combine into the adoption agency algorithm), and
a vocabulary cluster inside `track1-core/10_formatting_triple_b/`
disambiguating foster parenting, adoption agency, reconstruction, and the
unrelated DOM-API sense of "reparenting."

## Tech stack

JavaScript on Node.js >= 20, zero dependencies — the parser is hand-rolled
specifically so every decision is visible in source, not hidden behind a
library. Every module's `test/demo.js` output is checked against a real
browser's native `DOMParser`/`innerHTML` behavior, never asserted from spec
text alone. Docs are static `tutorial.html` files sharing one template
(`templates/course.css`) — no framework, no build step.

## Current status

Complete: all 20 modules (Track 1 00–14, Track 2 T2-01–T2-05), the
prerequisites layer, both cross-module lesson clusters, and the vocabulary
web. Five real bugs were found while building this and are documented
rather than quietly fixed away — see `ROADMAP.md`'s closing section and
`track1-core/14_adoption_agency/DECISIONS.md` for the fullest account,
including two corrections that required checking parse5's actual
reference-implementation source against a literal reading of spec prose.

## How to explore / run it

```bash
# Open any module's page directly - zero build step:
start track1-core/00_tokens_and_nodes/tutorial.html   # Windows
# or serve the folder if you prefer a URL bar over file://
python -m http.server 8000
```

Each module's `src/` holds the hand-rolled engine code for that step,
`test/` holds `demo.js` (the browser-verified assertions), and
`tutorial.html` is the narrative. Start at `prerequisites/index.html` if
you want the vocabulary first, or jump straight to
`track1-core/00_tokens_and_nodes/tutorial.html`. `ROADMAP.md` has the full
map and recommended stopping points depending on how much you need.

## A note on the reference documents

`PseudoDOM_Architecture` and `PseudoDOM_Guard_Unified` are real research
documents behind parts of this course's design, kept in the repo as PDF
(rendered, readable directly on GitHub). Their `.docx` sources are
intentionally excluded via `.gitignore` to keep this repository text-first
and diff-friendly — regenerate or re-attach them locally if you need the
editable form.
