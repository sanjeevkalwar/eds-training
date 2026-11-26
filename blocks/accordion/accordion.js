export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const question = row.children[0];
    const answer = row.children[1];

    if (!question || !answer) return;

    const questionText = question.textContent.trim();

    // Create accordion button
    const button = document.createElement('button');
    button.className = 'accordion-question';
    button.type = 'button';
    button.textContent = questionText;
    button.setAttribute('aria-expanded', 'false');

    // Create answer container
    const answerContent = document.createElement('div');
    answerContent.className = 'accordion-answer';
    answerContent.hidden = true;

    answerContent.innerHTML = answer.innerHTML;

    // Clear original row
    row.innerHTML = '';

    // Add elements
    row.append(button, answerContent);

    // Toggle accordion
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!isExpanded));
      answerContent.hidden = isExpanded;
      row.classList.toggle('active', !isExpanded);
    });
  });
}
