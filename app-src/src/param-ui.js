// param-ui.js
// Build collapsible groups of form controls from a customizer schema, and call
// onChange(param) whenever a value changes. Controls: slider, select, checkbox,
// number/text field.

export function buildParamUI(container, schema, onChange) {
  container.innerHTML = '';

  for (const group of schema.groups) {
    const details = document.createElement('details');
    details.open = true;
    details.className = 'group';

    const summary = document.createElement('summary');
    summary.textContent = group.name;
    details.appendChild(summary);

    for (const param of group.params) {
      details.appendChild(buildControl(param, onChange));
    }
    container.appendChild(details);
  }
}

function buildControl(param, onChange) {
  const row = document.createElement('div');
  row.className = 'row';

  const label = document.createElement('label');
  label.textContent = prettify(param.name);
  if (param.description) label.title = param.description;
  row.appendChild(label);

  let input;

  if (param.control === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!param.value;
    input.addEventListener('change', () => {
      param.value = input.checked;
      onChange(param);
    });
    row.classList.add('row-check');
  } else if (param.control === 'select') {
    input = document.createElement('select');
    for (const opt of param.options) {
      const o = document.createElement('option');
      o.value = String(opt.value);
      o.textContent = opt.label;
      if (opt.value === param.value) o.selected = true;
      input.appendChild(o);
    }
    input.addEventListener('change', () => {
      const opt = param.options.find((o) => String(o.value) === input.value);
      param.value = opt ? opt.value : input.value;
      onChange(param);
    });
  } else if (param.control === 'slider') {
    input = document.createElement('input');
    input.type = 'range';
    input.min = param.min;
    input.max = param.max;
    input.step = param.step || 1;
    input.value = param.value;

    const out = document.createElement('output');
    out.textContent = param.value;

    input.addEventListener('input', () => {
      param.value = Number(input.value);
      out.textContent = input.value;
      onChange(param);
    });
    row.appendChild(input);
    row.appendChild(out);
    return row;
  } else {
    // plain field
    input = document.createElement('input');
    input.type = param.type === 'number' ? 'number' : 'text';
    input.value = param.value;
    input.addEventListener('change', () => {
      param.value = param.type === 'number' ? Number(input.value) : input.value;
      onChange(param);
    });
  }

  row.appendChild(input);
  return row;
}

function prettify(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
