# Track 2, Module T2-04 — DECISIONS

Line-by-line rationale for `src/serializer.js`, `src/idempotency_check.js`, and `src/dispatch_reparse.js`.
Categories as before: **(a)** forced by spec, **(b)** forced by external contract, **(c)** our own
convention.

---

## A bug this module's own round-trip caught

Running `checkIdempotent` against a tree built by REAL, correct Track 1 parsing (Case B: `<div><table>
<tr><td>x</td></tr></table></div>`) initially failed — the check reported the tree unstable, which would
have been a false alarm undermining the whole defense. The cause: `serializeToHTML` (this module, new)
faithfully serializes an implied `<tbody>` node as an *explicit* `<tbody>` tag in the output string — and
no Track 1 test case, across fourteen modules, had ever fed dispatch13 a literal `<tbody>` start tag from
source text. Every `<tbody>` any Track 1 test ever produced was IMPLIED (inserted automatically by
`inTableSpecificRules` ahead of a `<td>`/`<tr>`), never tokenized directly. Track 1's dispatch chain
therefore has no rule at all for an explicit `<tbody>`/`<thead>`/`<tfoot>` start tag — it falls through to
the anything-else/foster-parenting fallback and gets wrongly fostered, exactly like an unrecognized tag
would. Fixed by `dispatch_reparse.js`, additively, intercepting exactly those three tag names before
delegating everything else to Track 1's `dispatch13` unchanged.

## `src/serializer.js`

**A minimal serializer, not a general "innerHTML" reimplementation — no attribute-value quoting edge
cases, no void-element self-closing syntax, beyond what this module's own test cases exercise.**
**(c) our own convention**, consistent with this course's engine throughout: Track 1's tokenizer (Module 01)
was similarly scoped to exactly what its test cases needed, not general HTML robustness. `REFERENCES.md` and
this file both flag it as a real, narrow scope rather than a hidden one.

## `src/idempotency_check.js`

**Comparison is done via a canonical STRUCTURAL dump (`canonicalize`), not a comparison of the two HTML
strings.**
**(a) forced by spec, in effect.** Two cosmetically different HTML strings can describe the identical tree
(different attribute quoting, whitespace); comparing strings would produce false positives unrelated to
the actual question ("is this the same tree"). Structural comparison is what the defense is actually
supposed to answer.

**`reparseFn` is a caller-supplied callback, not a hardcoded call into Track 1's engine.**
**(c) our own convention**, for testability and honesty about scope: this module's own demo passes
`reparseToDiv` (built on `dispatchReparse`, this module's bugfix), but nothing in `idempotency_check.js`
itself hardcodes which parser or which "rooted at" level is being compared — that responsibility is
explicitly the caller's, stated in the function's own comment rather than assumed silently.

## `src/dispatch_reparse.js`

**Explicit `<tbody>`/`<thead>`/`<tfoot>` handling is added here, in Track 2, as a thin wrapper — not
retroactively patched into Track 1's `dispatch13.js`.**
**(c) our own convention**, the same additive-extension pattern every Track 1 module since 07 used when
building on a previous module's dispatch chain (Module 07 on 05, Module 08 on 07, and so on through 13).
Track 1 is complete and fully documented; a wrapper that intercepts exactly the three tag names needed and
delegates everything else unchanged keeps that documentation accurate while still fixing a real,
newly-discovered gap.

---

## Decisions We Made

| Decision | Category | Why |
|---|---|---|
| Minimal serializer, explicitly scoped | (c) convention | Matches Track 1's own scoping discipline; documented, not hidden |
| Structural comparison, not string comparison | (a) spec (in effect) | Avoids false positives from cosmetically different but equal HTML |
| `reparseFn` supplied by the caller | (c) convention | Keeps the check itself parser-agnostic and honest about scope |
| Explicit tbody/thead/tfoot fix lives in a Track 2 wrapper | (c) convention | Same additive-extension pattern used throughout Track 1; avoids retroactively touching verified modules |

## What We Proved

Running `node test/demo.js` (real output, captured verbatim):

```
── Case A: a sanitizer "unwrap" step done via direct DOM mutation (Module 11's exact warning) ──
Tree built directly via DOM-mutation-style insertion (what the sanitizer THINKS is safe):
div
  table
    #text "x"

Reparsed (what a REAL later innerHTML assignment would actually build):
div
  #text "x"
  table

Stable (idempotent)? false
>>> CAUGHT...

── Case B: a tree built by REAL parsing (no shortcuts) ──
Stable (idempotent)? true
>>> No false alarm...

OK — all assertions passed. Track 2 Module T2-04: idempotent serialization defense, verified.
```

Case A's mismatch was independently verified against a real browser (`table.appendChild(textNode)`, then
`.outerHTML`, then a fresh `innerHTML` assignment elsewhere) before this module's own test was written —
reproduced in this same file's bug narrative above. This proves the idempotent-serialization pattern (parse
→ serialize → reparse → compare structurally) correctly flags a tree that was assembled via direct DOM
mutation bypassing tree-construction rules — exactly the case every naive checker in T2-01 through T2-03
missed — while correctly passing a tree that was always built by legitimate parsing, with no false alarm.
This is the actual defense pattern DOMPurify-style sanitizers use in production, built here from first
principles on top of nothing but this course's own Track 1 engine.
