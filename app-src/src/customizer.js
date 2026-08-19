// customizer.js
// Parse OpenSCAD Customizer annotations out of a .scad source into a schema the
// UI can render. Handles the syntax used by simple models AND the richer forms
// in community libraries like Gridfinity Extended:
//
//   /* [Group Name] */                 -> group (section)
//   /* [Hidden] */                     -> variables below are excluded
//   name = 5;      // [0:10]           -> integer slider
//   name = 5;      // [0:0.5:10]       -> stepped slider
//   name = "a";    // [a, b, c]        -> dropdown of literal options
//   name = 1;      // [1:One, 2:Two]   -> dropdown with labels
//   name = "x";    // [a, b:"Nice B"]  -> dropdown, quoted labels
//   name = true;                       -> checkbox
//   name = 3;      // 0.1              -> number spinner, 0.1 step (bare step)
//   name = [2, 0]; // 0.1              -> vector of 2 numbers, 0.1 step
//   name = 3;      // description       -> number spinner, text is tooltip
//
// If the file contains ostat-style /*<!!start ...!!>*/ ... /*<!!end ...!!>*/
// markers, only the region between them is parsed (that's the customizable
// section; everything after is internal computed variables).

const GROUP_RE = /^\s*\/\*\s*\[([^\]]+)\]\s*\*\/\s*$/;
const ASSIGN_RE = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?);\s*(?:\/\/(.*))?$/;
const START_RE = /<!!\s*start/i;
const END_RE = /<!!\s*end/i;

const NUM = String.raw`-?\d*\.?\d+`;
const SIMPLE_VALUE_RE = new RegExp(
  `^\\s*(?:"[^"]*"|'[^']*'|true|false|${NUM}|\\[\\s*(?:${NUM})(?:\\s*,\\s*(?:${NUM}))*\\s*\\])\\s*$`
);

function isVector(raw) {
  return /^\s*\[/.test(raw.trim());
}

function inferType(raw) {
  const v = raw.trim();
  if (isVector(v)) return 'vector';
  if (v === 'true' || v === 'false') return 'bool';
  if (/^["'].*["']$/.test(v)) return 'string';
  return 'number';
}

function parseDefault(raw, type) {
  const v = raw.trim();
  if (type === 'bool') return v === 'true';
  if (type === 'string') return v.slice(1, -1);
  if (type === 'vector') {
    return v
      .slice(1, -1)
      .split(',')
      .map((s) => Number(s.trim()));
  }
  return Number(v);
}

function stripQuotes(s) {
  return s.replace(/^["']|["']$/g, '');
}

function coerce(token, type) {
  if (type === 'number') return Number(token);
  if (type === 'bool') return token === 'true';
  return stripQuotes(token);
}

// Parse the "// ..." comment after the value into a control spec.
function parseSpec(comment, type) {
  const fallback = () => ({
    control:
      type === 'bool' ? 'checkbox' : type === 'vector' ? 'vector' : 'field',
    description: '',
  });
  if (!comment) return fallback();

  const bracket = comment.match(/\[([\s\S]*)\]/);
  const description = comment.replace(/\[[\s\S]*\]/, '').trim();

  if (!bracket) {
    // Bare "// 0.1" is a step hint, not a description.
    const stepMatch = comment.trim().match(/^(-?\d*\.?\d+)\s*$/);
    if (stepMatch && (type === 'number' || type === 'vector')) {
      const step = Number(stepMatch[1]);
      if (type === 'vector') return { control: 'vector', step, description: '' };
      return { control: 'spinner', step, description: '' };
    }
    return {
      control:
        type === 'bool'
          ? 'checkbox'
          : type === 'vector'
            ? 'vector'
            : type === 'number'
              ? 'spinner'
              : 'field',
      description: comment.trim(),
    };
  }

  const body = bracket[1].trim();

  // Numeric range: min:max or min:step:max
  if (type === 'number' && /^[-\d.]+(:[-\d.]+){1,2}$/.test(body)) {
    const parts = body.split(':').map(Number);
    if (parts.length === 2)
      return { control: 'slider', min: parts[0], max: parts[1], step: 1, description };
    if (parts.length === 3)
      return {
        control: 'slider',
        min: parts[0],
        step: parts[1],
        max: parts[2],
        description,
      };
  }

  // Options list: "a, b, c" or "1:One" or 'b:"Nice B"'
  const options = splitTopLevel(body)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((tok) => {
      const colon = tok.indexOf(':');
      if (colon !== -1) {
        const value = tok.slice(0, colon).trim();
        const label = stripQuotes(tok.slice(colon + 1).trim());
        return { value: coerce(value, type), label };
      }
      return { value: coerce(tok, type), label: stripQuotes(tok) };
    });
  return { control: 'select', options, description };
}

// Split on commas that aren't inside quotes.
function splitTopLevel(s) {
  const out = [];
  let cur = '';
  let q = null;
  for (const ch of s) {
    if (q) {
      if (ch === q) q = null;
      cur += ch;
    } else if (ch === '"' || ch === "'") {
      q = ch;
      cur += ch;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export function parseCustomizer(source) {
  let lines = source.split(/\r?\n/);

  // Scope to the ostat customizable section if markers are present.
  const startIdx = lines.findIndex((l) => START_RE.test(l));
  const endIdx = lines.findIndex((l) => END_RE.test(l));
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    lines = lines.slice(startIdx + 1, endIdx);
  }

  const groups = [];
  let current = { name: 'Parameters', params: [] };
  groups.push(current);
  let hidden = false;
  let pendingComment = ''; // a "// desc" line immediately above an assignment

  for (const line of lines) {
    const g = line.match(GROUP_RE);
    if (g) {
      const label = g[1].trim();
      hidden = /^hidden$/i.test(label);
      pendingComment = '';
      if (!hidden) {
        current = { name: label, params: [] };
        groups.push(current);
      }
      continue;
    }
    if (hidden) continue;

    const a = line.match(ASSIGN_RE);
    if (!a) {
      // Capture a lone "// description" line to attach to the next assignment.
      const c = line.match(/^\s*\/\/(.*)$/);
      pendingComment = c ? c[1].trim() : '';
      continue;
    }

    const [, name, rawVal, inlineComment] = a;
    if (!SIMPLE_VALUE_RE.test(rawVal)) {
      pendingComment = '';
      continue;
    }

    const type = inferType(rawVal);
    const def = parseDefault(rawVal, type);
    // Prefer the inline comment; fall back to a description-only line above it.
    const comment =
      inlineComment != null && inlineComment.trim() !== ''
        ? inlineComment
        : pendingComment;
    const spec = parseSpec(comment, type);
    if (!spec.description && pendingComment) spec.description = pendingComment;

    current.params.push({ name, type, value: def, default: def, ...spec });
    pendingComment = '';
  }

  return { groups: groups.filter((grp) => grp.params.length > 0) };
}

export function collectValues(schema) {
  const out = [];
  for (const grp of schema.groups)
    for (const p of grp.params) out.push({ name: p.name, value: p.value, type: p.type });
  return out;
}
