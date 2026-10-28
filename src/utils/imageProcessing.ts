export interface EnhancementSettings {
  brightness: number;     // -100 to 100 (default 0)
  contrast: number;       // -100 to 100 (default 0)
  saturation: number;     // -100 to 100 (default 0)
  vibrance: number;       // -100 to 100 (default 0)
  warmth: number;         // -100 to 100 (default 0)
  exposure: number;       // -100 to 100 (default 0)
  sharpen: number;        // 0 to 100 (default 0)
  noiseReduction: number; // 0 to 100 (default 0)
  highlights: number;     // -100 to 100 (default 0)
  shadows: number;        // -100 to 100 (default 0)
}

export const DEFAULT_ENHANCEMENT_SETTINGS: EnhancementSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  warmth: 0,
  exposure: 0,
  sharpen: 0,
  noiseReduction: 0,
  highlights: 0,
  shadows: 0,
};

export interface EnhancementPreset {
  id: string;
  name: string;
  description: string;
  settings: EnhancementSettings;
}

export const ENHANCEMENT_PRESETS: EnhancementPreset[] = [
  {
    id: 'cinematic_hdr',
    name: 'Cinematic HDR',
    description: 'Deepened contrast, rich colors, and enhanced micro-texture.',
    settings: {
      brightness: 4,
      contrast: 22,
      saturation: 18,
      vibrance: 25,
      warmth: 6,
      exposure: 6,
      sharpen: 35,
      noiseReduction: 10,
      highlights: -12,
      shadows: 16,
    },
  },
  {
    id: 'crystal_sharp',
    name: 'Ultra Clarity & Sharpen',
    description: 'Crisp edge enhancement and plumage/fur detail retrieval.',
    settings: {
      brightness: 2,
      contrast: 15,
      saturation: 8,
      vibrance: 14,
      warmth: 0,
      exposure: 4,
      sharpen: 55,
      noiseReduction: 5,
      highlights: -5,
      shadows: 10,
    },
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour Radiance',
    description: 'Warm amber tones, softened shadows, and luminous highlights.',
    settings: {
      brightness: 6,
      contrast: 12,
      saturation: 22,
      vibrance: 20,
      warmth: 32,
      exposure: 10,
      sharpen: 20,
      noiseReduction: 8,
      highlights: 14,
      shadows: 8,
    },
  },
  {
    id: 'cold_moonlight',
    name: 'Nocturnal Cyan Film',
    description: 'Cool atmospheric silver-blue tint for night beasts and fantasy.',
    settings: {
      brightness: -2,
      contrast: 25,
      saturation: -5,
      vibrance: 10,
      warmth: -35,
      exposure: -4,
      sharpen: 30,
      noiseReduction: 12,
      highlights: -10,
      shadows: -8,
    },
  },
  {
    id: 'denoise_smooth',
    name: 'Clean Denoise & Polish',
    description: 'Reduces grain and compression noise while preserving key contours.',
    settings: {
      brightness: 2,
      contrast: 8,
      saturation: 10,
      vibrance: 12,
      warmth: 2,
      exposure: 4,
      sharpen: 15,
      noiseReduction: 45,
      highlights: 0,
      shadows: 6,
    },
  },
  {
    id: 'vibrant_wildlife',
    name: 'Wildlife Vivid Color',
    description: 'Intense natural iridescence for flora, fauna, and animal eyes.',
    settings: {
      brightness: 5,
      contrast: 18,
      saturation: 32,
      vibrance: 38,
      warmth: 8,
      exposure: 6,
      sharpen: 28,
      noiseReduction: 8,
      highlights: -6,
      shadows: 12,
    },
  },
];

/**
 * Main Canvas 2D image processing pipeline.
 * Performs pixel-level tone curve, color space, sharpening convolution,
 * and edge-preserving noise reduction without any external services.
 */
export function processCanvasImage(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  settings: EnhancementSettings
): void {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  targetCanvas.width = width;
  targetCanvas.height = height;

  const srcCtx = sourceCanvas.getContext('2d');
  const tgtCtx = targetCanvas.getContext('2d');
  if (!srcCtx || !tgtCtx) return;

  const srcImageData = srcCtx.getImageData(0, 0, width, height);
  const data = new Uint8ClampedArray(srcImageData.data);

  // Precompute lookup tables (LUT) for fast performance
  const expFactor = Math.pow(2, settings.exposure / 50); // exposure curve
  const brightAdd = settings.brightness * 1.5;
  const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));

  const satMult = (settings.saturation + 100) / 100;
  const vibMult = settings.vibrance / 100;
  const warmthShift = settings.warmth; // Shifts red/yellow vs blue

  const highlightShift = settings.highlights / 100;
  const shadowShift = settings.shadows / 100;

  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure & Brightness
    r = r * expFactor + brightAdd;
    g = g * expFactor + brightAdd;
    b = b * expFactor + brightAdd;

    // 2. Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // 3. Highlights & Shadows
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 128 && shadowShift !== 0) {
      const shadowWeight = (1 - lum / 128);
      const shift = shadowShift * 40 * shadowWeight;
      r += shift;
      g += shift;
      b += shift;
    } else if (lum >= 128 && highlightShift !== 0) {
      const highlightWeight = ((lum - 128) / 128);
      const shift = highlightShift * 40 * highlightWeight;
      r += shift;
      g += shift;
      b += shift;
    }

    // 4. Warmth (Color Temperature)
    if (warmthShift !== 0) {
      r += warmthShift * 0.45;
      g += warmthShift * 0.15;
      b -= warmthShift * 0.45;
    }

    // 5. Saturation & Vibrance
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (max + min) / 2;

    // Standard saturation
    r = avg + (r - avg) * satMult;
    g = avg + (g - avg) * satMult;
    b = avg + (b - avg) * satMult;

    // Selective vibrance (boosts muted colors more than saturated ones)
    if (vibMult !== 0) {
      const sat = (max - min) / 255;
      const vibFactor = (1 - sat) * vibMult;
      r = avg + (r - avg) * (1 + vibFactor);
      g = avg + (g - avg) * (1 + vibFactor);
      b = avg + (b - avg) * (1 + vibFactor);
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  // 6. Noise Reduction (Edge-Preserving Spatial Filter)
  let processedData: Uint8ClampedArray<any> = data;
  if (settings.noiseReduction > 0) {
    processedData = applyEdgePreservingDenoise(processedData, width, height, settings.noiseReduction);
  }

  // 7. Sharpening (Unsharp Mask Convolution)
  if (settings.sharpen > 0) {
    processedData = applySharpenConvolution(processedData, width, height, settings.sharpen);
  }

  const outImageData = tgtCtx.createImageData(width, height);
  outImageData.data.set(processedData);
  tgtCtx.putImageData(outImageData, 0, 0);
}

/**
 * Edge-preserving bilateral/selective smoothing filter.
 * Blurs noise variations while preserving sharp contrast boundaries.
 */
function applyEdgePreservingDenoise(
  input: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(input);
  const threshold = 18 + (100 - strength) * 0.25; // edge threshold
  const radius = strength > 60 ? 2 : 1;

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      const centerR = input[idx];
      const centerG = input[idx + 1];
      const centerB = input[idx + 2];

      let sumR = centerR;
      let sumG = centerG;
      let sumB = centerB;
      let count = 1;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const nR = input[nIdx];
          const nG = input[nIdx + 1];
          const nB = input[nIdx + 2];

          // Compute color distance
          const diff = Math.abs(centerR - nR) + Math.abs(centerG - nG) + Math.abs(centerB - nB);
          if (diff < threshold * 3) {
            sumR += nR;
            sumG += nG;
            sumB += nB;
            count++;
          }
        }
      }

      const blend = strength / 130;
      output[idx] = centerR * (1 - blend) + (sumR / count) * blend;
      output[idx + 1] = centerG * (1 - blend) + (sumG / count) * blend;
      output[idx + 2] = centerB * (1 - blend) + (sumB / count) * blend;
    }
  }

  return output;
}

/**
 * 3x3 Laplacian / Unsharp Mask convolution for crisp sharpening.
 */
function applySharpenConvolution(
  input: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(input);
  const k = (amount / 100) * 0.85; // kernel factor
  const centerWeight = 1 + 4 * k;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          input[idx + c] * centerWeight -
          k * (input[up + c] + input[down + c] + input[left + c] + input[right + c]);
        output[idx + c] = Math.min(255, Math.max(0, val));
      }
    }
  }

  return output;
}

/**
 * Creates a low-res data URL thumbnail for the version history sidebar.
 */
export function createThumbnail(canvas: HTMLCanvasElement, maxDim: number = 96): string {
  const thumb = document.createElement('canvas');
  let w = canvas.width;
  let h = canvas.height;

  if (w > h) {
    if (w > maxDim) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    }
  } else {
    if (h > maxDim) {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  thumb.width = Math.max(1, w);
  thumb.height = Math.max(1, h);

  const ctx = thumb.getContext('2d');
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, w, h);
    return thumb.toDataURL('image/jpeg', 0.8);
  }
  return '';
}
