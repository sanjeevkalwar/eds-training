
import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Split banner: tinted full-width band with text on one side
 * and an image on the other.
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
        media.append(picture);
        return;
      }

      if (!cell.textContent.trim() && !picture) return;

      while (cell.firstChild) {
        content.append(cell.firstChild);
      }
    });
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading) {
    heading.classList.add('split-banner-title');
  }

  content.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a');

    if (!link || p.textContent.trim() !== link.textContent.trim()) return;

    p.className = 'split-banner-cta';
    link.className = '';
  });

  media.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);

    if (
      url.origin !== window.location.origin
      || /\.svg$/i.test(url.pathname)
    ) return;

    const optimized = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [
        { media: '(min-width: 900px)', width: '900' },
        { width: '750' },
      ],
    );

    img.closest('picture').replaceWith(optimized);
  });

  const children = [];

  if (content.children.length) children.push(content);

  if (media.children.length) {
    children.push(media);
  } else {
    block.classList.add('no-image');
  }

  block.replaceChildren(...children);
}
