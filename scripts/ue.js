import { readBlockConfig, toClassName, toCamelCase } from './aem.js';

export function setupAuthoringCodeBase(scriptURL) {
  const url = new URL(scriptURL, window.location.href);
  if (url.origin !== window.location.origin) {
    [window.hlx.codeBasePath] = url.href.split('/scripts/scripts.js');
  }
}

export function moveInstrumentation(from, to) {
  if (!from || !to) return;
  [...from.attributes].forEach(({ name, value }) => {
    if (name.startsWith('data-aue-') || name.startsWith('data-richtext-')) {
      to.setAttribute(name, value);
      from.removeAttribute(name);
    }
  });
}

export function decorateRichtext(container = document) {
  [...container.querySelectorAll('[data-richtext-prop]')].forEach((element) => {
    if (!element.hasAttribute('data-richtext-prop')) return;
    const {
      richtextResource, richtextProp, richtextLabel, richtextFilter,
    } = element.dataset;
    const siblings = [];
    let sibling = element.nextElementSibling;
    while (sibling?.dataset.richtextProp === richtextProp
      && sibling?.dataset.richtextResource === richtextResource) {
      siblings.push(sibling);
      sibling = sibling.nextElementSibling;
    }
    const group = document.createElement('div');
    group.dataset.aueType = 'richtext';
    group.dataset.aueProp = richtextProp;
    if (richtextResource) {
      group.dataset.aueResource = richtextResource;
      group.dataset.aueBehavior = 'component';
    }
    if (richtextLabel) group.dataset.aueLabel = richtextLabel;
    if (richtextFilter) group.dataset.aueFilter = richtextFilter;
    [element, ...siblings].forEach((part) => {
      [...part.attributes].filter(({ name }) => name.startsWith('data-richtext-'))
        .forEach(({ name }) => part.removeAttribute(name));
    });
    element.replaceWith(group);
    group.append(element, ...siblings);
  });
}

// The vendored section decorator treats every div as a block. AEM also emits
// classless divs for default content, which must remain in the default wrapper.
export function decorateAuthoringSections(main) {
  main.querySelectorAll(':scope > div:not([data-section-status])').forEach((section) => {
    let wrapper;
    let defaultContent = false;
    [...section.children].forEach((element) => {
      const isBlock = element.tagName === 'DIV' && !!element.className;
      if (isBlock || !defaultContent) {
        wrapper = document.createElement('div');
        if (!isBlock) wrapper.classList.add('default-content-wrapper');
        section.append(wrapper);
      }
      defaultContent = !isBlock;
      wrapper.append(element);
    });
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    section.style.display = 'none';
  });
}

export function decorateSectionMetadata(main) {
  main.querySelectorAll('.section-metadata').forEach((metadata) => {
    const section = metadata.closest('.section');
    if (!section) return;
    const config = readBlockConfig(metadata);
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'style') {
        value.split(',').map((style) => toClassName(style.trim())).filter(Boolean)
          .forEach((style) => section.classList.add(style));
      } else {
        section.dataset[toCamelCase(key)] = value;
      }
    });
    metadata.parentElement.remove();
  });
}
