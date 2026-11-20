// Leonida Legend — the hand-in program for gta6-trophy-guide-01 (Node 22, standard
// library only). It copies this repository's app/ and screenshots/ to /output and
// writes /output/dossier.json with the vendored make.fun library, the summary the
// judge reads. Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// Before copying, it pre-flights screenshots/: 3 or 4 images, each at most
// 256 KiB, a whole PNG or JPEG, its long side at most 1280 and its short side at
// least 480 pixels. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands
// in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_SHOTS = 4;
const MIN_SHOTS = 3;
const MAX_BYTES = 262144;
const MAX_LONG = 1280;
const MIN_SHORT = 480;

// Read a PNG's dimensions from its IHDR chunk.
function pngSize(buf: Buffer): { w: number; h: number } {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') throw new Error('not a PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// Read a JPEG's dimensions from its first frame (SOF0/SOF2) marker.
function jpegSize(buf: Buffer): { w: number; h: number } {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG');
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) throw new Error('bad JPEG marker');
    const marker = buf[off + 1];
    const len = buf.readUInt16BE(off + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(off + 5), w: buf.readUInt16BE(off + 7) };
    }
    off += 2 + len;
  }
  throw new Error('no JPEG frame found');
}

function checkScreenshots(): void {
  const dir = join(here, 'screenshots');
  if (!existsSync(dir)) throw new Error('screenshots/ is missing: 3 or 4 screenshots are required');
  const names = readdirSync(dir)
    .filter((n) => !n.startsWith('.') && statSync(join(dir, n)).isFile())
    .sort();
  if (names.length < MIN_SHOTS || names.length > MAX_SHOTS) {
    throw new Error(`screenshots/ holds ${names.length} images, need ${MIN_SHOTS} to ${MAX_SHOTS}`);
  }
  for (const name of names) {
    const file = join(dir, name);
    const size = statSync(file).size;
    if (size > MAX_BYTES) throw new Error(`${name} is ${size} bytes, over the 256 KiB cap`);
    const buf = readFileSync(file);
    const lower = name.toLowerCase();
    const dims = lower.endsWith('.png') ? pngSize(buf) : lower.endsWith('.jpg') || lower.endsWith('.jpeg') ? jpegSize(buf) : null;
    if (!dims) throw new Error(`${name} is neither PNG nor JPEG`);
    const long = Math.max(dims.w, dims.h);
    const short = Math.min(dims.w, dims.h);
    if (long > MAX_LONG) throw new Error(`${name} is ${dims.w}x${dims.h}, long side over ${MAX_LONG}`);
    if (short < MIN_SHORT) throw new Error(`${name} is ${dims.w}x${dims.h}, short side under ${MIN_SHORT}`);
  }
}

checkScreenshots();

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse
// an entry the scorer would refuse (more than 4 screenshots or one over 256 KiB;
// more than 993 files and directories in app/ or 48 MiB of app files).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`Leonida Legend handed in: app/ + screenshots/ copied to ${out}, dossier.json written.`);
