# REFERENCES

Every source this course draws a fact from, grouped by where it's used. This file grows as each module is
built — nothing here is asserted from memory; anything stated as fact in a module's `tutorial.html` or
`DECISIONS.md` traces back to an entry here or to this course's own verified code output.

## Primary specification

- **WHATWG HTML Standard, Living Standard** — https://html.spec.whatwg.org/multipage/
  - §13.2 Parsing HTML documents (overall structure: tokenization → tree construction)
  - §13.2.4.1 The insertion mode — the full list of insertion modes (Prerequisite P4)
  - §13.2.4.2 The stack of open elements — including the moved-or-removed-from-the-tree warning (Track 1
    Module 05 / attached reference file Module 09)
  - §13.2.4.5 Other parsing state flags (scripting flag, frameset-ok flag)
  - §13.2.6.1 Creating and inserting nodes — "appropriate place for inserting a node" (Prerequisite P5),
    including the foster-parenting substeps
  - §13.2.6.4.9–.16 The rules for the table-family insertion modes (`in table`, `in table text`,
    `in caption`, `in column group`, `in table body`, `in row`, `in cell`)
  - §13.2.10.3 An introduction to error handling and strange cases in the parser — the spec's own
    canonical triple-`<b>` example (Track 1 Module 10)

## Historical corrections to the spec (cited in the attached reference course's colophon)

- Nolan Waite, whatwg mailing list, July 2013 — reported that "insert a foreign element" was
  incorrectly documented as unaffected by foster parenting; confirmed and fixed by Ian Hickson ("Hixie").
  Relevant to Track 1 Module 06 (foreign elements are fostered too).
- David Flanagan, whatwg mailing list, October 2011 — identified that the foster-parenting rule must be
  re-evaluated on *every insertion*, not once per token, because a reconstructed formatting element can
  change the current node mid-token. This is why the modern spec uses the flag-plus-"appropriate place"
  formulation. Relevant to Track 1 Module 10.
- Henri Sivonen, March 2008 — observed that the adoption agency algorithm's final relocation step is not
  a special case but literally foster parenting as usual, once the override-target parameter is accounted
  for. Relevant to Track 1 Module 10.
- **whatwg/html PR #10557** (against issue #10310) — removal of the `in select` and `in select in table`
  insertion modes, part of the customizable `<select>` (`appearance: base-select`) work. Relevant to Track
  1 Module 12.

## Reference implementation source (Module 14)

- **parse5** — https://github.com/inikulin/parse5, TypeScript source fetched directly from
  `raw.githubusercontent.com/inikulin/parse5/master/packages/parse5/lib/parser/index.ts` during this
  session (a battle-tested implementation used by jsdom, not recalled from memory). Consulted after a
  spec-prose reading of the adoption agency algorithm's relocation step produced an incorrect
  "simplification" of `location_override.js` (see that module's DECISIONS.md). Its `callAdoptionAgency`,
  `aaObtainFormattingElementEntry`, `aaObtainFurthestBlock`, `aaInnerLoop`,
  `aaInsertLastNodeInCommonAncestor`, `aaReplaceFormattingElement`, and `aaRecreateElementFromEntry`
  functions resolved two real questions this module's build got wrong on the first attempt: whether the
  foster-parenting gate applies to the relocation step (it does — `aaInsertLastNodeInCommonAncestor` checks
  `_isElementCausesFosterParenting`), and which side of `furthestBlock` the new formatting-element clone
  belongs on in the stack of open elements (`insertAfter`, not before — the actual fix for an 8-iteration
  runaway-cloning bug this module's own build reproduced and fixed).
- **whatwg/html issues #10525 and #9559** — https://github.com/whatwg/html/issues/10525,
  https://github.com/whatwg/html/issues/9559 — fetched directly; confirm the adoption agency algorithm's
  spec prose is a known, actively-discussed source of implementer ambiguity, not just a source of confusion
  for this course's own build.

## Conformance test suite

- **html5lib-tests**, `tree-construction/tests1.dat` … `tests26.dat`, `tables01.dat` —
  https://github.com/html5lib/html5lib-tests — the de facto cross-browser/cross-library conformance suite
  for tree construction. Track 1 modules verify engine output against hand-picked cases from this family
  in addition to live-browser `DOMParser` output; any module claiming "matches real browsers" cites the
  specific case(s) checked in that module's own `DECISIONS.md`.

## mXSS / sanitizer security (Track 2)

- Mario Heiderich, Jörg Schwenk, Tilman Frosch, Jonas Magazinius, Edward Z. Yang — *"mXSS Attacks: Attacking
  well-secured Web-Applications by using innerHTML Mutations"* (ACM CCS 2013) — the original mXSS paper.
  General framing (a check against one HTML representation misses content in the reparsed result) cited
  starting Module T2-01; this course's own demonstrations use foster parenting specifically, which is not
  itself an example from that paper.
- DOMPurify project documentation and security advisories — https://github.com/cure53/DOMPurify — for the
  idempotent-serialization defense pattern, to be covered in Track 2 Module T2-04.
- PortSwigger Web Security Academy, mXSS research writeups — reserved for specific, named, publicly
  disclosed case studies in Track 2 Module T2-05, each to be cited individually when that module is built.

- **T2-01** — Live browser verification: one `DOMParser` case (an `<img>` with an inert marker attribute
  fostered out of a `<table>` inside a `#sandbox` wrapper), output captured verbatim and reproduced in
  `track2-mxss/01_what_mxss_is/DECISIONS.md`. No payload constructed or executed — see that module's
  DECISIONS.md for the firm structural-proof-only line this sets for the rest of Track 2.
- **T2-02** — reuses Track 1 Module 06's (generic-element fostering) and Module 07's (hidden-input
  containment) already-verified tree shapes rather than re-checking them against a live browser; this
  module's new claim is about sanitizer behavior, not tree shape. Heiderich et al. (already cited above)
  for the general class of source-position/tree-structure mismatch this naive heuristic falls into.
- **T2-03** — reuses Track 1 Module 08 (buffering) and Module 09 (fusion) unchanged. **Live browser
  verification**: one `DOMParser` case (`"java"` + `"script:alert(1)"` fusing to `"javascript:alert(1)"`
  across a table boundary), output captured verbatim and reproduced in
  `track2-mxss/03_whitespace_fusion_vectors/DECISIONS.md` — re-verified with this specific attack-shaped
  string despite Module 05 already proving the identical mechanism for an arbitrary string.
- **T2-04** — DOMPurify's documented idempotent-serialization defense pattern (parse → serialize → reparse
  → compare), and Heiderich et al.'s mXSS paper (both already cited above). **Live browser verification**:
  one case (`table.appendChild(textNode)` then `.outerHTML` then a fresh `innerHTML` assignment elsewhere),
  output captured verbatim and reproduced in `track2-mxss/04_idempotent_serialization/DECISIONS.md`. Also:
  a real bug in Track 1's dispatch chain (no rule for an explicit `<tbody>`/`<thead>`/`<tfoot>` start tag —
  every Track 1 test case only ever produced one by implication) was caught by this module's own round-trip
  test and fixed additively in `track2-mxss/04_idempotent_serialization/src/dispatch_reparse.js`.

- **T2-05** — three real sources, verified live via web search and direct fetch in this session, not
  recalled from memory:
  - SonarSource mXSS Cheatsheet, "Round Trip mXSS" and "Parsing Differential mXSS" sections —
    https://sonarsource.github.io/mxss-cheatsheet/explained/ (fetched directly; content confirmed present).
  - Gareth Heyes, PortSwigger Research, "Bypassing DOMPurify again with mutation XSS," October 7, 2020 —
    https://portswigger.net/research/bypassing-dompurify-again-with-mutation-xss (fetched directly; author,
    date, PoC payload, and mechanism confirmed from the source itself).
  **Live browser verification**: one case ("Round Trip mXSS" — a form nested inside a form, first parse and
  a serialize/reparse round trip), output captured verbatim and reproduced in
  `track2-mxss/05_case_studies/DECISIONS.md`, alongside an honestly-reported finding that this course's own
  T2-04 defense reports the reproduced tree as stable when the real browser's round-trip is not — a real,
  demonstrated gap in this engine's form-element-pointer tracking, not glossed over.

## Track 1 module-specific spec citations

- **Module 01** — WHATWG HTML Standard §13.2.4.2 (initial insertion mode: DOCTYPE tokens are fully
  consumed in place, not reprocessed — the rule whose omission caused this module's first failing test
  run; see `track1-core/01_stack_and_dispatch/DECISIONS.md`), and the tokenizer's attribute-parsing
  algorithm (first-occurrence-wins on duplicate attribute names).
- **Module 02** — the five-element foster-parenting target list and the "flag AND current node" gate
  condition, both restated directly from the attached reference course's own Module 00 ("Two conditions,
  one gate") and Module 02 ("Why exactly five elements").
- **Module 03** — WHATWG HTML Standard §13.2.4.1's "process the token using the rules for the X insertion
  mode" technique, distinct from an actual insertion-mode switch; and the "in table" anything-else clause's
  exact enable/process/disable sequence, quoted from the attached reference course's own Module 01 ("The
  flag: is there a switch?"). Regression check after the additive `MODES` export: Modules 00–02's own
  `test/demo.js` scripts were re-run and confirmed still passing unmodified.
- **Module 04** — CSS table layout's anonymous-box generation reasoning (why `table`/`tbody`/`thead`/
  `tfoot`/`tr` generate no box capable of holding non-table content) and the content-model distinction for
  `td`/`th`/`caption` (flow content), both restated from the attached reference course's own Module 02
  ("Why exactly five elements").
- **Module 05** — WHATWG HTML Standard §13.2.6.1's "appropriate place for inserting a node" algorithm in
  full (substeps 1–7), and §13.2.4.2's warning about elements moved/removed from the tree mid-parse
  (substeps 6–7, not independently browser-verified — see this module's DECISIONS.md for why). **Live
  browser verification**: `new DOMParser().parseFromString(html, 'text/html')` run in an actual browser tab
  against the two exact input strings this module's `test/demo.js` uses, output captured verbatim and
  reproduced in `track1-core/05_seven_substeps/DECISIONS.md`. This is the first module in the course
  verified against real browser output rather than only internal self-consistency.
- **Module 06** — Nolan Waite, whatwg mailing list, July 2013: report that "insert a foreign element" was
  incorrectly documented as unaffected by foster parenting; confirmed and fixed by Ian Hickson ("Hixie").
  **Live browser verification**: three `DOMParser` cases (`<table><math></math></table>`,
  `<table><svg></svg></table>`, and a mixed HTML/foreign/character case), output captured verbatim and
  reproduced in `track1-core/06_what_gets_fostered/DECISIONS.md`.
- **Module 07** — the attached reference course's own containment table (§ "What refuses to be fostered"),
  restated for the five explicitly-handled `in table` cases and the childless-form bug it calls "the
  parser's single most reliable source of 'why is my form empty' bug reports." **Live browser
  verification**: five `DOMParser` cases (`<style>`, hidden-input-with-trailing-content, non-hidden input,
  the childless-form case, and a comment inside a table), output captured verbatim and reproduced in
  `track1-core/07_what_refuses/DECISIONS.md`.
- **Module 08** — WHATWG HTML Standard's "in table text" insertion mode rules (buffer `Character` tokens;
  on the first non-character token, decide once over the whole run), restated from the attached reference
  course's own Module 06 ("'in table text' & the whitespace trap"). **Live browser verification**: three
  `DOMParser` cases (the whitespace-trap case from the attached reference course, a whitespace-only run
  before `<tr>`, and an all-whitespace table body), output captured verbatim and reproduced in
  `track1-core/08_in_table_text/DECISIONS.md`.
- **Bug fix during Module 08's build** — Module 05's `inTableSpecificRules()` had a latent double-insertion
  bug for `<table><tr><td>` (an explicit `<tr>` already open when `<td>` arrives), caught by this module's
  own test cases and fixed retroactively in `track1-core/05_seven_substeps/src/dispatch5.js`, documented as
  an addendum in that module's `DECISIONS.md` (Module 05's original test cases were re-run and confirmed
  byte-identical after the fix).
- **Module 09** — WHATWG HTML Standard §13.2.6.1's "insert a character," step 4 ("if there is a Text node
  immediately before the adjusted insertion location, append data to that Text node"), read literally as a
  mutation, not a value-equality claim. No new live-browser verification — object identity isn't observable
  via `DOMParser` output; see `track1-core/09_text_fusion/DECISIONS.md` for why, and what a real check
  would require (a live, incrementally-parsed document under `MutationObserver`).
- **Module 10** — WHATWG HTML Standard §13.2.10.3's own canonical triple-`<b>` example, reproduced
  verbatim as this module's test input; Henri Sivonen, March 2008, on the adoption agency's final
  relocation step being "just foster parenting as usual" (already cited above; restated in this module's
  `concept_adoption_agency.html`). **Live browser verification**: one `DOMParser` case (the spec's own
  example), output captured verbatim and reproduced in `track1-core/10_formatting_triple_b/DECISIONS.md`.

- **Module 11** — WHATWG HTML Standard §13.2.6.1's foster-parenting substeps 1, 3, 4 (last-template check,
  template-contents redirect, the fragment case), and §13.2.5 (roughly) the HTML fragment parsing
  algorithm, restated from the attached reference course's own Module 09 ("Templates, fragments, detached
  tables") including its "same markup, two routes, opposite results" example. **Live browser verification**:
  six `DOMParser`/`innerHTML` cases (document-parse vs. fragment-parse inversion, a genuine substep-4
  fragment case via real `table.innerHTML`, a template intercepting fostered content, substep 1 firing for
  content nested inside a template, plus two probes — `tbody.innerHTML='<tr>FOO'` and
  `<table><template><tr>FOO</template></table>` — that revealed the `in template`-mode-dispatch nuance this
  module routes around rather than implements), output captured verbatim and reproduced in
  `track1-core/11_templates_fragments/DECISIONS.md`.

- **Module 12** — the attached reference course's own containment atlas (§ "The containment atlas"),
  naming all seven recovery tactics (FOSTER/CLOSE/IGNORE/POP+REPROCESS/REDIRECT/MERGE/ADOPTION AGENCY) plus
  TOKENIZER/VOID; WHATWG HTML Standard's `<html>` MERGE rule (attribute-merge with first-occurrence-wins).
  **Live browser verification**: one case (a second `<html>` tag with a duplicate and a new attribute),
  output captured verbatim and reproduced in `track1-core/12_containment_atlas/DECISIONS.md`.

- **Module 13** — WHATWG HTML Standard §13.2.4.2's four "has an element in scope" variants (default, list
  item, button, table), restated from the attached reference course's own Module 11 ("Scope: why table is
  a wall") including its Noah's Ark clause aside (not built here — see Module 10's DECISIONS.md for the
  related, also-unbuilt active-formatting-list bound). **Live browser verification**: one `DOMParser` case
  (a stray `</div>` inside a `<td>`, silently ignored), output captured verbatim and reproduced in
  `track1-core/13_scope/DECISIONS.md`. This closes Track 1 (Modules 00–13).

- **Module 14** — added after Track 1's original close, by explicit request. WHATWG HTML Standard's
  adoption agency algorithm text (fetched directly via DOM extraction from
  `html.spec.whatwg.org/multipage/parsing.html#adoption-agency-algorithm`, since `WebFetch` truncated the
  page), and its "special" element-category list. Henri Sivonen, March 2008 (already cited above), on the
  algorithm's final relocation step being foster parenting as usual — restated and given a real, working
  caller for the first time in this course's engine. **parse5's real source** (see the dedicated citation
  block above) — the resolving authority for two real mistakes this module's own build made and corrected;
  see `track1-core/14_adoption_agency/DECISIONS.md` for the full narrative. **Live browser verification**:
  three `DOMParser` cases (the textbook `<b>`/`<i>` overlap, a `<div>` misnested inside `<b>`, and a
  `<table>` misnested inside `<b>`), output captured verbatim and independently re-verified with a
  `parentElement`-labeled serializer after two transcription errors in the module's own test expectations
  were caught, reproduced in `track1-core/14_adoption_agency/DECISIONS.md`.

## This course's own primary source

- `foster-parenting-course.html` (user-provided) — the spec-accurate single-file course whose module
  scope (00–13) this course's Track 1 build modules are structured around, and whose design system
  (`templates/course.css`) this entire course reuses. Its own colophon cites §13.2.4 (parse state),
  §13.2.6.1, §13.2.6.4.9–.16, and §13.2.10.3 directly against the spec.

---

*Convention: every new citation is added here in the same commit/session as the module that first relies
on it — no forward-declared or speculative sources beyond the mXSS section above, which names the expected
literature so Track 2 modules know what to verify against before citing it as fact.*
