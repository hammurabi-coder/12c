import { z } from 'zod';

export const sectionSchema = z.object({
  heading: z.string(),
  en: z.string(),
  la: z.string(),
  wikiLinks: z.record(z.string()).optional()
});

export const biographySchema = z.object({
  metadata: z.object({
    name: z.string(),
    source: z.string().optional()
  }),
  sections: z.array(sectionSchema),
  notes: z.record(z.string()).optional()
});

export const processedSectionSchema = z.object({
  heading: z.string(),
  en: z.string(),
  la: z.string(),
  wikiLinks: z.record(z.string()).optional(),
  enParagraphs: z.array(z.string()),
  laParagraphs: z.array(z.string())
});

export const caesarNavigationItemSchema = z.object({
  caesar: z.object({
    name: z.string(),
    latin: z.string(),
    dates: z.string(),
    reign: z.string(),
    tag: z.string(),
    n: z.string(),
    slug: z.string(),
    wikipedia: z.string(),
    bustFrame: z.object({
      scale: z.number(),
      x: z.string(),
      y: z.string()
    })
  }),
  isCurrent: z.boolean()
});

export const pageLoadOutputSchema = z.object({
  caesarData: z.object({
    metadata: z.object({
      name: z.string(),
      source: z.string().optional()
    }),
    sections: z.array(processedSectionSchema),
    notes: z.record(z.string()).optional()
  }),
  currentCaesar: z.object({
    name: z.string(),
    latin: z.string(),
    dates: z.string(),
    reign: z.string(),
    tag: z.string(),
    n: z.string(),
    slug: z.string(),
    wikipedia: z.string(),
    bustFrame: z.object({
      scale: z.number(),
      x: z.string(),
      y: z.string()
    })
  }),
  currentCaesarIndex: z.number(),
  nextCaesar: z.nullable(
    z.object({
      name: z.string(),
      latin: z.string(),
      dates: z.string(),
      reign: z.string(),
      tag: z.string(),
      n: z.string(),
      slug: z.string(),
      wikipedia: z.string(),
      bustFrame: z.object({
        scale: z.number(),
        x: z.string(),
        y: z.string()
      })
    })
  ),
  prevCaesar: z.nullable(
    z.object({
      name: z.string(),
      latin: z.string(),
      dates: z.string(),
      reign: z.string(),
      tag: z.string(),
      n: z.string(),
      slug: z.string(),
      wikipedia: z.string(),
      bustFrame: z.object({
        scale: z.number(),
        x: z.string(),
        y: z.string()
      })
    })
  ),
  navigationItems: z.array(caesarNavigationItemSchema),
  slug: z.string()
});

export const slugSchema = z.string().regex(/^[a-z]+$/, 'Slug must be lowercase letters only');
