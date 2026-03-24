import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

/** @type {import('./$types').PageLoad} */
export async function load() {
  throw redirect(307, `${base}/julius`);
}
