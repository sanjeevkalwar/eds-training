
export default function decorate(block) {
  const rows = [...block.children];

  // Read parent layout configuration
  const config = rows.find((row) =>
    row.classList.contains('feature-card-config')
  );

  let columns = '3';
  let gap = 'medium';
  let radius = 'medium';

  if (config) {
    const values = [...config.children];

    columns = values[0]?.textContent.trim() || columns;
    gap = values[1]?.textContent.trim() || gap;
    radius = values[2]?.textContent.trim() || radius;

    config.remove();
  }

  // Set parent layout
  block.dataset.columns = columns;
  block.dataset.gap = gap;
  block.dataset.radius = radius;

  // Render individual feature cards
  [...block.children].forEach((row) => {
    const cells = [...row.children];

    const getValue = (index, fallback = '') =>
      cells[index]?.textContent.trim() || fallback;

    const eyebrow = getValue(0);
    const title = getValue(1);
    const description = cells[2]?.innerHTML || '';
    const accent = getValue(3, '#7C3AED');

    const card = document.createElement('div');
    card.className = 'feature-card-content';

    card.style.setProperty('--accent', accent);

    const eyebrowElement = document.createElement('span');
    eyebrowElement.className = 'feature-eyebrow';
    eyebrowElement.textContent = eyebrow;

    const titleElement = document.createElement('h2');
    titleElement.className = 'feature-title';
    titleElement.textContent = title;

    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'feature-description';
    descriptionElement.innerHTML = description;

    if (eyebrow) card.append(eyebrowElement);
    if (title) card.append(titleElement);
    if (description) card.append(descriptionElement);

    row.replaceChildren(card);
    row.classList.add('feature-card-item');
  });

  block.classList.add('feature-card');
}
