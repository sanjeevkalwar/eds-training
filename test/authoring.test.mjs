import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<html><head></head><body></body></html>', {
  url: 'https://main--eds-training--sanjeevkalwar.aem.page/',
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.MutationObserver = dom.window.MutationObserver;
const {
  setupAuthoringCodeBase, moveInstrumentation, decorateAuthoringSections,
  decorateSectionMetadata, decorateRichtext,
} = await import('../scripts/ue.js');
const { decorateBlocks } = await import('../scripts/aem.js');
const { default: decorateCards } = await import('../blocks/cards/cards.js');
const { default: decorateColumns } = await import('../blocks/columns/columns.js');
const { default: decorateCarousel } = await import('../blocks/carousel/carousel.js');
const { default: decorateWinners } = await import('../blocks/list-dynamic-artwork/list-dynamic-artwork.js');
const { default: decorateDog } = await import('../blocks/dynamic-dog-image/dynamic-dog-image.js');

function element(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.firstElementChild;
}

test('compiled configuration resolves models, filters, and insertable blocks', async () => {
  const load = async (name) => JSON.parse(await readFile(new URL(`../${name}.json`, import.meta.url)));
  const definition = await load('component-definition');
  const models = await load('component-models');
  const filters = await load('component-filters');
  const components = definition.groups.flatMap((group) => group.components);
  const ids = new Set(components.map(({ id }) => id));
  assert.equal(ids.size, components.length);
  assert.equal(new Set(models.map(({ id }) => id)).size, models.length);
  assert.equal(new Set(filters.map(({ id }) => id)).size, filters.length);
  components.forEach(({ plugins }) => {
    const { template } = plugins.xwalk.page;
    if (template.model) assert.ok(models.some(({ id }) => id === template.model));
    if (template.filter) assert.ok(filters.some(({ id }) => id === template.filter));
  });
  filters.forEach(({ components: allowed }) => allowed.forEach((id) => {
    // Column is a structural child provided by AEM's built-in columns component.
    assert.ok(ids.has(id) || id === 'column', `Unknown filtered component: ${id}`);
  }));
  const section = filters.find(({ id }) => id === 'section');
  ['hero', 'cards', 'columns', 'fragment', 'carousel', 'dynamic-dog-image', 'list-dynamic-artwork']
    .forEach((id) => assert.ok(section.components.includes(id)));
});

test('AEM author loads code from the EDS origin, while same-origin base paths stay intact', () => {
  window.hlx.codeBasePath = '/existing';
  setupAuthoringCodeBase(`${window.location.origin}/scripts/scripts.js`);
  assert.equal(window.hlx.codeBasePath, '/existing');
  setupAuthoringCodeBase('https://code.example/scripts/scripts.js');
  assert.equal(window.hlx.codeBasePath, 'https://code.example');
  setupAuthoringCodeBase('https://code.example/site/scripts/scripts.js');
  assert.equal(window.hlx.codeBasePath, 'https://code.example/site');
  window.hlx.codeBasePath = '';
});

test('AEM default-content divs and section metadata are not decorated as blocks', () => {
  const main = element(`<main data-aue-resource="urn:page">
    <div data-aue-resource="urn:section">
      <div data-aue-resource="urn:text"><p>Default text</p></div>
      <h2>Title</h2>
      <div class="cards"><div><div><p>Card</p></div></div></div>
      <div class="section-metadata">
        <div><div>style</div><div>highlight</div></div>
        <div><div>name</div><div>Featured</div></div>
      </div>
    </div>
  </main>`);
  decorateAuthoringSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  const section = main.firstElementChild;
  assert.equal(section.dataset.aueResource, 'urn:section');
  assert.equal(section.dataset.name, 'Featured');
  assert.ok(section.classList.contains('highlight'));
  assert.equal(main.querySelectorAll('.block').length, 1);
  assert.equal(main.querySelector('.block').dataset.blockName, 'cards');
  assert.equal(main.querySelector('.default-content-wrapper').children.length, 2);
  assert.equal(main.querySelector('[data-aue-resource="urn:text"]').dataset.blockStatus, undefined);
  decorateAuthoringSections(main);
  assert.equal(section.children.length, 2);
});

test('richtext paragraphs are grouped by resource and property without losing content', () => {
  const main = element(`<main>
    <p data-richtext-resource="urn:one" data-richtext-prop="text" data-richtext-label="Text">First</p>
    <p data-richtext-resource="urn:one" data-richtext-prop="text">Second</p>
    <p data-richtext-resource="urn:two" data-richtext-prop="text">Third</p>
  </main>`);
  decorateRichtext(main);
  assert.equal(main.children.length, 2);
  assert.equal(main.firstElementChild.dataset.aueResource, 'urn:one');
  assert.equal(main.firstElementChild.dataset.aueType, 'richtext');
  assert.equal(main.firstElementChild.dataset.aueLabel, 'Text');
  assert.equal(main.firstElementChild.children.length, 2);
  assert.equal(main.lastElementChild.dataset.aueResource, 'urn:two');
  decorateRichtext(main);
  assert.equal(main.children.length, 2);
  assert.equal(main.querySelectorAll('[data-richtext-prop]').length, 0);
});

test('cards retain row, image, and richtext instrumentation after decoration', () => {
  const cards = element(`<div class="cards" data-aue-resource="urn:cards">
    <div data-aue-resource="urn:card" data-aue-model="card">
      <div><picture><img src="/media.png" alt="Example" data-aue-prop="image" data-aue-type="media"></picture></div>
      <div><p data-richtext-resource="urn:card" data-richtext-prop="text">Card body</p></div>
    </div>
  </div>`);
  decorateRichtext(cards);
  decorateCards(cards);
  assert.equal(cards.dataset.aueResource, 'urn:cards');
  assert.equal(cards.querySelector('li').dataset.aueResource, 'urn:card');
  assert.equal(cards.querySelector('li').dataset.aueModel, 'card');
  assert.equal(cards.querySelector('img').dataset.aueProp, 'image');
  assert.equal(cards.querySelector('img').alt, 'Example');
  assert.equal(cards.querySelector('[data-aue-type="richtext"]').textContent, 'Card body');
  assert.equal(cards.querySelectorAll('.cards-card-image').length, 1);
  assert.equal(cards.querySelectorAll('.cards-card-body').length, 1);
  const source = element('<div data-aue-label="" title="Keep"></div>');
  const target = document.createElement('h2');
  moveInstrumentation(source, target);
  assert.ok(target.hasAttribute('data-aue-label'));
  assert.equal(source.title, 'Keep');
});

test('empty authored columns and carousels do not throw', async () => {
  decorateColumns(element('<div class="columns"></div>'));
  await decorateCarousel(element('<div class="carousel"></div>'));
});

test('carousel slides remain selectable and selection activates the authored slide', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ status: 404 }));
  globalThis.IntersectionObserver = class {
    observe() {}
  };
  const carousel = element(`<div class="carousel" data-aue-resource="urn:carousel">
    <div data-aue-resource="urn:slide-one"><div></div><div><h2 id="one">One</h2></div></div>
    <div data-aue-resource="urn:slide-two"><div></div><div><h2 id="two">Two</h2><a href="/">Link</a></div></div>
  </div>`);
  await decorateCarousel(carousel);
  const slides = carousel.querySelectorAll('.carousel-slide');
  assert.equal(slides[0].dataset.aueResource, 'urn:slide-one');
  assert.equal(slides[1].dataset.aueResource, 'urn:slide-two');
  assert.equal(carousel.dataset.activeSlide, '0');
  const scroller = carousel.querySelector('.carousel-slides');
  scroller.scrollTo = t.mock.fn();
  slides[1].dispatchEvent(new window.CustomEvent('aue:ui-select', { bubbles: true }));
  assert.equal(carousel.dataset.activeSlide, '1');
  assert.equal(slides[1].getAttribute('aria-hidden'), 'false');
  assert.equal(slides[0].getAttribute('aria-hidden'), 'true');
  assert.equal(scroller.scrollTo.mock.callCount(), 1);
});

test('Nobel key/value model honors per-block dropdown values and legacy Count rows', async (t) => {
  const { definitions } = JSON.parse(await readFile(
    new URL('../blocks/list-dynamic-artwork/_list-dynamic-artwork.json', import.meta.url),
  ));
  assert.equal(definitions[0].plugins.xwalk.page.template['key-value'], true);
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url) => {
    const limit = Number(new URL(url).searchParams.get('limit'));
    return {
      ok: true,
      json: async () => ({
        laureates: Array.from({ length: limit }, (_, index) => ({
          id: String(index + 1),
          knownName: { en: `Winner ${index + 1}` },
          nobelPrizes: [{ category: { en: 'Physics' }, awardYear: '2024' }],
        })),
      }),
    };
  });
  for (const limit of [0, 3, 20]) {
    const block = element(`<div class="list-dynamic-artwork" data-aue-resource="urn:winners-${limit}">
      <div><div>limit</div><div><p>${limit}</p></div></div>
    </div>`);
    // eslint-disable-next-line no-await-in-loop
    await decorateWinners(block);
    assert.equal(block.querySelectorAll('.laureates > li').length, limit);
    assert.equal(block.dataset.aueResource, `urn:winners-${limit}`);
    if (limit === 0) assert.equal(fetchMock.mock.callCount(), 0);
  }
  const legacy = element('<div><div><div>Count</div><div>1</div></div></div>');
  await decorateWinners(legacy);
  assert.equal(legacy.querySelectorAll('.laureates > li').length, 1);
  t.mock.method(console, 'error', () => {});
  const invalid = element('<div><div><div>Limit</div><div>21</div></div></div>');
  const calls = fetchMock.mock.callCount();
  await decorateWinners(invalid);
  assert.match(invalid.querySelector('[role="status"]').textContent, /Invalid Limit/);
  assert.equal(fetchMock.mock.callCount(), calls);
});

test('dynamic dog heading stays editable after its authored row is replaced', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
  t.mock.method(console, 'error', () => {});
  const block = element(`<div class="dynamic-dog-image" data-aue-resource="urn:dog">
    <div><div data-aue-prop="heading" data-aue-type="text">My dog</div></div>
  </div>`);
  await decorateDog(block);
  assert.equal(block.querySelector('h2').textContent, 'My dog');
  assert.equal(block.querySelector('h2').dataset.aueProp, 'heading');
  assert.equal(block.dataset.aueResource, 'urn:dog');
});

test('saved editor operations refresh before the CORS library can patch decorated markup', async () => {
  const realWindow = globalThis.window;
  let reloads = 0;
  globalThis.window = { location: { reload: () => { reloads += 1; } } };
  try {
    await import('../scripts/editor-support.js');
    const block = element('<div data-aue-resource="urn:editable"></div>');
    document.body.append(block);
    let fallbackCalls = 0;
    const fallback = () => { fallbackCalls += 1; };
    document.body.addEventListener('aue:content-patch', fallback);
    ['patch', 'update', 'add', 'move', 'remove', 'copy'].forEach((operation) => {
      block.dispatchEvent(new realWindow.CustomEvent(`aue:content-${operation}`, { bubbles: true }));
    });
    assert.equal(reloads, 6);
    assert.equal(fallbackCalls, 0);
    document.body.removeEventListener('aue:content-patch', fallback);
    block.remove();
  } finally {
    globalThis.window = realWindow;
  }
});
