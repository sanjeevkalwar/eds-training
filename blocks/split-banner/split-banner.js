import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Split banner: tinted full-width band with text (heading, paragraph,
 * arrow CTA) on one side and a wide photo on the other.
 * Rows: 1) image (with alt), 2) rich-text content. Either row may be
 * missing; text split across several rows is merged into the content.
 * Options: `image-left` places the image before the text on desktop.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'split-banner-content';
  const media = document.createElement('div');
  media.className = 'split-banner-media';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    (cells.length ? cells : [row]).forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && cell.textContent.trim() === '' && !media.children.length) {
        moveInstrumentation(row, media);
        media.append(picture);
        return;
      }
      if (!cell.textContent.trim() && !picture) return;
      if (!content.children.length) moveInstrumentation(row, content);
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('split-banner-title');

  // a paragraph holding only a link is the arrow call to action
  content.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a');
    if (!link || p.textContent.trim() !== link.textContent.trim()) return;
    p.className = 'split-banner-cta';
    link.className = '';
  });

  media.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '900' }, { width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  const children = [];
  if (content.children.length) children.push(content);
  if (media.children.length) children.push(media);
  else block.classList.add('no-image');
  block.replaceChildren(...children);
}