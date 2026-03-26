/**
 * Builds a stable section id from a section heading.
 * @param {string} heading
 */
export function slugifyHeading(heading) {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * @param {import('$lib/types').Section[]} sections
 */
export function buildSectionMeta(sections) {
  return sections.map((section, index) => ({
    ...section,
    index,
    id: slugifyHeading(section.heading)
  }));
}
