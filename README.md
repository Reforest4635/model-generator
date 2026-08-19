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

## How it works

- Real OpenSCAD compiled to WebAssembly (single-threaded release `2022.03.20`)
  runs `.scad` → binary STL entirely in the browser.
- The UI is generated from OpenSCAD **Customizer annotations** in each model, so
  adding a model needs no UI code.
- Vite is built with `base: './'` (relative paths), which is exactly what HA
  ingress needs — ingress strips its path prefix and the app resolves assets and
  the wasm binary relative to the ingress URL.
- Single-threaded on purpose: no SharedArrayBuffer means no COOP/COEP headers are
  required, which nginx here doesn't need to set.

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
