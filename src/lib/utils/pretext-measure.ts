/**
 * Svelte action for Pretext-based text measurement.
 * Usage: <div use:pretextMeasure={{ font, maxWidth, lineHeight, lang }}>
 *
 * Dispatches 'pretext-height-{lang}' event with paragraph heights when measured.
 */
import { browser } from '$app/environment';
import type { MeasureResult } from './pretext';

let _prepare: ((text: string, font: string) => object) | null = null;
let _layout: ((prepared: object, maxWidth: number, lineHeight: number) => { lineCount: number; height: number }) | null = null;

async function ensureLoaded() {
  if (!browser || _prepare) return;
  const mod = await import('@chenglou/pretext');
  _prepare = mod.prepare;
  _layout = mod.layout;
}

export type PretextMeasureOptions = {
  font: string;
  maxWidth: number;
  lineHeight: number;
  /** Language key — used to name the dispatched event */
  lang?: string;
};

export function pretextMeasure(
  node: HTMLElement,
  options: PretextMeasureOptions
): { destroy: () => void } | void {
  if (!browser) return;

  let measured = false;

  async function doMeasure() {
    if (measured) return;
    measured = true;

    await ensureLoaded();
    if (!_prepare || !_layout) return;

    const { font, maxWidth, lineHeight, lang = 'unknown' } = options;

    // Get plain text from each paragraph
    const paragraphs = Array.from(node.querySelectorAll<HTMLParagraphElement>('p'));
    if (paragraphs.length === 0) return;

    const results: MeasureResult[] = paragraphs.map((p) => {
      const text = p.textContent ?? '';
      const prepared = _prepare!(text, font);
      const layout = _layout!(prepared, maxWidth, lineHeight);
      return {
        ...layout,
        font,
        lineHeight,
        measuredAt: Date.now(),
      };
    });

    const totalHeight = results.reduce((sum, r) => sum + r.height, 0);
    const totalLines = results.reduce((sum, r) => sum + r.lineCount, 0);

    // Dispatch language-specific event so parent can correlate EN + LAT
    node.dispatchEvent(
      new CustomEvent<{ totalHeight: number; totalLines: number }>(`pretext-height-${lang}`, {
        detail: { totalHeight, totalLines },
        bubbles: true,
      })
    );
  }

  // Measure after a tick to ensure DOM is rendered
  requestAnimationFrame(doMeasure);

  return {
    destroy() {
      // cleanup if needed
    },
  };
}

