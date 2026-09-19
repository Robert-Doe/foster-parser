// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/01_stack_and_dispatch/src/dispatch.js in this repo.
// The insertion-mode dispatch loop (Prerequisite P4): initial through in body,
// switching into "in table" — everything "in table" itself does starts in
// later modules (foster.js / location.js / dispatch5.js / dispatch10.js).
import { ElementNode, DocumentNode, TextNode, insertNode, tryFuseCharacter } from './nodes.js';

export class NotImplementedYet extends Error {
  mode: string;
  token: any;
  constructor(mode: string, token: any) {
    super(
      `Insertion mode "${mode}" has no rules yet in this engine (token: ${token.type}` +
      `${token.tagName ? ' ' + token.tagName : ''}). This engine currently implements ` +
      'modes through Module 01 (initial…in body, switching into "in table"). Reaching ' +
      'this error means the dispatch loop correctly reached the mode — its own rules ' +
      'are built starting in a later module.'
    );
    this.mode = mode;
    this.token = token;
  }
}

export function createParserState() {
  return { document: new DocumentNode(), stack: [] as any[], mode: 'initial' };
}

export function currentNode(state: any) {
  return state.stack[state.stack.length - 1];
}

export function insertHtmlElement(state: any, tagName: string, attrs: Map<string, string> = new Map()) {
  const parent = state.stack.length ? currentNode(state) : state.document;
  const el = new ElementNode(tagName);
  for (const [k, v] of attrs) el.attrs.set(k, v);
  insertNode(parent, el);
  state.stack.push(el);
  return el;
}

export function insertCharacter(state: any, data: string) {
  const parent = currentNode(state);
  if (!tryFuseCharacter(parent, data)) {
    insertNode(parent, new TextNode(data));
  }
}

export const MODES: Record<string, (token: any, state: any) => void> = {
  initial(token, state) {
    if (token.type === 'DOCTYPE') {
      state.mode = 'before html';
      return;
    }
    state.mode = 'before html';
    dispatch(token, state);
  },

  'before html'(token, state) {
    if (token.type === 'StartTag' && token.tagName === 'html') {
      insertHtmlElement(state, token.tagName, token.attrs);
      state.mode = 'before head';
      return;
    }
    insertHtmlElement(state, 'html');
    state.mode = 'before head';
    dispatch(token, state);
  },

  'before head'(token, state) {
    if (token.type === 'StartTag' && token.tagName === 'head') {
      insertHtmlElement(state, token.tagName, token.attrs);
      state.mode = 'in head';
      return;
    }
    insertHtmlElement(state, 'head');
    state.mode = 'in head';
    dispatch(token, state);
  },

  'in head'(token, state) {
    if (token.type === 'EndTag' && token.tagName === 'head') {
      state.stack.pop();
      state.mode = 'after head';
      return;
    }
    if (token.type === 'Character' && /\s/.test(token.data)) {
      insertCharacter(state, token.data);
      return;
    }
    throw new NotImplementedYet('in head', token);
  },

  'after head'(token, state) {
    if (token.type === 'StartTag' && token.tagName === 'body') {
      insertHtmlElement(state, token.tagName, token.attrs);
      state.mode = 'in body';
      return;
    }
    throw new NotImplementedYet('after head', token);
  },

  'in body'(token, state) {
    if (token.type === 'Character') {
      insertCharacter(state, token.data);
      return;
    }
    if (token.type === 'StartTag' && token.tagName === 'table') {
      insertHtmlElement(state, token.tagName, token.attrs);
      state.mode = 'in table';
      return;
    }
    throw new NotImplementedYet('in body', token);
  },
};

export function dispatch(token: any, state: any) {
  const handler = MODES[state.mode];
  if (!handler) throw new NotImplementedYet(state.mode, token);
  handler(token, state);
}
