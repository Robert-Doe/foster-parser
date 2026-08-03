'use strict';

const { ElementNode, TextNode, CommentNode } = require('../../../track1-core/00_tokens_and_nodes/src/nodes.js');
const { serializeToHTML } = require('./serializer.js');

// A canonical, structural dump — NOT the HTML string — used to compare two trees.
// Comparing HTML strings would be fooled by cosmetically different-but-equivalent
// markup; comparing structure is what actually answers "is this the same tree."
function canonicalize(node, depth = 0, out = []) {
  const indent = '  '.repeat(depth);
  if (node instanceof ElementNode) out.push(indent + node.tagName);
  else if (node instanceof TextNode) out.push(indent + '#text ' + JSON.stringify(node.data));
  else if (node instanceof CommentNode) out.push(indent + '#comment ' + JSON.stringify(node.data));
  for (const child of node.children || []) canonicalize(child, depth + 1, out);
  return out.join('\n');
}

// The defense: serialize `rootNode`, reparse that exact string via `reparseFn`
// (real tree construction — Track 1's engine, unchanged), and compare structurally.
// If they differ, the tree `rootNode` represents is NOT safe to hand off as a
// string — a later, independent parse (e.g. a real innerHTML assignment) would
// build something different from what was inspected/approved.
//
// `reparseFn(html)` must return a node comparable to `rootNode` (same "rooted at"
// level — see DECISIONS.md for why this module doesn't try to infer that
// automatically).
function checkIdempotent(rootNode, reparseFn) {
  const serialized = serializeToHTML(rootNode);
  const reparsedRoot = reparseFn(serialized);
  const before = canonicalize(rootNode);
  const after = canonicalize(reparsedRoot);
  return { stable: before === after, before, after, serialized };
}

module.exports = { canonicalize, checkIdempotent };
