// This file is the visualizer's own driver, it is NOT a ported course
// module. It composes the real, unmodified engine pieces (tokenizer.ts,
// dispatch10.ts, formatting.ts, nodes.ts) exactly the way this repo's own
// module_10 demo.js does, but records a step-by-step trace instead of just
// printing a final tree, and tags fostered nodes via nodes.ts's insert hook.
import { tokenize } from './tokenizer.js';
import { createParserState10, dispatch10 } from './dispatch10.js';
import { setInsertHook, renderTree, describeNode } from './nodes.js';
import { setFosterHook } from './location.js';
import { tokenToString } from './tokens.js';

export type TraceStep = {
  index: number;
  tokenLabel: string;
  modeBefore: string;
  modeAfter: string;
  stackBefore: string[];
  stackAfter: string[];
  treeLines: string[];
  fosteredThisStep: boolean;
  error?: string;
};

export type ParseResult = {
  steps: TraceStep[];
  finalTreeLines: string[];
  stopped: boolean;
  stopReason?: string;
  fosteredCount: number;
};

// If the visitor's snippet doesn't already declare <html>, this engine's
// "in head" mode has no fallback for an unexpected start tag (by design,
// see track1-core/01_stack_and_dispatch's DECISIONS.md) and would throw
// before ever reaching the table content the demo is about. Auto-wrapping
// with the minimal boilerplate a real browser would imply keeps casual
// fragments (like the classic `<table><b>bold<tr>...` example) working,
// without changing how the engine itself behaves.
export function ensureBoilerplate(html: string): { html: string; wrapped: boolean } {
  if (/<html[\s>]/i.test(html)) return { html, wrapped: false };
  return { html: `<!DOCTYPE html><html><head></head><body>${html}`, wrapped: true };
}

export function runTrace(rawHtml: string): ParseResult {
  const { html } = ensureBoilerplate(rawHtml);
  const tokens = tokenize(html);
  const state = createParserState10();

  const fosteredNodes = new WeakSet<object>();
  // lastInsertWasFostered reflects the REAL per-insert decision made inside
  // location.ts's getAdjustedInsertionLocation (step 2 vs. step 3 of
  // "appropriate place for inserting a node"), not merely whether
  // state.fosterParentingEnabled happened to be true when this token was
  // processed. Those differ, e.g. for characters buffered while fostering
  // is enabled but whose current node is a <td>, which insert ordinarily.
  let lastInsertWasFostered = false;
  setFosterHook((didFoster) => {
    lastInsertWasFostered = didFoster;
  });
  setInsertHook((node) => {
    if (lastInsertWasFostered) fosteredNodes.add(node);
    // Consume once: an insert (or fuse) that ISN'T preceded by its own
    // getAdjustedInsertionLocation call (e.g. the plain insertHtmlElement
    // path used for implied <tbody>/<tr>) must never inherit a stale
    // decision left over from an unrelated, earlier fostered insertion.
    lastInsertWasFostered = false;
  });

  // `log` is the pre-existing instrumentation parameter dispatch10/tabletext
  // already accept in this repo's own source (dispatch10.js calls
  // log('enable')/log('disable') around the fostering-enabled window), kept
  // as a no-op sink here since this visualizer derives fostering from the
  // finer-grained hook above instead.
  const log = (_which: 'enable' | 'disable') => {};

  const steps: TraceStep[] = [];
  let stopped = false;
  let stopReason: string | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'EOF') {
      // This engine has no "after body"/"after html" modes, EOF is where a
      // real spec would still have work to do, but this course's engine
      // intentionally stops modeling behavior here (see dispatch.js
      // DECISIONS.md). Treat it as a clean end of trace, not an error.
      break;
    }

    const modeBefore = state.mode;
    const stackBefore = state.stack.map((n: any) => n.tagName);
    const fosteredBeforeCount = countFostered(state.document, fosteredNodes);

    try {
      dispatch10(token, state, log);
    } catch (err: any) {
      steps.push({
        index: i,
        tokenLabel: tokenToString(token),
        modeBefore,
        modeAfter: state.mode,
        stackBefore,
        stackAfter: state.stack.map((n: any) => n.tagName),
        treeLines: renderTree(state.document),
        fosteredThisStep: false,
        error: err && err.message ? err.message : String(err),
      });
      stopped = true;
      stopReason = err && err.message ? err.message : String(err);
      break;
    }

    const fosteredAfterCount = countFostered(state.document, fosteredNodes);

    steps.push({
      index: i,
      tokenLabel: tokenToString(token),
      modeBefore,
      modeAfter: state.mode,
      stackBefore,
      stackAfter: state.stack.map((n: any) => n.tagName),
      treeLines: renderTree(state.document),
      fosteredThisStep: fosteredAfterCount > fosteredBeforeCount,
    });
  }

  setInsertHook(null);
  setFosterHook(null);

  return {
    steps,
    finalTreeLines: renderTreeWithFosterMarks(state.document, fosteredNodes),
    stopped,
    stopReason,
    fosteredCount: countFostered(state.document, fosteredNodes),
  };
}

function countFostered(root: any, fostered: WeakSet<object>): number {
  let count = 0;
  (function walk(node: any) {
    if (fostered.has(node)) count++;
    for (const child of node.children ?? []) walk(child);
  })(root);
  return count;
}

// A tree renderer that annotates each line with whether ITS node was
// fostered, built for this visualizer (mirrors nodes.ts's renderTree
// connector shape exactly) since the ported renderTree has no reason to
// know about foster-parenting bookkeeping.
export function renderTreeWithFosterMarks(node: any, fostered: WeakSet<object>, prefix = '', isLast = true, isRoot = true): string[] {
  const lines: string[] = [];
  const label = describeNode(node);
  const marked = fostered.has(node) ? `${label}  ← fostered` : label;
  if (isRoot) {
    lines.push(marked);
  } else {
    lines.push(prefix + (isLast ? '└─ ' : '├─ ') + marked);
  }
  const childPrefix = isRoot ? '' : prefix + (isLast ? '   ' : '│  ');
  const children = node.children ?? [];
  children.forEach((child: any, i: number) => {
    lines.push(...renderTreeWithFosterMarks(child, fostered, childPrefix, i === children.length - 1, false));
  });
  return lines;
}
