# Track 2, Module T2-01 — DECISIONS

Line-by-line rationale for `src/narrow_inspector.js`. Categories as before: **(a)** forced by spec, **(b)**
forced by external contract, **(c)** our own convention. This is the first Track 2 module — defensive,
educational: it demonstrates a structural gap, not an exploit.

---

**The demo uses an inert `data-dangerous="yes"` marker attribute instead of a real dangerous attribute
(e.g. `onerror`, `onload`) or an executable payload.**
**(c) our own convention, and a firm line for the whole of Track 2.** The claim this module makes is
entirely structural — "does a node end up somewhere a narrow inspector fails to reach?" — and that claim is
fully provable without constructing anything that would execute in a browser. Track 2 verifies tree shape,
the same way Track 1 did from Module 05 onward; it does not construct or run payloads, because the
structural claim is the whole point and needs nothing more to be true or false.

**`collectFromAssumedTableCells` hardcodes exactly one assumed shape (`table > tbody > tr > td`) rather than
being configurable for arbitrary "expected" structures.**
**(c) our own convention.** This module's job is to demonstrate the CLASS of bug with one concrete,
verified example — not to build a general-purpose "assumed-shape checker" framework. A configurable version
would be exactly the kind of premature abstraction this course's engineering conventions warn against;
Track 2's later modules can extend this narrowly if a specific later test needs a different assumed shape.

**The demo reuses Track 1's `dispatch13` (the final, most complete engine) unchanged, rather than building
new parsing logic for Track 2.**
**(a) forced by spec, in spirit — (c) convention in practice.** The entire point of Track 2 opening this way
is that the SAME tree-construction behavior Track 1 spent thirteen modules building and verifying is
exactly what creates the gap a naive inspector misses. Reusing the engine unchanged is what makes that
argument honest — a new, Track-2-specific parser could not make the same claim about "ordinary, correctly
specified tree construction."

**Both a narrow walk and a full walk are implemented and compared directly, rather than asserting only
that the narrow walk misses the node.**
**(c) our own convention**, for the same reason Module 09 insisted on capturing `originalTextNode` before
asserting identity: showing what the FULL walk finds is what proves the narrow walk's miss is a real gap
and not, say, a bug in this demo's own traversal code. The `<img>` genuinely being present (found by the
full walk) and genuinely unreachable by the narrow one (found by neither) are two separate, both-verified
claims.

---

## Decisions We Made

| Decision | Category | Why |
|---|---|---|
| Inert marker attribute, no real payload or execution | (c) convention, firm line | The structural claim needs nothing more; sets the pattern for all of Track 2 |
| One hardcoded assumed shape, not a general framework | (c) convention | Demonstrates the class of bug with one verified example; no premature abstraction |
| Reuses Track 1's `dispatch13` unchanged | (c) convention | Makes "ordinary tree construction creates this gap" an honest claim |
| Both narrow and full walks implemented and compared | (c) convention | Proves the miss is real, not an artifact of the demo's own traversal |

## What We Proved

Running `node test/demo.js` (real output, captured verbatim):

```
── Actual final tree, this course's own Track 1 engine ──
div [id=sandbox]
  img [src=x,data-dangerous=yes]
  table

── What a "narrow inspector" (table > tbody > tr > td only) sees ──
Elements found by the narrow inspector: (none)

── What a full walk of the actual sandbox subtree sees ──
Elements found by the full walk: [ 'img', 'table' ]

OK — all assertions passed. Track 2 Module T2-01: what mXSS actually is, verified.
```

The engine's output was verified against real browser `DOMParser` output before this module's own test was
written (see the live-browser session referenced in root `REFERENCES.md`). This proves the central claim of
Track 2's opening module: a piece of user content placed exactly where a template author intended (inside a
`<table>`) can end up, after ordinary and correctly-specified tree construction, somewhere a narrow,
shape-assuming inspector never looks — fully attributed, fully present in the final tree, and completely
invisible to that inspector. No exploit was built. The gap is the point.
