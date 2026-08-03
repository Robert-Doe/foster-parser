'use strict';

const assert = require('node:assert/strict');
const { tokenize } = require('../../../track1-core/01_stack_and_dispatch/src/tokenizer.js');
const { NotImplementedYet } = require('../../../track1-core/01_stack_and_dispatch/src/dispatch.js');
const { ElementNode, TextNode } = require('../../../track1-core/00_tokens_and_nodes/src/nodes.js');
const { dispatch13, createParserState13 } = require('../../../track1-core/13_scope/src/dispatch13.js');
const { checkChunksIncrementally, checkFinalText } = require('../src/incremental_checker.js');

const DANGEROUS = /^javascript:/i;

console.log('── The two pieces, as a naive "check each chunk as it arrives" sanitizer would see them ──\n');

// "java" is inserted ordinarily, before the table exists (Module 00/09's fusion
// case). "script:alert(1)" is buffered by Module 08's "in table text" mechanism
// while current node is <table> (a fostering target), then flushed and fostered by
// Module 05's location algorithm — landing immediately before the table, where
// Module 09's fusion merges it into the SAME TextNode "java" already produced.
const chunks = ['java', 'script:alert(1)'];
const incrementalResults = checkChunksIncrementally(chunks, DANGEROUS);
for (const r of incrementalResults) {
  console.log(`  chunk ${JSON.stringify(r.chunk)} → flagged: ${r.flagged}`);
}
assert.ok(incrementalResults.every((r) => !r.flagged), 'neither chunk, checked in isolation, should match a "javascript:" prefix check');
console.log('\nNeither chunk matches on its own. A per-chunk checker would wave both through.\n');

console.log('── What Track 1\'s own engine actually builds, parsing the real markup ──\n');
const html = '<!DOCTYPE html><head></head><body><div>java<table>script:alert(1)</table></div></body>';
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

function serializeLikeBrowser(node, depth = 0, out = []) {
  const indent = '  '.repeat(depth);
  if (node instanceof ElementNode) out.push(indent + node.tagName);
  else if (node instanceof TextNode) out.push(indent + '#text ' + JSON.stringify(node.data));
  for (const child of node.children || []) serializeLikeBrowser(child, depth + 1, out);
  return out;
}

const htmlEl = state.document.children.find((c) => c.tagName === 'html');
const body = htmlEl.children.find((c) => c.tagName === 'body');
const div = body.children.find((c) => c.tagName === 'div');
const actualTree = serializeLikeBrowser(div).join('\n');
console.log(actualTree);

assert.equal(
  actualTree,
  ['div', '  #text "javascript:alert(1)"', '  table'].join('\n'),
  'the two chunks must fuse into one TextNode reading exactly "javascript:alert(1)" — matches real browser output, same mechanism as Track 1 Module 05\'s "abcdef" case'
);

const finalText = div.children[0].data;
const finalCheck = checkFinalText(finalText, DANGEROUS);
console.log(`\nFinal, actual TextNode data: ${JSON.stringify(finalText)}`);
console.log(`Checked against the SAME pattern: flagged = ${finalCheck.flagged}`);

assert.equal(finalCheck.flagged, true, 'the fused final text DOES match the dangerous pattern — the two "safe" chunks combined into something the pattern was written to catch');

console.log('\n── The point ──');
console.log('Two chunks, individually checked, individually clean. One fostering-and-fusion cycle later');
console.log('(Modules 08\'s buffering delivered the second chunk out of the table; Module 09\'s fusion merged');
console.log('it into the first) — one text node, reading exactly the string the checker was built to catch,');
console.log('and never checked against it, because it never existed as one string until after the check ran.');

console.log('\nOK — all assertions passed. Track 2 Module T2-03: whitespace & fusion vectors, verified.');
