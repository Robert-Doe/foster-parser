'use strict';

// A "narrow inspector" — a stand-in for a common, real class of sanitizer bug: code
// that assumes attacker content dropped into a known template position (here, "as
// the contents of a <table> cell") stays reachable by walking only the structure
// that position implies (table > tbody > tr > td). This is DEFENSIVE/EDUCATIONAL
// code: it demonstrates why that assumption is unsafe, using this course's own
// already-verified Track 1 engine — it does not construct or execute any payload.
//
// Real sanitizers that walk the DOM (rather than regex-scanning source strings) are
// NOT automatically safe from this — they're only safe if they walk the ACTUAL
// resulting tree, not an assumed shape. This function deliberately walks the assumed
// shape, to make that gap concrete and measurable.
function collectFromAssumedTableCells(tableElement) {
  const found = [];
  for (const tbody of tableElement.children) {
    if (tbody.tagName !== 'tbody') continue;
    for (const tr of tbody.children) {
      if (tr.tagName !== 'tr') continue;
      for (const td of tr.children) {
        if (td.tagName !== 'td') continue;
        found.push(...td.children);
      }
    }
  }
  return found;
}

// A full, honest walk of everything under `root` — what the narrow inspector above
// is implicitly assumed to be equivalent to, but isn't.
function collectAllDescendants(root) {
  const found = [];
  (function walk(node) {
    for (const child of node.children || []) {
      found.push(child);
      walk(child);
    }
  })(root);
  return found;
}

module.exports = { collectFromAssumedTableCells, collectAllDescendants };
