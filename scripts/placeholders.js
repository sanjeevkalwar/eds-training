import { toCamelCase } from './aem.js';

// eslint-disable-next-line import/prefer-default-export
export async function fetchPlaceholders(prefix = '') {
  const response = await fetch(`${prefix}/placeholders.json`);
  if (response.status === 404) return {}; // The authoring spreadsheet is optional.
  if (!response.ok) throw new Error(`Placeholders request failed (${response.status}).`);
  const json = await response.json();
  if (!Array.isArray(json.data)) throw new Error('Invalid placeholders spreadsheet.');
  return Object.fromEntries(json.data.map(({ Key, Text }) => [toCamelCase(Key), Text]));
}
