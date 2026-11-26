import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Media list: photo on one side, rich text on the other.
 * Supports heading, paragraph, bullet list and CTA button.
 * Options: image-right places the image after the text on desktop.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'media-list-media';

  const content = document.createElement('div');
  content.className = 'media-list-content';

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

  // Style the heading
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');

  if (heading) {
    heading.classList.add('media-list-title');
  }

  // Convert a paragraph containing only a link into a CTA button
  content.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a[href]');

    if (!link || link.querySelector('img')) return;
    if (p.textContent.trim() !== link.textContent.trim()) return;

    p.className = 'button-wrapper media-list-cta';
    link.className = 'button primary';

    if (link.parentElement !== p) {
      p.replaceChildren(link);
    }
  });

  // Optimize images
  media.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);

    if (
      url.origin !== window.location.origin
      || /\.svg$/i.test(url.pathname)
    ) {
      return;
    }

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

  // Append media and content
  const children = [];

  if (media.children.length) {
    children.push(media);
  } else {
    block.classList.add('no-image');
  }

  if (content.children.length) {
    children.push(content);
  }

  block.replaceChildren(...children);
}
