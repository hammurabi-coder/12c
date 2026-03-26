#!/usr/bin/env node

import { collectApprovedLinks, loadSuggestionsBySlug, patchBiographyFiles } from './lib/wiki-link-apply.mjs';

const allLinks = collectApprovedLinks(loadSuggestionsBySlug());
const patched = patchBiographyFiles(allLinks);

console.log(`\nDone — ${patched} biographies updated.`);
