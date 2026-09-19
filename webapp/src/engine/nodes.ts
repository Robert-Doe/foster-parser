// Ported verbatim (CommonJS -> ES module syntax; logic unchanged) from
// track1-core/00_tokens_and_nodes/src/nodes.js in this repo.
// The four (plus DocumentFragment) DOM node kinds tree construction produces/moves.
//
// ONE addition for this visualizer, clearly marked below: an optional insert
// hook so the demo can record, at the exact moment a node is spliced into a
// parent, whether foster parenting was active. It does not change WHERE or
// WHETHER any node is inserted — only observes it.

export class Node {
  parent: any = null;
}

export class DocumentNode extends Node {
  children: any[] = [];
}

export class ElementNode extends Node {
  tagName: string;
  attrs: Map<string, string> = new Map();
  children: any[] = [];
  constructor(tagName: string) {
    super();
    this.tagName = tagName;
  }
}

export class TextNode extends Node {
  data: string;
  constructor(data: string) {
    super();
    this.data = data;
  }
}

export class CommentNode extends Node {
  data: string;
  constructor(data: string) {
    super();
    this.data = data;
  }
}

export class DocumentFragmentNode extends Node {
  children: any[] = [];
}

export function isParentNode(node: any): boolean {
  return node instanceof DocumentNode || node instanceof ElementNode || node instanceof DocumentFragmentNode;
}

// --- Visualizer-only addition: an optional global insert hook. ---
// Not part of the ported algorithm — purely an observation point so the demo
// can tag which nodes were fostered, without altering insertion behavior.
type InsertHook = (node: any, parent: any, index: number) => void;
let insertHook: InsertHook | null = null;
export function setInsertHook(fn: InsertHook | null) {
  insertHook = fn;
}

// Splice `node` into `parent`'s children, at `index` (default: append after last child).
export function insertNode(parent: any, node: any, index: number = parent.children.length) {
  if (!isParentNode(parent)) {
    throw new TypeError(`Cannot insert into a ${parent.constructor.name} — it has no children array.`);
  }
  node.parent = parent;
  parent.children.splice(index, 0, node);
  if (insertHook) insertHook(node, parent, index); // <-- visualizer hook only
  return node;
}

// Text-node fusion: if the node immediately before `index` in `parent` is a
// TextNode, append `data` to it instead of inserting a new node.
export function tryFuseCharacter(parent: any, data: string, index: number = parent.children.length): boolean {
  const before = parent.children[index - 1];
  if (before instanceof TextNode) {
    before.data += data;
    // Visualizer-only: a fuse is still an "insert-like" event at this
    // location (no new node, but it's the same decision point as
    // insertNode below) — routing it through the same hook keeps the
    // hook's caller (trace.ts) from seeing a stale foster/non-foster
    // decision bleed into the NEXT, unrelated insertion.
    if (insertHook) insertHook(before, parent, index);
    return true;
  }
  return false;
}

export function renderTree(node: any, prefix = '', isLast = true, isRoot = true): string[] {
  const lines: string[] = [];
  const label = describeNode(node);
  if (isRoot) {
    lines.push(label);
  } else {
    lines.push(prefix + (isLast ? '└─ ' : '├─ ') + label);
  }
  const childPrefix = isRoot ? '' : prefix + (isLast ? '   ' : '│  ');
  const children = node.children ?? [];
  children.forEach((child: any, i: number) => {
    lines.push(...renderTree(child, childPrefix, i === children.length - 1, false));
  });
  return lines;
}

export function describeNode(node: any): string {
  if (node instanceof DocumentNode) return '#document';
  if (node instanceof DocumentFragmentNode) return '#document-fragment';
  if (node instanceof ElementNode) return node.tagName;
  if (node instanceof TextNode) return `#text ${JSON.stringify(node.data)}`;
  if (node instanceof CommentNode) return `#comment ${JSON.stringify(node.data)}`;
  throw new Error(`Unknown node kind: ${node?.constructor?.name}`);
}
