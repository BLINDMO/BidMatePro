// Trim surrounding whitespace from the brand logo and make the white
// background transparent, so it sits flush in the invoice / scope header.
// Dependency-free PNG decode + re-encode (8-bit, non-interlaced RGB/RGBA).
import { inflateSync, deflateSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = process.argv[2];
const OUT = process.argv[3] || 'public/brand/heller-logo.png';

const buf = readFileSync(SRC);
let pos = 8;
let width = 0,
  height = 0,
  bitDepth = 0,
  colorType = 0,
  interlace = 0;
const idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);
  if (type === 'IHDR') {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    interlace = data[12];
  } else if (type === 'IDAT') idat.push(data);
  else if (type === 'IEND') break;
  pos += 12 + len;
}

const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
if (!channels || bitDepth !== 8 || interlace !== 0) {
  throw new Error(`Unsupported PNG (colorType ${colorType}, bitDepth ${bitDepth}, interlace ${interlace})`);
}

const raw = inflateSync(Buffer.concat(idat));
const bpp = channels;
const stride = width * bpp;
const out = Buffer.alloc(height * stride);
let prev = Buffer.alloc(stride);
let p = 0;
for (let y = 0; y < height; y++) {
  const ft = raw[p++];
  const line = raw.subarray(p, p + stride);
  p += stride;
  const cur = Buffer.alloc(stride);
  for (let i = 0; i < stride; i++) {
    const a = i >= bpp ? cur[i - bpp] : 0;
    const b = prev[i];
    const c = i >= bpp ? prev[i - bpp] : 0;
    let v = line[i];
    if (ft === 1) v = (v + a) & 255;
    else if (ft === 2) v = (v + b) & 255;
    else if (ft === 3) v = (v + ((a + b) >> 1)) & 255;
    else if (ft === 4) {
      const pa = Math.abs(b - c),
        pb = Math.abs(a - c),
        pc = Math.abs(a + b - 2 * c);
      const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      v = (v + pr) & 255;
    }
    cur[i] = v;
  }
  cur.copy(out, y * stride);
  prev = cur;
}

const px = (x, y) => {
  const o = y * stride + x * bpp;
  const r = out[o];
  const g = bpp >= 3 ? out[o + 1] : r;
  const b = bpp >= 3 ? out[o + 2] : r;
  const al = bpp === 4 ? out[o + 3] : 255;
  return [r, g, b, al];
};
const isInk = (r, g, b, a) => a >= 10 && (r < 240 || g < 240 || b < 240);

let minX = width,
  minY = height,
  maxX = 0,
  maxY = 0;
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    const [r, g, b, a] = px(x, y);
    if (isInk(r, g, b, a)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

const pad = Math.round(Math.max(width, height) * 0.015);
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;

// Cropped RGBA with near-white made transparent.
const rowBytes = cw * 4;
const rawOut = Buffer.alloc(ch * (rowBytes + 1));
for (let y = 0; y < ch; y++) {
  rawOut[y * (rowBytes + 1)] = 0;
  for (let x = 0; x < cw; x++) {
    const [r, g, b, a] = px(x + minX, y + minY);
    const o = y * (rowBytes + 1) + 1 + x * 4;
    const white = r >= 240 && g >= 240 && b >= 240;
    rawOut[o] = r;
    rawOut[o + 1] = g;
    rawOut[o + 2] = b;
    rawOut[o + 3] = white ? 0 : a;
  }
}

function crc32(b) {
  let c = ~0;
  for (let i = 0; i < b.length; i++) {
    c ^= b[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(cw, 0);
ihdr.writeUInt32BE(ch, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(rawOut, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync('public/brand', { recursive: true });
writeFileSync(OUT, png);
console.log(`Trimmed ${width}x${height} -> ${cw}x${ch} (aspect ${(cw / ch).toFixed(2)})  ${OUT}`);
