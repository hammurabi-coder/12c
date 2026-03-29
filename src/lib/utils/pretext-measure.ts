/**
 * Svelte action for Pretext-based text measurement.
 * Reads font metrics and content width directly from the node's computed style,
 * so CSS and Pretext are always in sync — no hardcoded values anywhere.
 *
 * Dispatches 'pretext-height-{lang}' with { totalHeight, totalLines }.
 */
import { browser } from '$app/environment';

type MeasureResult = {
  lineCount: number;
  height: number;
  font: string;
  lineHeight: number;
  measuredAt: number;
};

let _prepare: ((text: string, font: string) => object) | null = null;
let _layout: ((prepared: object, maxWidth: number, lineHeight: number) => { lineCount: number; height: number }) | null = null;

async function ensureLoaded() {
  if (!browser || _prepare) return;
  const mod = await import('@chenglou/pretext');
  _prepare = mod.prepare;
  _layout = mod.layout;
}

/**
 * Build a Pretext font spec string from computed element styles.
 * Reads font-size, font-weight, font-family from the element's cascade.
 */
function resolveFontSpec(el: HTMLElement): string {
  const style = getComputedStyle(el);
  const size = parseFloat(style.fontSize);
  const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  const weight = style.fontWeight === 'normal' ? '400' : style.fontWeight;
  return `${weight} ${size}px ${family}`;
}

/**
 * Resolve the effective line-height in px from an element.
 * Handles both unitless (multiplier, e.g. 1.95) and px values.
 */
function resolveLineHeightPx(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const lh = style.lineHeight;
  if (lh.endsWith('px')) return parseFloat(lh);
  // unitless: multiply by font-size
  return parseFloat(lh) * parseFloat(style.fontSize);
}

/**
 * Resolve the content width in px of an element (clientWidth minus padding).
 */
function resolveContentWidth(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const pl = parseFloat(style.paddingLeft) || 0;
  const pr = parseFloat(style.paddingRight) || 0;
  return Math.floor(el.clientWidth - pl - pr);
}

export type PretextMeasureOptions = {
  /** Language key — drives the dispatched event name */
  lang?: string;
};

export function pretextMeasure(
  node: HTMLElement,
  options: PretextMeasureOptions = {}
): { destroy: () => void } | void {
  if (!browser) return;

  let measured = false;

  async function doMeasure() {
    if (measured) return;
    measured = true;

    await ensureLoaded();
    if (!_prepare || !_layout) return;

    const lang = options.lang ?? 'unknown';

    // Read resolved values directly from the element's computed styles
    const font = resolveFontSpec(node);
    const lineHeight = resolveLineHeightPx(node);
    const maxWidth = resolveContentWidth(node);

    const paragraphs = Array.from(node.querySelectorAll<HTMLParagraphElement>(':scope > div p'));
    if (paragraphs.length === 0) return;

    const results: MeasureResult[] = paragraphs.map((p) => {
      const text = p.textContent ?? '';
      const prepared = _prepare!(text, font);
      const layout = _layout!(prepared, maxWidth, lineHeight);
      return { ...layout, font, lineHeight, measuredAt: Date.now() };
    });

    const totalHeight = results.reduce((sum, r) => sum + r.height, 0);
    const totalLines = results.reduce((sum, r) => sum + r.lineCount, 0);

    node.dispatchEvent(
      new CustomEvent<{ totalHeight: number; totalLines: number }>(`pretext-height-${lang}`, {
        detail: { totalHeight, totalLines },
        bubbles: true,
      })
    );
  }

  requestAnimationFrame(doMeasure);

  return {
    destroy() {},
  };
}
