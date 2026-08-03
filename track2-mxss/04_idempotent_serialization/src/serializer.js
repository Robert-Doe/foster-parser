'use strict';

const { ElementNode, TextNode, CommentNode, DocumentFragmentNode } = require('../../../track1-core/00_tokens_and_nodes/src/nodes.js');

// Track 1 never needed this direction (string → tree only). Track 2 does: an
// idempotent-serialization defense has to serialize a tree BACK into a string
// before it can reparse and compare. A minimal, real serializer — HTML-escaping
// text content, not attempting a general "innerHTML" reimplementation (no
// attribute-value escaping edge cases, no void-element self-closing syntax) beyond
// what this module's own test cases need. See DECISIONS.md.
function escapeText(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function serializeToHTML(node) {
  if (node instanceof TextNode) {
    return escapeText(node.data);
  }
  if (node instanceof CommentNode) {
    return `<!--${node.data}-->`;
  }
  if (node instanceof ElementNode) {
    const attrs = [...node.attrs.entries()].map(([k, v]) => ` ${k}="${v}"`).join('');
    const children = node.children.map(serializeToHTML).join('');
    return `<${node.tagName}${attrs}>${children}</${node.tagName}>`;
  }
  if (node instanceof DocumentFragmentNode) {
    return node.children.map(serializeToHTML).join('');
  }
  // DocumentNode or unrecognized: serialize children only.
  return (node.children || []).map(serializeToHTML).join('');
}

module.exports = { serializeToHTML };
