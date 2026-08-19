// models/index.js
// A model has:
//   id, name          identifiers
//   loadFiles()       async -> { '/fs/path.scad': contents } (entry + libraries)
//   entry             which path in the loaded files to compile
//   source/files      filled in after loadFiles() runs (see main.js)
//   note              optional UI hint shown under the parameter panel

import boxSrc from './gridfinity-box.scad?raw';

export const MODELS = [
  {
    id: 'gridfinity-box',
    name: 'Simple Box',
    entry: '/model.scad',
    loadFiles: async () => ({ '/model.scad': boxSrc }),
  },
  {
    id: 'gridfinity-extended-bin',
    name: 'Gridfinity Extended — Bin',
    entry: '/gfext/gridfinity_basic_cup.scad',
    // Lazy: the ~6 MB library only loads when this model is selected.
    loadFiles: async () => (await import('../lib/gfext-bundle.js')).default,
    note: 'Full ostat bin. Heavy model — renders take a few seconds. Labels render but auto-sizing is approximate (this build lacks textmetrics()).',
  },
];

export function getModel(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}
