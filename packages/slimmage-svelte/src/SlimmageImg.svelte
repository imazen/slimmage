<script lang="ts">
  import { onMount } from 'svelte';
  import { createSlimmage } from 'slimmage-core';
  import type { SlimmageConfig, ImageLoadInfo, ImageFormat } from 'slimmage-core';

  let {
    src,
    container,
    widthStep = 160,
    maxWidth = 4096,
    dprAware = true,
    maxDpr = 3,
    quality = 85,
    qualityDprStep = 10,
    preferredFormat = 'avif' as ImageFormat,
    lazy = true,
    lazyMargin = '200px',
    aspectRatio,
    fetchPriority = 'auto' as 'high' | 'low' | 'auto',
    onload,
    class: className = '',
    ...restProps
  }: {
    src: string;
    container?: string | Element;
    widthStep?: number;
    maxWidth?: number;
    dprAware?: boolean;
    maxDpr?: number;
    quality?: number;
    qualityDprStep?: number;
    preferredFormat?: ImageFormat;
    lazy?: boolean;
    lazyMargin?: string;
    aspectRatio?: number;
    fetchPriority?: 'high' | 'low' | 'auto';
    onload?: (info: ImageLoadInfo) => void;
    class?: string;
    [key: string]: unknown;
  } = $props();

  let imgEl: HTMLImageElement;
  let wrapperEl: HTMLDivElement;

  onMount(() => {
    const config: SlimmageConfig = {
      src,
      container: container ?? wrapperEl,
      widthStep,
      maxWidth,
      dprAware,
      maxDpr,
      quality,
      qualityDprStep,
      preferredFormat,
      lazy,
      lazyMargin,
      aspectRatio,
      fetchPriority,
      onLoad: onload,
    };

    const cleanup = createSlimmage(imgEl, config);
    return cleanup;
  });
</script>

<div bind:this={wrapperEl} class={className} style={aspectRatio ? `aspect-ratio: ${aspectRatio}` : ''}>
  <img bind:this={imgEl} alt="" style="display: block; width: 100%; height: auto;" {...restProps} />
</div>
