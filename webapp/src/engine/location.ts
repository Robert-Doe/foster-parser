// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/05_seven_substeps/src/location.js in this repo.
// "Appropriate place for inserting a node," in full: step 1 (target = current
// node), step 2 (the foster-parenting substeps), step 3 (the ordinary case).
import { isFosterParentingTarget } from './foster.js';
import { insertNode, tryFuseCharacter, TextNode, ElementNode } from './nodes.js';

// --- Visualizer-only addition, same pattern as nodes.ts's insertHook: an
// optional hook reporting whether THIS SPECIFIC call actually took the
// foster-parenting branch (step 2 of "appropriate place for inserting a
// node"), as opposed to merely running while state.fosterParentingEnabled
// happens to be true. The two are different questions, e.g. characters
// buffered while fostering is enabled but whose current node is a <td>
// (not a table-family element) are NOT fostered, per step 3's ordinary
// case below. Does not change the algorithm's decision, only observes it.
type FosterHook = (didFoster: boolean) => void;
let fosterHook: FosterHook | null = null;
export function setFosterHook(fn: FosterHook | null) {
  fosterHook = fn;
}

export function getAdjustedInsertionLocation(state: any): { parent: any; index: number } {
  const target = state.stack[state.stack.length - 1];

  if (!isFosterParentingTarget(state)) {
    if (fosterHook) fosterHook(false);
    return { parent: target, index: target.children.length };
  }
  if (fosterHook) fosterHook(true);

  const stack = state.stack;
  let lastTableIndex = -1;
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].tagName === 'table') {
      lastTableIndex = i;
      break;
    }
  }

  if (lastTableIndex === -1) {
    const first = stack[0];
    return { parent: first, index: first.children.length };
  }

  const lastTable = stack[lastTableIndex];

  if (lastTable.parent) {
    const parent = lastTable.parent;
    return { parent, index: parent.children.indexOf(lastTable) };
  }

  const previousElement = stack[lastTableIndex - 1];
  return { parent: previousElement, index: previousElement.children.length };
}

export function insertCharacterAtAppropriatePlace(state: any, data: string) {
  const { parent, index } = getAdjustedInsertionLocation(state);
  if (!tryFuseCharacter(parent, data, index)) {
    insertNode(parent, new TextNode(data), index);
  }
}

export function insertElementAtAppropriatePlace(state: any, tagName: string, attrs: Map<string, string> = new Map()) {
  const { parent, index } = getAdjustedInsertionLocation(state);
  const el = new ElementNode(tagName);
  for (const [k, v] of attrs) el.attrs.set(k, v);
  insertNode(parent, el, index);
  state.stack.push(el);
  return el;
}
