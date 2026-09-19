# GLOSSARY

Every term, file, and constant introduced by a module or prerequisite, alphabetical. Each entry is tagged
with where it was first defined. **Append-only** — never rewritten from scratch; new entries are inserted
in alphabetical order, existing entries are never deleted (mark superseded ones rather than removing them).

Format: **`term`** — one-sentence definition. *First seen: `<location>`.*

---

**`active formatting elements (list)`** — the parser's second, separate list of formatting elements
(alongside the stack of open elements), used by reconstruction and the adoption agency; diverges from the
stack when table cleanup pops a formatting element off the stack without touching the list. See the
vocabulary web at `track1-core/10_formatting_triple_b/concept_how_they_connect.html`. *First seen: Module
10.*

**`adoption agency algorithm`** — the spec's repair algorithm for misnested formatting-element end tags;
referenced but not built in Module 10 — built and verified in full in Module 14, added to the course after
Track 1's original close specifically to cover this. Its final relocation step can trigger foster parenting
by supplying `commonAncestor` as an override target. See
`track1-core/10_formatting_triple_b/concept_adoption_agency.html` and `track1-core/14_adoption_agency/`.
*First seen: Module 10 (referenced, not implemented); built Module 14.*

**`adoption_agency.js`** — source file (`track1-core/14_adoption_agency/src/adoption_agency.js`) defining
`runAdoptionAgency()` and the local `moveNode()` helper. *First seen: Module 14.*

**`adjusted insertion location`** — the (parent, position) pair that "appropriate place for inserting a
node" computes; every "insert a ___" algorithm splices into whatever this names. *First seen: Prerequisite
P5.*

**`collectFromAssumedTableCells()`** / **`collectAllDescendants()`** — `narrow_inspector.js` functions
(Track 2 T2-01): a walk over an assumed shape (`table > tbody > tr > td`) vs. a full, honest walk of a
subtree, used to demonstrate content that escapes the former while remaining in the latter. *First seen:
Track 2 Module T2-01.*

**`atlas.js`** (Module 04) — source file (`track1-core/04_five_elements/src/atlas.js`) defining
`TABLE_FAMILY_ATLAS` (eleven elements, each with a `fosters`/`reason` pair) and `checkTarget()`. *First
seen: Module 04.*

**`checkTarget()`** — `atlas.js` helper: builds a minimal synthetic parser state with a given tag as the
sole current node, flag enabled, and returns `isFosterParentingTarget(state)`. *First seen: Module 04.*

**`BASE_SCOPE`** / **`LIST_ITEM_SCOPE`** / **`BUTTON_SCOPE`** / **`TABLE_SCOPE`** — `scope.js`'s four
scope-boundary `Set`s, each defining which elements a given scope variant's search stops at. *First seen:
Module 13.*

**`bookmark (active formatting list)`** — an index into the active formatting elements list, tracked
through the adoption agency algorithm's inner loop, marking where the reconstructed formatting-element
clone must be reinserted after the original is removed; adjusted every time an earlier list entry is
spliced out so it keeps pointing at the same logical position. *First seen: Module 14.*

**`character token`** — a token representing a single character of text (not a run — the tokenizer emits
one per character). *First seen: Prerequisite P1.*

**`CONTAINMENT_ATLAS`** — `containment_atlas.js`'s array of fourteen rows mapping elements/situations to
one of the spec's seven recovery tactics (plus TOKENIZER/VOID), each marked with whether this engine has
real, tested code for it. *First seen: Module 12.*

**`containment_atlas.js`** — source file (`track1-core/12_containment_atlas/src/containment_atlas.js`).
*First seen: Module 12.*

**`comment token`** — a token carrying one string of comment data, produced from `<!-- ... -->`. *First
seen: Prerequisite P1.*

**`clearActiveFormattingElementsToLastMarker()`** — `formatting.js` function: pops the active formatting
elements list until (and including) the last marker, exposing whatever formatting entries were shielded
behind it. *First seen: Module 10.*

**`clearStackBackToTableContext()`** — `formatting.js` function: a merged, simplified stand-in for the
spec's three "clear the stack back to a ___ context" operations, popping anything not table-structural.
*First seen: Module 10.*

**`createParserState10()`** — `dispatch10.js` function: Module 01's `createParserState()`, plus an added
`activeFormattingElements: []` field. *First seen: Module 10.*

**`createParserState14()`** — `dispatch14.js` function: identical pattern to `createParserState10()`,
re-added locally rather than reused since Module 14 builds its own full dispatch chain. *First seen: Module
14.*

**`commonAncestor`** — the adoption agency algorithm's name for the element immediately below
`formattingElement` on the stack of open elements; supplied as the override target when relocating the
inner loop's final `lastNode`, which is what lets that relocation trigger foster parenting when
`commonAncestor` happens to be table-family. *First seen: Module 14.*

**`current node`** — the bottommost (most recently pushed, least recently popped) entry on the stack of
open elements. *First seen: Prerequisite P3.*

**`dispatchCaseStudy()`** — `dispatch_case_study.js`'s wrapper (Track 2 T2-05): intercepts `EndTag 'form'`
to remove it from the stack from wherever it sits, delegates everything else to T2-04's `dispatchReparse`.
*First seen: Track 2 Module T2-05.*

**`closeFormByRemovingFromStack()`** — `form_pointer.js` function: removes a `<form>` element from the
stack of open elements from wherever it sits (not necessarily the top) — the one stack operation Track 1
always deferred. *First seen: Track 2 Module T2-05.*

**`dispatch()`** — `dispatch.js`'s core function: looks up `MODES[state.mode]` and calls it with the
current token, or throws `NotImplementedYet` if that mode has no handler yet. *First seen: Module 01.*

**`dispatch5()`** — `dispatch5.js`'s entry point: delegates to Module 01's `dispatch()` for every mode
before `in body`, then takes over with foster-aware, location-computing handling for `in body`/`in table`.
*First seen: Module 05.*

**`dispatch5.js`** — source file (`track1-core/05_seven_substeps/src/dispatch5.js`) defining `dispatch5()`,
`inBodyFosterAware()`, and `inTableSpecificRules()`. *First seen: Module 05.*

**`dispatch7()`** — `dispatch7.js`'s entry point: Module 05's `dispatch5` with one more check layered in
first — `inTableRefusesFostering` — before Module 05's `<td>`/`<th>`/`<tr>` rules and the anything-else
fallback. *First seen: Module 07.*

**`dispatch7.js`** — source file (`track1-core/07_what_refuses/src/dispatch7.js`). *First seen: Module 07.*

**`dispatch8()`** — `dispatch8.js`'s entry point: Module 07's `dispatch7`, with `Character` tokens arriving
in `in table` mode now routed into buffering (`in table text`) instead of the anything-else fallback
per-character. *First seen: Module 08.*

**`dispatch8.js`** — source file (`track1-core/08_in_table_text/src/dispatch8.js`). *First seen: Module 08.*

**`dispatch10()`** — `dispatch10.js`'s entry point: Module 08's dispatch chain, extended with
reconstruction, formatting-element handling, marker management, and a narrow `</table>`-closing rule.
*First seen: Module 10.*

**`dispatch10.js`** — source file (`track1-core/10_formatting_triple_b/src/dispatch10.js`). *First seen:
Module 10.*

**`dispatch11()`** — `dispatch11.js`'s entry point: intercepts `<template>` uniformly up front, then
delegates to a template-aware `in table`/`in body` chain built on `location11.js`. *First seen: Module 11.*

**`dispatch11.js`** — source file (`track1-core/11_templates_fragments/src/dispatch11.js`). *First seen:
Module 11.*

**`dispatch12()`** — `dispatch12.js`'s entry point: Module 11's dispatch chain, extended with the MERGE
tactic for a second `<html>` tag. *First seen: Module 12.*

**`dispatch12.js`** — source file (`track1-core/12_containment_atlas/src/dispatch12.js`). *First seen:
Module 12.*

**`dispatch13()`** — `dispatch13.js`'s entry point: Module 12's dispatch chain, with the generic `EndTag`
branch now scope-checked. *First seen: Module 13.*

**`dispatch13.js`** — source file (`track1-core/13_scope/src/dispatch13.js`). *First seen: Module 13.*

**`dispatch14()`** — `dispatch14.js`'s entry point: Module 13's dispatch chain, rebuilt locally with a
formatting-elements set extended to include `'i'`, and a new `EndTag` branch that routes matching tags to
`runAdoptionAgency()` instead of the generic scope-checked pop. *First seen: Module 14.*

**`dispatch14.js`** — source file (`track1-core/14_adoption_agency/src/dispatch14.js`). *First seen: Module
14.*

**`dispatchReparse()`** — `dispatch_reparse.js`'s wrapper (Track 2 T2-04): intercepts explicit
`<tbody>`/`<thead>`/`<tfoot>` tags (a gap Track 1 never needed to close), delegates everything else to
`dispatch13` unchanged. *First seen: Track 2 Module T2-04.*

**`dispatch.js`** — source file (`track1-core/01_stack_and_dispatch/src/dispatch.js`) defining
`createParserState`, `dispatch`, `currentNode`, `insertHtmlElement`, and the `MODES` table of
insertion-mode handlers. *First seen: Module 01.*

**`dispatchWithFosterParenting()`** — `lifecycle.js`'s foster-parenting-aware entry point: delegates to
Module 01's `dispatch()` for every mode except `in table`, where it instead runs `inTableAnythingElse()`.
*First seen: Module 03.*

**`doctype token`** — a token carrying a name plus public/system identifiers, produced from
`<!DOCTYPE ...>`. *First seen: Prerequisite P1.*

**`DocumentFragmentNode`** — the fifth node kind, added additively in Module 11 (deferred exactly as long
as Module 00's own DECISIONS.md predicted). Represents a `<template>`'s `.content`, a tree disconnected
from the main document. *First seen: Module 11.*

**`end tag token`** — a token carrying a tag name only (attributes on an end tag are discarded by the
tokenizer as a parse error before tree construction sees it). *First seen: Prerequisite P1.*

**`enterInTableText()`** — `tabletext.js` function: clears `state.pendingCharacters`, saves `state.mode` as
`state.originalMode`, and switches to `'in table text'`. *First seen: Module 08.*

**`fragment.js`** — source file (`track1-core/11_templates_fragments/src/fragment.js`) defining
`parseFragment()`, a simplified HTML fragment parsing algorithm. *First seen: Module 11.*

**`foreign.js`** — source file (`track1-core/06_what_gets_fostered/src/foreign.js`) defining
`insertForeignElementAtAppropriatePlace()`, a thin named wrapper around Module 05's
`insertElementAtAppropriatePlace()`. *First seen: Module 06.*

**`FORMATTING_ELEMENTS`** — `formatting.js`'s `Set` of recognized formatting elements; contains only
`'b'` for this course's engine (deliberately narrow — see Module 10's DECISIONS.md). Extended, without
mutation, by Module 14's `FORMATTING_ELEMENTS_14`. *First seen: Module 10.*

**`FORMATTING_ELEMENTS_14`** — `dispatch14.js`'s local `Set`, built as `new Set([...FORMATTING_ELEMENTS,
'i'])` rather than mutating Module 10's shared original — protects every module that already imports
`FORMATTING_ELEMENTS` from a silent behavior change. *First seen: Module 14.*

**`furthest block`** — the adoption agency algorithm's name for the topmost "special category" element
(see `SPECIAL_CATEGORY`) found between `formattingElement` and the top of the stack; its presence or
absence is what decides whether the algorithm takes the cheap "no furthest block" exit or the full
clone-and-relocate path. *First seen: Module 14.*

**`formatting.js`** — source file (`track1-core/10_formatting_triple_b/src/formatting.js`) defining the
active-formatting-elements list operations and `reconstructActiveFormattingElements()`. *First seen: Module
10.*

**`foster parenting`** — the tree-construction algorithm's relocation mechanism: when the foster-parenting
flag is enabled and the current node is a table-family element, an inserted node lands elsewhere in the
tree instead of inside the current node. The whole subject of this course. *First seen: Module 02 (the
gate condition); given a real destination starting Module 05.*

**`foster.js`** — source file (`track1-core/02_two_conditions_one_gate/src/foster.js`) defining
`FOSTER_PARENT_TARGETS` and the pure predicate `isFosterParentingTarget()`. *First seen: Module 02.*

**`FOSTER_PARENT_TARGETS`** — the frozen `Set` of exactly five tag names (`table`, `tbody`, `tfoot`,
`thead`, `tr`) condition 2 of the gate checks the current node against. *First seen: Module 02.*

**`form_pointer.js`** — source file (`track2-mxss/05_case_studies/src/form_pointer.js`) defining
`closeFormByRemovingFromStack()`. *First seen: Track 2 Module T2-05.*

**`fosterParentingEnabled`** — a plain boolean field on parser state, added by Module 02 without modifying
Module 01's `dispatch.js`; has no automatic lifecycle until Module 03. *First seen: Module 02.*

**`inBodyFosterAware()`** — `dispatch5.js`'s replacement for Module 01's `in body` handling: same observed
rules (character insertion, `<table>`, generic start/end tags), but every insertion routes through
`getAdjustedInsertionLocation` instead of a hardcoded location. *First seen: Module 05.*

**`insertCharacterAtAppropriatePlace()`** / **`insertElementAtAppropriatePlace()`** — `location.js`
helpers: compute the adjusted insertion location, then splice a character or element there (fusing text
where applicable). Safe to call whether or not foster parenting is in effect. *First seen: Module 05.*

**`getAdjustedInsertionLocation()`** — `location.js`'s full implementation of "appropriate place for
inserting a node" (Prerequisite P5): the gate check, then either the ordinary case or the foster-parenting
substeps. *First seen: Module 05.*

**`handleInTableText()`** — `tabletext.js` function: buffers `Character` tokens, and on the first
non-character token, makes the all-or-nothing decision (Module 08's "whitespace trap"), flushes the
buffer, restores the mode, and reprocesses the triggering token. *First seen: Module 08.*

**`hasElementInScope()`** / **`hasInScope()`** / **`hasInListItemScope()`** / **`hasInButtonScope()`** /
**`hasInTableScope()`** — `scope.js` functions implementing the four scope variants: walk the stack from
the current node down, target-match wins, a scope-list member wins first otherwise. *First seen: Module
13.*

**`checkIdempotent()`** / **`canonicalize()`** — `idempotency_check.js` functions (Track 2 T2-04): the
parse→serialize→reparse→compare defense pattern, and the structural dump used to compare two trees.
*First seen: Track 2 Module T2-04.*

**`checkChunksIncrementally()`** / **`checkFinalText()`** — `incremental_checker.js` functions (Track 2
T2-03): a naive per-chunk text check vs. the correct final-text check, used to show two individually-clean
text chunks fusing (Track 1 Module 09) into a string a pattern check was built to catch. *First seen: Track
2 Module T2-03.*

**`insertForeignElementAtAppropriatePlace()`** — `foreign.js`'s wrapper: calls
`insertElementAtAppropriatePlace()` unchanged, stating in code that foreign (SVG/MathML) elements route
through the exact same relocation path as HTML elements. *First seen: Module 06.*

**`in table text`** — the insertion mode that buffers `Character` tokens arriving in `in table` mode,
making one all-or-nothing fostering decision over the whole buffered run when a non-character token ends
it. *First seen: Prerequisite P4 (listed); implemented Module 08.*

**`incremental_checker.js`** — source file
(`track2-mxss/03_whitespace_fusion_vectors/src/incremental_checker.js`). *First seen: Track 2 Module
T2-03.*

**`insertHtmlElement()`** — `dispatch.js` helper implementing a Module-01-scoped "insert an HTML element":
creates the element, appends it to the current node (always "after last child" — no adjusted insertion
location yet), and pushes it onto the stack. *First seen: Module 01.*

**`insertNode()`** — `nodes.js`'s centralized splice function; every later "insert a ___" algorithm in
this course's engine bottoms out in a call to this, differing only in the (parent, index) it's given.
*First seen: Module 00.*

**`insertion mode`** — the single global value naming which rule table the tree-construction dispatcher
currently consults for the next token; not per-element, not stacked, not the same as a tokenizer state.
*First seen: Prerequisite P4.*

**`inTableAnythingElse()`** — `lifecycle.js`'s implementation of "in table" mode's fallback clause: enable
the flag, call `MODES['in body']` directly (never touching `state.mode`), disable the flag in a `finally`
block regardless of outcome. *First seen: Module 03.*

**`inTableRefusesFostering()`** — `nonfoster.js`'s function: checks whether a token matches one of
`in table`'s explicitly-handled cases (`<style>`/`<script>`/`<template>`, hidden `<input>`, `<form>`, a
comment, or DOCTYPE) and handles it if so, returning whether fostering must be skipped for that token.
*First seen: Module 07.*

**`inTableSpecificRules()`** — `dispatch5.js`'s minimal implementation of `in table`'s own (non-fostering)
`<td>`/`<th>`/`<tr>` clauses: imply the necessary `<tbody>`/`<tr>` and insert ordinarily, before the
anything-else/foster-parenting fallback is ever reached. *First seen: Module 05.*

**`isFosterParentingTarget()`** — `foster.js`'s pure predicate implementing the two-condition gate: flag
enabled AND current node in `FOSTER_PARENT_TARGETS`. No side effects; doesn't decide where a fostered node
goes. *First seen: Module 02.*

**`lifecycle.js`** — source file (`track1-core/03_the_flag_lifetime/src/lifecycle.js`) defining
`inTableAnythingElse()` and `dispatchWithFosterParenting()`. *First seen: Module 03.*

**`location.js`** — source file (`track1-core/05_seven_substeps/src/location.js`) defining
`getAdjustedInsertionLocation()`, `insertCharacterAtAppropriatePlace()`, and
`insertElementAtAppropriatePlace()`. *First seen: Module 05.*

**`lessons/`** — root directory for cross-module concept clusters (Phase 3): `01_insertion_mode_statechart/`
(spans Modules 01, 03, 05, 08, 10–13) and `02_scope_and_active_formatting/` (spans Modules 02, 04, 10, 13).
See `lessons/README.md`. *First seen: after Module 13.*

**`location11.js`** — source file (`track1-core/11_templates_fragments/src/location11.js`) completing
Module 05's `getAdjustedInsertionLocation` with the template-content substeps. *First seen: Module 11.*

**`location_override.js`** — source file (`track1-core/14_adoption_agency/src/location_override.js`)
defining `getAdjustedInsertionLocationFor()` / `insertNodeAtAppropriatePlaceFor()` — "appropriate place for
inserting a node" given an explicit override target, the first real caller of that parameter in this
course's engine. Went through two versions during this module's build; see DECISIONS.md. *First seen:
Module 14.*

**`MARKER`** — `formatting.js`'s unique sentinel (a `Symbol`) pushed onto the active formatting elements
list on entering `<td>`/`<th>`, shielding earlier entries from reconstruction until cleared. *First seen:
Module 10.*

**`merge.js`** — source file (`track1-core/12_containment_atlas/src/merge.js`) defining
`mergeHtmlAttributes()`. *First seen: Module 12.*

**`mergeHtmlAttributes()`** — `merge.js` function implementing the MERGE tactic: a second `<html>` start
tag's attributes are added to the existing root only if not already present (first-occurrence-wins).
*First seen: Module 12.*

**`mXSS (mutation XSS)`** — a class of vulnerability where a check performed against one representation of
HTML (source string, or an assumed tree shape) misses content a real, correctly-specified parser places
somewhere else after reparsing — including, but not limited to, via foster parenting. This course's whole
Track 2 subject. *First seen: Track 2 Module T2-01.*

**`MODES`** — the internal table of insertion-mode handlers in `dispatch.js`, keyed by mode name; exported
starting Module 03 (additively — see that module's DECISIONS.md) so other modules can invoke one specific
mode's rules directly, distinct from switching `state.mode` to it. *First seen: Module 01 (internal);
exported Module 03.*

**`moveNode()`** — a local helper in `adoption_agency.js` (and duplicated in `location_override.js`'s
`insertNodeAtAppropriatePlaceFor`): detaches a node from its existing parent's children array, if any,
before calling `insertNode()`. Fixes a real gap in Module 00's `insertNode` — which never needed to move an
already-parented node before this module — discovered as an exponential-duplication bug during this
module's build. *First seen: Module 14.*

**`narrow_inspector.js`** — source file (`track2-mxss/01_what_mxss_is/src/narrow_inspector.js`) defining
`collectFromAssumedTableCells()` and `collectAllDescendants()`. *First seen: Track 2 Module T2-01.*

**`nodes.js`** — source file (`track1-core/00_tokens_and_nodes/src/nodes.js`) defining the engine's four
node classes (`DocumentNode`, `ElementNode`, `TextNode`, `CommentNode`) and the shared `insertNode`/
`tryFuseCharacter`/`renderTree` helpers. *First seen: Module 00.*

**`nonfoster.js`** — source file (`track1-core/07_what_refuses/src/nonfoster.js`) defining
`inTableRefusesFostering()`. *First seen: Module 07.*

**`NotImplementedYet`** — the typed error `dispatch()` throws when the current insertion mode has no
handler for the current token; names both the mode and the token in its message. *First seen: Module 01.*

**`override target`** — an optional parameter to "appropriate place for inserting a node" that replaces
the current node as `target` in step 1; named as an example use case since Prerequisite P5, given a real,
working, tested caller (`commonAncestor`) in Module 14. *First seen: Prerequisite P5; real caller built
Module 14.*

**`parse.js`** — source file (`track1-core/01_stack_and_dispatch/src/parse.js`) exposing the ordinary
"just run it" entry point: `tokenize()` the input, then `dispatch()` every token in order. *First seen:
Module 01.*

**`parseFragment()`** — `fragment.js` function implementing HTML fragment parsing (verified only for
`contextTagName === 'table'`): seeds a fresh root, sets mode from context, and returns the root's children
— what a real `element.innerHTML = ...` assignment installs. *First seen: Module 11.*

**`process the token using the rules for X insertion mode`** — a distinct spec technique from switching
`state.mode` to X: invoke X's rule table for one token; `state.mode` only changes if X's own rule for that
token explicitly says so. Conflating this with an actual mode switch is the central pitfall Module 03 is
built to avoid. *First seen: Module 03.*

**`pushActiveFormattingElement()`** / **`pushMarker()`** — `formatting.js` functions: append an element, or
the `MARKER` sentinel, to the active formatting elements list. *First seen: Module 10.*

**`reconstructActiveFormattingElements()`** — `formatting.js`'s implementation of "reconstruct the active
formatting elements": no-ops if the list's last entry is a marker or already on the stack; otherwise
recreates entries via the same foster-aware insertion every module since 05 uses. See
`track1-core/10_formatting_triple_b/concept_reconstruction.html`. *First seen: Module 10.*

**`reparenting (DOM API sense)`** — an unrelated runtime concept: moving an already-parsed DOM node with
ordinary methods (`appendChild`, `moveBefore`). Shares no mechanism with foster parenting, reconstruction,
or the adoption agency — included in the vocabulary web specifically because the name collides. See
`track1-core/10_formatting_triple_b/concept_reparenting_dom_api.html`. *First seen: Module 10 (named
explicitly to distinguish it from tree-construction concepts).*

**`reprocess the token`** — switch insertion mode, then run the *same* token again through the new mode's
rules without consuming a new one from the tokenizer. *First seen: Prerequisite P4.*

**`runAdoptionAgency()`** — `adoption_agency.js`'s implementation of the adoption agency algorithm: an
outer loop (capped at 8 iterations) that finds `formattingElement` and `furthestBlock`, then either exits
cheaply (no furthest block found) or runs an inner cloning loop that clones each intervening node, relocates
the result to `commonAncestor` via an override target, and duplicates `formattingElement` around
`furthestBlock`'s former children. *First seen: Module 14.*

**`renderTree()`** — `nodes.js` helper that renders a node subtree as the same `└─`/`├─`/`│` ASCII-art
format used in every tutorial's `.tree` diagrams, so code output can be eyeballed against tutorial prose.
*First seen: Module 00.*

**`scanWithNaiveHeuristic()`** / **`isTrustedBySourcePosition()`** — `source_position_sanitizer.js`
functions (Track 2 T2-02): a naive sanitizer heuristic trusting tags by their SOURCE STRING position
relative to `<table>`/`</table>`, shown to be attacker-controllably wrong. *First seen: Track 2 Module
T2-02.*

**`scope.js`** — source file (`track1-core/13_scope/src/scope.js`) defining the four scope-boundary `Set`s
and the scope-check functions. *First seen: Module 13.*

**`SPECIAL_CATEGORY`** — `special_category.js`'s `Set` reproducing the spec's full "special" element-
category list (address, applet, div, table, td, and dozens more); kept complete rather than narrowed to
this module's own test cases, a deliberate exception to this course's usual scope-trimming habit — see
Module 14's DECISIONS.md. *First seen: Module 14.*

**`special_category.js`** — source file (`track1-core/14_adoption_agency/src/special_category.js`).
*First seen: Module 14.*

**`source_position_sanitizer.js`** — source file
(`track2-mxss/02_naive_sanitizer_break/src/source_position_sanitizer.js`). *First seen: Track 2 Module
T2-02.*

**`serializeToHTML()`** — `serializer.js` function (Track 2 T2-04): the one direction Track 1 never needed
— turns this engine's tree back into an HTML string. Deliberately minimal, not a general "innerHTML"
reimplementation. *First seen: Track 2 Module T2-04.*

**`serializer.js`** — source file (`track2-mxss/04_idempotent_serialization/src/serializer.js`). *First
seen: Track 2 Module T2-04.*

**`dispatch_reparse.js`** — source file (`track2-mxss/04_idempotent_serialization/src/dispatch_reparse.js`)
defining `dispatchReparse()`. *First seen: Track 2 Module T2-04.*

**`stack of open elements`** — the shared, mutable list of elements the parser has opened and not yet
closed; grows by push on a start tag, shrinks by pop on a matching end tag. *First seen: Prerequisite P3.*

**`start tag token`** — a token carrying a tag name, an attribute map, and a self-closing flag, produced
from e.g. `<table>`. *First seen: Prerequisite P1.*

**`TABLE_FAMILY_ATLAS`** — `atlas.js`'s array of eleven `{ tag, fosters, reason }` rows covering all
five foster-parenting elements, three flow-content near-misses, two structurally-excluded near-misses, and
one unrelated control (`div`). *First seen: Module 04.*

**`tabletext.js`** — source file (`track1-core/08_in_table_text/src/tabletext.js`) defining
`enterInTableText()` and `handleInTableText()`. *First seen: Module 08.*

**`target`** — the element "appropriate place for inserting a node" evaluates against; the current node
unless an override target was supplied. *First seen: Prerequisite P5.*

**`token`** — the tokenizer's atomic output unit; always one of six shapes (DOCTYPE, start tag, end tag,
comment, character, EOF). *First seen: Prerequisite P1.*

**`text-node fusion (object identity)`** — the stronger, spec-literal claim that fostered text merges into
an *existing* `TextNode` object (mutated in place) rather than a new, equal-looking one — distinct from,
and unobservable via, a tree-shape comparison alone. *First seen: Module 09 (no new source; see that
module's DECISIONS.md).*

**`tokenizer.js`** — source file (`track1-core/01_stack_and_dispatch/src/tokenizer.js`) implementing a
minimal, regex/index-scanning `tokenize(input)` — not the spec's full ~80-state tokenizer — sufficient for
this course's well-formed test-case subset. *First seen: Module 01.*

**`tokens.js`** — source file (`track1-core/00_tokens_and_nodes/src/tokens.js`) defining the engine's six
token factory functions (`doctypeToken`, `startTagToken`, `endTagToken`, `commentToken`, `characterToken`,
`eofToken`) plus the `characterTokens()` convenience helper and `tokenToString()`. *First seen: Module 00.*

**`tryFuseCharacter()`** — `nodes.js` helper implementing the spec's "insert a character" step 4: appends
to the `TextNode` immediately before an insertion point instead of creating a new node, if one exists.
*First seen: Module 00.*
