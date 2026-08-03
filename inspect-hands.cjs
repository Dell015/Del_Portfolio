/**
 * Throwaway diagnostic: does each hand PNG actually carry usable transparency?
 *
 * sampleImageToPoints() builds the particle silhouette by SKIPPING pixels with
 * alpha < 20. If these files have no alpha channel (or an all-opaque one), the
 * sampler yields a solid rectangle of particles instead of a hand shape.
 *
 * Delete this file after reading the output.
 */
const fs = require("fs");
const zlib = require("zlib");

const COLOR_TYPES = {
  0: "grayscale (no alpha)",
  2: "RGB (no alpha)",
  3: "palette (alpha only via tRNS)",
  4: "grayscale + alpha",
  6: "RGBA",
};
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function inspect(path) {
  const buf = fs.readFileSync(path);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  const interlace = buf[28];

  console.log(`\n=== ${path} ===`);
  console.log(`  ${width} x ${height}, bit depth ${bitDepth}`);
  console.log(`  color type ${colorType} — ${COLOR_TYPES[colorType] ?? "unknown"}`);
  console.log(`  file size: ${(buf.length / 1024).toFixed(0)} KB`);

  const hasAlpha = colorType === 4 || colorType === 6;
  if (!hasAlpha) {
    console.log("  >>> NO ALPHA CHANNEL. Background is opaque.");
    return;
  }
  if (bitDepth !== 8 || interlace !== 0) {
    console.log("  (skipping pixel scan: needs 8-bit non-interlaced)");
    return;
  }

  // Concatenate every IDAT chunk, then inflate.
  const idat = [];
  let tRNS = false;
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    if (type === "IDAT") idat.push(buf.subarray(off + 8, off + 8 + len));
    if (type === "tRNS") tRNS = true;
    if (type === "IEND") break;
    off += 12 + len;
  }
  if (tRNS) console.log("  has tRNS chunk");

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = CHANNELS[colorType];
  const stride = width * bpp;

  // Undo PNG scanline filtering — required before alpha bytes mean anything.
  const out = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let val = line[x];
      switch (filter) {
        case 1: val += a; break;
        case 2: val += b; break;
        case 3: val += (a + b) >> 1; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          val += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          break;
        }
      }
      cur[x] = val & 0xff;
    }
  }

  // Alpha statistics + corner sample.
  const alphaOffset = bpp - 1;
  let transparent = 0;
  let total = 0;
  for (let i = alphaOffset; i < out.length; i += bpp) {
    if (out[i] < 20) transparent++;
    total++;
  }

  const px = (x, y) => {
    const i = y * stride + x * bpp;
    return colorType === 6
      ? `rgba(${out[i]},${out[i + 1]},${out[i + 2]},${out[i + 3]})`
      : `gray(${out[i]},a=${out[i + 1]})`;
  };

  console.log(`  transparent pixels (a<20): ${transparent}/${total} = ${((transparent / total) * 100).toFixed(1)}%`);
  console.log(`  top-left     ${px(0, 0)}`);
  console.log(`  top-right    ${px(width - 1, 0)}`);
  console.log(`  bottom-left  ${px(0, height - 1)}`);
  console.log(`  bottom-right ${px(width - 1, height - 1)}`);
  console.log(`  center       ${px(width >> 1, height >> 1)}`);
}

for (const f of ["public/hand-god.png", "public/hand-adam.png"]) {
  try {
    inspect(f);
  } catch (e) {
    console.log(`\n=== ${f} ===\n  FAILED: ${e.message}`);
  }
}

const fresco = fs.statSync("public/creation-of-adam.jpg");
console.log(`\n=== public/creation-of-adam.jpg ===`);
console.log(`  file size: ${(fresco.size / 1024 / 1024).toFixed(2)} MB`);
