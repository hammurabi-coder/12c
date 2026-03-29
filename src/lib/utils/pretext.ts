/**
 * Pretext integration for 12c biography text measurement.
 * Browser-only — all functions are no-ops in SSR context.
 */
import { browser } from '$app/environment';

// Lazy import to avoid SSR issues
let _prepare: ((text: string, font: string) => PreparedText) | null = null;
let _layout: ((prepared: PreparedText, maxWidth: number, lineHeight: number) => LayoutResult) | null = null;

type PreparedText = object; // opaque type from pretext
type LayoutResult = { lineCount: number; height: number };

async function loadPretext() {
  if (!browser) return;
  if (_prepare) return;
  const mod = await import('@chenglou/pretext');
  _prepare = mod.prepare;
  _layout = mod.layout;
}

export type MeasureResult = LayoutResult & {
  font: string;
  lineHeight: number;
  measuredAt: number;
};

/**
 * Compute the font string for Pretext from a CSS font shorthand.
 * Handles 'Marcellus', '16px Marcellus', etc.
 */
export function buildPretextFont(
  fontFamily: string,
  fontSizePx: number,
  fontWeight: string = '400'
): string {
  return `${fontWeight} ${fontSizePx}px ${fontFamily}`;
}

/**
 * Convert rem to px using a root font size reference.
 */
export function remToPx(rem: number, rootPx: number = 16): number {
  return rem * rootPx;
}

/**
 * Measure a block of text using Pretext.
 * Returns null if called in SSR or before Pretext is loaded.
 */
export async function measureText(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): Promise<MeasureResult | null> {
  if (!browser) return null;

  await loadPretext();
  if (!_prepare || !_layout) return null;

  const prepared = _prepare(text, font);
  const result = _layout(prepared, maxWidth, lineHeight);

  return {
    ...result,
    font,
    lineHeight,
    measuredAt: Date.now(),
  };
}

/**
 * Measure multiple paragraphs and return their heights.
 * Useful for column equalization or reading progress.
 */
export async function measureParagraphs(
  paragraphs: string[],
  font: string,
  maxWidth: number,
  lineHeight: number
): Promise<MeasureResult[]> {
  if (!browser) return [];

  await loadPretext();
  if (!_prepare || !_layout) return [];

  return paragraphs.map((p) => {
    const prepared = _prepare!(p, font);
    const result = _layout!(prepared, maxWidth, lineHeight);
    return { ...result, font, lineHeight, measuredAt: Date.now() };
  });
}
