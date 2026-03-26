<script>
  import { getBustUrl } from '$lib/utils/paths';

  /** @type {{
   *   caesar: import('$lib/types').Caesar,
   *   alt: string,
   *   frameClass?: string,
   *   imageClass?: string,
   *   loading?: 'eager' | 'lazy',
   *   decoding?: 'sync' | 'async' | 'auto'
   * }} */
  let {
    caesar,
    alt,
    frameClass = '',
    imageClass = '',
    loading = 'lazy',
    decoding = 'async'
  } = $props();

  const bustSrc = $derived(getBustUrl(caesar.name));
  const bustStyle = $derived(
    `--bust-scale: ${caesar.bustFrame.scale}; --bust-x: ${caesar.bustFrame.x}; --bust-y: ${caesar.bustFrame.y};`
  );
</script>

<div class={`bust-frame ${frameClass}`} style={bustStyle}>
  <div class="bust-positioner">
    <img src={bustSrc} {alt} {loading} {decoding} class={`bust-image ${imageClass}`} />
  </div>
</div>

<style>
  .bust-frame {
    position: relative;
    overflow: hidden;
  }

  .bust-positioner {
    position: absolute;
    left: 50%;
    top: 50%;
    height: calc(100% * var(--bust-scale, 1));
    width: calc(100% * var(--bust-scale, 1));
    max-width: none;
    transform: translate(calc(-50% + var(--bust-x, 0%)), calc(-50% + var(--bust-y, 0%)));
    transform-origin: center;
  }

  .bust-image {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
</style>
