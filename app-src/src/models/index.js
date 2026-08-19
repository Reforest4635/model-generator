// models/index.js
// Register each model here. The `?raw` suffix tells Vite to inline the .scad
// file as a string at build time. To add a model, drop a .scad in this folder
// (with Customizer annotations) and add an entry below.
//
// For multi-file community libraries (e.g. Gridfinity Extended by ostat), also
// import the dependency files as ?raw and pass them via `libs` — they get
// mounted into the wasm filesystem so include<>/use<> resolve. Adjust the mount
// paths to match the include<> lines in the model.

import gridfinityBox from './gridfinity-box.scad?raw';

export const MODELS = [
  {
    id: 'gridfinity-box',
    name: 'Gridfinity Box',
    source: gridfinityBox,
    libs: {}, // e.g. { '/lib/gridfinity.scad': gridfinityLib }
  },
];

export function getModel(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}
