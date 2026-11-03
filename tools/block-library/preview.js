import { buildBlock, decorateBlock, loadCSS } from '../../scripts/aem.js';

async function preview() {
  const main = document.querySelector('main');
  try {
    const name = new URLSearchParams(window.location.search).get('block');
    if (!['cards', 'columns', 'hero'].includes(name)) throw new Error('Unsupported preview block.');
    const response = await fetch(`./samples/${name}.html`);
    if (!response.ok) throw new Error(`Example request failed (${response.status}).`);
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    doc.querySelectorAll('img').forEach((img) => {
      img.src = new URL(img.getAttribute('src'), response.url).href;
      const picture = document.createElement('picture');
      img.replaceWith(picture);
      picture.append(img);
    });
    const rows = [...doc.querySelector('table').rows].slice(1).map((row) => (
      [...row.cells].map((cell) => ({ elems: [...cell.childNodes] }))
    ));
    const block = buildBlock(name, rows);
    const section = document.createElement('div');
    section.className = `section ${name}-container`;
    const wrapper = document.createElement('div');
    wrapper.className = `${name}-wrapper`;
    wrapper.append(block);
    section.append(wrapper);
    main.replaceChildren(section);
    decorateBlock(block);
    const [, module] = await Promise.all([
      loadCSS(`/blocks/${name}/${name}.css`),
      import(`../../blocks/${name}/${name}.js`),
    ]);
    if (module.default) await module.default(block);
    block.dataset.blockStatus = 'loaded';
  } catch (error) {
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = `Unable to preview block: ${error.message}`;
    main.replaceChildren(message);
  }
}

preview();
