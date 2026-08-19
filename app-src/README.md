# Gridfinity Generator

A frontend-only parametric model generator, like the Perplexing Labs one:
parameter panel → live 3D preview → STL download. Runs **real OpenSCAD** in the
browser via `openscad-wasm`, renders with three.js, and has **no backend** — so
it drops straight into Home Assistant under `/config/www/`.

## Stack

- **Vite** static build (`base: './'` — works from any subpath)
- **openscad-wasm** single-threaded build (release `2022.03.20`), vendored in
  `public/wasm/`. Single-threaded on purpose: no SharedArrayBuffer, so it needs
  no COOP/COEP headers — which HA's static server can't set anyway.
- **three.js** viewer (OrbitControls + STLLoader)
- Auto-generated UI from **OpenSCAD Customizer annotations** — any annotated
  `.scad` gets a parameter panel for free.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
```

## How it fits together

```
src/
  main.js            wires everything; debounced auto-render on slider drag
  openscad-runner.js loads the wasm, writes model.scad, runs -D defines -> binstl
  customizer.js      parses /* [Group] */ and // [min:max] annotations -> schema
  param-ui.js        builds sliders/checkboxes/dropdowns from the schema
  viewer.js          three.js scene; re-frames camera per model (Z-up -> Y-up)
  models/
    index.js         model registry (imports .scad with ?raw)
    gridfinity-box.scad
public/wasm/         openscad.js + openscad.wasm.js + openscad.wasm (vendored)
```

## Adding a model

1. Drop an annotated `.scad` into `src/models/`. Use Customizer syntax so the UI
   builds itself:

   ```openscad
   /* [Size] */
   width = 30;      // [10:100]
   depth = 20;      // [10:0.5:100]
   style = "round"; // [round, square]
   with_lid = true;

   /* [Hidden] */
   $fn = 48;
   ```

2. Register it in `src/models/index.js`:

   ```js
   import myModel from './my-model.scad?raw';
   export const MODELS = [
     { id: 'my-model', name: 'My Model', source: myModel, libs: {} },
     // ...
   ];
   ```

### Multi-file libraries (e.g. Gridfinity Extended by ostat)

If a model uses `include <...>` / `use <...>`, import each dependency as `?raw`
and mount it via `libs` — the paths become files in the wasm filesystem:

```js
import model from './rugged-box.scad?raw';
import gfLib from './lib/gridfinity.scad?raw';

export const MODELS = [{
  id: 'rugged-box', name: 'Rugged Box', source: model,
  libs: { '/rugged-box/gridfinity.scad': gfLib },  // match the include<> path
}];
```

The runner writes every `libs` entry into the virtual FS before compiling, so
`include <gridfinity.scad>` resolves. Deep dependency trees just need every file
mounted at the path the `include`/`use` lines expect.

## Deploy to Home Assistant

The whole thing is static files, and anything under `/config/www/` is served at
`/local/` **without HA authentication**, so no add-on or auth plumbing is needed.

```bash
npm run build
# copy the build output into HA config
cp -r dist/* /config/www/gridfinity/
```

Then add a **Webpage** card (or a dashboard panel) pointing at:

```
/local/gridfinity/index.html
```

Because `base: './'` makes all paths relative, `index.html`, the JS/CSS, and
`wasm/openscad.wasm` all resolve correctly under `/local/gridfinity/`. The first
render fetches the ~7.7 MB `openscad.wasm` once; the browser caches it after.

## Notes / gotchas

- **STL export uses binary STL** (`--export-format=binstl`) — smaller and faster
  to parse than ASCII.
- **Preview vs. final:** this renders true CGAL geometry to STL (not a preview
  mesh), so what you see is what you slice.
- **Colors:** STL carries no color; the viewer tint is cosmetic. (Matches the
  known CGAL-flattens-color behavior — irrelevant here since we export geometry.)
- **Updating openscad-wasm:** keep using a *single-threaded* release. Threaded
  builds ship an `openscad.worker.js` and need SharedArrayBuffer + COOP/COEP,
  which the HA static server won't provide.
- The `warmUp()` call in `main.js` starts fetching the wasm on page load so the
  first Render isn't waiting on the download.
```
