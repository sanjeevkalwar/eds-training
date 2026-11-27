import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// keep track globally of the number of tabs blocks on the page
let tabBlockCnt = 0;

function optimizeImages(panel, eager) {
  panel.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, eager, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

/**
 * Splits a panel's content cell into a media area (background picture)
 * and a copy area (heading, description, CTA).
 */
function decoratePanel(panel, index) {
  const content = document.createElement('div');
  content.className = 'tabs-content';
  // white copy box laid over the photo
  const copy = document.createElement('div');
  copy.className = 'tabs-copy';
  content.append(copy);
  const media = document.createElement('div');
  media.className = 'tabs-media';

  [...panel.children].forEach((cell) => {
    [...cell.children].forEach((el) => {
      const isPictureOnly = el.tagName === 'PICTURE'
        || (el.querySelector('picture') && el.textContent.trim() === '');
      if (isPictureOnly) media.append(el);
      else copy.append(el);
    });
    // keep the cell when it still carries UE instrumentation, otherwise drop it
    if (!cell.children.length) {
      moveInstrumentation(cell, content);
      cell.remove();
    }
  });

  if (media.children.length) {
    optimizeImages(media, index === 0);
    panel.classList.add('tabs-has-media');
    panel.append(media);
  }
  panel.append(content);
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  tabBlockCnt += 1;
  tablist.id = `tabs-tablist-${tabBlockCnt}`;

  // the first cell of each row is the label of the tab
  const rows = [...block.children]
    .filter((row) => row.firstElementChild && row.firstElementChild.textContent.trim() !== '');

  rows.forEach((row, i) => {
    const tab = row.firstElementChild;
    const id = `tabs-panel-${tabBlockCnt}-${i + 1}`;

    // decorate tabpanel
    const tabpanel = row;
    tabpanel.className = 'tabs-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', i !== 0);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', i === 0);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    if (i !== 0) button.setAttribute('tabindex', '-1');

    button.addEventListener('click', () => {
      block.querySelectorAll('.tabs-panel').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
        btn.setAttribute('tabindex', '-1');
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
      button.removeAttribute('tabindex');
    });

    tablist.append(button);

    // remove the tab label from the panel, which also removes it from the UE tree
    tab.remove();
    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }

    decoratePanel(tabpanel, i);
  });

  // arrow-key navigation between tabs
  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const buttons = [...tablist.querySelectorAll('button')];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = buttons.length - 1;
    e.preventDefault();
    buttons[next].focus();
    buttons[next].click();
  });

  // panels without their own photo reuse the first panel's photo as a shared background
  const sharedMedia = block.querySelector('.tabs-panel.tabs-has-media .tabs-media');
  if (sharedMedia) {
    block.querySelectorAll('.tabs-panel:not(.tabs-has-media)').forEach((panel) => {
      const clone = sharedMedia.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('*').forEach((el) => {
        [...el.attributes]
          .filter(({ name }) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'))
          .forEach(({ name }) => el.removeAttribute(name));
      });
      clone.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'));
      panel.classList.add('tabs-has-media');
      panel.prepend(clone);
    });
  }

  // tabs sit beneath the panels, matching the source layout
  block.append(tablist);
}