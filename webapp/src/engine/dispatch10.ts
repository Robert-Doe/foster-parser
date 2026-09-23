// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/10_formatting_triple_b/src/dispatch10.js in this repo, the
// most complete insertion-mode dispatcher this course builds: foster
// parenting (Module 05), what refuses fostering (Module 07), in-table-text
// buffering (Module 08), and active-formatting-element reconstruction
// (this module) all composed together.
import { dispatch, currentNode, NotImplementedYet, createParserState } from './dispatch.js';
import { insertCharacterAtAppropriatePlace, insertElementAtAppropriatePlace } from './location.js';
import { inTableSpecificRules } from './dispatch5.js';
import { inTableRefusesFostering } from './nonfoster.js';
import { enterInTableText, handleInTableText } from './tabletext.js';
import {
  FORMATTING_ELEMENTS,
  pushActiveFormattingElement,
  pushMarker,
  clearActiveFormattingElementsToLastMarker,
  clearStackBackToTableContext,
  reconstructActiveFormattingElements,
} from './formatting.js';

function insertCharWithReconstruction(state: any, ch: string) {
  reconstructActiveFormattingElements(state, insertElementAtAppropriatePlace);
  insertCharacterAtAppropriatePlace(state, ch);
}

function inTableSpecificRules10(token: any, state: any): boolean {
  if (token.type !== 'StartTag') return false;
  if (!['td', 'th', 'tr'].includes(token.tagName)) return false;
  clearStackBackToTableContext(state);
  const handled = inTableSpecificRules(token, state);
  if (handled && (token.tagName === 'td' || token.tagName === 'th')) {
    pushMarker(state);
  }
  return handled;
}

function inBodyFosterAware10(token: any, state: any) {
  if (token.type === 'Character') {
    reconstructActiveFormattingElements(state, insertElementAtAppropriatePlace);
    insertCharacterAtAppropriatePlace(state, token.data);
    return;
  }
  if (token.type === 'StartTag' && token.tagName === 'table') {
    insertElementAtAppropriatePlace(state, token.tagName, token.attrs);
    state.mode = 'in table';
    return;
  }
  if (token.type === 'StartTag' && FORMATTING_ELEMENTS.has(token.tagName)) {
    reconstructActiveFormattingElements(state, insertElementAtAppropriatePlace);
    const el = insertElementAtAppropriatePlace(state, token.tagName, token.attrs);
    pushActiveFormattingElement(state, el);
    return;
  }
  if (token.type === 'StartTag') {
    insertElementAtAppropriatePlace(state, token.tagName, token.attrs);
    return;
  }
  if (token.type === 'EndTag' && token.tagName === 'table') {
    while (state.stack.length > 0) {
      const popped = state.stack.pop();
      if (popped.tagName === 'table') break;
    }
    state.mode = 'in body';
    return;
  }
  if (token.type === 'EndTag') {
    const cur = currentNode(state);
    if (cur && cur.tagName === token.tagName) {
      state.stack.pop();
      if (token.tagName === 'td' || token.tagName === 'th') {
        clearActiveFormattingElementsToLastMarker(state);
      }
      return;
    }
  }
  throw new NotImplementedYet('in body (Module 10, formatting-aware)', token);
}

export function dispatch10(token: any, state: any, log: (s: string) => void) {
  if (state.mode === 'in table text') {
    return handleInTableText(token, state, log, dispatch10, insertCharWithReconstruction);
  }
  if (state.mode === 'in table' && token.type === 'Character') {
    enterInTableText(state);
    return dispatch10(token, state, log);
  }
  if (state.mode === 'in table') {
    if (inTableRefusesFostering(token, state)) return;
    if (inTableSpecificRules10(token, state)) return;
    log('enable');
    state.fosterParentingEnabled = true;
    try {
      inBodyFosterAware10(token, state);
    } finally {
      log('disable');
      state.fosterParentingEnabled = false;
    }
    return;
  }
  if (state.mode === 'in body') {
    return inBodyFosterAware10(token, state);
  }
  return dispatch(token, state);
}

export function createParserState10() {
  const state = createParserState();
  (state as any).activeFormattingElements = [];
  return state;
}
