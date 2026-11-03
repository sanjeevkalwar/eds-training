function englishText(value) {
  return typeof value?.en === 'string' ? value.en.trim() : '';
}

function createLaureate(laureate) {
  const name = [laureate?.knownName, laureate?.fullName, laureate?.orgName]
    .map(englishText).find(Boolean);
  if (!name || !/^\d+$/.test(laureate?.id)
    || !Number.isSafeInteger(Number(laureate.id)) || Number(laureate.id) < 1
    || !Array.isArray(laureate.nobelPrizes) || !laureate.nobelPrizes.length) {
    throw new Error('The Nobel Prize API returned an invalid laureate.');
  }

  const item = document.createElement('li');
  const heading = document.createElement('h3');
  const link = document.createElement('a');
  link.href = `https://www.nobelprize.org/laureate/${laureate.id}`;
  link.textContent = name;
  heading.append(link);
  item.append(heading);

  const origin = laureate.birth || laureate.founded;
  const details = [
    typeof origin?.date === 'string' ? origin.date.trim() : '',
    englishText(origin?.place?.locationString),
  ].filter(Boolean);
  if (details.length) {
    const biography = document.createElement('p');
    biography.className = 'laureate-biography';
    biography.textContent = `${laureate.birth ? 'Born' : 'Founded'}: ${details.join(' | ')}`;
    item.append(biography);
  }

  const prizes = document.createElement('ul');
  prizes.className = 'laureate-prizes';
  laureate.nobelPrizes.forEach((prize) => {
    const category = englishText(prize?.category);
    if (!category || !/^\d{4}$/.test(prize?.awardYear)) {
      throw new Error('The Nobel Prize API returned an invalid prize.');
    }
    const award = document.createElement('li');
    const label = document.createElement('p');
    label.className = 'laureate-award';
    label.textContent = `${category} | ${prize.awardYear}`;
    award.append(label);
    const motivation = englishText(prize.motivation);
    if (motivation) {
      const description = document.createElement('p');
      description.className = 'laureate-motivation';
      description.textContent = motivation;
      award.append(description);
    }
    prizes.append(award);
  });
  item.append(prizes);
  return item;
}

export default async function decorate(block) {
  const limitRows = [...block.children].filter((row) => (
    ['limit', 'count'].includes(row.children[0]?.textContent.trim().toLowerCase())
  ));
  const value = limitRows.length ? limitRows[0].children[1]?.textContent.trim() : '3';
  const limit = Number(value);

  const heading = document.createElement('h2');
  heading.textContent = 'Nobel Prize Winners';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const list = document.createElement('ul');
  list.className = 'laureates';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'button primary';
  retry.textContent = 'Try again';
  retry.hidden = true;
  const attribution = document.createElement('p');
  attribution.className = 'list-dynamic-artwork-attribution';
  const source = document.createElement('a');
  source.href = 'https://www.nobelprize.org/';
  source.textContent = 'Data from NobelPrize.org';
  attribution.append(source);
  block.replaceChildren(heading, status, list, retry, attribution);

  if (limitRows.length > 1 || !/^\d+$/.test(value || '') || limit < 0 || limit > 20) {
    status.textContent = 'Invalid Limit: enter one whole number from 0 to 20 in a single Limit row.';
    // eslint-disable-next-line no-console
    console.error('Nobel Prize Winners configuration is invalid', { value });
    return;
  }

  if (limit === 0) {
    status.textContent = 'No winners selected.';
    return;
  }

  async function loadLaureates() {
    retry.disabled = true;
    retry.hidden = true;
    list.replaceChildren();
    list.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading Nobel Prize winners...';
    try {
      const url = new URL('https://api.nobelprize.org/2.1/laureates');
      url.searchParams.set('limit', String(limit));
      const response = await fetch(url.href, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Nobel Prize API request failed (${response.status}).`);
      const payload = await response.json();
      if (!Array.isArray(payload?.laureates) || payload.laureates.length !== limit) {
        throw new Error(`Expected ${limit} laureates in the API response.`);
      }
      const items = payload.laureates.map(createLaureate);
      list.replaceChildren(...items);
      status.textContent = `${limit} Nobel Prize ${limit === 1 ? 'winner' : 'winners'} loaded.`;
    } catch (error) {
      status.textContent = 'Unable to load Nobel Prize winners. Please try again.';
      retry.hidden = false;
      // eslint-disable-next-line no-console
      console.error('Nobel Prize Winners loading failed', error);
    } finally {
      retry.disabled = false;
      list.setAttribute('aria-busy', 'false');
    }
  }

  retry.addEventListener('click', loadLaureates);
  await loadLaureates();
}
