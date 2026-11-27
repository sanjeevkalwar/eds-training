import { decorateRichtext, moveInstrumentation } from '../../scripts/ue.js';

const ALLOWED_VALUES = {
  fontFamily: new Set(['body', 'heading']),
  fontSize: new Set([
    'body-xs',
    'body-s',
    'body-m',
    'heading-xs',
    'heading-s',
    'heading-m',
    'heading-l',
    'heading-xl',
    'heading-xxl',
  ]),
  fontWeight: new Set(['400', '500', '700']),
  textColor: new Set(['text', 'dark', 'link', 'link-hover']),
  textAlign: new Set(['left', 'center', 'right']),
  backgroundColor: new Set(['white', 'light']),
};

function normalizeKey(value) {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function getRows(block) {
  const rows = new Map();
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    if (keyCell && valueCell) rows.set(normalizeKey(keyCell.textContent.trim()), valueCell);
  });
  return rows;
}

function validValue(block, name, value) {
  if (!value || ALLOWED_VALUES[name].has(value)) return value;
  // eslint-disable-next-line no-console
  console.warn(`Styled Text ignored invalid ${name} value`, { value, block });
  return '';
}

export default function decorate(block) {
  const rows = getRows(block);
  const contentCell = rows.get('content') || block.firstElementChild?.children[1]
    || block.firstElementChild;
  const content = document.createElement('div');
  content.className = 'styled-text-content';

  if (contentCell) {
    moveInstrumentation(contentCell, content);
    content.append(...contentCell.childNodes);
  }

  const values = {
    fontFamily: validValue(block, 'fontFamily', rows.get('font-family')?.textContent.trim() || ''),
    fontSize: validValue(block, 'fontSize', rows.get('font-size')?.textContent.trim() || ''),
    fontWeight: validValue(block, 'fontWeight', rows.get('font-weight')?.textContent.trim() || ''),
    textColor: validValue(block, 'textColor', rows.get('text-color')?.textContent.trim() || ''),
    textAlign: validValue(block, 'textAlign', rows.get('text-align')?.textContent.trim() || ''),
    backgroundColor: validValue(
      block,
      'backgroundColor',
      rows.get('background-color')?.textContent.trim() || '',
    ),
  };

  if (values.fontFamily === 'heading' && values.fontWeight
    && values.fontWeight !== '700') {
    // eslint-disable-next-line no-console
    console.warn('Styled Text reset an unsupported Roboto Condensed font weight to 700', {
      requested: values.fontWeight,
      block,
    });
    values.fontWeight = '700';
  }
  if (values.fontFamily === 'heading' && !values.fontWeight) values.fontWeight = '700';

  Object.entries(values).forEach(([name, value]) => {
    if (value) block.classList.add(`styled-text-${normalizeKey(name)}-${value}`);
  });
  block.replaceChildren(content);
  decorateRichtext(block);
}
