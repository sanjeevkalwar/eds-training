import { decorateRichtext } from './ue.js';

// Refresh from AEM after a saved authoring operation, rather than injecting HTML
// patches into decorated blocks. The editor shell and saved content stay intact.
[
  'aue:content-patch',
  'aue:content-update',
  'aue:content-add',
  'aue:content-move',
  'aue:content-remove',
  'aue:content-copy',
].forEach((type) => document.addEventListener(type, (event) => {
  event.stopPropagation();
  window.location.reload();
}, { capture: true }));

decorateRichtext();
const observer = new MutationObserver(() => decorateRichtext());
observer.observe(document, {
  childList: true,
  attributes: true,
  attributeFilter: ['data-richtext-prop'],
  subtree: true,
});
