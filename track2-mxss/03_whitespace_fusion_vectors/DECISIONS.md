# Track 2, Module T2-03 — DECISIONS

Line-by-line rationale for `src/incremental_checker.js`. Categories as before: **(a)** forced by spec,
**(b)** forced by external contract, **(c)** our own convention. Defensive/educational, same firm line as
T2-01/T2-02: no real payload execution — the pattern used (`/^javascript:/i`) is checked as an inert string
comparison against text content, never used to navigate or evaluate anything.

---

**The demonstration uses a `javascript:`-prefix pattern specifically, rather than a `<script>` tag or an
event-handler attribute (as T2-01/T2-02 used).**
**(c) our own convention.** This is a deliberately different vector from the previous two modules — a
pattern-match against fused TEXT content, not against an element's tag name or attributes — to show the
same class of gap (a check performed against one representation misses content in the reparsed result)
recurs across genuinely different kinds of sanitizer logic. `javascript:`-URI filtering is also a
real-world-recognizable pattern (commonly checked when sanitizing `href`/`src` values), which is why it
was chosen over an arbitrary placeholder string.

**`checkChunksIncrementally` takes the two chunks as already-separated strings (`'java'`,
`'script:alert(1)'`) rather than deriving them from a live, character-by-character trace of Module 08's
buffering.**
**(c) our own convention.** The two chunks correspond exactly to the two real insertion events Track 1's
engine performs — an ordinary insertion before the table exists, and a buffered-then-fostered insertion
after — but this module's `src/` code demonstrates the CHECKING logic, not a re-implementation of Module 08's
buffering (which is reused unchanged, via `dispatch13`, for the actual parse). Keeping the chunk boundaries
explicit in the demo (rather than extracting them from the engine's internal buffer state) keeps this
module's own new code focused on the sanitizer-shaped question it's built to answer.

**The tree-shape claim (`"java"` + `"script:alert(1)"` → one `"javascript:alert(1)"` TextNode) is verified
against real browser output, even though it's the same underlying mechanism as Track 1 Module 05's already-
verified `"abc"` + `"def"` → `"abcdef"` case.**
**(c) our own convention**, chosen for rigor over efficiency. The STRINGS are different and security-
relevant here in a way Module 05's arbitrary `"abcdef"` wasn't — re-verifying with the actual attack-shaped
input, rather than assuming the mechanism generalizes, follows this course's standing rule against
asserting behavior it hasn't specifically checked.

---

## Decisions We Made

| Decision | Category | Why |
|---|---|---|
| `javascript:`-prefix pattern, not a tag/attribute check | (c) convention | Shows the gap recurs across a genuinely different kind of sanitizer logic |
| Chunks given explicitly, not extracted from engine internals | (c) convention | Keeps this module's new code focused on the checking logic, not re-deriving Module 08 |
| Re-verified against a live browser despite reusing Module 05's mechanism | (c) convention | The specific attack-shaped strings weren't previously checked; assumption avoided |

## What We Proved

Running `node test/demo.js` (real output, captured verbatim):

```
── The two pieces, as a naive "check each chunk as it arrives" sanitizer would see them ──
  chunk "java" → flagged: false
  chunk "script:alert(1)" → flagged: false

Neither chunk matches on its own. A per-chunk checker would wave both through.

── What Track 1's own engine actually builds, parsing the real markup ──
div
  #text "javascript:alert(1)"
  table

Final, actual TextNode data: "javascript:alert(1)"
Checked against the SAME pattern: flagged = true

OK — all assertions passed. Track 2 Module T2-03: whitespace & fusion vectors, verified.
```

This proves a sanitizer that validates text content incrementally, as it arrives (rather than re-checking
the final, fused result), can be handed two individually-clean chunks that combine — via nothing but
Track 1's own already-verified buffering (Module 08) and fusion (Module 09) mechanisms — into exactly the
string a downstream check was built to catch. No new engine behavior was needed to produce this outcome; it
falls directly out of composing two mechanisms Track 1 built for entirely non-adversarial reasons (Module 08:
correctly handling a whitespace-heavy buffered run; Module 09: not creating spurious duplicate text nodes).
