const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, 'temp_snaps');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

async function processPhoto(inputPath, extractOpts, basePath) {
  const pipeline = sharp(inputPath).extract(extractOpts).resize(600, 600);

  const webpPath = `${basePath}.webp`;
  const jpgPath = `${basePath}.jpg`;

  await pipeline.clone().webp({ quality: 90, effort: 4 }).toFile(webpPath);
  await pipeline.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(jpgPath);

  console.log(`✓ Saved ${path.basename(webpPath)} and ${path.basename(jpgPath)}`);
}

async function main() {
  const p0 = path.join(tempDir, 'indian_p_0.jpg');
  const p2 = path.join(tempDir, 'indian_p_2.jpg');

  const meta0 = await sharp(p0).metadata();
  const meta2 = await sharp(p2).metadata();

  console.log('Generating real Indian candidate test-taking snapshots...');

  // 1. In position (00:05) - Focused on test screen
  const snap1Extract = {
    left: Math.round(meta2.width * 0.35),
    top: Math.round(meta2.height * 0.0),
    width: Math.round(meta2.height * 0.85),
    height: Math.round(meta2.height * 0.85),
  };
  await processPhoto(p2, snap1Extract, path.join(IMAGES_DIR, 'report-snap-1'));
  await processPhoto(p2, snap1Extract, path.join(IMAGES_DIR, 'snap-front'));

  // 2. Flagged moment (11:48) - Turned gaze / gesturing
  const snap2Extract = {
    left: Math.round(meta0.width * 0.28),
    top: Math.round(meta0.height * 0.05),
    width: Math.round(meta0.height * 0.85),
    height: Math.round(meta0.height * 0.85),
  };
  await processPhoto(p0, snap2Extract, path.join(IMAGES_DIR, 'report-snap-2'));
  await processPhoto(p0, snap2Extract, path.join(IMAGES_DIR, 'snap-away'));

  // 3. Refocused (11:53) - Answering test questions attentively at keyboard/screen
  const snap3Extract = {
    left: Math.round(meta2.width * 0.16),
    top: Math.round(meta2.height * 0.08),
    width: Math.round(meta2.height * 0.88),
    height: Math.round(meta2.height * 0.88),
  };
  await processPhoto(p2, snap3Extract, path.join(IMAGES_DIR, 'report-snap-3'));
  await processPhoto(p2, snap3Extract, path.join(IMAGES_DIR, 'snap-back'));

  // Also update hero webcam photo to match
  await processPhoto(p2, snap1Extract, path.join(IMAGES_DIR, 'hero-webcam'));
  await processPhoto(p2, snap1Extract, path.join(IMAGES_DIR, 'hero-candidate'));

  console.log('✓ Successfully processed and updated all candidate assessment snapshot assets!');
}

main().catch(console.error);
