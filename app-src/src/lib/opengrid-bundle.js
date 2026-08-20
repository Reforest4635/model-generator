// opengrid-bundle.js
// One lazy chunk holding the whole BOSL2 library (which every openGrid model
// needs via `include <BOSL2/std.scad>`), mounted under /BOSL2/... in the wasm
// filesystem. Loaded only when an openGrid model is first selected, then cached.
const raw = import.meta.glob('./BOSL2/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const files = {};
const prefix = './BOSL2/';
for (const [key, contents] of Object.entries(raw)) {
  const rel = key.slice(key.indexOf(prefix) + prefix.length);
  files['/BOSL2/' + rel] = contents;
}
export default files; // { '/BOSL2/std.scad': '...', ... }
