const API_URL = 'https://dog.ceo/api/breeds/image/random';
const TIMEOUT = 15000;

function loadImage(url) {
  const image = document.createElement('img');
  image.alt = 'A random dog from Dog CEO';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      image.onload = null;
      image.onerror = null;
      image.removeAttribute('src');
      reject(new Error('Dog image request timed out.'));
    }, TIMEOUT);
    image.onload = () => {
      clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error('The dog image could not be loaded.'));
    };
    image.src = url;
  });
}

export default async function decorate(block) {
  const title = block.firstElementChild?.firstElementChild?.textContent.trim()
    || 'Meet a random dog';
  const heading = document.createElement('h2');
  heading.textContent = title;

  const media = document.createElement('div');
  media.className = 'dynamic-dog-image-media';

  const status = document.createElement('p');
  status.className = 'dynamic-dog-image-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button primary';
  button.textContent = 'Show another dog';

  const attribution = document.createElement('p');
  attribution.className = 'dynamic-dog-image-attribution';
  const link = document.createElement('a');
  link.href = 'https://dog.ceo/dog-api/';
  link.textContent = 'Images provided by Dog CEO';
  attribution.append(link);

  block.replaceChildren(heading, media, status, button, attribution);

  async function showDog() {
    button.disabled = true;
    media.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading a dog image...';
    try {
      const response = await fetch(API_URL, {
        signal: AbortSignal.timeout(TIMEOUT),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Dog API request failed (${response.status}).`);
      const data = await response.json();
      if (data?.status !== 'success' || typeof data.message !== 'string') {
        throw new Error('The Dog API returned an invalid image response.');
      }
      const url = new URL(data.message);
      if (url.protocol !== 'https:' || url.hostname !== 'images.dog.ceo') {
        throw new Error('The Dog API returned an unexpected image URL.');
      }
      const image = await loadImage(url.href);
      media.replaceChildren(image);
      status.textContent = 'Dog image loaded.';
      button.textContent = 'Show another dog';
    } catch (error) {
      media.replaceChildren();
      status.textContent = 'Unable to load a dog image. Please try again.';
      button.textContent = 'Try again';
      // eslint-disable-next-line no-console
      console.error('Dynamic dog image loading failed', error);
    } finally {
      button.disabled = false;
      media.setAttribute('aria-busy', 'false');
    }
  }

  button.addEventListener('click', showDog);
  await showDog();
}
