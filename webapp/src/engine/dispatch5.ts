// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/05_seven_substeps/src/dispatch5.js in this repo.
// A foster-aware replacement for Module 01's "in body" character/table
// handling, plus a minimal slice of "in table"'s specific (non-fostering)
// <td>/<tr> rules.
import { dispatch, insertHtmlElement, currentNode, NotImplementedYet } from './dispatch.js';
import { insertCharacterAtAppropriatePlace, insertElementAtAppropriatePlace } from './location.js';

export function inBodyFosterAware(token: any, state: any) {
  if (token.type === 'Character') {
    insertCharacterAtAppropriatePlace(state, token.data);
    return;
  }
  if (token.type === 'StartTag' && token.tagName === 'table') {
    insertElementAtAppropriatePlace(state, token.tagName, token.attrs);
    state.mode = 'in table';
    return;
  }
  if (token.type === 'StartTag') {
    insertElementAtAppropriatePlace(state, token.tagName, token.attrs);
    return;
  }
  if (token.type === 'EndTag') {
    const cur = currentNode(state);
    if (cur && cur.tagName === token.tagName) {
      state.stack.pop();
      return;
    }
  }
  throw new NotImplementedYet('in body (Module 05, foster-aware)', token);
}

const TABLE_BODY_TAGS = ['tbody', 'thead', 'tfoot'];

export function inTableSpecificRules(token: any, state: any): boolean {
  if (token.type !== 'StartTag') return false;
  const cur = currentNode(state);
  if (token.tagName === 'td' || token.tagName === 'th') {
    if (!cur || cur.tagName !== 'tr') {
      if (!cur || !TABLE_BODY_TAGS.includes(cur.tagName)) {
        insertHtmlElement(state, 'tbody');
      }
      insertHtmlElement(state, 'tr');
    }
    insertHtmlElement(state, token.tagName, token.attrs);
    return true;
  }
  if (token.tagName === 'tr') {
    if (!cur || !TABLE_BODY_TAGS.includes(cur.tagName)) {
      insertHtmlElement(state, 'tbody');
    }
    insertHtmlElement(state, token.tagName, token.attrs);
    return true;
  }
  return false;
}

export function dispatch5(token: any, state: any, log: (s: string) => void) {
  if (state.mode === 'in table') {
    if (inTableSpecificRules(token, state)) return;
    log('enable');
    state.fosterParentingEnabled = true;
    try {
      inBodyFosterAware(token, state);
    } finally {
      log('disable');
      state.fosterParentingEnabled = false;
    }
    return;
  }
  if (state.mode === 'in body') {
    return inBodyFosterAware(token, state);
  }
  return dispatch(token, state);
}
