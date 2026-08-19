// openscad-runner.js
// Thin wrapper around the single-threaded openscad-wasm build (release 2022.03.20).
// The three files (openscad.js / openscad.wasm.js / openscad.wasm) live in
// public/wasm/ and are served verbatim. We load them via a RUNTIME URL derived
// from document.baseURI so the app works from any subpath (web root, or HA's
// /local/<dir>/). We must NOT let Vite rewrite this import, hence @vite-ignore.

let instancePromise = null;

// Resolve public/wasm/ relative to wherever the page is actually served from.
function wasmBase() {
  return new URL('wasm/', document.baseURI).href;
}

// Load the OpenSCAD module once and reuse it. The wrapper sets noInitialRun and
// exposes FS + callMain. Because the runtime keeps global state between runs, we
// reload a fresh module per render to avoid FS/name collisions (cheap after the
// wasm is cached by the browser).
async function loadModule() {
  const base = wasmBase();
  // openscad.js is an ES module wrapper; its internal import.meta.url points at
  // /wasm/openscad.js, so it finds openscad.wasm.js and openscad.wasm alongside.
  const { default: OpenSCAD } = await import(/* @vite-ignore */ base + 'openscad.js');
  const scratch = [];
  const mod = await OpenSCAD({
    noInitialRun: true,
    print: (t) => scratch.push(t),
    printErr: (t) => scratch.push(t),
  });
  mod.__log = scratch;
  return mod;
}

// Format a JS value as an OpenSCAD -D define.
function formatDefine(name, value, type) {
  if (type === 'bool') return `${name}=${value ? 'true' : 'false'}`;
  if (type === 'string') return `${name}="${String(value).replace(/"/g, '\\"')}"`;
  // number (int or float)
  return `${name}=${value}`;
}

/**
 * Compile a .scad source string into a binary STL.
 * @param {string} source        The .scad file contents.
 * @param {Array}  params         [{ name, value, type }] parameter overrides.
 * @param {Object} [extraFiles]   { '/lib/foo.scad': '<contents>' } to mount for
 *                                include/use of community libraries.
 * @returns {Promise<{ stl: Uint8Array, log: string }>}
 */
export async function renderStl(source, params = [], extraFiles = {}) {
  const mod = await loadModule();

  // Write any library files first so include<>/use<> resolve.
  for (const [path, contents] of Object.entries(extraFiles)) {
    const dir = path.slice(0, path.lastIndexOf('/'));
    if (dir) mkdirp(mod, dir);
    mod.FS.writeFile(path, contents);
  }

  mod.FS.writeFile('/model.scad', source);

  const args = ['/model.scad', '--export-format=binstl'];
  for (const p of params) {
    args.push('-D', formatDefine(p.name, p.value, p.type));
  }
  // Search paths so mounted libraries are found.
  args.push('-o', '/out.stl');

  const rc = mod.callMain(args);
  const log = (mod.__log || []).join('\n');
  if (rc !== 0) {
    throw new Error(`OpenSCAD exited with code ${rc}\n${log}`);
  }
  const stl = mod.FS.readFile('/out.stl'); // Uint8Array
  return { stl, log };
}

function mkdirp(mod, dir) {
  const parts = dir.split('/').filter(Boolean);
  let cur = '';
  for (const part of parts) {
    cur += '/' + part;
    try {
      mod.FS.mkdir(cur);
    } catch (_) {
      /* already exists */
    }
  }
}

// Optional warm-up: kick off the wasm fetch early so the first Render is snappy.
export function warmUp() {
  if (!instancePromise) instancePromise = loadModule().catch(() => null);
}
