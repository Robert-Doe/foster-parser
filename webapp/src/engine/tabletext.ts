// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/08_in_table_text/src/tabletext.js in this repo.
// "in table text": buffer character tokens arriving one at a time; decide,
// once, over the whole run, whether to foster them or insert them ordinarily.
import { insertCharacterAtAppropriatePlace } from './location.js';

const ASCII_WHITESPACE = /[ \t\n\f\r]/;

export function enterInTableText(state: any) {
  state.pendingCharacters = [];
  state.originalMode = state.mode;
  state.mode = 'in table text';
}

export function handleInTableText(
  token: any,
  state: any,
  log: (s: string) => void,
  dispatchFn: (token: any, state: any, log: (s: string) => void) => void,
  insertChar: (state: any, ch: string) => void = insertCharacterAtAppropriatePlace
) {
  if (token.type === 'Character') {
    state.pendingCharacters.push(token.data);
    return;
  }

  const pending: string[] = state.pendingCharacters;
  const hasNonWhitespace = pending.some((ch) => !ASCII_WHITESPACE.test(ch));

  if (hasNonWhitespace) {
    log('enable');
    state.fosterParentingEnabled = true;
    try {
      for (const ch of pending) insertChar(state, ch);
    } finally {
      log('disable');
      state.fosterParentingEnabled = false;
    }
  } else {
    for (const ch of pending) insertChar(state, ch);
  }

  state.pendingCharacters = [];
  state.mode = state.originalMode;
  return dispatchFn(token, state, log);
}
