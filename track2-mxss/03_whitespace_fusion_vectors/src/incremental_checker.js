'use strict';

// A naive "incremental" sanitizer check — DEFENSIVE/EDUCATIONAL: validates each
// piece of text AS IT ARRIVES (as a real streaming sanitizer, or one that hooks
// individual insertions, might), and never re-checks the FUSED final result. This
// exists to demonstrate why that's unsafe, using Track 1 Modules 08-09's own
// already-verified buffering and fusion mechanisms — no payload is executed; only a
// harmless string comparison against a URI-scheme-shaped pattern is performed.
function checkChunksIncrementally(chunks, dangerousPattern) {
  return chunks.map((chunk) => ({ chunk, flagged: dangerousPattern.test(chunk) }));
}

// The check a sanitizer SHOULD run instead: against the real, final text content —
// after whatever fusion (Module 09) actually happened, not before it.
function checkFinalText(finalText, dangerousPattern) {
  return { text: finalText, flagged: dangerousPattern.test(finalText) };
}

module.exports = { checkChunksIncrementally, checkFinalText };
