const select = document.querySelector('#block-select');
const copy = document.querySelector('#copy-block');
const example = document.querySelector('#example');
const status = document.querySelector('#status');
let selectionVersion = 0;

async function loadExample() {
  selectionVersion += 1;
  const version = selectionVersion;
  copy.disabled = true;
  example.replaceChildren();
  document.querySelector('#preview-section').hidden = true;
  document.querySelector('#fragment-note').hidden = true;
  status.textContent = 'Loading example...';
  const slug = select.value;
  document.querySelector('#block-title').textContent = select.selectedOptions[0].textContent;
  try {
    const response = await fetch(`./samples/${slug}.html`);
    if (!response.ok) throw new Error(`Example request failed (${response.status}).`);
    const html = await response.text();
    if (version !== selectionVersion) return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) throw new Error('The example does not contain an authoring table.');
    table.querySelectorAll('img').forEach((img) => {
      img.src = new URL(img.getAttribute('src'), response.url).href;
    });
    example.append(table);
    copy.disabled = false;
    status.textContent = '';
    const isFragment = slug === 'fragment';
    document.querySelector('#fragment-note').hidden = !isFragment;
    document.querySelector('#preview-section').hidden = isFragment;
    if (!isFragment) document.querySelector('#preview').src = `./preview.html?block=${slug}`;
  } catch (error) {
    if (version === selectionVersion) status.textContent = `Unable to load block: ${error.message}`;
  }
}

copy.addEventListener('click', async () => {
  const table = example.querySelector('table');
  if (!table) return;
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([table.outerHTML], { type: 'text/html' }),
      'text/plain': new Blob([table.innerText], { type: 'text/plain' }),
    })]);
    status.textContent = 'Block table copied. Paste it into DA.live Content view.';
  } catch (error) {
    status.textContent = `Clipboard unavailable: ${error.message}. Select the whole table and copy it manually.`;
  }
});

select.addEventListener('change', loadExample);

async function init() {
  try {
    const response = await fetch('./blocks.json');
    if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`);
    const { data } = await response.json();
    select.replaceChildren();
    data.forEach(({ name, path }) => {
      const slug = new URL(path).pathname.split('/').pop();
      const option = document.createElement('option');
      option.value = slug;
      option.textContent = name;
      select.append(option);
      const row = document.createElement('tr');
      [name, path].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      document.querySelector('#sheet-rows').append(row);
    });
    select.disabled = false;
    await loadExample();
  } catch (error) {
    status.textContent = `Unable to load library: ${error.message}. Reload this page to retry.`;
  }
}

init();
