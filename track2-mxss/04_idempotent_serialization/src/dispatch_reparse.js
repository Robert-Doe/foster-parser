'use strict';

const { dispatch13 } = require('../../../track1-core/13_scope/src/dispatch13.js');
const { insertElementAtAppropriatePlace11 } = require('../../../track1-core/11_templates_fragments/src/location11.js');
const { clearStackBackToTableContext } = require('../../../track1-core/10_formatting_triple_b/src/formatting.js');

const EXPLICIT_TABLE_BODY_TAGS = ['tbody', 'thead', 'tfoot'];

// A bug this module's own round-trip test caught: Track 1's `inTableSpecificRules`
// (Modules 05-13) only ever handles <td>/<th>/<tr> specially — every one of Track
// 1's own test cases only ever produced a <tbody> by IMPLICATION (inserted
// automatically ahead of a <td>/<tr>), never by tokenizing a literal <tbody> tag
// from source text. This module's serializer, round-tripping a real tree, is the
// first thing in the whole course to feed dispatch13 an EXPLICIT <tbody> start tag
// — which then fell through to the anything-else/foster-parenting fallback and got
// (wrongly) fostered before the table, exactly like an unrecognized tag would.
//
// Fixed here, additively, rather than editing Track 1's already-verified
// `dispatch13.js` — same pattern every Track 1 module since 07 used when extending
// a previous module's dispatch chain. See DECISIONS.md.
function dispatchReparse(token, state, log) {
  if (
    state.mode === 'in table' &&
    token.type === 'StartTag' &&
    EXPLICIT_TABLE_BODY_TAGS.includes(token.tagName)
  ) {
    clearStackBackToTableContext(state);
    insertElementAtAppropriatePlace11(state, token.tagName, token.attrs);
    return;
  }
  return dispatch13(token, state, log);
}

module.exports = { dispatchReparse };
