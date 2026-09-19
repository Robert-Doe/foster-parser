// Ported verbatim (CommonJS -> ES module syntax only; logic unchanged) from
// track1-core/00_tokens_and_nodes/src/tokens.js in this repo.
// The six token shapes a tokenizer can emit. See prerequisites/prereq_tokens.html.

export function doctypeToken(name: string | null, publicId: string | null = null, systemId: string | null = null, forceQuirks = false) {
  return { type: 'DOCTYPE', name, publicId, systemId, forceQuirks };
}

export function startTagToken(tagName: string, attrs: [string, string][] = [], selfClosing = false) {
  return { type: 'StartTag', tagName, attrs: new Map(attrs), selfClosing };
}

export function endTagToken(tagName: string) {
  return { type: 'EndTag', tagName };
}

export function commentToken(data: string) {
  return { type: 'Comment', data };
}

export function characterToken(data: string) {
  if (data.length !== 1) {
    throw new RangeError(
      `characterToken() takes exactly one character, got ${JSON.stringify(data)} ` +
      `(length ${data.length}). The tokenizer never batches characters into a token — ` +
      'see prerequisites/prereq_tokens.html and Track 1 Module 08.'
    );
  }
  return { type: 'Character', data };
}

export function eofToken() {
  return { type: 'EOF' };
}

export function characterTokens(text: string) {
  return Array.from(text).map(characterToken);
}

export function tokenToString(token: any): string {
  switch (token.type) {
    case 'DOCTYPE':
      return `DOCTYPE(${token.name ?? ''})`;
    case 'StartTag': {
      const attrStr = [...token.attrs.entries()].map(([k, v]: [string, string]) => ` ${k}="${v}"`).join('');
      return `<${token.tagName}${attrStr}${token.selfClosing ? ' /' : ''}>`;
    }
    case 'EndTag':
      return `</${token.tagName}>`;
    case 'Comment':
      return `<!--${token.data}-->`;
    case 'Character':
      return JSON.stringify(token.data);
    case 'EOF':
      return 'EOF';
    default:
      throw new Error(`Unknown token type: ${token.type}`);
  }
}
