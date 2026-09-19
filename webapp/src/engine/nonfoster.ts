// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/07_what_refuses/src/nonfoster.js in this repo.
// "in table"'s explicitly-handled cases that intercept a token BEFORE the
// anything-else/foster-parenting fallback is ever consulted.
import { insertHtmlElement, currentNode } from './dispatch.js';
import { insertNode, CommentNode } from './nodes.js';

export function inTableRefusesFostering(token: any, state: any): boolean {
  if (token.type === 'StartTag' && ['style', 'script', 'template'].includes(token.tagName)) {
    insertHtmlElement(state, token.tagName, token.attrs);
    return true;
  }
  if (token.type === 'EndTag' && ['style', 'script', 'template'].includes(token.tagName)) {
    const cur = currentNode(state);
    if (cur && cur.tagName === token.tagName) state.stack.pop();
    return true;
  }
  if (token.type === 'StartTag' && token.tagName === 'input') {
    const type = (token.attrs.get('type') || '').toLowerCase();
    if (type === 'hidden') {
      insertHtmlElement(state, token.tagName, token.attrs);
      state.stack.pop();
      return true;
    }
    return false;
  }
  if (token.type === 'StartTag' && token.tagName === 'form') {
    insertHtmlElement(state, token.tagName, token.attrs);
    state.stack.pop();
    return true;
  }
  if (token.type === 'Comment') {
    insertNode(currentNode(state), new CommentNode(token.data));
    return true;
  }
  if (token.type === 'DOCTYPE') {
    return true;
  }
  return false;
}
