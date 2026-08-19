// openscad-runner.js
// Runs OpenSCAD in the browser via the `openscad-wasm-prebuilt` package: a
// single-threaded OpenSCAD 2025 build with the wasm inlined into one JS file
// (so it's fully self-contained — no separate .wasm fetch, no SharedArrayBuffer,
// no COOP/COEP headers needed, which is exactly what Home Assistant ingress
// wants). We import it dynamically so it lands in its own lazy chunk.
//
// Each render uses a FRESH instance: OpenSCAD's runtime can't be re-run (a second
// callMain throws), and re-instantiating the module is cheap next to the render.
// Renders use --backend=manifold, which is ~10x faster than the CGAL default.

// Format a JS value as an OpenSCAD -D define.
function formatDefine(name, value, type) {
  if (type === 'bool') return `${name}=${value ? 'true' : 'false'}`;
  if (type === 'string') return `${name}="${String(value).replace(/"/g, '\\"')}"`;
  if (type === 'vector') return `${name}=[${value.join(',')}]`;
  return `${name}=${value}`; // number
}

function mkdirp(FS, dir) {
  let cur = '';
  for (const part of dir.split('/').filter(Boolean)) {
    cur += '/' + part;
    try {
      FS.mkdir(cur);
    } catch (_) {
      /* exists */
    }
  }
}

/**
 * Compile a model to a binary STL.
 * @param {Object} model
 * @param {Object} model.files  { '/path/in/fs.scad': '<contents>' } — everything
 *                              needed on the virtual FS, including libraries.
 * @param {string} model.entry  path of the .scad to compile (a key in files).
 * @param {Array}  params        [{ name, value, type }] overrides via -D.
 * @returns {Promise<{ stl: Uint8Array, log: string }>}
 */
export async function renderStl(model, params = []) {
  const { createOpenSCAD } = await import('openscad-wasm-prebuilt');

  const log = [];
  const sc = await createOpenSCAD({
    noInitialRun: true,
    print: (t) => log.push(t),
    printErr: (t) => log.push(t),
  });
  const inst = sc.getInstance();
  const FS = inst.FS;

  for (const [path, contents] of Object.entries(model.files)) {
    const dir = path.slice(0, path.lastIndexOf('/'));
    if (dir) mkdirp(FS, dir);
    FS.writeFile(path, contents);
  }

  const args = [model.entry, '--backend=manifold', '--export-format=binstl'];
  for (const p of params) args.push('-D', formatDefine(p.name, p.value, p.type));
  args.push('-o', '/out.stl');

  let rc;
  try {
    rc = inst.callMain(args);
  } catch (e) {
    throw new Error(`OpenSCAD crashed\n${log.slice(-6).join('\n')}`);
  }
  if (rc !== 0) throw new Error(`OpenSCAD exited ${rc}\n${log.slice(-6).join('\n')}`);

  const stl = FS.readFile('/out.stl'); // Uint8Array
  return { stl, log: log.join('\n') };
}

// Warm the lazy chunk so the first render isn't waiting on the download.
export function warmUp() {
  import('openscad-wasm-prebuilt').catch(() => {});
}
