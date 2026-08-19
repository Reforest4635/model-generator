// rugged-box-bundle.js
// One lazy chunk for the smkent rugged box + its pinned gridfinity-rebuilt
// dependency. Files are remounted under /rb/... preserving the subdirectory so
// the entry's include<gridfinity-rebuilt-openscad/...> lines resolve.
const raw = import.meta.glob('./rugged_box/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const files = {};
const prefix = './rugged_box/';
for (const [key, contents] of Object.entries(raw)) {
  const rel = key.slice(key.indexOf(prefix) + prefix.length);
  files['/rb/' + rel] = contents;
}
export default files;
