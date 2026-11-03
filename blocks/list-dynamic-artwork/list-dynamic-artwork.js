export default async function decorate(block) {
  const countRows = [...block.children].filter((row) => (
    row.children[0]?.textContent.trim().toLowerCase() === 'count'
  ));
  const value = countRows.length ? countRows[0].children[1]?.textContent.trim() : '5';
  const count = Number(value);

  const heading = document.createElement('h2');
  heading.textContent = 'Artworks';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const list = document.createElement('ul');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'button primary';
  retry.textContent = 'Try again';
  retry.hidden = true;
  const attribution = document.createElement('p');
  attribution.className = 'list-dynamic-artwork-attribution';
  const source = document.createElement('a');
  source.href = 'https://www.artic.edu/collection';
  source.textContent = 'Collection of the Art Institute of Chicago';
  attribution.append(source);
  block.replaceChildren(heading, status, list, retry, attribution);

  if (countRows.length > 1 || !/^\d+$/.test(value || '') || count < 1 || count > 100) {
    status.textContent = 'Invalid Count: enter one whole number from 1 to 100 in the Count row.';
    // eslint-disable-next-line no-console
    console.error('List dynamic artwork configuration is invalid', { value });
    return;
  }

  async function loadArtworks() {
    retry.disabled = true;
    retry.hidden = true;
    list.replaceChildren();
    list.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading artworks...';
    try {
      const url = new URL('https://api.artic.edu/api/v1/artworks');
      url.searchParams.set('limit', String(count));
      url.searchParams.set('fields', 'id,title');
      const response = await fetch(url.href, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Artwork API request failed (${response.status}).`);
      const payload = await response.json();
      if (!Array.isArray(payload?.data) || payload.data.length !== count) {
        throw new Error(`Expected ${count} artworks in the API response.`);
      }
      const items = payload.data.map((artwork) => {
        if (!Number.isSafeInteger(artwork?.id) || artwork.id < 1
          || typeof artwork.title !== 'string' || !artwork.title.trim()) {
          throw new Error('The Artwork API returned an invalid artwork.');
        }
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `https://www.artic.edu/artworks/${artwork.id}`;
        link.textContent = artwork.title;
        item.append(link);
        return item;
      });
      list.replaceChildren(...items);
      status.textContent = `${count} ${count === 1 ? 'artwork' : 'artworks'} loaded.`;
    } catch (error) {
      status.textContent = 'Unable to load artworks. Please try again.';
      retry.hidden = false;
      // eslint-disable-next-line no-console
      console.error('Dynamic artwork loading failed', error);
    } finally {
      retry.disabled = false;
      list.setAttribute('aria-busy', 'false');
    }
  }

  retry.addEventListener('click', loadArtworks);
  await loadArtworks();
}
