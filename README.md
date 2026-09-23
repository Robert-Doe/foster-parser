# foster-parser

I built a hand-made HTML5 tree-construction engine, kept honest the whole way against a real browser, to explain why mutation XSS keeps showing back up no matter how many times people think they've closed it.

## What this is, and why the odd name

Foster parenting isn't a metaphor I made up. It's the WHATWG HTML Standard's own term (section 13.2.6) for the one mechanism in the tree-construction algorithm that relocates a DOM node to a position the source markup never specified. Misnested content inside a `<table>` gets kicked out and re-inserted as a sibling of the table instead of where it looked like it was going. I built that mechanism from scratch in JavaScript, the tokenizer, the stack of open elements, insertion-mode dispatch, the foster-parenting flag, active formatting elements, and the adoption agency algorithm, verified every claimed behavior against a real browser's native `DOMParser` output, and then used the finished engine as ground truth to explain a recurring root cause of mutation XSS: sanitizers whose serialize-then-reparse round trip silently changes tree shape because of foster parenting and related error-recovery tactics.

The scope here is deliberately narrow and spec-accurate rather than a full parser. Only enough of the tokenizer and the non-table insertion modes exist to correctly drive table-family tree construction. That narrowness is exactly what makes every claim checkable. There's nowhere left for an untested code path to hide.

## Module and track map

**Track 1, the corridor engine** (`track1-core/`): builds the parser.

| # | Module | Proves |
|---|---|---|
| 00 | Tokens & the DOM node shape | The token and node data structures represent every later input |
| 01 | Stack of open elements & dispatch loop | A minimal dispatch loop can reach `in table` from `in body` |
| 02 | Two conditions, one gate | The foster-parenting flag plus the current-node check is necessary but not sufficient alone |
| 03 | The flag: enable, process, disable | The flag's one-token lifetime, shown by logging its transitions |
| 04 | Why exactly five elements | The five-element fostering membership list is derivable, not memorized |
| 05 | The seven substeps | The engine computes the same adjusted insertion location as a real browser |
| 06 | What gets fostered | HTML elements, text, and foreign (SVG/MathML) elements all share one relocation path |
| 07 | What refuses to be fostered | `<style>`, `<script>`, `<template>`, hidden `<input>`, and `<form>` are intercepted first |
| 08 | `in table text` & the whitespace trap | The all-or-nothing buffered-run decision, round-tripped against the spec's own case |
| 09 | Text-node fusion | Fostered text merges into `table.previousSibling` instead of duplicating a node |
| 10 | Active formatting elements & the triple `<b>` | Reproduces the spec's canonical 3x `<b>` example byte for byte |
| 11 | Templates, fragments, detached tables | The `innerHTML`-vs-document-parse inversion, same markup run through both paths |
| 12 | The containment atlas | The per-element dispatch table matches all seven recovery tactics, not just fostering |
| 13 | Scope & why table is a wall | The four scope variants correctly gate the historical `<p>`/`<div>` leak cases |
| 14 | The adoption agency algorithm | The full misnested-formatting-element repair algorithm against real browser output |

**Track 2, breaking sanitizers** (`track2-mxss/`): applies the engine.

| # | Module | Proves |
|---|---|---|
| T2-01 | What mXSS actually is | A concrete sanitize, serialize, reparse cycle turns inert markup into an executing payload |
| T2-02 | Foster-parenting-shaped payloads vs. a naive sanitizer | A hand-built allowlist sanitizer falls to fostering behavior alone |
| T2-03 | Whitespace-run & text-fusion vectors | Buffered whitespace and text fusion hide or merge attacker content across sanitizer node boundaries |
| T2-04 | Idempotent serialization as a defense | A reparse-and-diff idempotency check (the DOMPurify-style pattern) catches every T2-02/03 payload |
| T2-05 | Case studies from disclosed mXSS bugs | The engine reproduces the tree-shape behavior behind real, publicly disclosed mXSS writeups |

Supporting material: `prerequisites/` (tokens, DOM node shape, the stack of open elements, insertion modes, "appropriate place for inserting a node"), `lessons/` (the full roughly 20-state insertion-mode statechart, and how scope plus active formatting elements combine into the adoption agency algorithm), and a vocabulary cluster inside `track1-core/10_formatting_triple_b/` disambiguating foster parenting, adoption agency, reconstruction, and the unrelated DOM-API sense of "reparenting."

## Tech stack

JavaScript on Node.js 20 or later, zero dependencies. The parser is hand-rolled specifically so every decision is visible in source, never hidden behind a library. Every module's `test/demo.js` output gets checked against a real browser's native `DOMParser`/`innerHTML` behavior, never asserted from spec text alone. Docs are static `tutorial.html` files sharing one template (`templates/course.css`), no framework, no build step.

## Where this stands

Done. All 20 modules (Track 1's 00 through 14, Track 2's T2-01 through T2-05), the prerequisites layer, both cross-module lesson clusters, and the vocabulary web. I found five real bugs while building this and documented them rather than quietly fixing them away, see `ROADMAP.md`'s closing section and `track1-core/14_adoption_agency/DECISIONS.md` for the fullest account, including two corrections that required checking parse5's actual reference-implementation source against a literal reading of the spec prose.

## How to explore or run it

```bash
# Open any module's page directly, zero build step:
start track1-core/00_tokens_and_nodes/tutorial.html   # Windows
# or serve the folder if you prefer a URL bar over file://
python -m http.server 8000
```

Each module's `src/` holds the hand-rolled engine code for that step, `test/` holds `demo.js` (the browser-verified assertions), and `tutorial.html` is the narrative. Start at `prerequisites/index.html` if you want the vocabulary first, or jump straight to `track1-core/00_tokens_and_nodes/tutorial.html`. `ROADMAP.md` has the full map and recommended stopping points depending on how much you actually need.

## A note on the reference documents

`PseudoDOM_Architecture` and `PseudoDOM_Guard_Unified` are real research documents behind parts of this course's design, kept in the repo as PDF, rendered and readable directly on GitHub. Their `.docx` sources are intentionally excluded through `.gitignore` to keep this repository text-first and diff-friendly. Regenerate or re-attach them locally if you need the editable form.
