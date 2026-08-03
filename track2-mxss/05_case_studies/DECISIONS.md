# Track 2, Module T2-05 — DECISIONS

Line-by-line rationale for `src/form_pointer.js` and `src/dispatch_case_study.js`. Categories as before:
**(a)** forced by spec, **(b)** forced by external contract, **(c)** our own convention. This is the final
module of the whole course.

---

## Sources — verified before writing anything about them

Per this course's standing rule (never assert a behavior claim without checking it), the three case studies
below were looked up directly rather than recalled from memory, using web search and a live fetch of the
primary source, in this same session:

1. **"Round Trip mXSS"** and **"Parsing Differential mXSS"** — both documented at the SonarSource mXSS
   Cheatsheet, https://sonarsource.github.io/mxss-cheatsheet/explained/ (fetched directly; content
   confirmed present under those exact section names).
2. **The MathML/comment-parsing DOMPurify bypass** — Gareth Heyes, PortSwigger Research, "Bypassing
   DOMPurify again with mutation XSS," published October 7, 2020,
   https://portswigger.net/research/bypassing-dompurify-again-with-mutation-xss (fetched directly; author,
   date, and mechanism confirmed from the page itself, not inferred).

## Case Study 1 — "Round Trip mXSS" (fully reproduced)

**Source example:** `<form id="outer"><div></form><form id="inner"><input></div></form>`-shaped markup —
a form nested inside another form, which the HTML content model forbids but tree construction still builds
a specific, deterministic tree from. Verified independently against a live browser (`DOMParser`) before any
engine code was written — see "What We Proved" below for the captured output.

**`closeFormByRemovingFromStack` splices the matching `<form>` out of the stack from wherever it sits,
rather than popping every element above it (the behavior every prior module's generic `EndTag` handling
implements).**
**(a) forced by spec.** This is a genuinely different operation from anything Track 1 or Track 2 built
before it — every earlier "close an element" case in this course assumed the target was the current node,
or fell through to `NotImplementedYet` otherwise (Module 13's own documented limit). Reproducing this real
case study required building the one case Track 1 always deferred: removing a non-current-node element
directly from the stack.

**This fix is scoped narrowly to `</form>` specifically, not generalized into "generate implied end tags"
(the real spec algorithm this is one special case of).**
**(c) our own convention**, consistent with every narrow, targeted fix Track 2 has added on top of Track 1
(T2-04's explicit-`<tbody>` fix is the most recent precedent). Building the general algorithm would be
substantially more code for a claim this module doesn't need to make.

## The honest limitation this module's own test surfaced

Running this real, verified tree through T2-04's `checkIdempotent` reports it as **stable** — but the real
browser's actual round-trip (independently verified; see "What We Proved") is **unstable**: the second
parse silently drops the entire `form#inner` element, changing which form the `<input>` is associated
with. This engine's round-trip doesn't reproduce that mismatch, because Track 1/Track 2 never built
general (non-table) form-element-pointer tracking for plain `in body` content — only the table-context
version (Track 1 Module 07's `inTableRefusesFostering`) exists. The real spec's rule ("a second `<form>`
start tag is ignored while the form element pointer is set, regardless of table context") is broader than
what any Track 1 or Track 2 module built.

**This is reported directly, not smoothed over, because it demonstrates something important about the
whole idea of an idempotent-serialization defense (T2-04): the defense is only as trustworthy as the
parser used to run its reparse step.** A production implementation of this defense using a parser that
doesn't match real browser behavior exactly has exactly this kind of blind spot — silently reporting
"stable" on content a real browser would actually mutate. This isn't a flaw unique to this course's toy
engine; it's a property of the *defense pattern itself*, worth understanding before relying on it.

---

## Decisions We Made

| Decision | Category | Why |
|---|---|---|
| Sources verified live (web search + fetch), not recalled from memory | (c) convention | This course's standing rule against unverified claims, applied to its own final module |
| `closeFormByRemovingFromStack` splices from anywhere in the stack | (a) spec | The one case Track 1 always deferred; needed to reproduce this real case study |
| Scoped narrowly to `</form>`, not generalized to "implied end tags" | (c) convention | Matches every prior narrow, targeted Track 2 fix; no test needs the general algorithm |
| The idempotency-check mismatch is reported honestly, not hidden | (c) convention | Demonstrates a real, important property of the defense pattern itself, not just this engine's limits |

## What We Proved

Live browser verification, captured before any engine code was written:

```
Input:  <form id="outer"><div></form><form id="inner"><input></body>
First parse:  body > form#outer > div > form#inner > input
Serialized:   <form id="outer"><div><form id="inner"><input></form></div></form>
Second parse: div > form#outer > div > input        (form#inner is GONE)
```

This engine's own `node test/demo.js` (real output, captured verbatim):

```
── Case Study 1: "Round Trip mXSS" ──
This engine's reproduction:
body
  form#outer
    div
      form#inner
        input

Matches real browser output exactly...

── Checking this real tree against T2-04's idempotent-serialization defense ──
Before: form > div > form > input
After:  form > div > form > input
Stable (idempotent)? true

[explicit gap statement — see above]

OK — Case Study 1 (first-parse tree shape) verified against real browser output.
```

**Case Study 2 — the MathML/comment-parsing DOMPurify bypass (cited, not reproduced).** Gareth Heyes'
October 2020 bypass (PoC: `<math><mtext><table><mglyph><style><!--</style><img
title="--><img src=1 onerror=alert(1)>">`) works by switching the parser into MathML foreign-content mode,
then exploiting how an unclosed HTML comment interacts with `<style>`'s RAWTEXT tokenizing and an
attribute value. Reproducing it would require foreign-content namespace tracking and RAWTEXT tokenizer
states — both explicitly out of scope since Track 1 Module 01 and Module 06.

**Case Study 3 — "Parsing Differential mXSS" (cited, not reproduced).** SonarSource's documented example
(`<noscript><style></noscript><img src=x onerror="alert(1)">`) exploits the fact that `<noscript>`'s
tokenizer behavior depends on the scripting flag (Prerequisite discussion, Module 01's DECISIONS.md names
the scripting flag as one this engine never models). A sanitizer running with scripting disabled parses
`<noscript>` content as RAWTEXT (inert), while a browser with scripting enabled parses the same markup as
ordinary nested elements — reproducing this needs a scripting-flag-aware tokenizer this course never built.

Three real, independently-verified sources; one fully reproduced with real, tested code; two accurately
cited and clearly scoped out, for named reasons, rather than either faked or silently omitted. This closes
the course.
