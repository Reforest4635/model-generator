# Gridfinity Generator

A browser-based parametric Gridfinity model generator: adjust parameters, see a
live 3D preview, download an STL. It runs real OpenSCAD in your browser via
`openscad-wasm` — there is no cloud service and nothing leaves your network.

## Installation

1. In Home Assistant go to **Settings → Add-ons → Add-on Store**.
2. Open the **⋮** menu (top right) → **Repositories**.
3. Add: `https://github.com/Reforest4635/model-generator`
4. Find **Gridfinity Generator** in the store and click **Install**.
5. Start the add-on, then click **Open Web UI**.

## Usage

- Pick a model from the dropdown:
  - **Simple Box** — a quick stackable bin.
  - **Gridfinity Extended — Bin** — the full ostat configurable bin (many
    parameters, grouped into collapsible sections). It's a heavy model, so
    renders take a few seconds.
- Adjust parameters on the left; the preview re-renders automatically.
- Click **Download STL** to save the mesh for slicing.

The OpenSCAD engine (~11 MB) downloads once on first render and is cached by the
browser afterwards. The extended library loads only when you pick that model.

The "Gridfinity Extended — Bin" uses the GPL-3.0 Gridfinity Extended library by
ostat (https://github.com/ostat/gridfinity_extended_openscad).

## Adding your own models

Models live in the frontend source (`app-src/src/models/`). Each is an OpenSCAD
`.scad` file with Customizer annotations, which the UI turns into controls
automatically. See the repository README for the model-authoring and release
workflow.
