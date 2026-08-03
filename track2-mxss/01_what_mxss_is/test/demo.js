'use strict';

const assert = require('node:assert/strict');
const { tokenize } = require('../../../track1-core/01_stack_and_dispatch/src/tokenizer.js');
const { NotImplementedYet } = require('../../../track1-core/01_stack_and_dispatch/src/dispatch.js');
const { ElementNode, TextNode } = require('../../../track1-core/00_tokens_and_nodes/src/nodes.js');
const { dispatch13, createParserState13 } = require('../../../track1-core/13_scope/src/dispatch13.js');
const { collectFromAssumedTableCells, collectAllDescendants } = require('../src/narrow_inspector.js');

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

console.log('── A common real-world pattern: user content dropped into an existing <table> ──\n');

// Standing in for a real dangerous attribute (e.g. onerror) with an inert marker —
// this demo proves a STRUCTURAL escape (does the node end up somewhere a narrow
// inspector would miss?), not an execution — no payload is constructed or run.
const userHTML = '<img src=x data-dangerous="yes">';
const html = `<!DOCTYPE html><head></head><body><div id="sandbox"><table>${userHTML}</table></div></body>`;
console.log(html, '\n');

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
const sandbox = body.children.find((c) => c.tagName === 'div');
const table = sandbox.children.find((c) => c.tagName === 'table');

const actualTree = serializeLikeBrowser(sandbox).join('\n');
console.log('── Actual final tree, this course\'s own Track 1 engine ──');
console.log(actualTree, '\n');

const EXPECTED_TREE = ['div [id=sandbox]', '  img [src=x,data-dangerous=yes]', '  table'].join('\n');
assert.equal(actualTree, EXPECTED_TREE, 'engine output must match real browser DOMParser output exactly');

console.log('── What a "narrow inspector" (table > tbody > tr > td only) sees ──');
const narrowResults = collectFromAssumedTableCells(table);
console.log('Elements found by the narrow inspector:', narrowResults.length === 0 ? '(none)' : narrowResults.map((e) => e.tagName));

console.log('\n── What a full walk of the actual sandbox subtree sees ──');
const fullResults = collectAllDescendants(sandbox);
console.log('Elements found by the full walk:', fullResults.map((e) => e.tagName));

assert.equal(narrowResults.length, 0, 'the narrow inspector, walking only table>tbody>tr>td, must find NOTHING — the <img> was fostered out of that structure entirely');
const imgInFullWalk = fullResults.find((e) => e.tagName === 'img');
assert.ok(imgInFullWalk, 'the full walk must find the <img>, proving it really is present in the final tree');
assert.equal(imgInFullWalk.attrs.get('data-dangerous'), 'yes', 'the <img> must still carry its attribute — nothing stripped it, because nothing ever looked at it');

console.log('\nThe <img> is real, present, and fully attributed in the final DOM — and structurally invisible');
console.log('to any inspector that only walks the table cells it expected user content to land in.');
console.log('\nThis is the whole mechanism of mXSS: a check performed against one representation (what the');
console.log('source markup, or an assumed tree shape, seems to say) can miss content that a real parser');
console.log('places somewhere else entirely — using nothing but ordinary, correctly-specified tree');
console.log('construction. Foster parenting (Track 1, Modules 02-09) is one concrete, well-understood way');
console.log('this exact gap opens up.');

console.log('\nOK — all assertions passed. Track 2 Module T2-01: what mXSS actually is, verified.');
