// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/01_stack_and_dispatch/src/tokenizer.js in this repo.
// A minimal, hand-rolled tokenizer for the well-formed HTML subset this
// engine's test cases use.
import { doctypeToken, startTagToken, endTagToken, commentToken, characterToken, eofToken } from './tokens.js';

export function tokenize(input: string) {
  const tokens: any[] = [];
  let i = 0;
  const n = input.length;

  function emitCharacterRun(text: string) {
    for (const ch of text) tokens.push(characterToken(ch));
  }

  while (i < n) {
    if (input[i] !== '<') {
      const next = input.indexOf('<', i);
      const end = next === -1 ? n : next;
      emitCharacterRun(input.slice(i, end));
      i = end;
      continue;
    }

    if (input.startsWith('<!--', i)) {
      const close = input.indexOf('-->', i + 4);
      const stop = close === -1 ? n : close;
      tokens.push(commentToken(input.slice(i + 4, stop)));
      i = close === -1 ? n : close + 3;
      continue;
    }

    if (/^<!doctype/i.test(input.slice(i, i + 9))) {
      const close = input.indexOf('>', i);
      const stop = close === -1 ? n : close;
      const body = input.slice(i + 9, stop).trim();
      const name = body.length ? body.split(/\s+/)[0].toLowerCase() : null;
      tokens.push(doctypeToken(name));
      i = close === -1 ? n : close + 1;
      continue;
    }

    if (input[i + 1] === '/') {
      const close = input.indexOf('>', i);
      const stop = close === -1 ? n : close;
      const tagName = input.slice(i + 2, stop).trim().split(/\s+/)[0].toLowerCase();
      tokens.push(endTagToken(tagName));
      i = close === -1 ? n : close + 1;
      continue;
    }

    if (/^[a-zA-Z]/.test(input[i + 1] || '')) {
      const close = findTagEnd(input, i);
      const raw = input.slice(i + 1, close);
      const { tagName, attrs, selfClosing } = parseStartTag(raw);
      tokens.push(startTagToken(tagName, attrs, selfClosing));
      i = close + 1;
      continue;
    }

    tokens.push(characterToken('<'));
    i += 1;
  }

  tokens.push(eofToken());
  return tokens;
}

function findTagEnd(input: string, start: number): number {
  let i = start + 1;
  let quote: string | null = null;
  while (i < input.length) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '>') {
      return i;
    }
    i += 1;
  }
  return input.length;
}

function parseStartTag(raw: string): { tagName: string; attrs: [string, string][]; selfClosing: boolean } {
  let body = raw;
  let selfClosing = false;
  if (body.trimEnd().endsWith('/')) {
    selfClosing = true;
    body = body.trimEnd().slice(0, -1);
  }
  const firstSpace = body.search(/\s/);
  const tagName = (firstSpace === -1 ? body : body.slice(0, firstSpace)).trim().toLowerCase();
  const attrSource = firstSpace === -1 ? '' : body.slice(firstSpace);

  const attrRe = /([^\s="'>/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|[^\s"'=<>`]+))?/g;
  const attrs: [string, string][] = [];
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(attrSource))) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? m[2] ?? '';
    if (!attrs.some(([k]) => k === name)) attrs.push([name, value]);
  }
  return { tagName, attrs, selfClosing };
}
