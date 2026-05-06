# Pretext Justified Alignment — Implementation Plan

> **For:** Peter | **By:** Treadwell
> **Status:** Draft

## Goal

Add per-line justified alignment using Pretext for two purposes:
1. **Idea 4** — Single-language justified alignment: sparse lines get explicit `width` + `text-align: left` instead of broken `justify`
2. **Idea 5** — Bilingual column alignment: balance EN and LAT paragraph line counts by inflating shorter column via justified spacing

## Architecture

**Core library:** `src/lib/utils/pretext-justify.ts` — new file
- Exports a Svelte action `pretextAlign(node, options)` that runs `prepareWithSegments` + `layoutWithLines` on each paragraph
- For Idea 4 (single): sets `display: inline-block` + explicit `width` on inner line wrappers for sparse lines
- For Idea 5 (bilingual): also exports `pretextAlignBilingual()` that accepts per-paragraph partner metrics and adds justified line-width inflation

**Modified files:**
- `src/lib/components/BiographySection.svelte` — replaces flat `{@html}` paragraphs with per-line reactive structures, wires both Idea 4 and Idea 5
- `src/lib/utils/pretext-measure.ts` — unchanged; height equalization still works

**Key insight on how injection works:**
- Pretext's `layoutWithLines` returns exact pixel widths per line
- Sparse line (fill < 0.80) → wrap in `<span class="ptx-line" style="display:inline-block;width:{lineWidth}px">`
- Full line (fill ≥ 0.80) → plain text (CSS justify handles it)
- `text-align: left` on the span so it respects the explicit width
- This only injects for sparse lines; most lines remain CSS-handled

**Key insight on bilingual alignment (Idea 5):**
- Pretext runs on both EN and LAT paragraphs simultaneously in `onMount`
- For each paragraph pair: `extraLines = |lineCountEn - lineCountLa|`
- The column with fewer lines inflates each paragraph's lines slightly via Pretext-computed target widths
- `inflationFactor = (lineCountPartner + extraLines) / lineCountPartner` — e.g., LAT has 8 lines, EN has 5 → EN lines inflated × 1.06
- Inflated lines use `display: inline-block; width: {round(naturalWidth * inflationFactor)}px` + `text-align: justify`
- Natural line count preserved but visual height absorbed — paragraphs end together

**Tradeoff:** Converting `{@html paragraph}` (flat string) to `{#each lines}{line}{/each}` (reactive per-line array) changes Svelte's diffing. Paragraph content rarely changes — only on language toggle or wiki-links toggle — so this is acceptable.

---

## Task 1: Write the pretext-justify utility

**File:** `src/lib/utils/pretext-justify.ts`

```typescript
import { browser } from '$app/environment';

type LayoutLine = {
  text: string;
  width: number;
};

type LineAnalysis = {
  lines: LayoutLine[];
  fillRatios: number[];
  avgFill: number;
};

let _prepare: ((text: string, font: string, options?: object) => object) | null = null;
let _layoutLines:
  | ((
      prepared: object,
      maxWidth: number,
      lineHeight: number
    ) => { lines: LayoutLine[]; height: number; lineCount: number })
  | null = null;

async function ensureReady() {
  if (!browser || _prepare) return;
  const mod = await import('@chenglou/pretext');
  _prepare = mod.prepareWithSegments;
  _layoutLines = mod.layoutWithLines;
}

function buildFontSpec(el: HTMLElement): string {
  const style = getComputedStyle(el);
  const size = parseFloat(style.fontSize);
  const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  const weight = style.fontWeight === 'normal' ? '400' : style.fontWeight;
  return `${weight} ${size}px ${family}`;
}

function getLineHeightPx(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const lh = style.lineHeight;
  if (lh.endsWith('px')) return parseFloat(lh);
  return parseFloat(lh) * parseFloat(style.fontSize);
}

function getContentWidth(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const pl = parseFloat(style.paddingLeft) || 0;
  const pr = parseFloat(style.paddingRight) || 0;
  return Math.floor(el.clientWidth - pl - pr);
}

/**
 * Analyze a paragraph's lines using Pretext.
 * Returns per-line data and fill statistics.
 */
export function analyzeParagraph(
  el: HTMLElement
): Promise<LineAnalysis | null> {
  return new Promise(async (resolve) => {
    if (!browser) return resolve(null);
    await ensureReady();
    if (!_prepare || !_layoutLines) return resolve(null);

    const font = buildFontSpec(el);
    const lineHeight = getLineHeightPx(el);
    const maxWidth = getContentWidth(el);
    const text = el.textContent ?? '';

    try {
      const prepared = (_prepare as Function)(text, font);
      const result = (_layoutLines as Function)(
        prepared,
        maxWidth,
        lineHeight
      );

      const lines: LayoutLine[] = result.lines.map((l: { text: string; width: number }) => ({
        text: l.text,
        width: l.width,
      }));

      const fillRatios = lines.map((l) => l.width / maxWidth);
      const avgFill = fillRatios.reduce((a, b) => a + b, 0) / fillRatios.length;

      resolve({ lines, fillRatios, avgFill });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Sparse-line fill ratio threshold below which a line gets explicit width.
 */
export const SPARSE_THRESHOLD = 0.80;

/**
 * Class added to sparse line wrappers.
 */
export const LINE_WRAPPER_CLASS = 'ptx-line';
```

---

## Task 2: Write the bilingual aligner

**Append to:** `src/lib/utils/pretext-justify.ts`

```typescript
/**
 * Compute per-paragraph inflation factors for bilingual column alignment (Idea 5).
 *
 * Given per-paragraph line counts from both columns, returns a map of
 * paragraph index → inflation multiplier for the column that has fewer lines.
 *
 * @param enCounts  Line counts per paragraph in EN column
 * @param laCounts  Line counts per paragraph in LAT column
 * @param deficitColumn  'en' | 'la' — which column should inflate its lines
 */
export function computeInflation(
  enCounts: number[],
  laCounts: number[],
  deficitColumn: 'en' | 'la'
): Map<number, number> {
  const inflations = new Map<number, number>();

  for (let i = 0; i < Math.min(enCounts.length, laCounts.length); i++) {
    const en = enCounts[i];
    const la = laCounts[i];
    if (deficitColumn === 'en' && la > en) {
      inflations.set(i, (la + 0.5) / (en + 0.5));
    } else if (deficitColumn === 'la' && en > la) {
      inflations.set(i, (en + 0.5) / (la + 0.5));
    }
    // if counts equal or no deficit, no inflation
  }

  return inflations;
}
```

---

## Task 3: Write unit tests for pretext-justify

**File:** `src/lib/utils/pretext-justify.test.ts`

Create a minimal test file. Test `computeInflation` logic directly (no DOM needed):

```typescript
import { describe, it, expect } from 'vitest';
import { computeInflation, SPARSE_THRESHOLD } from './pretext-justify';

describe('computeInflation', () => {
  it('returns no inflation when line counts match', () => {
    const result = computeInflation([5, 3, 4], [5, 3, 4], 'en');
    expect(result.size).toBe(0);
  });

  it('inflates EN when LAT has more lines', () => {
    const result = computeInflation([5, 3], [8, 5], 'en');
    expect(result.get(0)).toBeCloseTo(8 / 5, 2);
    expect(result.get(1)).toBeCloseTo(5 / 3, 2);
  });

  it('inflates LAT when EN has more lines', () => {
    const result = computeInflation([8, 5], [5, 3], 'la');
    expect(result.get(0)).toBeCloseTo(8 / 5, 2);
    expect(result.get(1)).toBeCloseTo(5 / 3, 2);
  });

  it('skips paragraphs with no deficit', () => {
    const result = computeInflation([5, 3, 4], [8, 3, 2], 'en');
    expect(result.has(0)).toBe(true);
    expect(result.has(1)).toBe(false); // 3 === 3
    expect(result.has(2)).toBe(true);  // 4 > 2
  });
});

describe('SPARSE_THRESHOLD', () => {
  it('is 0.80', () => {
    expect(SPARSE_THRESHOLD).toBe(0.80);
  });
});
```

**Run:** `cd /home/nanobot/coding/12c && npm test -- src/lib/utils/pretext-justify.test.ts`

---

## Task 4: Add the reactive paragraph renderer to BiographySection

**Modify:** `src/lib/components/BiographySection.svelte`

The key changes:

### Script section additions

```svelte
import { onMount } from 'svelte';
import { analyzeParagraph, computeInflation, SPARSE_THRESHOLD, LINE_WRAPPER_CLASS } from '$lib/utils/pretext-justify';

// For bilingual mode: per-paragraph structure
type ParagraphLayout = {
  lines: Array<{ text: string; width: number; sparse: boolean; inflatedWidth?: number }>;
  inflationFactor: number;
};

let enLayouts = $state<ParagraphLayout[]>([]);
let laLayouts = $state<ParagraphLayout[]>([]);
let bilingualReady = $state(false);
let deficitLang = $state<'en' | 'la'>('en'); // which column inflates

// Measure a single paragraph element and return its layout
async function measureParagraph(el: HTMLElement, inflationFactor = 1): Promise<ParagraphLayout | null> {
  const analysis = await analyzeParagraph(el);
  if (!analysis) return null;

  const { lines, fillRatios, avgFill } = analysis;
  const inflated = lines.map((line) => {
    const sparse = fillRatios[lines.indexOf(line)] < SPARSE_THRESHOLD;
    return {
      ...line,
      sparse,
      inflatedWidth: inflationFactor !== 1
        ? Math.round(line.width * inflationFactor)
        : undefined,
    };
  });

  return { lines: inflated, inflationFactor };
}

// Measure all paragraphs in a column and return per-paragraph layouts
async function measureColumn(
  els: HTMLElement[],
  inflation?: Map<number, number>
): Promise<ParagraphLayout[]> {
  return Promise.all(
    els.map((el, i) => {
      const factor = inflation?.get(i) ?? 1;
      return measureParagraph(el, factor);
    })
  );
}
```

### HTML changes — single column

Replace the flat `{@html}` per-paragraph rendering with per-line rendering:

```svelte
<!-- Single-column: EN or LAT -->
<article
  class="reader-panel mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-8"
  use:pretextMeasure={{ lang: currentLang }}
  on:pretext-height-en={handleEnHeight}
>
  <div class="reader-prose {currentLang === 'la' ? 'italic text-ink/80' : 'text-ink/94'}">
    {#each currentLang === 'en' ? section.enParagraphs : section.laParagraphs as paragraph, pi}
      {#if enLayouts[pi]}
        <p>
          {#each enLayouts[pi].lines as line}
            {#if line.sparse}
              <span class={LINE_WRAPPER_CLASS} style="display:inline-block;width:{line.inflatedWidth ?? line.width}px;text-align:left">{line.text}</span>
            {:else}
              <span>{line.text}</span>
            {/if}
          {/each}
        </p>
      {:else}
        <p>{@html paragraph}</p>
      {/if}
    {/each}
  </div>
</article>
```

### HTML changes — bilingual column (the full Idea 5 implementation)

```svelte
<!-- Bilingual -->
<div class="grid gap-6 lg:grid-cols-2 lg:gap-8 items-start">
  <article
    class="reader-panel px-5 py-5 md:px-7"
    style={bothReady ? `min-height: ${colHeight}px` : ''}
    use:pretextMeasure={{ lang: 'en' }}
    on:pretext-height-en={handleEnHeight}
  >
    <div class="imperial-label mb-4 text-rubric/50">English · Rolfe</div>
    <div class="reader-prose text-ink/92">
      {#each section.enParagraphs as paragraph, pi}
        {#if bilingualReady && enLayouts[pi]}
          <p>
            {#each enLayouts[pi].lines as line}
              {#if line.sparse || enLayouts[pi].inflationFactor !== 1}
                <span class={LINE_WRAPPER_CLASS} style="display:inline-block;width:{line.inflatedWidth ?? line.width}px;text-align:justify">{line.text}</span>
              {:else}
                <span>{line.text}</span>
              {/if}
            {/each}
          </p>
        {:else}
          <p>{@html paragraph}</p>
        {/if}
      {/each}
    </div>
  </article>

  <article
    class="reader-panel border-rubric/8 bg-black/[0.025] px-5 py-5 md:px-7"
    style={bothReady ? `min-height: ${colHeight}px` : ''}
    use:pretextMeasure={{ lang: 'la' }}
    on:pretext-height-la={handleLaHeight}
  >
    <div class="imperial-label mb-4 text-rubric/55">Latin</div>
    <div class="reader-prose text-ink/78 italic">
      {#each section.laParagraphs as paragraph, pi}
        {#if bilingualReady && laLayouts[pi]}
          <p>
            {#each laLayouts[pi].lines as line}
              {#if line.sparse || laLayouts[pi].inflationFactor !== 1}
                <span class={LINE_WRAPPER_CLASS} style="display:inline-block;width:{line.inflatedWidth ?? line.width}px;text-align:justify">{line.text}</span>
              {:else}
                <span>{line.text}</span>
              {/if}
            {/each}
          </p>
        {:else}
          <p>{@html paragraph}</p>
        {/if}
      {/each}
    </div>
  </article>
</div>
```

### onMount hook — bilingual measurement

Add to script:

```svelte
onMount(async () => {
  if (currentLang === 'both') {
    // Wait for DOM paragraphs to be available
    await new Promise(r => setTimeout(r, 50));

    const enEls = Array.from(
      document.querySelectorAll<HTMLElement>('.reader-panel:first-child .reader-prose p')
    );
    const laEls = Array.from(
      document.querySelectorAll<HTMLElement>('.reader-panel:last-child .reader-prose p')
    );

    // First pass: raw line counts
    const enCounts = await Promise.all(
      enEls.map(async (el) => {
        const a = await analyzeParagraph(el);
        return a?.lines.length ?? 0;
      })
    );
    const laCounts = await Promise.all(
      laEls.map(async (el) => {
        const a = await analyzeParagraph(el);
        return a?.lines.length ?? 0;
      })
    );

    // Determine which column needs to inflate (the shorter one per paragraph)
    let enTotal = 0, laTotal = 0;
    for (let i = 0; i < enCounts.length; i++) {
      enTotal += enCounts[i];
      laTotal += laCounts[i];
    }
    deficitLang = laTotal > enTotal ? 'en' : 'la';

    // Compute inflation factors
    const inflations = computeInflation(enCounts, laCounts, deficitLang);

    // Measure with inflation
    [enLayouts, laLayouts] = await Promise.all([
      measureColumn(enEls, deficitLang === 'en' ? inflations : undefined),
      measureColumn(laEls, deficitLang === 'la' ? inflations : undefined),
    ]);

    bilingualReady = true;
  }
});
```

### Fallback CSS for sparse lines

Add to BiographySection's `<style>` block:

```css
  .ptx-line {
    /* inherits font, line-height from parent */
  }

  /* Ensure justify works on inflated inline-blocks */
  .reader-prose p {
    text-align: justify;
    text-justify: inter-word;
    text-wrap: stable;
  }
```

---

## Task 5: Verify the build

```bash
cd /home/nanobot/coding/12c && npm run build 2>&1 | tail -30
```

Expected: clean build, no TypeScript errors.

---

## Task 6: Smoke-test in browser

Start the dev server if not already running:

```bash
cd /home/nanobot/coding/12c && npm run dev -- --host 0.0.0.0 --port 5173 &
sleep 4 && curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/12c/julius/
```

Navigate to Julius, toggle to Bilingual. Open browser console — expect no JS errors. Inspect a sparse-looking paragraph (end of a long sentence) — the `<span class="ptx-line" style="display:inline-block;width:NNNpx">` should appear.

---

## Implementation Notes

- **DOM structure change:** `{@html paragraph}` → per-line `{#each}` is a meaningful change. The fallback `<p>{@html paragraph}</p>` until layouts are ready prevents layout flash on first render.
- **SSR safety:** all Pretext calls gated behind `browser` check and `onMount` (client-only)
- **Inflation cap:** inflation factor should be clamped to avoid absurdly wide lines. Add: `Math.min(inflationFactor, 1.15)` in `computeInflation`
- **Performance:** Pretext `prepare()` is ~19ms for 500 paragraphs (from their benchmarks). We're calling it per-paragraph on mount. For a 50-paragraph biography, that's ~2ms total — well within acceptable bounds
- **Wiki-links toggle:** when links toggle off/on, `enLayouts` and `laLayouts` go stale. The heights will be off until next mount. A reactive statement watching `wikiLinksEnabled` should reset `bilingualReady = false` and re-trigger `onMount` logic.

---

## YAGNI Check

- NOT implementing: per-word span injection (too DOM-heavy)
- NOT implementing: real-time re-alignment on resize (window resize events are expensive)
- NOT implementing: balanced/ragged-right text as a user toggle — just one mode
