// Dependency-free PNG icon generator for BidMate Pro.
// Draws the brand mark: navy background with an amber rounded square + chevron notch.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const NAVY = [9, 12, 21];
const AMBER = [245, 166, 35];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, { maskable }) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const r = maskable ? size * 0.5 : size * 0.32; // corner radius of the amber tile
  const pad = maskable ? 0 : size * 0.16; // safe-zone padding for non-maskable
  const tile = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;

  const inRounded = (x, y) => {
    const lx = x - pad;
    const ly = y - pad;
    if (lx < 0 || ly < 0 || lx > tile || ly > tile) return false;
    const rr = maskable ? 0 : tile * 0.22;
    const minx = rr,
      maxx = tile - rr,
      miny = rr,
      maxy = tile - rr;
    let dx = 0,
      dy = 0;
    if (lx < minx) dx = minx - lx;
    else if (lx > maxx) dx = lx - maxx;
    if (ly < miny) dy = miny - ly;
    else if (ly > maxy) dy = ly - maxy;
    return dx * dx + dy * dy <= rr * rr;
  };

  // A bold chevron/notch in navy across the amber tile (suggests a build/level mark).
  const inChevron = (x, y) => {
    const w = size * 0.5;
    const t = size * 0.12;
    const nx = x - cx;
    const ny = y - cy + size * 0.04;
    if (Math.abs(nx) > w / 2) return false;
    const edge = Math.abs(nx) * 0.6 - size * 0.06;
    return ny > edge && ny < edge + t;
  };

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const tileHit = inRounded(x, y);
      let col = NAVY;
      let a = 255;
      if (tileHit && !inChevron(x, y)) col = AMBER;
      else if (tileHit) col = NAVY;
      else if (!maskable) {
        col = NAVY;
        a = 0; // transparent outside the tile for non-maskable
      }
      const o = rowStart + 1 + x * 4;
      raw[o] = col[0];
      raw[o + 1] = col[1];
      raw[o + 2] = col[2];
      raw[o + 3] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', png(192, { maskable: false }));
writeFileSync('public/icons/icon-512.png', png(512, { maskable: false }));
writeFileSync('public/icons/icon-maskable-192.png', png(192, { maskable: true }));
writeFileSync('public/icons/icon-maskable-512.png', png(512, { maskable: true }));
writeFileSync('public/icons/apple-touch-icon.png', png(180, { maskable: true }));
console.log('Icons written to public/icons/');
