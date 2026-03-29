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
