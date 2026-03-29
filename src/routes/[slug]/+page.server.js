import { caesars } from '$lib/data/caesars';
import { getCaesarContext } from '$lib/data/caesar-context';
import { biographySchema, slugSchema, pageLoadOutputSchema } from '$lib/data/schema';
import { splitParagraphs, escapeHtml } from '$lib/utils/biography-text';
import { CONTENT_PATH } from '$lib/constants';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  return caesars.map((c) => ({ slug: c.slug }));
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { slug } = params;

  try {
    slugSchema.parse(slug);
  } catch {
    throw error(404, 'Invalid slug format');
  }

  const validSlugs = new Set(caesars.map((c) => c.slug));
  if (!validSlugs.has(slug)) {
    throw error(404, 'Caesar not found');
  }

  const context = getCaesarContext(slug);

  if (!context.currentCaesar) {
    throw error(404, 'Caesar not found');
  }

  let raw;
  try {
    const rawFile = await fs.readFile(
      path.join(process.cwd(), CONTENT_PATH, `${slug}.json`),
      'utf-8'
    );
    raw = JSON.parse(rawFile);
  } catch {
    throw error(404, `Could not load biography for ${slug}`);
  }

  const parsed = biographySchema.safeParse(raw);
  if (!parsed.success) {
    console.error(`Validation failed for ${slug}`, parsed.error);
    throw error(500, `Invalid biography data`);
  }

  const processedData = {
    ...parsed.data,
    sections: parsed.data.sections.map((sec) => ({
      ...sec,
      enParagraphs: splitParagraphs(sec.en).map(escapeHtml),
      laParagraphs: splitParagraphs(sec.la).map(escapeHtml),
      wikiLinks: sec.wikiLinks || {}
    }))
  };

  const output = {
    caesarData: processedData,
    currentCaesar: context.currentCaesar,
    currentCaesarIndex: context.currentCaesarIndex,
    nextCaesar: context.nextCaesar,
    prevCaesar: context.prevCaesar,
    navigationItems: caesars.map((caesar) => ({
      caesar,
      isCurrent: caesar.slug === slug
    })),
    slug
  };

  if (process.env.NODE_ENV === 'development') {
    pageLoadOutputSchema.parse(output);
  }

  return output;
}
