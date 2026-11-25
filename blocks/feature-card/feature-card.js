
export default function decorate(block) {
  const rows = [...block.children];

  // Read layout settings from the first Feature item
  const firstCells = [...(rows[0]?.children || [])];

  const getValue = (cells, index, fallback = '') =>
    cells[index]?.textContent.trim() || fallback;

  const columns = getValue(firstCells, 5, '3');
  const gap = getValue(firstCells, 6, 'medium');
  const radius = getValue(firstCells, 7, 'medium');

  // Apply layout settings to the parent block
  block.dataset.columns = ['2', '3', '4'].includes(columns)
    ? columns
    : '3';

  block.dataset.gap = ['small', 'medium', 'large'].includes(gap)
    ? gap
    : 'medium';

  block.dataset.radius = ['small', 'medium', 'large'].includes(radius)
    ? radius
    : 'medium';

  // Render each feature card
  rows.forEach((row) => {
    const cells = [...row.children];

    const eyebrow = getValue(cells, 0);
    const title = getValue(cells, 1);
    const descriptionCell = cells[2];
    const imageCell = cells[3];
    const accent = getValue(cells, 4, '#7C3AED');

    const card = document.createElement('div');
    card.className = 'feature-card-content';

    card.style.setProperty('--accent', accent);

    // Eyebrow
    if (eyebrow) {
      const eyebrowElement = document.createElement('span');
      eyebrowElement.className = 'feature-eyebrow';
      eyebrowElement.textContent = eyebrow;
      card.append(eyebrowElement);
    }

    // Title
    if (title) {
      const titleElement = document.createElement('h2');
      titleElement.className = 'feature-title';
      titleElement.textContent = title;
      card.append(titleElement);
    }

    // Description
    if (descriptionCell) {
      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'feature-description';

      [...descriptionCell.childNodes].forEach((node) => {
        descriptionElement.append(node.cloneNode(true));
      });

      card.append(descriptionElement);
    }

    // Image below description
    const image = imageCell?.querySelector('picture, img');

    if (image) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'feature-image';

      imageWrapper.append(image.cloneNode(true));
      card.append(imageWrapper);
    }

    row.replaceChildren(card);
    row.classList.add('feature-card-item');
  });

  block.classList.add('feature-card');
}
