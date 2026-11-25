export default function decorate(block) {
  const items = [...block.children];

  const cards = items.map((item) => {
    const cells = [...item.children];

    const [
      eyebrow,
      title,
      description,
      iconName,
      buttonText,
      buttonLink,
      accent,
      theme,
      alignment,
      radius,
      iconSize,
    ] = cells.map((cell) => cell.textContent.trim());

    return `
      <div
        class="feature-card ${theme || 'light'} ${alignment || 'left'}"
        style="
          --accent:${accent || '#7C3AED'};
          --radius:${radius || 20}px;
          --icon-size:${iconSize || 48}px;
        "
      >
        ${
          eyebrow
            ? `<div class="feature-card-eyebrow">${eyebrow}</div>`
            : ''
        }

        ${
          iconName
            ? `<div class="feature-card-icon">
                <span>${iconName}</span>
              </div>`
            : ''
        }

        ${title ? `<h3>${title}</h3>` : ''}

        ${
          description
            ? `<div class="feature-card-description">
                ${description}
              </div>`
            : ''
        }

        ${
          buttonText
            ? `<a
                class="feature-card-button"
                href="${buttonLink || '#'}"
              >
                ${buttonText}
              </a>`
            : ''
        }
      </div>
    `;
  });

  block.innerHTML = `
    <div class="feature-card-container">
      ${cards.join('')}
    </div>
  `;
}