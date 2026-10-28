import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const PUBLIC_DIR = path.resolve('public');
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// CRC32 table for PNG chunk checksums
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);

  const bodyToCrc = Buffer.concat([typeBuf, dataBuf]);
  const crcVal = crc32(bodyToCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, bodyToCrc, crcBuf]);
}

function createPng(width, height, renderPixelFn) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // deflate compression
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace none
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = renderPixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance helper
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// Clamp helper
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Render StoryForge brand icon:
// Background: #111827 (RGB: 17, 24, 39)
// Glowing rounded film frame with electric violet (#8b5cf6) to cyan (#06b6d4) gradient
// Inside: 4-pointed radiant storytelling star + subtle film perforations
function renderIcon(x, y, width, height, isMaskable = false) {
  // Normalize coordinates to -1 to 1
  const scale = isMaskable ? 0.75 : 0.88;
  const cx = width / 2;
  const cy = height / 2;
  const nx = (x - cx) / (cx * scale);
  const ny = (y - cy) / (cy * scale);

  // Base background: #111827
  let r = 17;
  let g = 24;
  let b = 39;
  let a = 255;

  // Background radial glow
  const dCenter = Math.sqrt(nx * nx + ny * ny);
  if (dCenter < 1.2) {
    const glow = Math.exp(-dCenter * 1.6);
    r = Math.min(255, Math.round(r + glow * 45));
    g = Math.min(255, Math.round(g + glow * 25));
    b = Math.min(255, Math.round(b + glow * 85));
  }

  // Film frame rectangle: -0.75 <= nx <= 0.75, -0.75 <= ny <= 0.75 with rounded corners r = 0.25
  const rw = 0.72;
  const rh = 0.72;
  const cr = 0.22;
  const qx = Math.max(0, Math.abs(nx) - (rw - cr));
  const qy = Math.max(0, Math.abs(ny) - (rh - cr));
  const frameDist = Math.sqrt(qx * qx + qy * qy) - cr;

  // Outer border of film frame
  const borderWidth = 0.055;
  if (frameDist <= 0 && frameDist >= -borderWidth) {
    // Gradient along diagonal from violet to cyan
    const gradT = clamp((nx + ny + 1.2) / 2.4, 0, 1);
    // Cyan: 6, 182, 212 | Violet: 139, 92, 246
    const fr = Math.round(139 * (1 - gradT) + 6 * gradT);
    const fg = Math.round(92 * (1 - gradT) + 182 * gradT);
    const fb = Math.round(246 * (1 - gradT) + 212 * gradT);
    r = fr;
    g = fg;
    b = fb;
  } else if (frameDist < -borderWidth) {
    // Inside inner frame: Darker slate vignette
    const innerT = Math.min(1, Math.abs(frameDist) / 0.5);
    r = Math.round(15 + innerT * 10);
    g = Math.round(20 + innerT * 12);
    b = Math.round(35 + innerT * 30);

    // Film sprockets / notches on left and right borders
    const absX = Math.abs(nx);
    if (absX >= 0.50 && absX <= 0.60) {
      const sprocketY = Math.abs(Math.sin(ny * Math.PI * 3.5));
      if (sprocketY > 0.65) {
        r = 139;
        g = 92;
        b = 246;
        a = 230;
      }
    }

    // 4-pointed radiant storytelling star in the center
    // Star equation: (abs(x))^0.5 + (abs(y))^0.5 <= size^0.5
    const starRadius = 0.38;
    const sx = Math.abs(nx);
    const sy = Math.abs(ny);
    const starShape = Math.sqrt(sx) + Math.sqrt(sy);
    const starThreshold = Math.sqrt(starRadius);

    if (starShape <= starThreshold) {
      const starFade = 1 - (starShape / starThreshold);
      // Bright glowing cyan/white core
      const coreIntensity = Math.min(1, starFade * 1.8);
      r = Math.round(r * (1 - coreIntensity) + (240 * coreIntensity));
      g = Math.round(g * (1 - coreIntensity) + (250 * coreIntensity));
      b = Math.round(b * (1 - coreIntensity) + (255 * coreIntensity));
    }

    // Small diagonal sparkles
    const d1 = dist(nx, ny, 0.26, -0.26);
    if (d1 < 0.08) {
      const sp = (1 - d1 / 0.08);
      r = Math.min(255, Math.round(r + sp * 240));
      g = Math.min(255, Math.round(g + sp * 200));
      b = 255;
    }
  }

  return [r, g, b, a];
}

console.log('Generating PWA icons in /public...');

// 1. 192x192 regular
const pwa192 = createPng(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-192x192.png'), pwa192);
console.log('Created pwa-192x192.png');

// 2. 512x512 regular
const pwa512 = createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-512x512.png'), pwa512);
console.log('Created pwa-512x512.png');

// 3. 192x192 maskable
const pwaMaskable192 = createPng(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, true));
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-maskable-192x192.png'), pwaMaskable192);
console.log('Created pwa-maskable-192x192.png');

// 4. 512x512 maskable
const pwaMaskable512 = createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true));
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-maskable-512x512.png'), pwaMaskable512);
console.log('Created pwa-maskable-512x512.png');

// 5. 180x180 apple touch icon
const appleIcon = createPng(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleIcon);
console.log('Created apple-touch-icon.png');

// 6. SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#0b0f19"/>
    </linearGradient>
    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)"/>
  <rect x="72" y="72" width="368" height="368" rx="56" fill="#151d30" stroke="url(#frameGrad)" stroke-width="20" filter="url(#glow)"/>
  <!-- Film Sprockets -->
  <rect x="100" y="116" width="22" height="36" rx="6" fill="#8b5cf6" opacity="0.8"/>
  <rect x="100" y="238" width="22" height="36" rx="6" fill="#8b5cf6" opacity="0.8"/>
  <rect x="100" y="360" width="22" height="36" rx="6" fill="#8b5cf6" opacity="0.8"/>
  <rect x="390" y="116" width="22" height="36" rx="6" fill="#06b6d4" opacity="0.8"/>
  <rect x="390" y="238" width="22" height="36" rx="6" fill="#06b6d4" opacity="0.8"/>
  <rect x="390" y="360" width="22" height="36" rx="6" fill="#06b6d4" opacity="0.8"/>
  <!-- Central Spark -->
  <path d="M256 148 C256 208 208 256 148 256 C208 256 256 304 256 364 C256 304 304 256 364 256 C304 256 256 208 256 148 Z" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="256" cy="256" r="28" fill="#a5f3fc"/>
  <!-- Secondary Sparkle -->
  <path d="M344 148 C344 168 328 184 308 184 C328 184 344 200 344 220 C344 200 360 184 380 184 C360 184 344 168 344 148 Z" fill="#c084fc"/>
</svg>`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'icon.svg'), svgContent);
console.log('Created icon.svg');

console.log('All icons generated successfully!');
