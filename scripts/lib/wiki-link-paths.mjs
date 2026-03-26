import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CONTENT_DIR = join(__dirname, '../../static/content');
export const SUGGESTIONS_DIR = join(__dirname, '../../suggestions');
export const WIKIPEDIA_BASE = 'https://en.wikipedia.org/wiki/';

export function ensureSuggestionsDir() {
  mkdirSync(SUGGESTIONS_DIR, { recursive: true });
}
