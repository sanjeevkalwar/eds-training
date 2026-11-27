let accordionCount = 0;

export default function decorate(block) {
  accordionCount += 1;

  const rows = [...block.children];

  rows.forEach((row, index) => {
    const questionCell = row.children[0];
    const answerCell = row.children[1];

    if (!questionCell || !answerCell) return;

    const questionText = questionCell.textContent.trim();

    const button = document.createElement('button');
    button.className = 'accordion-question';
    button.type = 'button';
    button.textContent = questionText;
    button.setAttribute('aria-expanded', 'false');

    const answer = document.createElement('div');
    answer.className = 'accordion-answer';
    answer.id = `accordion-${accordionCount}-answer-${index}`;
    answer.hidden = true;

    answer.innerHTML = answerCell.innerHTML;

    button.setAttribute('aria-controls', answer.id);

    row.classList.add('accordion-item');
    row.replaceChildren(button, answer);

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!isExpanded));
      answer.hidden = isExpanded;
      row.classList.toggle('active', !isExpanded);
    });
  });
}