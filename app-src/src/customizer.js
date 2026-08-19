// customizer.js
// Parse OpenSCAD Customizer annotations out of a .scad source into a schema the
// UI can render. Supports the common subset used by Gridfinity models:
//
//   /* [Group Name] */            -> starts a group (section)
//   /* [Hidden] */                -> variables below are excluded from the UI
//   name = 5;      // [0:10]      -> integer slider  (min:max)
//   name = 5;      // [0:0.5:10]  -> stepped slider  (min:step:max)
//   name = "a";    // [a, b, c]   -> dropdown of literal options
//   name = 1;      // [1:One, 2:Two] -> dropdown with labels
//   name = true;   // toggle       -> checkbox (type inferred from value)
//   name = 3;      // description   -> number spinner, text is the tooltip
//
// Type is inferred from the default value: true/false -> bool, "…" -> string,
// otherwise number. This mirrors how the desktop Customizer behaves.

const GROUP_RE = /^\s*\/\*\s*\[([^\]]+)\]\s*\*\/\s*$/;
const ASSIGN_RE = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?);\s*(?:\/\/(.*))?$/;

function inferType(raw) {
  const v = raw.trim();
  if (v === 'true' || v === 'false') return 'bool';
  if (/^["'].*["']$/.test(v)) return 'string';
  return 'number';
}

function parseDefault(raw, type) {
  const v = raw.trim();
  if (type === 'bool') return v === 'true';
  if (type === 'string') return v.slice(1, -1);
  return Number(v);
}

// Parse the "// [...]" spec after the value.
function parseSpec(comment, type) {
  if (!comment) return { control: type === 'bool' ? 'checkbox' : 'field', description: '' };

  const bracket = comment.match(/\[([^\]]*)\]/);
  const description = comment.replace(/\[[^\]]*\]/, '').trim();

  if (!bracket) {
    return { control: type === 'bool' ? 'checkbox' : 'field', description };
  }

  const body = bracket[1].trim();

  // Range: min:max or min:step:max  (only for numbers)
  if (type === 'number' && /^[-\d.]+:[-\d.:]+$/.test(body) && body.includes(':')) {
    const parts = body.split(':').map(Number);
    if (parts.length === 2) {
      return { control: 'slider', min: parts[0], max: parts[1], step: 1, description };
    }
    if (parts.length === 3) {
      return { control: 'slider', min: parts[0], step: parts[1], max: parts[2], description };
    }
  }

  // Options list: a, b, c  OR  1:One, 2:Two
  const options = body.split(',').map((s) => s.trim()).filter(Boolean).map((tok) => {
    const colon = tok.indexOf(':');
    if (colon !== -1) {
      const value = tok.slice(0, colon).trim();
      const label = tok.slice(colon + 1).trim();
      return { value: coerce(value, type), label };
    }
    return { value: coerce(tok, type), label: tok };
  });
  return { control: 'select', options, description };
}

function coerce(token, type) {
  if (type === 'number') return Number(token);
  if (type === 'bool') return token === 'true';
  return token.replace(/^["']|["']$/g, '');
}

/**
 * @param {string} source .scad file contents
 * @returns {{ groups: Array<{ name, params: Array }> }}
 */
export function parseCustomizer(source) {
  const lines = source.split(/\r?\n/);
  const groups = [];
  let current = { name: 'Parameters', params: [] };
  groups.push(current);
  let hidden = false;

  for (const line of lines) {
    const g = line.match(GROUP_RE);
    if (g) {
      const label = g[1].trim();
      if (/^hidden$/i.test(label)) {
        hidden = true;
        continue;
      }
      hidden = false;
      current = { name: label, params: [] };
      groups.push(current);
      continue;
    }
    if (hidden) continue;

    const a = line.match(ASSIGN_RE);
    if (!a) continue;
    const [, name, rawVal, comment] = a;
    // Skip expressions that reference other variables (derived constants).
    if (!/^\s*(["'].*["']|true|false|-?[\d.]+)\s*$/.test(rawVal)) continue;

    const type = inferType(rawVal);
    const def = parseDefault(rawVal, type);
    const spec = parseSpec(comment, type);
    current.params.push({ name, type, value: def, default: def, ...spec });
  }

  // Drop empty leading group if the file opened straight into a named group.
  return { groups: groups.filter((grp) => grp.params.length > 0) };
}

// Flatten a schema back to the [{name, value, type}] list the runner wants.
export function collectValues(schema) {
  const out = [];
  for (const grp of schema.groups) {
    for (const p of grp.params) out.push({ name: p.name, value: p.value, type: p.type });
  }
  return out;
}
