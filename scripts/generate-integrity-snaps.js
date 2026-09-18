const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

function getIntegrityWebcamSvg(width, height, state = 'in_position') {
  // state: 'in_position' (00:05), 'flagged_away' (11:48), 'refocused' (11:53)

  const isAway = state === 'flagged_away';
  const isRefocused = state === 'refocused';

  // Gaze and head turn angles
  const eyeOffsetX = isAway ? 18 : (isRefocused ? -2 : 0);
  const eyeOffsetY = isAway ? -4 : (isRefocused ? 4 : 1);
  const headRotation = isAway ? 14 : 0;
  const headShiftX = isAway ? 28 : 0;

  // Proctor HUD styling
  const hudColor = isAway ? '#DC2626' : '#16A34A';
  const hudBg = isAway ? 'rgba(220, 38, 38, 0.12)' : 'rgba(22, 163, 74, 0.12)';
  const hudBorder = isAway ? 'rgba(220, 38, 38, 0.4)' : 'rgba(22, 163, 74, 0.35)';
  const statusText = isAway ? 'FLAGGED: GAZE DEVIATION' : (isRefocused ? 'TRACKING: NORMAL' : 'VERIFIED: CANDIDATE ID MATCH');
  const timestamp = isAway ? '11:48.04' : (isRefocused ? '11:53.22' : '00:05.18');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradients for realistic lighting and Indian skin tone -->
        <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EBF1F7" />
          <stop offset="40%" stop-color="#E2E8F0" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>

        <linearGradient id="warmLight" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stop-color="#FEF3C7" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#FEF3C7" stop-opacity="0" />
        </linearGradient>

        <linearGradient id="screenGlow" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#93C5FD" stop-opacity="0.45" />
          <stop offset="40%" stop-color="#60A5FA" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </linearGradient>

        <!-- Ananya's Authentic Indian Skin Tone Gradient -->
        <linearGradient id="ananyaSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#D9986A" />
          <stop offset="35%" stop-color="#C88454" />
          <stop offset="70%" stop-color="#B87342" />
          <stop offset="100%" stop-color="#A56233" />
        </linearGradient>

        <linearGradient id="ananyaSkinHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E8AE82" />
          <stop offset="100%" stop-color="#C88454" />
        </linearGradient>

        <!-- Dark Rich Hair -->
        <linearGradient id="ananyaHair" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#261E1A" />
          <stop offset="60%" stop-color="#191310" />
          <stop offset="100%" stop-color="#0A0706" />
        </linearGradient>

        <!-- Navy Professional Test Taking Top -->
        <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E293B" />
          <stop offset="50%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>

        <!-- Desk Surface Gradient -->
        <linearGradient id="deskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2D4C3" />
          <stop offset="100%" stop-color="#C9B8A4" />
        </linearGradient>

        <!-- Laptop Keyboard & Base -->
        <linearGradient id="laptopBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="30%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>

        <!-- Soft Drop Shadow -->
        <filter id="softShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.18" />
        </filter>

        <filter id="blurBg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <!-- 1. Background: Home Study Room with Soft Defocused Details -->
      <rect width="${width}" height="${height}" fill="url(#wallGrad)" />
      <!-- Warm Window / Desk Lamp Ambient Wash -->
      <rect x="0" y="0" width="${width * 0.5}" height="${height * 0.7}" fill="url(#warmLight)" />

      <!-- Defocused Study Background Items -->
      <g filter="url(#blurBg)" opacity="0.6">
        <!-- Study Bookshelf on Left -->
        <rect x="20" y="30" width="100" height="260" rx="6" fill="#D1D5DB" opacity="0.4" />
        <rect x="25" y="45" width="20" height="70" rx="3" fill="#2563EB" opacity="0.6" />
        <rect x="48" y="40" width="22" height="75" rx="3" fill="#D97706" opacity="0.7" />
        <rect x="73" y="50" width="18" height="65" rx="3" fill="#059669" opacity="0.6" />
        <line x1="20" y1="120" x2="120" y2="120" stroke="#9CA3AF" stroke-width="4" />
        <rect x="30" y="130" width="25" height="60" rx="3" fill="#4B5563" opacity="0.6" />
        <rect x="60" y="125" width="22" height="65" rx="3" fill="#DC2626" opacity="0.5" />

        <!-- Potted Desk Plant on Right -->
        <g transform="translate(${width - 90}, 140) scale(0.65)">
          <path d="M 10 70 L 25 120 L 75 120 L 90 70 Z" fill="#92400E" opacity="0.7" />
          <ellipse cx="50" cy="50" rx="35" ry="50" fill="#15803D" opacity="0.7" transform="rotate(-15 50 50)" />
          <ellipse cx="75" cy="35" rx="28" ry="45" fill="#16A34A" opacity="0.8" transform="rotate(20 75 35)" />
          <ellipse cx="25" cy="40" rx="25" ry="40" fill="#22C55E" opacity="0.6" transform="rotate(-35 25 40)" />
        </g>
      </g>

      <!-- 2. Candidate: Ananya R. (Authentic South Asian Assessment Taker) -->
      <g transform="translate(${headShiftX}, 0)" filter="url(#softShadow)">
        <!-- Back Hair Volume -->
        <g transform="translate(${width / 2}, ${height * 0.42}) rotate(${headRotation})">
          <path d="M -135 -30 C -160 50, -170 170, -120 250 L 120 250 C 170 170, 160 50, 135 -30 C 130 -130, -130 -130, -135 -30 Z" fill="url(#ananyaHair)" />
        </g>

        <!-- Torso & Shoulders in Navy Top -->
        <g transform="translate(${width / 2}, ${height * 0.58})">
          <!-- Main Torso / Top -->
          <path d="M -190 140 C -160 30, -90 0, 0 0 C 90 0, 160 30, 190 140 L 240 320 L -240 320 Z" fill="url(#topGrad)" />
          
          <!-- Collar & Modest V-Neck -->
          <path d="M -38 0 L 0 52 L 38 0 Z" fill="url(#ananyaSkinHighlight)" />
          <!-- Delicate Gold Chain Pendant -->
          <path d="M -26 8 Q 0 34 26 8" fill="none" stroke="#F59E0B" stroke-width="1.8" />
          <circle cx="0" cy="24" r="3" fill="#F59E0B" />

          <!-- Left Arm / Typing Pose -->
          <path d="M -170 80 C -190 150, -180 230, -130 280 L -70 280 C -120 220, -130 140, -110 80 Z" fill="#1E293B" />
          <!-- Right Arm / Typing Pose -->
          <path d="M 170 80 C 190 150, 180 230, 130 280 L 70 280 C 120 220, 130 140, 110 80 Z" fill="#1E293B" />
        </g>

        <!-- Neck & Head -->
        <g transform="translate(${width / 2}, ${height * 0.42}) rotate(${headRotation})">
          <!-- Neck -->
          <rect x="-32" y="30" width="64" height="70" rx="14" fill="url(#ananyaSkin)" />
          <ellipse cx="0" cy="85" rx="34" ry="10" fill="#8B4D22" opacity="0.3" />

          <!-- Face Oval -->
          <ellipse cx="0" cy="-15" rx="84" ry="108" fill="url(#ananyaSkinHighlight)" />
          <ellipse cx="0" cy="-10" rx="80" ry="104" fill="url(#ananyaSkin)" opacity="0.9" />

          <!-- Small Traditional Indian Bindi (Subtle dot between eyebrows) -->
          <circle cx="0" cy="-48" r="2.2" fill="#7F1D1D" opacity="0.85" />

          <!-- Silver/Pearl Stud Earrings -->
          <circle cx="-83" cy="-5" r="4.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1" />
          <circle cx="83" cy="-5" r="4.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1" />

          <!-- Front Hair Framing -->
          <path d="M -90 -45 C -95 -120, -45 -145, 0 -145 C 45 -145, 95 -120, 90 -45 C 85 -90, 45 -120, 0 -120 C -45 -120, -85 -90, -90 -45 Z" fill="url(#ananyaHair)" />
          <path d="M -90 -40 C -92 10, -75 50, -75 80 C -60 20, -70 -25, -80 -40 Z" fill="url(#ananyaHair)" />
          <path d="M 90 -40 C 92 10, 75 50, 75 80 C 60 20, 70 -25, 80 -40 Z" fill="url(#ananyaHair)" />

          <!-- Natural Dark Eyebrows -->
          <path d="M -60 -52 Q -36 -64 -14 -52" fill="none" stroke="#1C1410" stroke-width="4.2" stroke-linecap="round" />
          <path d="M 14 -52 Q 36 -64 60 -52" fill="none" stroke="#1C1410" stroke-width="4.2" stroke-linecap="round" />

          <!-- Realistic Expressive Eyes -->
          <g transform="translate(${eyeOffsetX}, ${eyeOffsetY})">
            <!-- Left Eye -->
            <ellipse cx="-36" cy="-30" rx="15" ry="9" fill="#FFFFFF" />
            <ellipse cx="-36" cy="-30" rx="8" ry="8" fill="#382215" />
            <circle cx="-36" cy="-30" r="4.5" fill="#110B07" />
            <circle cx="-38" cy="-33" r="2.2" fill="#FFFFFF" />
            <path d="M -52 -33 Q -36 -42 -20 -33" fill="none" stroke="#140E0A" stroke-width="2.2" />

            <!-- Right Eye -->
            <ellipse cx="36" cy="-30" rx="15" ry="9" fill="#FFFFFF" />
            <ellipse cx="36" cy="-30" rx="8" ry="8" fill="#382215" />
            <circle cx="36" cy="-30" r="4.5" fill="#110B07" />
            <circle cx="34" cy="-33" r="2.2" fill="#FFFFFF" />
            <path d="M 20 -33 Q 36 -42 52 -33" fill="none" stroke="#140E0A" stroke-width="2.2" />
          </g>

          <!-- Nose Definition -->
          <path d="M 0 -36 L 0 5 Q 9 10 0 13" fill="none" stroke="#8E4F25" stroke-width="2.6" stroke-linecap="round" />
          <ellipse cx="-7" cy="11" rx="3.5" ry="2" fill="#8E4F25" opacity="0.4" />
          <ellipse cx="7" cy="11" rx="3.5" ry="2" fill="#8E4F25" opacity="0.4" />

          <!-- Focused Mouth / Natural Lip Tone -->
          <path d="M -22 38 Q 0 32 22 38 Q 0 50 -22 38 Z" fill="#A84C4C" />
          <path d="M -22 38 Q 0 42 22 38" fill="none" stroke="#782323" stroke-width="1.2" />
        </g>
      </g>

      <!-- 3. Foreground: Desk Surface & Laptop Screen Glow (Attentive Test Taking Context) -->
      <!-- Desk Base -->
      <rect x="0" y="${height * 0.74}" width="${width}" height="${height * 0.26}" fill="url(#deskGrad)" />
      <line x1="0" y1="${height * 0.74}" x2="${width}" y2="${height * 0.74}" stroke="#B8A48F" stroke-width="2" />

      <!-- Laptop Base in Foreground (Shows she is actively taking a test on laptop) -->
      <g transform="translate(${width * 0.18}, ${height * 0.72})">
        <!-- Open Laptop Display Bezel top edge -->
        <path d="M 0 ${height * 0.28} L 40 18 L ${width * 0.64 - 40} 18 L ${width * 0.64} ${height * 0.28} Z" fill="url(#laptopBase)" stroke="#64748B" stroke-width="1.5" />
        <!-- Keyboard Key Grid Suggestion -->
        <rect x="60" y="32" width="${width * 0.64 - 120}" height="45" rx="4" fill="#0F172A" opacity="0.9" />
        <!-- Keyboard Key Rows -->
        <line x1="70" y1="44" x2="${width * 0.64 - 70}" y2="44" stroke="#334155" stroke-width="2" stroke-dasharray="8 3" />
        <line x1="70" y1="56" x2="${width * 0.64 - 70}" y2="56" stroke="#334155" stroke-width="2" stroke-dasharray="8 3" />
        <line x1="70" y1="68" x2="${width * 0.64 - 70}" y2="68" stroke="#334155" stroke-width="2" stroke-dasharray="12 4" />

        <!-- Trackpad -->
        <rect x="${(width * 0.64 - 90) / 2}" y="84" width="90" height="40" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1" />

        <!-- Candidate's Hands on Keyboard / Trackpad -->
        <g opacity="0.95">
          <!-- Left Hand -->
          <path d="M 45 48 C 65 38, 85 42, 95 55 C 85 68, 65 72, 40 68 Z" fill="url(#ananyaSkinHighlight)" />
          <!-- Right Hand -->
          <path d="M ${width * 0.64 - 45} 48 C ${width * 0.64 - 65} 38, ${width * 0.64 - 85} 42, ${width * 0.64 - 95} 55 C ${width * 0.64 - 85} 68, ${width * 0.64 - 65} 72, ${width * 0.64 - 40} 68 Z" fill="url(#ananyaSkinHighlight)" />
        </g>
      </g>

      <!-- Screen Light Glow Casting Up onto Ananya -->
      <rect x="0" y="${height * 0.5}" width="${width}" height="${height * 0.5}" fill="url(#screenGlow)" pointer-events="none" />

      <!-- 4. GuardEye AI Proctoring HUD Overlay (Realistic Webcam Capture Frame) -->
      <!-- Live Video Indicator Dot -->
      <g transform="translate(18, 20)">
        <circle cx="6" cy="6" r="4" fill="${hudColor}" />
        <text x="16" y="9.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#0F172A" letter-spacing="0.5">WEBCAM LIVE · ${timestamp}</text>
      </g>

      <!-- Proctoring AI Status Badge -->
      <g transform="translate(${width - 18}, 16)">
        <rect x="-175" y="0" width="175" height="22" rx="6" fill="${hudBg}" stroke="${hudBorder}" stroke-width="1" />
        <circle cx="-163" cy="11" r="3.5" fill="${hudColor}" />
        <text x="-152" y="14.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="${hudColor}" letter-spacing="0.4">${statusText}</text>
      </g>

      ${isAway ? `
        <!-- Bounding Box / Gaze Vector Tracking Visual for Flagged Moment -->
        <g transform="translate(${width / 2 + headShiftX - 70}, ${height * 0.42 - 95})">
          <rect x="0" y="0" width="140" height="175" rx="8" fill="none" stroke="#DC2626" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.85" />
          <!-- Corner brackets -->
          <path d="M 0 16 L 0 0 L 16 0" fill="none" stroke="#DC2626" stroke-width="2.5" />
          <path d="M 124 0 L 140 0 L 140 16" fill="none" stroke="#DC2626" stroke-width="2.5" />
          <path d="M 0 159 L 0 175 L 16 175" fill="none" stroke="#DC2626" stroke-width="2.5" />
          <path d="M 124 175 L 140 175 L 140 159" fill="none" stroke="#DC2626" stroke-width="2.5" />
          <text x="6" y="-6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="#DC2626">AI FLAG: HEAD TURNED 38°</text>
        </g>
      ` : `
        <!-- Verified Candidate Bounding Box (Subtle) -->
        <g transform="translate(${width / 2 - 68}, ${height * 0.42 - 92})" opacity="0.6">
          <!-- Subtle Corner brackets -->
          <path d="M 0 12 L 0 0 L 12 0" fill="none" stroke="#16A34A" stroke-width="2" />
          <path d="M 124 0 L 136 0 L 136 12" fill="none" stroke="#16A34A" stroke-width="2" />
          <path d="M 0 158 L 0 170 L 12 170" fill="none" stroke="#16A34A" stroke-width="2" />
          <path d="M 124 170 L 136 170 L 136 158" fill="none" stroke="#16A34A" stroke-width="2" />
        </g>
      `}
    </svg>
  `;
}

async function renderAndSave(svgString, basePath, width = 600, height = 600) {
  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize(width, height)
    .png()
    .toBuffer();

  const webpPath = `${basePath}.webp`;
  const jpgPath = `${basePath}.jpg`;

  await sharp(pngBuffer)
    .webp({ quality: 92, effort: 4 })
    .toFile(webpPath);

  await sharp(pngBuffer)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(jpgPath);

  console.log(`✓ Saved ${path.basename(webpPath)} and ${path.basename(jpgPath)}`);
}

async function main() {
  console.log('Generating authentic Indian candidate laptop test-taking snapshots...');

  // 1. In position (00:05)
  const snap1Svg = getIntegrityWebcamSvg(800, 800, 'in_position');
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'report-snap-1'));
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'snap-front'));

  // 2. Flagged moment (11:48)
  const snap2Svg = getIntegrityWebcamSvg(800, 800, 'flagged_away');
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'report-snap-2'));
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'snap-away'));

  // 3. Refocused (11:53)
  const snap3Svg = getIntegrityWebcamSvg(800, 800, 'refocused');
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'report-snap-3'));
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'snap-back'));

  // Also update hero-webcam & hero-candidate to match Ananya R. test taking on laptop
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'hero-candidate'));
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'hero-webcam'));

  console.log('✓ All integrity report snapshot images successfully updated!');
}

main().catch(console.error);
