'use strict';

// A naive, source-string-based sanitizer heuristic — DEFENSIVE/EDUCATIONAL: this
// exists to demonstrate why the heuristic is unsafe, not to produce a usable
// sanitizer. Real rule some naive implementations plausibly use: "content whose
// SOURCE POSITION falls between a <table> tag and its matching </table> is
// contained table markup, and tables aren't a script-execution context, so we don't
// need to strip dangerous-looking attributes from it."
//
// The flaw: source position is a fact about the STRING. Whether a node ends up as a
// DESCENDANT of the table in the final DOM is a fact about tree construction — and
// Track 1 (Modules 02-09) proved those two facts routinely disagree.
function isTrustedBySourcePosition(html, tagIndex) {
  const tableStart = html.indexOf('<table');
  const tableEnd = html.indexOf('</table>');
  if (tableStart === -1 || tableEnd === -1) return false;
  return tagIndex > tableStart && tagIndex < tableEnd;
}

// Scans `html` for tags matching `dangerousAttrPattern` (a regex testing for a
// dangerous attribute, e.g. an event handler) and reports which ones the
// source-position heuristic above would (wrongly, or rightly) trust.
function scanWithNaiveHeuristic(html, dangerousAttrPattern) {
  const tagRe = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  const results = [];
  let m;
  while ((m = tagRe.exec(html))) {
    const [full, tagName, attrsSrc] = m;
    if (dangerousAttrPattern.test(attrsSrc)) {
      results.push({
        tagName,
        index: m.index,
        raw: full,
        trustedBySourcePosition: isTrustedBySourcePosition(html, m.index),
      });
    }
  }
  return results;
}

module.exports = { isTrustedBySourcePosition, scanWithNaiveHeuristic };
