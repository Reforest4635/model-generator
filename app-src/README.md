# Gridfinity Generator — frontend

Frontend-only parametric generator: parameter panel → live 3D preview → STL
download, running real OpenSCAD in the browser. No backend.

## Stack

- **Vite** static build (`base: './'` — works from any subpath, incl. HA ingress)
- **openscad-wasm-prebuilt** — a single-threaded OpenSCAD **2025** build with the
  wasm inlined into one JS file. Self-contained (no separate `.wasm` fetch, no
  SharedArrayBuffer, so no COOP/COEP headers needed). Imported dynamically so it
  lands in its own lazy chunk.
- **three.js** viewer (OrbitControls + STLLoader)
- UI auto-generated from **OpenSCAD Customizer annotations** in each model.
- Renders use **`--backend=manifold`** (~10x faster than the CGAL default).

## Files

```
src/
  main.js            wires everything; debounced auto-render
  openscad-runner.js fresh wasm instance per render; mounts files; -D defines
  customizer.js      parses annotations (incl. vectors + ostat <!!start/end!!>)
  param-ui.js        sliders/checkboxes/dropdowns/spinners/vectors from schema
  viewer.js          three.js scene (Z-up -> Y-up)
  models/
    index.js         model registry (lazy loadFiles + entry path)
    gridfinity-box.scad
  lib/
    gfext-bundle.js               one lazy chunk for the whole library
    gridfinity_extended/…         vendored ostat library (GPL-3.0, see NOTICE.md)
```

Each render spins up a fresh OpenSCAD instance (its runtime can't be re-run),
writes the model's files into the virtual FS, and runs
`entry --backend=manifold -D … -o /out.stl`.

## Models

A model in `src/models/index.js`:

```js
{
  id: 'my-model',
  name: 'My Model',
  entry: '/model.scad',                       // path to compile in the FS
  loadFiles: async () => ({ '/model.scad': src }), // FS contents (lazy)
  note: 'optional hint shown in the panel',
}
```

- **Single-file model:** add an annotated `.scad` to `src/models/`, import it
  `?raw`, and return `{ '/model.scad': src }` from `loadFiles`.
- **Library-backed model** (like the extended bin): keep the library under
  `src/lib/<name>/`, add a small bundle module that eagerly globs it into one
  lazy chunk, and have `loadFiles` dynamically import that bundle. The `entry`
  points at the library's entry `.scad`; `include<>`/`use<>` resolve because the
  whole tree is mounted.

### Customizer annotations understood

```openscad
/* [Group] */          // section
/* [Hidden] */         // hide following vars
w = 30;    // [10:100]           slider
w = 30;    // [10:0.5:100]       stepped slider
s = "a";   // [a, b, c]          dropdown (labels: [a:"Nice A", b])
on = true;                       checkbox
n = 3;     // 0.1                spinner with step
v = [2,0]; // 0.1                vector of numbers (one input per element)
```

If a file has ostat `/*<!!start …!!>*/ … /*<!!end …!!>*/` markers, only that
region is parsed.

## Adding more Gridfinity Extended entry points

The whole ostat library is already vendored, so exposing another entry point
(baseplate, drawers, item holder, …) is just another `MODELS` entry with the
matching `entry` path — no new files needed. Validate render time first; some
are heavier than the basic cup.
