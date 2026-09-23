// Foster Parser, HTML5 Tree Construction Visualizer
//
// Every insertion-mode transition, stack snapshot, and foster-parenting
// decision shown here comes from the REAL, unmodified tree-construction
// engine ported verbatim from this repo's track1-core/ course build
// (Modules 00, 01, 02, 05, 07, 08, 10, see src/engine/*.ts headers for the
// exact source file each was ported from). src/engine/trace.ts is this
// demo's own driver code, composing those real pieces the same way the
// repo's own module_10 demo.js does, just recording a step-by-step trace.
//
// SAFETY: this page is 100% client-side. The optional "render for real"
// toggle below renders the visitor's OWN input, in their OWN browser, inside
// a sandboxed <iframe sandbox="allow-scripts"> (no allow-same-origin) via
// srcdoc, never a same-origin src. No input is ever sent to a server,
// stored, logged, or shown to any other visitor.
import { runTrace, ensureBoilerplate, type TraceStep, type ParseResult } from './engine/trace.js';

const PRESETS: { label: string; html: string }[] = [
  {
    label: 'Classic: <b> fostered out of table',
    html: '<table><b>bold<tr><td>cell</td></tr></table>',
  },
  {
    label: 'Lost text before a table',
    html: '<table>lost text<tr><td>cell</td></tr></table>',
  },
  {
    label: 'Refuses fostering: hidden <input>/<form>',
    html: '<table><input type="hidden" name="x"><form>stray<tr><td>ok</td></tr></table>',
  },
];

const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="topbar">
    <div class="brand">foster-<span>parser</span></div>
    <nav>
      <a href="https://github.com/Robert-Doe/foster-parser" target="_blank" rel="noopener">GitHub</a>
      <a href="https://robertdoe.com" target="_blank" rel="noopener">&larr; robertdoe.com</a>
    </nav>
  </div>

  <section class="hero">
    <h1>HTML5 Tree Construction, <em>Fostered</em></h1>
    <p class="tagline">
      A real insertion-mode dispatch loop, the stack of open elements, foster
      parenting, active-formatting-element reconstruction, running live in
      your browser. Type malformed HTML and watch exactly where the spec relocates it.
    </p>
  </section>

  <main class="demo">
    <div class="panes">
      <div class="card">
        <h2>Input</h2>
        <p class="sub">Malformed HTML that lands inside a table gets "foster parented" &mdash; moved to just before the table.</p>
        <div class="preset-row" id="presets"></div>
        <textarea class="html-input" id="html-input" spellcheck="false"></textarea>
        <div class="btn-row">
          <button class="btn primary" id="btn-parse">Parse &rarr;</button>
        </div>
        <div id="notice-area"></div>
        <label class="toggle-row">
          <input type="checkbox" id="toggle-render" />
          Also render this HTML for real (sandboxed iframe)
        </label>
        <p class="sandbox-note">Sandboxed via <code>srcdoc</code> + <code>sandbox="allow-scripts"</code> (no <code>allow-same-origin</code>). No access to this page, your cookies, or storage.</p>
      </div>

      <div class="card">
        <div class="trace-header">
          <h2>Insertion-mode trace</h2>
          <div class="step-nav">
            <button class="btn small" id="btn-prev">&larr; Prev</button>
            <span id="step-counter">Step 0 / 0</span>
            <button class="btn small" id="btn-next">Next &rarr;</button>
          </div>
        </div>
        <p class="sub">One row per token the tokenizer emitted. Step through to watch the mode, the open-elements stack, and foster parenting fire.</p>
        <div class="trace-detail" id="trace-detail">Parse something to begin.</div>
      </div>
    </div>

    <div class="card">
      <div class="output-grid">
        <div>
          <h2>Final DOM tree</h2>
          <p class="sub">Inert diagram &mdash; not live DOM. Nodes marked <span class="fostered-flag">fostered</span> were relocated out of the table.</p>
          <div class="tree-box" id="final-tree"></div>
        </div>
        <div>
          <h2>Real render (sandboxed)</h2>
          <p class="sub">Toggle the checkbox to compare against your actual browser's parser.</p>
          <div class="iframe-shell" id="iframe-shell">
            <div class="iframe-placeholder">Sandboxed render is off.</div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer class="site">
    <p><span class="safety">Safety &amp; scope:</span> 100% client-side, no backend. Any live-rendered HTML runs only inside a sandboxed <code>&lt;iframe sandbox="allow-scripts"&gt;</code> via <code>srcdoc</code> (no <code>allow-same-origin</code>) &mdash; never persisted, never shown to other visitors, never sent anywhere. This mirrors PortSwigger's Web Security Academy / Google's XSS game.</p>
    <p>Real tree-construction engine ported verbatim from this repo's <code>track1-core/</code> course build (Modules 00, 01, 02, 05, 07, 08, 10). Built for <a href="https://robertdoe.com" target="_blank" rel="noopener">robertdoe.com</a>.</p>
  </footer>
`;

const presetsEl = document.getElementById('presets') as HTMLElement;
const inputEl = document.getElementById('html-input') as HTMLTextAreaElement;
const parseBtn = document.getElementById('btn-parse') as HTMLButtonElement;
const noticeArea = document.getElementById('notice-area') as HTMLElement;
const toggleRenderEl = document.getElementById('toggle-render') as HTMLInputElement;
const stepCounterEl = document.getElementById('step-counter') as HTMLElement;
const traceDetailEl = document.getElementById('trace-detail') as HTMLElement;
const prevBtn = document.getElementById('btn-prev') as HTMLButtonElement;
const nextBtn = document.getElementById('btn-next') as HTMLButtonElement;
const finalTreeEl = document.getElementById('final-tree') as HTMLElement;
const iframeShellEl = document.getElementById('iframe-shell') as HTMLElement;

let currentResult: ParseResult | null = null;
let currentStep = 0;
let lastEffectiveHtml = '';

for (const preset of PRESETS) {
  const btn = document.createElement('button');
  btn.className = 'btn small';
  btn.textContent = preset.label;
  btn.addEventListener('click', () => {
    inputEl.value = preset.html;
    parse();
  });
  presetsEl.appendChild(btn);
}

inputEl.value = PRESETS[0].html;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function parse() {
  const raw = inputEl.value;
  const { html, wrapped } = ensureBoilerplate(raw);
  lastEffectiveHtml = html;
  currentResult = runTrace(raw);
  currentStep = Math.max(0, currentResult.steps.length - 1);

  noticeArea.innerHTML = '';
  if (wrapped) {
    const n = document.createElement('div');
    n.className = 'notice';
    n.textContent = 'Auto-wrapped with <!DOCTYPE html><html><head></head><body> since the snippet omitted document structure.';
    noticeArea.appendChild(n);
  }
  if (currentResult.stopped) {
    const n = document.createElement('div');
    n.className = 'notice error';
    n.textContent = `Engine stopped: ${currentResult.stopReason}`;
    noticeArea.appendChild(n);
  }

  renderStep();
  renderFinalTree();
  if (toggleRenderEl.checked) renderSandbox();
}

function renderStep() {
  const steps = currentResult?.steps ?? [];
  stepCounterEl.textContent = `Step ${steps.length ? currentStep + 1 : 0} / ${steps.length}`;
  prevBtn.disabled = currentStep <= 0;
  nextBtn.disabled = currentStep >= steps.length - 1;

  if (!steps.length) {
    traceDetailEl.textContent = 'Nothing to show yet.';
    return;
  }
  const step: TraceStep = steps[currentStep];
  const modeChanged = step.modeBefore !== step.modeAfter;

  const stackChips = (labels: string[]) =>
    labels
      .map((tag, i) => `<span class="stack-chip ${i === labels.length - 1 ? 'top' : ''}">${escapeHtml(tag)}</span>`)
      .join('') || '<span class="stack-chip">(empty)</span>';

  traceDetailEl.innerHTML = `
    <div class="token-line">Token <span class="tok">${escapeHtml(step.tokenLabel)}</span></div>
    <div class="mode-transition">
      <span class="mode-chip">${escapeHtml(step.modeBefore)}</span>
      <span class="mode-arrow">&rarr;</span>
      <span class="mode-chip ${modeChanged ? 'changed' : ''}">${escapeHtml(step.modeAfter)}</span>
    </div>
    <div class="stack-row"><span class="stack-label">Stack before</span>${stackChips(step.stackBefore)}</div>
    <div class="stack-row"><span class="stack-label">Stack after</span>${stackChips(step.stackAfter)}</div>
    ${step.fosteredThisStep ? '<div class="fostered-flag">foster parenting fired on this token</div>' : ''}
    ${step.error ? `<div class="notice error" style="margin-top:10px;">${escapeHtml(step.error)}</div>` : ''}
  `;
}

function renderFinalTree() {
  if (!currentResult) {
    finalTreeEl.textContent = '';
    return;
  }
  finalTreeEl.innerHTML = currentResult.finalTreeLines
    .map((line) => {
      const fostered = line.includes('← fostered');
      return `<div class="${fostered ? 'fostered-line' : ''}">${escapeHtml(line)}</div>`;
    })
    .join('');
}

function renderSandbox() {
  iframeShellEl.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  // srcdoc, never `src` pointing at a same-origin URL, the sandboxed
  // document is fully opaque: no allow-same-origin means it cannot read
  // this page's cookies, storage, or DOM, and gets a fresh, unique origin.
  iframe.srcdoc = lastEffectiveHtml;
  iframeShellEl.appendChild(iframe);
}

prevBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    renderStep();
  }
});
nextBtn.addEventListener('click', () => {
  if (currentResult && currentStep < currentResult.steps.length - 1) {
    currentStep++;
    renderStep();
  }
});
parseBtn.addEventListener('click', parse);
toggleRenderEl.addEventListener('change', () => {
  if (toggleRenderEl.checked) {
    renderSandbox();
  } else {
    iframeShellEl.innerHTML = '<div class="iframe-placeholder">Sandboxed render is off.</div>';
  }
});

parse();
