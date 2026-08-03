# Track 2, Module T2-02 — DECISIONS

Line-by-line rationale for `src/source_position_sanitizer.js`. Categories as before: **(a)** forced by
spec, **(b)** forced by external contract, **(c)** our own convention. Defensive/educational, same firm
line as T2-01: no real payload, no execution, structural proof only.

---

**The naive heuristic checks SOURCE STRING position (`indexOf`) rather than parsing the DOM at all.**
**(c) our own convention**, and the deliberate point of departure from T2-01. T2-01's naive inspector at
least parsed a real tree and walked an assumed SHAPE of it; this module's heuristic doesn't parse anything
— it reasons directly about the string, which is a real, historically common category of naive sanitizer
(pre-dating widespread DOM-based sanitization, and still found in ad hoc string-templating code). Building
both variants across T2-01/T2-02 covers the two most common shapes this mistake takes in practice.

**Case B (`<input type=hidden>`) is included specifically to show the heuristic is SOMETIMES right, not
built as a second, independent bug.**
**(c) our own convention**, and the central point of this module. A demonstration that only ever shows the
heuristic failing could be read as "this heuristic is always wrong, so a smarter version of the same idea
might work." Case B forecloses that reading directly: the exact same reasoning, applied to a different tag,
is accidentally CORRECT — proving the heuristic has no principled basis at all, right or wrong depending
entirely on which of Track 1 Module 07's specific, narrow "refuses to foster" cases the attacker's chosen
tag happens to land in.

**Both cases reuse facts already verified in Track 1 (Module 06's generic-element fostering, Module 07's
hidden-input containment) rather than re-verifying against a live browser in this module.**
**(c) our own convention.** Re-running the same live-browser check Module 06/07 already performed for the
same tree shapes would be redundant — this module's new claim is specifically about the SANITIZER's
behavior (does the heuristic trust the tag?), not about the tree shape itself, which Track 1 already
established as ground truth. `REFERENCES.md` and this file both point back to exactly where each reused
fact was originally verified.

**`scanWithNaiveHeuristic` uses a simple regex to find tags, not this course's own Track 1 tokenizer.**
**(c) our own convention.** The naive sanitizer being demonstrated is naive PRECISELY because it doesn't use
a real tokenizer — using Track 1's tokenizer here would misrepresent what the vulnerable code actually does.
The regex is deliberately simple (and not claimed to be a general-purpose HTML tag matcher) because its
imprecision is part of the point, not a limitation to route around.

---

## Decisions We Made

| Decision | Category | Why |
|---|---|---|
| Source-string heuristic, no DOM parsing at all | (c) convention | Covers the other common naive-sanitizer shape, distinct from T2-01's narrow DOM walk |
| Case B included to show the heuristic sometimes succeeds | (c) convention | Proves "no principled basis," not just "found one bug" |
| Reuses Module 06/07's already-verified tree shapes | (c) convention | Avoids redundant re-verification; this module's new claim is about the sanitizer, not the tree |
| Simple regex tag-scanner, not Track 1's real tokenizer | (c) convention | Accurately represents what a naive sanitizer's code actually does |

## What We Proved

Running `node test/demo.js` (real output, captured verbatim):

```
── Case A: a plain <img> — the naive heuristic trusts it, reality disagrees ──
Naive heuristic scan: img → trusted=true
Actual final tree (this course's own verified Track 1 engine):
body
  img [src=x,data-dangerous=focus-steal]
  table
>>> The naive heuristic said "trusted, contained in the table." ... The heuristic was WRONG.

── Case B: an <input type=hidden> — the SAME heuristic, and this time it happens to be right ──
Naive heuristic scan: input → trusted=true
Actual final tree:
body
  table
    input [type=hidden,data-dangerous=hidden-but-inert]
>>> This time the heuristic happened to be right — but only because <input type=hidden> is one
    of the specific, narrow cases "in table" handles explicitly (Module 07)...

OK — all assertions passed. Track 2 Module T2-02: naive sanitizer break, verified.
```

This proves a naive, source-position-based sanitization heuristic — "textually between `<table>` and
`</table>` means structurally contained" — produces an attacker-controllable outcome: correct for one
input shape, silently wrong for another, using nothing but ordinary, already-verified Track 1 fostering
behavior (Modules 06 and 07). No new parser mechanism was needed to defeat it; the heuristic was broken by
its very first design assumption, not by a sophisticated exploit technique.
