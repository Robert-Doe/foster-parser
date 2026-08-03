'use strict';

const assert = require('node:assert/strict');
const { tokenize } = require('../../../track1-core/01_stack_and_dispatch/src/tokenizer.js');
const { NotImplementedYet } = require('../../../track1-core/01_stack_and_dispatch/src/dispatch.js');
const { ElementNode, TextNode } = require('../../../track1-core/00_tokens_and_nodes/src/nodes.js');
const { dispatch13, createParserState13 } = require('../../../track1-core/13_scope/src/dispatch13.js');
const { scanWithNaiveHeuristic } = require('../src/source_position_sanitizer.js');

function serializeLikeBrowser(node, depth = 0, out = []) {
  const indent = '  '.repeat(depth);
  if (node instanceof ElementNode) {
    const attrs = [...node.attrs.entries()].map(([k, v]) => `${k}=${v}`).join(',');
    out.push(indent + node.tagName + (attrs ? ` [${attrs}]` : ''));
  } else if (node instanceof TextNode) {
    out.push(indent + '#text ' + JSON.stringify(node.data));
  }
  for (const child of node.children || []) serializeLikeBrowser(child, depth + 1, out);
  return out;
}

function realFinalParentOf(html, tagName) {
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
  let found = null;
  (function walk(node) {
    for (const child of node.children || []) {
      if (child.tagName === tagName) found = child;
      walk(child);
    }
  })(body);
  return { body, found };
}

const DANGEROUS_ATTR = /data-dangerous=/;

console.log('── Case A: a plain <img> — the naive heuristic trusts it, reality disagrees ──\n');
const htmlA = '<!DOCTYPE html><head></head><body><table><img src=x data-dangerous="focus-steal"></table></body>';
console.log(htmlA);

const scanA = scanWithNaiveHeuristic(htmlA, DANGEROUS_ATTR);
console.log('\nNaive heuristic scan:', scanA.map((r) => `${r.tagName} → trusted=${r.trustedBySourcePosition}`).join(', '));
assert.equal(scanA[0].trustedBySourcePosition, true, 'the naive heuristic must trust the <img> — it is textually between <table> and </table>');

const realA = realFinalParentOf(htmlA, 'img');
const realTreeA = serializeLikeBrowser(realA.body).join('\n');
console.log('\nActual final tree (this course\'s own verified Track 1 engine):');
console.log(realTreeA);
assert.equal(
  realTreeA,
  ['body', '  img [src=x,data-dangerous=focus-steal]', '  table'].join('\n'),
  'the <img> must actually foster OUTSIDE the table, contradicting the heuristic\'s trust — matches Track 1 Module 06\'s already-verified behavior'
);
console.log('\n>>> The naive heuristic said "trusted, contained in the table." The real parser put it in body,');
console.log('    a completely ordinary rendering context, attribute untouched. The heuristic was WRONG.\n');

console.log('── Case B: an <input type=hidden> — the SAME heuristic, and this time it happens to be right ──\n');
const htmlB = '<!DOCTYPE html><head></head><body><table><input type=hidden data-dangerous="hidden-but-inert"></table></body>';
console.log(htmlB);

const scanB = scanWithNaiveHeuristic(htmlB, DANGEROUS_ATTR);
console.log('\nNaive heuristic scan:', scanB.map((r) => `${r.tagName} → trusted=${r.trustedBySourcePosition}`).join(', '));
assert.equal(scanB[0].trustedBySourcePosition, true, 'the SAME heuristic reasoning trusts the hidden input too — identical source-position logic');

const realB = realFinalParentOf(htmlB, 'input');
const realTreeB = serializeLikeBrowser(realB.body).join('\n');
console.log('\nActual final tree:');
console.log(realTreeB);
assert.equal(
  realTreeB,
  ['body', '  table', '    input [type=hidden,data-dangerous=hidden-but-inert]'].join('\n'),
  'the hidden input must actually stay inside the table — matches Track 1 Module 07\'s already-verified "refuses to foster" behavior'
);
console.log('\n>>> This time the heuristic happened to be right — but only because <input type=hidden> is one');
console.log('    of the specific, narrow cases "in table" handles explicitly (Module 07), not because the');
console.log('    heuristic itself has any principled basis.\n');

console.log('── The point ──');
console.log('Same sanitizer logic. Same reasoning ("it is between <table> and </table> in the source, so it');
console.log('is contained"). Right by accident in Case B, catastrophically wrong in Case A — and an attacker');
console.log('chooses which case they send. A heuristic that is sometimes correct provides no real guarantee.');

console.log('\nOK — all assertions passed. Track 2 Module T2-02: naive sanitizer break, verified.');
