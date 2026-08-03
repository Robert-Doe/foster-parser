'use strict';

const assert = require('node:assert/strict');
const { tokenize } = require('../../../track1-core/01_stack_and_dispatch/src/tokenizer.js');
const { NotImplementedYet } = require('../../../track1-core/01_stack_and_dispatch/src/dispatch.js');
const { ElementNode, TextNode, DocumentNode, insertNode } = require('../../../track1-core/00_tokens_and_nodes/src/nodes.js');
const { dispatch13, createParserState13 } = require('../../../track1-core/13_scope/src/dispatch13.js');
const { checkIdempotent, canonicalize } = require('../src/idempotency_check.js');
const { dispatchReparse } = require('../src/dispatch_reparse.js');

// Parses `html` wrapped in <body>, and returns the first top-level <div> found —
// the same "rooted at" level every tree this demo checks is built at. Uses
// `dispatchReparse` (this module's own fix for explicit <tbody> tags), not
// `dispatch13` directly — a serialized tree can contain explicit <tbody> tags no
// Track 1 test case ever produced. See DECISIONS.md.
function reparseToDiv(html) {
  const fullHtml = `<!DOCTYPE html><head></head><body>${html}</body>`;
  const tokens = tokenize(fullHtml);
  const state = createParserState13();
  for (const token of tokens) {
    try {
      dispatchReparse(token, state, () => {});
    } catch (err) {
      if (err instanceof NotImplementedYet) break;
      throw err;
    }
  }
  const htmlEl = state.document.children.find((c) => c.tagName === 'html');
  const body = htmlEl.children.find((c) => c.tagName === 'body');
  return body.children.find((c) => c.tagName === 'div');
}

console.log('── Case A: a sanitizer "unwrap" step done via direct DOM mutation (Module 11\'s exact warning) ──\n');

// Simulates a sanitizer that decided a wrapper around "x" was disallowed and
// "unwrapped" it by manipulating the tree directly — table.appendChild-style, per
// Module 11's own explicit lesson: "DOM mutation is not tree construction."
const wrapperDoc = new DocumentNode();
const div1 = insertNode(wrapperDoc, new ElementNode('div'));
const table1 = insertNode(div1, new ElementNode('table'));
insertNode(table1, new TextNode('x')); // direct mutation — bypasses "appropriate place" entirely

console.log('Tree built directly via DOM-mutation-style insertion (what the sanitizer THINKS is safe):');
console.log(canonicalize(div1));

const resultA = checkIdempotent(div1, reparseToDiv);
console.log('\nSerialized for handoff:', JSON.stringify(resultA.serialized));
console.log('\nReparsed (what a REAL later innerHTML assignment would actually build):');
console.log(resultA.after);
console.log('\nStable (idempotent)?', resultA.stable);

assert.equal(resultA.stable, false, 'the direct-mutation tree must NOT be idempotent — reparsing must fosters "x" out of the table');
assert.equal(resultA.before, ['div', '  table', '    #text "x"'].join('\n'));
assert.equal(resultA.after, ['div', '  #text "x"', '  table'].join('\n'), 'matches the real-browser-verified table.appendChild + innerHTML round-trip mismatch');
console.log('\n>>> CAUGHT: this tree is unsafe to hand off as a string. A defense using this check would');
console.log('    reject or re-sanitize here — exactly the case a naive checker (T2-01/02/03) would miss.\n');

console.log('── Case B: a tree built by REAL parsing (no shortcuts) ──\n');

const html = '<!DOCTYPE html><head></head><body><div><table><tr><td>x</td></tr></table></div></body>';
const tokens = tokenize(html);
const state = createParserState13();
for (const token of tokens) {
  try {
    dispatch13(token, state, () => {});
  } catch (err) {
    if (err instanceof NotImplementedYet) break;
    throw err;
  }
}
const htmlEl = state.document.children.find((c) => c.tagName === 'html');
const body = htmlEl.children.find((c) => c.tagName === 'body');
const div2 = body.children.find((c) => c.tagName === 'div');

console.log('Tree built by real parsing:');
console.log(canonicalize(div2));

const resultB = checkIdempotent(div2, reparseToDiv);
console.log('\nStable (idempotent)?', resultB.stable);
assert.equal(resultB.stable, true, 'a tree that was already built by real, correct tree construction must reparse identically to itself');
console.log('\n>>> No false alarm: content that was always safely, correctly parsed passes the check.\n');

console.log('OK — all assertions passed. Track 2 Module T2-04: idempotent serialization defense, verified.');
