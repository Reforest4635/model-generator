// main.js
import './style.css';
import { MODELS, getModel } from './models/index.js';
import { parseCustomizer, collectValues } from './customizer.js';
import { buildParamUI } from './param-ui.js';
import { renderStl, warmUp } from './openscad-runner.js';
import { Viewer } from './viewer.js';

const els = {
  select: document.getElementById('model-select'),
  params: document.getElementById('params'),
  render: document.getElementById('render-btn'),
  export: document.getElementById('export-btn'),
  status: document.getElementById('status'),
  viewer: document.getElementById('viewer'),
};

const viewer = new Viewer(els.viewer);
warmUp(); // start fetching the wasm immediately

let model = null;
let schema = null;
let lastStl = null;
let rendering = false;
let dirty = true;

// Populate model dropdown
for (const m of MODELS) {
  const o = document.createElement('option');
  o.value = m.id;
  o.textContent = m.name;
  els.select.appendChild(o);
}

async function loadModel(id) {
  model = getModel(id);
  els.params.innerHTML = '<p class="hint">Loading model…</p>';
  els.render.disabled = true;
  els.export.disabled = true;
  try {
    model.files = await model.loadFiles();
    model.source = model.files[model.entry];
  } catch (err) {
    console.error(err);
    els.params.innerHTML = '<p class="hint">Failed to load model.</p>';
    return;
  }
  schema = parseCustomizer(model.source);
  // Apply any per-model default overrides (e.g. a lighter default Part).
  if (model.paramDefaults) {
    for (const grp of schema.groups)
      for (const p of grp.params)
        if (p.name in model.paramDefaults) p.value = model.paramDefaults[p.name];
  }
  buildParamUI(els.params, schema, () => {
    dirty = true;
    if (!model.manualRender) scheduleRender(); // manual models render on click only
  });
  if (model.note) {
    const n = document.createElement('p');
    n.className = 'hint model-note';
    n.textContent = model.note;
    els.params.prepend(n);
  }
  els.render.disabled = false;
  dirty = true;
  render();
}

// Debounced auto-render as the user drags sliders.
let timer = null;
function scheduleRender() {
  clearTimeout(timer);
  timer = setTimeout(render, 500);
}

async function render() {
  if (rendering) {
    dirty = true;
    return;
  }
  rendering = true;
  dirty = false;
  setStatus('Rendering…');
  els.render.disabled = true;
  try {
    const values = collectValues(schema);
    const { stl } = await renderStl(model, values);
    lastStl = stl;
    viewer.showStl(stl);
    const tris = new DataView(stl.buffer, stl.byteOffset).getUint32(80, true);
    setStatus(`Done — ${tris.toLocaleString()} triangles, ${(stl.length / 1024).toFixed(0)} KB`);
    els.export.disabled = false;
  } catch (err) {
    console.error(err);
    setStatus('Error: ' + (err.message || err).split('\n')[0]);
  } finally {
    rendering = false;
    els.render.disabled = false;
    if (dirty) scheduleRender(); // a change landed mid-render
  }
}

function download() {
  if (!lastStl) return;
  const blob = new Blob([lastStl], { type: 'model/stl' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${model.id}.stl`;
  a.click();
  URL.revokeObjectURL(url);
}

function setStatus(t) {
  els.status.textContent = t;
}

els.select.addEventListener('change', () => loadModel(els.select.value));
els.render.addEventListener('click', render);
els.export.addEventListener('click', download);

loadModel(MODELS[0].id);
