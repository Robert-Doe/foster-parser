# Foster Parser — HTML5 Tree Construction Visualizer (web demo)

A small, real, interactive web app built on top of this repo's from-scratch
WHATWG-style HTML tree-construction engine (`track1-core/` Modules 00, 01,
02, 05, 07, 08, and 10).

`src/engine/` is a line-for-line port of the real course modules (tokens,
DOM node shapes, the tokenizer, the insertion-mode dispatch loop, the
two-condition foster-parenting gate, the adjusted-insertion-location
algorithm, what refuses fostering, in-table-text character buffering, and
active-formatting-element reconstruction) — CommonJS `require`/
`module.exports` rewritten to ES module `import`/`export`, with every line
of parsing logic unchanged. `src/engine/trace.ts` is this demo's own driver,
composing those real pieces the same way the repo's own `test/demo.js`
files do, recording a step-by-step trace instead of a single final printout.

## Safety & scope

This app is designed to be **publicly hosted**. It is 100% client-side:

- No backend, no database, no API that stores or relays visitor input.
- The optional "render this HTML for real" toggle renders the visitor's own
  input, in their own browser, inside a sandboxed
  `<iframe sandbox="allow-scripts">` (deliberately **without**
  `allow-same-origin`) via `srcdoc` — never a same-origin `src`. That
  confines any script execution to an opaque, cookie-less, storage-less
  sandboxed context with no access to this page's real DOM.
- No visitor's input is ever shown to, or executed for, any other visitor —
  there is no persistence and no shared payload gallery.

This mirrors the same safety model as PortSwigger's Web Security Academy and
Google's XSS game.

## Local development

```bash
cd webapp
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Type-checks (`tsc --noEmit`) then builds to `webapp/dist/`. Must succeed
with zero errors before deploying.

```bash
npm run preview
```

Serves the built `dist/` output locally for a final check.

## Deploying (static hosting)

Fully static — no backend, no environment variables.

**Vercel / Netlify / Cloudflare Pages**, using this repo as the source:

- Root directory: `webapp`
- Build command: `npm run build`
- Output directory: `dist`
