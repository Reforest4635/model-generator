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
import predSrc from './pred-style-box.scad?raw';

// openGrid entries (small) + the shared BOSL2 library (large, lazy chunk).
import ogPlate from '../lib/opengrid/openGrid.scad?raw';
import ogSnap from '../lib/opengrid/opengrid-snap.scad?raw';
import ogBorder from '../lib/opengrid/openGrid-border.scad?raw';
import ogBin from '../lib/opengrid/MulticonnectBin.scad?raw';
import ogShelf from '../lib/opengrid/MulticonnectShelf.scad?raw';
const loadBosl = async () => (await import('../lib/opengrid-bundle.js')).default;
const withBosl = (src) => async () => ({ ...(await loadBosl()), '/model.scad': src });

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
    id: 'pred-style-box',
    name: 'Storage Box (Pred-style)',
    entry: '/model.scad',
    loadFiles: async () => ({ '/model.scad': predSrc }),
    note: 'Clean closed storage box (our OpenSCAD reimplementation of the Pred form): smooth flush lid, back barrel hinge (pin = 1.75mm filament or 3mm/M3), front snap latch, interior gridfinity baseplate. "part" = base / lid / pin to export; assembled_closed / _open are previews. Print-test the hinge (hinge_clearance), latch (latch_grip/clearance), and lid tongue (tongue_clear) and tell me what to tune.',
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
  // ---- openGrid (28mm wall/desk system) ----
  {
    id: 'opengrid-plate',
    name: 'openGrid — Plate',
    entry: '/model.scad',
    loadFiles: withBosl(ogPlate),
    paramDefaults: { Full_or_Lite: 'Full' },
    note: 'openGrid tile/plate (David D, CC-BY; OpenSCAD by QuackWorks, CC-BY-NC-SA — non-commercial). Full mode is the default and works with connectors/screws/chamfers. NOTE: "Lite" mode currently crashes the browser engine when combined with connector/screw/chamfer holes — use Full for now. Renders take several seconds.',
  },
  {
    id: 'opengrid-snap',
    name: 'openGrid — Snap Connector',
    entry: '/model.scad',
    loadFiles: withBosl(ogSnap),
    note: 'openGrid snap connector — snaps into a tile to join tiles or mount accessories (CC-BY-NC-SA, non-commercial).',
  },
  {
    id: 'opengrid-border',
    name: 'openGrid — Border',
    entry: '/model.scad',
    loadFiles: withBosl(ogBorder),
    note: 'openGrid border/edge trim (CC-BY-NC-SA, non-commercial).',
  },
  {
    id: 'opengrid-bin',
    name: 'openGrid — Bin (MultiConnect)',
    entry: '/model.scad',
    loadFiles: withBosl(ogBin),
    paramDefaults: { distanceBetweenSlots: 28 },
    note: 'MultiConnect bin that mounts to openGrid via snap connectors. Slot spacing defaulted to 28mm for openGrid (CC-BY-NC-SA, non-commercial).',
  },
  {
    id: 'opengrid-shelf',
    name: 'openGrid — Shelf (MultiConnect)',
    entry: '/model.scad',
    loadFiles: withBosl(ogShelf),
    paramDefaults: { distanceBetweenSlots: 28 },
    note: 'MultiConnect shelf that mounts to openGrid via snap connectors. Slot spacing defaulted to 28mm for openGrid (CC-BY-NC-SA, non-commercial).',
  },
];

export function getModel(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}
