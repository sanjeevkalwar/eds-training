let tabsCount = 0;

export default function decorate(block) {
  tabsCount += 1;

  const rows = [...block.children];

  const tabList = document.createElement('div');
  tabList.className = 'tabs-list';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Content tabs');

  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  rows.forEach((row, index) => {
    const titleCell = row.children[0];
    const contentCell = row.children[1];

    if (!titleCell || !contentCell) return;

    const tabId = `tabs-${tabsCount}-tab-${index}`;
    const panelId = `tabs-${tabsCount}-panel-${index}`;

    const title = titleCell.textContent.trim();

    // Create tab button
    const button = document.createElement('button');
    button.className = 'tabs-button';
    button.type = 'button';
    button.textContent = title;
    button.id = tabId;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panelId);
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');

    // Create content panel
    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = index !== 0;

    panel.innerHTML = contentCell.innerHTML;

    // Add tab and panel
    tabList.append(button);
    panels.append(panel);

    // Handle tab click
    button.addEventListener('click', () => {
      activateTab(index);
    });

    // Handle keyboard navigation
    button.addEventListener('keydown', (event) => {
      let nextIndex = index;

      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % rows.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + rows.length) % rows.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = rows.length - 1;
      } else {
        return;
      }

      event.preventDefault();

      const nextButton = tabList.children[nextIndex];
      nextButton.focus();
      activateTab(nextIndex);
    });
  });

  function activateTab(activeIndex) {
    [...tabList.children].forEach((button, index) => {
      const isActive = index === activeIndex;

      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');

      panels.children[index].hidden = !isActive;
    });
  }

  block.replaceChildren(tabList, panels);
}