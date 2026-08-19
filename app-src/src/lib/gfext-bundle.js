// gfext-bundle.js
// Eagerly inlines the whole Gridfinity Extended library into ONE module, so that
// when main.js dynamically imports this file, Vite loads all of it as a single
// lazy chunk (not 98 separate requests, and not part of the initial bundle).
const raw = import.meta.glob('./gridfinity_extended/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const files = {};
const prefix = './gridfinity_extended/';
for (const [key, contents] of Object.entries(raw)) {
  const rel = key.slice(key.indexOf(prefix) + prefix.length);
  files['/gfext/' + rel] = contents;
}
export default files;
