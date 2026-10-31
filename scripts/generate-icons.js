import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// CRC32 table & function for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const toCrc = Buffer.concat([typeBuf, data]);
  chunk.writeUInt32BE(crc32(toCrc), 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = createChunk('IHDR', ihdrData);

  // Scanlines (width * 4 + 1 filter byte per row)
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  const cx = width / 2;
  const cy = height / 2;
  const shieldScale = isMaskable ? 0.38 : 0.44;

  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter: None
    const ny = (y - cy) / (height / 2);
    for (let x = 0; x < width; x++) {
      const nx = (x - cx) / (width / 2);
      const distFromCenter = Math.sqrt(nx * nx + ny * ny);

      // Background color: #0f172a (dark slate)
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Subtle radial dark gradient for background
      if (distFromCenter < 1.0) {
        const factor = 1 - distFromCenter * 0.4;
        r = Math.min(255, Math.floor(15 * factor + 10));
        g = Math.min(255, Math.floor(23 * factor + 15));
        b = Math.min(255, Math.floor(42 * factor + 35));
      }

      // Shield shape math:
      // ny ranges from -0.8 to 0.8
      // width of shield tapers down below ny = 0
      const sy = ny / (shieldScale * 2);
      const sx = nx / (shieldScale * 1.8);

      const inShieldTop = sy >= -0.7 && sy <= 0.1 && Math.abs(sx) <= 0.8;
      const inShieldBottom = sy > 0.1 && sy <= 0.9 && Math.abs(sx) <= (0.8 * (1 - (sy - 0.1) / 0.8 * 0.8));
      const inShieldPoint = sy > 0.9 && sy <= 1.05 && Math.abs(sx) <= 0.16 * (1 - (sy - 0.9) / 0.15);

      if (inShieldTop || inShieldBottom || inShieldPoint) {
        // Shield gradient (cyan #0ea5e9 to indigo #6366f1)
        const t = (sy + 0.7) / 1.7;
        const shieldR = Math.floor(14 * (1 - t) + 99 * t);
        const shieldG = Math.floor(165 * (1 - t) + 102 * t);
        const shieldB = Math.floor(233 * (1 - t) + 241 * t);

        // Border highlighting
        const isBorder = Math.abs(sx) > 0.65 || sy < -0.55 || (sy > 0.75);
        if (isBorder) {
          r = Math.min(255, shieldR + 50);
          g = Math.min(255, shieldG + 40);
          b = 255;
        } else {
          // Inside shield: draw a play triangle
          // Play triangle centered at sx = 0.05, sy = 0.1
          const px = sx - 0.05;
          const py = sy - 0.1;
          const inPlay = px >= -0.25 && px <= 0.3 && Math.abs(py) <= (0.3 - px * 0.5) && py >= -0.28 && py <= 0.28;

          if (inPlay) {
            // White play symbol
            r = 255;
            g = 255;
            b = 255;
          } else {
            // Shield body
            r = shieldR;
            g = shieldG;
            b = shieldB;
          }
        }
      }

      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
      rawData[pos++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', deflated);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

// Generate files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(48, 48, false));

console.log('PWA icons successfully generated in public/ directory.');
