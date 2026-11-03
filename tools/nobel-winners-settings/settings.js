// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const select = document.querySelector('#limit');
const note = document.querySelector('#selection-note');
const status = document.querySelector('#status');
let snapshot;
let selectedBlock;
let saving = false;

for (let value = 0; value <= 20; value += 1) {
  const option = document.createElement('option');
  option.value = String(value);
  option.textContent = String(value);
  select.append(option);
}

function limitRows(block) {
  return [...block.children].filter((row) => (
    ['limit', 'count'].includes(row.children[0]?.textContent.trim().toLowerCase())
  ));
}

function syncSelection(state) {
  snapshot = state;
  const doc = new DOMParser().parseFromString(state.html, 'text/html');
  const index = state.selection?.blockIndex;
  selectedBlock = Number.isSafeInteger(index) && index >= 0
    ? doc.querySelectorAll('[data-block-index]')[index] : undefined;
  if (!selectedBlock?.classList.contains('list-dynamic-artwork') || state.editable === false) {
    selectedBlock = undefined;
    select.disabled = true;
    select.value = '';
    note.textContent = state.editable === false
      ? 'This document is read-only.'
      : 'Click inside the Nobel Prize Winners block to edit its limit.';
    return;
  }

  const rows = limitRows(selectedBlock);
  if (rows.length > 1) {
    selectedBlock = undefined;
    select.disabled = true;
    select.value = '';
    note.textContent = 'Remove duplicate Limit or Count rows from this block before using the dropdown.';
    return;
  }
  const value = rows.length ? rows[0].children[1]?.textContent.trim() : '3';
  const valid = /^\d+$/.test(value || '') && Number(value) <= 20;
  select.value = valid ? String(Number(value)) : '';
  select.disabled = saving;
  note.textContent = valid
    ? `Selected block limit: ${Number(value)}.`
    : 'The current value is invalid. Choose a number from 0 to 20 to correct it.';
}

function setCell(cell, text) {
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  cell.replaceChildren(paragraph);
}

async function init() {
  if (window.parent === window) {
    note.textContent = 'Open this tool from the DA.live editor to change a block.';
    return;
  }
  const { actions } = await DA_SDK;
  if (!actions.subscribeLiveDocument || !actions.sendHTML) {
    throw new Error('This DA.live editor does not support block settings. Use Experience Workspace.');
  }
  const unsubscribe = actions.subscribeLiveDocument(syncSelection);
  window.addEventListener('pagehide', unsubscribe, { once: true });

  select.addEventListener('change', async () => {
    if (saving || !selectedBlock) return;
    const { value } = select;
    if (!/^\d+$/.test(value) || Number(value) > 20) {
      status.textContent = 'Choose a whole number from 0 to 20.';
      return;
    }
    const expected = { html: snapshot.html, blockIndex: snapshot.selection.blockIndex };
    const block = selectedBlock.cloneNode(true);
    block.removeAttribute('data-block-index');
    let [row] = limitRows(block);
    if (!row) {
      row = document.createElement('div');
      row.append(document.createElement('div'));
      block.append(row);
    }
    if (row.children.length < 2) row.append(document.createElement('div'));
    setCell(row.children[0], 'Limit');
    setCell(row.children[1], value);
    saving = true;
    select.disabled = true;
    status.textContent = 'Updating limit...';
    try {
      const result = await actions.sendHTML(block.outerHTML, { replace: true, expected });
      if (!result?.ok) {
        throw new Error(result?.message || `Unable to update the block (${result?.error || 'no response'}).`);
      }
      if (typeof result.html === 'string') syncSelection(result);
      status.textContent = `Limit set to ${value}. Preview or publish the page to update the website.`;
    } catch (error) {
      status.textContent = `${error.message} Select the block and try again.`;
      // eslint-disable-next-line no-console
      console.error('Nobel Winners Settings update failed', error);
    } finally {
      saving = false;
      syncSelection(snapshot);
    }
  });
}

init().catch((error) => {
  select.disabled = true;
  status.textContent = error.message;
  // eslint-disable-next-line no-console
  console.error('Nobel Winners Settings initialization failed', error);
});
