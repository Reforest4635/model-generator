# Model Generator — Home Assistant Add-on Repository

A Home Assistant add-on repository containing **Gridfinity Generator**, a
frontend-only parametric model generator (OpenSCAD-wasm + three.js) served
through HA ingress.

## Add to Home Assistant

**Settings → Add-ons → Add-on Store → ⋮ → Repositories**, then add:

```
https://github.com/Reforest4635/model-generator
```

Install **Gridfinity Generator**, start it, and click **Open Web UI**.

## Repository layout

```
repository.yaml            Add-on repository metadata (HA reads this)
gridfinity_generator/      The add-on
  config.yaml              Manifest (name, version, ingress)
  build.yaml               Per-arch HA base images
  Dockerfile               nginx serving the prebuilt site; CACHEBUST arg
  nginx.conf               Static server on :8099 (ingress target)
  run.sh                   Entrypoint
  DOCS.md                  User-facing docs (shown in HA)
  public/                  Prebuilt static site (SERVED — committed artifact)
app-src/                   Frontend source (Vite + openscad-wasm + three.js)
  src/…                    App code and models
  public/wasm/…            Vendored single-threaded openscad-wasm build
```

The add-on serves the **prebuilt** `gridfinity_generator/public/`. It does not
run `npm` inside Docker, so installs on a Pi stay fast. Rebuilding the frontend
is a maintainer step done before committing (below).

## Models

- **Simple Box** — a lightweight stackable bin (loads instantly).
- **Stacking Case (ours)** — our own closed case: plain baseplate floor + inset
  lid with side indent-and-latch stacking. `part` selector for base/lid.
- **Rugged Box (smkent)** — the full ribbed/latched/hinged rugged storage box.
  `Part` selector exports each piece; individual parts render in seconds, the
  assembled preview views take longer. Auto-render is off for this model.
- **Gridfinity Extended — …** — all 17 ostat entry points (bin, baseplate, tray,
  lid, drawers, item holder, etc.). The ~6 MB library is lazy-loaded on first use.

## How it works

- Real OpenSCAD compiled to WebAssembly (single-threaded **2025** build via the
  `openscad-wasm-prebuilt` package, wasm inlined) runs `.scad` → binary STL
  entirely in the browser.
- Renders use OpenSCAD's **Manifold** backend (`--backend=manifold`), ~10x faster
  than the CGAL default.
- The UI is generated from OpenSCAD **Customizer annotations** in each model, so
  adding a model needs no UI code. Heavy models can opt into manual render
  (`manualRender`) and default overrides (`paramDefaults`).
- Vite is built with `base: './'` (relative paths) for HA ingress.
- Single-threaded, self-contained wasm: no SharedArrayBuffer, no COOP/COEP.

## Credits & license

Third-party models are redistributed under their own licenses (see each folder's
`NOTICE.md` / `LICENSE`):

- **Gridfinity Extended** by **ostat** — GPL-3.0.
  `app-src/src/lib/gridfinity_extended/`
- **Gridfinity Rugged Storage Box** by **smkent** — CC-BY-SA-4.0, plus the
  **gridfinity-rebuilt** dependency by **kennetek** — MIT.
  `app-src/src/lib/rugged_box/`

GPL-3.0 and CC-BY-SA-4.0 are copyleft/share-alike: those terms carry through
wherever this repo is distributed. Worth a review before redistributing or
relicensing beyond personal/self-hosted use.

## Adding a model

1. Add an annotated `.scad` to `app-src/src/models/` (Customizer syntax:
   `/* [Group] */`, `// [min:max]`, `// [a,b,c]`).
2. Register it in `app-src/src/models/index.js`.
3. Rebuild and release (below).

Multi-file community libraries (e.g. Gridfinity Extended by ostat) are mounted
into the wasm filesystem via each model's `libs` map — see `app-src/README.md`.

## Release workflow

```bash
# 1. Build the frontend
cd app-src
npm install
npm run build

# 2. Copy the built site into the add-on
rm -rf ../gridfinity_generator/public
cp -r dist ../gridfinity_generator/public

# 3. Bump versions
#    - gridfinity_generator/config.yaml : version
#    - gridfinity_generator/Dockerfile  : ARG CACHEBUST

# 4. Commit and push to main
git add -A
git commit -m "Release vX.Y.Z"
git push origin main
```

In Home Assistant, open the add-on and click **Update** (or reinstall) to pull
the new build.
