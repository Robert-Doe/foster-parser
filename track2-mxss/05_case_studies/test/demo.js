'use strict';

const assert = require('node:assert/strict');
const { tokenize } = require('../../../track1-core/01_stack_and_dispatch/src/tokenizer.js');
const { NotImplementedYet, createParserState } = require('../../../track1-core/01_stack_and_dispatch/src/dispatch.js');
const { ElementNode, TextNode } = require('../../../track1-core/00_tokens_and_nodes/src/nodes.js');
const { dispatchCaseStudy } = require('../src/dispatch_case_study.js');
const { checkIdempotent, canonicalize } = require('../../04_idempotent_serialization/src/idempotency_check.js');

function createState() {
  const state = createParserState();
  state.activeFormattingElements = [];
  return state;
}

function serializeLikeBrowser(node, depth = 0, out = []) {
  const indent = '  '.repeat(depth);
  if (node instanceof ElementNode) {
    const id = node.attrs.get('id');
    out.push(indent + node.tagName + (id ? '#' + id : ''));
  } else if (node instanceof TextNode) {
    out.push(indent + '#text ' + JSON.stringify(node.data));
  }
  for (const child of node.children || []) serializeLikeBrowser(child, depth + 1, out);
  return out;
}

console.log('── Case Study 1: "Round Trip mXSS" (real, documented pattern — see DECISIONS.md for source) ──\n');

const html = '<!DOCTYPE html><head></head><body><form id="outer"><div></form><form id="inner"><input></body>';
console.log(html, '\n');

const tokens = tokenize(html);
const state = createState();
for (const token of tokens) {
  try {
    dispatchCaseStudy(token, state, () => {});
  } catch (err) {
    if (err instanceof NotImplementedYet) break;
    throw err;
  }
}
const htmlEl = state.document.children.find((c) => c.tagName === 'html');
const body = htmlEl.children.find((c) => c.tagName === 'body');
const actualTree = serializeLikeBrowser(body).join('\n');

console.log('This engine\'s reproduction:');
console.log(actualTree);

const EXPECTED = ['body', '  form#outer', '    div', '      form#inner', '        input'].join('\n');
assert.equal(actualTree, EXPECTED, 'must match the real, independently-verified browser DOMParser output for this exact input');
console.log('\nMatches real browser output exactly: the </form> end tag removed form#outer from the STACK');
console.log('directly (not by popping div along with it), so form#inner — a nested form, normally illegal —');
console.log('opens for real, inside div, because the form element pointer was already clear.\n');

console.log('── Checking this real tree against T2-04\'s idempotent-serialization defense ──\n');
const div = body.children.find((c) => c.tagName === 'form');
function reparseWithCaseStudy(html) {
  const fullHtml = `<!DOCTYPE html><head></head><body>${html}</body>`;
  const toks = tokenize(fullHtml);
  const st = createState();
  for (const t of toks) {
    try {
      dispatchCaseStudy(t, st, () => {});
    } catch (err) {
      if (err instanceof NotImplementedYet) break;
      throw err;
    }
  }
  const h = st.document.children.find((c) => c.tagName === 'html');
  const b = h.children.find((c) => c.tagName === 'body');
  return b.children.find((c) => c.tagName === 'form');
}

const result = checkIdempotent(body.children[0], reparseWithCaseStudy);
console.log('Before (this engine\'s first parse):');
console.log(result.before);
console.log('\nAfter (this engine\'s reparse of its own serialized output):');
console.log(result.after);
console.log('\nStable (idempotent)?', result.stable);

console.log('\n── What this module honestly does and does not reproduce ──');
console.log('This engine models the FIRST parse exactly (verified above). Track 1/2 never built general,');
console.log('non-table form-element-pointer tracking for "in body" mode (only the table-context version,');
console.log('Track 1 Module 07) — so this engine\'s SECOND parse may not reproduce the real browser\'s exact');
console.log('round-trip mismatch. That gap is real and stated here directly, not glossed over — see');
console.log('DECISIONS.md for exactly what would be needed to close it.');

console.log('\nOK — Case Study 1 (first-parse tree shape) verified against real browser output.');
console.log('See tutorial.html and DECISIONS.md for Case Studies 2 and 3 (cited, not reproduced — out of scope).');
