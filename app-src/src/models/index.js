// models/index.js
// A model has:
//   id, name          identifiers
//   loadFiles()       async -> { '/fs/path.scad': contents } (entry + libraries)
//   entry             which path in the loaded files to compile
//   source/files      filled in after loadFiles() runs (see main.js)
//   note              optional UI hint shown under the parameter panel

import boxSrc from './gridfinity-box.scad?raw';
import caseSrc from './gridfinity-stacking-case.scad?raw';
import clamshellSrc from './clamshell-box.scad?raw';

// Rugged box (+ dependency) as one lazy chunk; entry contents needed for the UI.
const loadRuggedBox = async () => (await import('../lib/rugged-box-bundle.js')).default;

// The whole ostat Gridfinity Extended library, loaded as one lazy chunk and
// shared by every Extended entry point below (the dynamic import is cached, so
// switching between Extended models doesn't refetch it).
const loadGfext = async () => (await import('../lib/gfext-bundle.js')).default;

// Every root .scad in the ostat library, with a friendly name.
const EXTENDED = [
  ['gridfinity_basic_cup.scad', 'Extended — Bin'],
  ['gridfinity_baseplate.scad', 'Extended — Baseplate'],
  ['gridfinity_baseplate_flsun_q5.scad', 'Extended — Baseplate (FLSUN Q5)'],
  ['gridfinity_tray.scad', 'Extended — Tray'],
  ['gridfinity_lid.scad', 'Extended — Lid'],
  ['gridfinity_sliding_lid.scad', 'Extended — Sliding Lid'],
  ['gridfinity_drawers.scad', 'Extended — Drawers'],
  ['gridfinity_item_holder.scad', 'Extended — Item Holder'],
  ['gridfinity_socket_holder.scad', 'Extended — Socket Holder'],
  ['gridfinity_vertical_divider.scad', 'Extended — Vertical Divider'],
  ['gridfinity_silverware.scad', 'Extended — Silverware Tray'],
  ['gridfinity_silverware_legacy.scad', 'Extended — Silverware Tray (Legacy)'],
  ['gridfinity_sieve.scad', 'Extended — Sieve'],
  ['gridfinity_glue_stick.scad', 'Extended — Glue Stick Holder'],
  ['gridfinity_marble.scad', 'Extended — Marble'],
  ['gridfinity_chess.scad', 'Extended — Chess'],
  ['stanley_basic_cup.scad', 'Extended — Stanley Cup'],
];

// Entry points that take a few seconds to render, so the user isn't surprised.
const HEAVY = new Set([
  'gridfinity_drawers.scad',
  'gridfinity_silverware.scad',
  'gridfinity_tray.scad',
  'gridfinity_item_holder.scad',
  'gridfinity_vertical_divider.scad',
]);

const extendedModels = EXTENDED.map(([file, name]) => ({
  id: 'ext-' + file.replace(/\.scad$/, ''),
  name,
  entry: '/gfext/' + file,
  loadFiles: loadGfext,
  note:
    'ostat Gridfinity Extended (GPL-3.0).' +
    (HEAVY.has(file) ? ' Heavy model — renders take several seconds.' : ''),
}));

export const MODELS = [
  {
    id: 'gridfinity-box',
    name: 'Simple Box',
    entry: '/model.scad',
    loadFiles: async () => ({ '/model.scad': boxSrc }),
  },
  {
    id: 'clamshell-box',
    name: 'Clamshell Box (ours)',
    entry: '/model.scad',
    loadFiles: async () => ({ '/model.scad': clamshellSrc }),
    note: 'Our own minimalist clamshell: smooth exterior, interior gridfinity baseplate, barrel hinge (pin = 1.75mm filament or 3mm/M3), front snap latch, side stacking. Set "part" to base / lid / pin and export each; "assembled" shows it open as a preview. FIRST DRAFT — print-test the hinge fit (hinge_clearance), latch grip, and stacking detents, then tell me what to tune.',
  },
  {
    id: 'stacking-case',
    name: 'Stacking Case (ours)',
    entry: '/model.scad',
    loadFiles: async () => ({ '/model.scad': caseSrc }),
    note: 'Our own closed case: baseplate floor + inset lid, side indent-and-latch stacking. Set "part" to base or lid and export each. First design — check the fit in preview and print-test the latch/clearance values.',
  },
  {
    id: 'rugged-box',
    name: 'Rugged Box (smkent)',
    entry: '/rb/rugged-box-gridfinity.scad',
    loadFiles: loadRuggedBox,
    manualRender: true,
    paramDefaults: { Part: 'bottom' },
    note: 'smkent Gridfinity Rugged Storage Box — ribbed corners, draw/clip latches, hinge, handle (CC-BY-SA-4.0 + MIT). Auto-render is OFF: set options, then click Render. Use the Part selector to export each piece (bottom, top, latch, handle, label…) — individual parts render in a few seconds. The "assembled" preview views show the whole box but can take a couple of minutes.',
  },
  ...extendedModels,
];

export function getModel(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}
