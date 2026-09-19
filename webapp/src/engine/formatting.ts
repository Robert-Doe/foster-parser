// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/10_formatting_triple_b/src/formatting.js in this repo.
// The active formatting elements list, markers, and reconstruction.
import { currentNode } from './dispatch.js';

export const FORMATTING_ELEMENTS: ReadonlySet<string> = new Set(['b']);

export const MARKER = Symbol('marker');

export function pushActiveFormattingElement(state: any, element: any) {
  state.activeFormattingElements.push(element);
}

export function pushMarker(state: any) {
  state.activeFormattingElements.push(MARKER);
}

export function clearActiveFormattingElementsToLastMarker(state: any) {
  const list = state.activeFormattingElements;
  while (list.length > 0) {
    const entry = list.pop();
    if (entry === MARKER) break;
  }
}

const TABLE_CONTEXT_STOP_TAGS = new Set(['table', 'tbody', 'thead', 'tfoot', 'tr', 'template', 'html']);

export function clearStackBackToTableContext(state: any) {
  while (state.stack.length > 0 && !TABLE_CONTEXT_STOP_TAGS.has(currentNode(state).tagName)) {
    state.stack.pop();
  }
}

export function reconstructActiveFormattingElements(
  state: any,
  insertElementFn: (state: any, tagName: string, attrs: Map<string, string>) => any
) {
  const list = state.activeFormattingElements;
  if (list.length === 0) return;

  const last = list[list.length - 1];
  if (last === MARKER || state.stack.includes(last)) return;

  let i = list.length - 1;
  while (i > 0) {
    const candidate = list[i - 1];
    if (candidate === MARKER || state.stack.includes(candidate)) break;
    i -= 1;
  }

  for (; i < list.length; i += 1) {
    const entry = list[i];
    const clone = insertElementFn(state, entry.tagName, entry.attrs);
    list[i] = clone;
  }
}
