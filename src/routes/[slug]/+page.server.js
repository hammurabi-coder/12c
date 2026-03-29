import { caesars } from '$lib/data/caesars';
import { getCaesarContext } from '$lib/data/caesar-context';
import { biographySchema } from '$lib/data/schema';
import { splitParagraphs, escapeHtml } from '$lib/utils/biography-text';
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
  const context = getCaesarContext(slug);

  if (!context.currentCaesar) {
    throw error(404, 'Caesar not found');
  }

  let raw;
  try {
    const rawFile = await fs.readFile(
      path.join(process.cwd(), 'static/content', `${slug}.json`),
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

  // Pre-process paragraphs to free UI from non-UI work
  const processedData = {
    ...parsed.data,
    sections: parsed.data.sections.map((sec) => ({
      ...sec,
      enParagraphs: splitParagraphs(sec.en).map(escapeHtml),
      laParagraphs: splitParagraphs(sec.la).map(escapeHtml),
      wikiLinks: sec.wikiLinks || {}
    }))
  };

  return {
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
}
