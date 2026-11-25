
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];

    const getText = (i, fallback = '') =>
      cells[i]?.textContent.trim() || fallback;

    const card = document.createElement('div');
    card.className = 'feature-card-content';

    card.style.setProperty('--accent', getText(6, '#7C3AED'));
    card.style.setProperty('--radius', `${getText(9, '20')}px`);

    const eyebrow = getText(0);
    const title = getText(1);
    const description = cells[2]?.innerHTML || '';
    const buttonText = getText(4);
    const buttonLink = getText(5);

    card.innerHTML = `
      <span class="eyebrow">${eyebrow}</span>
      <h2>${title}</h2>
      <div class="description">${description}</div>
      ${buttonText && buttonLink
        ? `<a href="${buttonLink}">${buttonText} →</a>`
        : ''}
    `;

    row.replaceChildren(card);
    row.classList.add('feature-card-item');
  });

  block.classList.add('feature-card');
}
