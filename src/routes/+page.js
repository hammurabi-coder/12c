import { caesars } from '$lib/data/caesars';
import { base } from '$app/paths';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  // Get the Caesar name from the URL hash if it exists, otherwise default to 'julius'
  let name = url.hash ? url.hash.substring(1).replace(/-/g, ' ') : 'julius';

  // Validate the name, fallback to julius if invalid
  if (!caesars.find((c) => c.slug === name)) {
    name = 'julius';
  }

  const response = await fetch(`${base}/content/${name}.json`);
  const caesarData = await response.json();

  return {
    caesarData,
    initialSlug: name
  };
}
