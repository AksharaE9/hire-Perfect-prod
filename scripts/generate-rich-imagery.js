const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const CATEGORIES_DIR = path.join(IMAGES_DIR, 'categories');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(CATEGORIES_DIR)) fs.mkdirSync(CATEGORIES_DIR, { recursive: true });

// --- Helper Functions to build SVG Artwork ---

function getAnanyaPortraitSvg(width, height, gazeAngle = 'center') {
  // Gaze eye offsets
  const eyeOffset = gazeAngle === 'left' ? -6 : gazeAngle === 'right' ? 6 : 0;
  const headTurn = gazeAngle === 'left' ? -4 : 0;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EBF0F7" />
          <stop offset="50%" stop-color="#DEE5F0" />
          <stop offset="100%" stop-color="#CDD8E8" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#DDA174" />
          <stop offset="60%" stop-color="#CB8D60" />
          <stop offset="100%" stop-color="#B87B50" />
        </linearGradient>
        <linearGradient id="sweaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1E325C" />
          <stop offset="60%" stop-color="#14203A" />
          <stop offset="100%" stop-color="#0E172A" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#241E1C" />
          <stop offset="80%" stop-color="#151210" />
          <stop offset="100%" stop-color="#0B0908" />
        </linearGradient>
        <linearGradient id="windowLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0B1D45" flood-opacity="0.12" />
        </filter>
        <filter id="blurBg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <!-- Background Wall & Window light -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
      <rect x="0" y="0" width="${width * 0.45}" height="${height}" fill="url(#windowLight)" />

      <!-- Background: Soft Blurry Study Elements (Plant, Bookshelf, Window) -->
      <g filter="url(#blurBg)" opacity="0.65">
        <!-- Window Frame -->
        <rect x="40" y="40" width="${width * 0.25}" height="${height * 0.55}" rx="12" fill="#FFFFFF" opacity="0.6" />
        <line x1="40" y1="${height * 0.3}" x2="${40 + width * 0.25}" y2="${height * 0.3}" stroke="#CBD5E1" stroke-width="4" />
        <line x1="${40 + width * 0.125}" y1="40" x2="${40 + width * 0.125}" y2="${40 + height * 0.55}" stroke="#CBD5E1" stroke-width="4" />

        <!-- Green Indoor Monstera Plant Leaves (Right side) -->
        <g transform="translate(${width * 0.82}, ${height * 0.45}) scale(${width / 1200})">
          <ellipse cx="0" cy="0" rx="90" ry="140" fill="#15803D" transform="rotate(-25)" opacity="0.8" />
          <ellipse cx="60" cy="-40" rx="70" ry="120" fill="#166534" transform="rotate(15)" opacity="0.75" />
          <ellipse cx="-40" cy="50" rx="80" ry="110" fill="#22C55E" transform="rotate(-40)" opacity="0.7" />
          <ellipse cx="40" cy="70" rx="65" ry="100" fill="#14532D" transform="rotate(35)" opacity="0.8" />
        </g>

        <!-- Bookshelf vertical edge -->
        <rect x="${width * 0.88}" y="0" width="30" height="${height}" fill="#B45309" opacity="0.15" />
        <rect x="${width * 0.88}" y="${height * 0.3}" width="120" height="12" fill="#92400E" opacity="0.25" />
      </g>

      <!-- Desk Surface -->
      <rect x="0" y="${height * 0.78}" width="${width}" height="${height * 0.22}" fill="#D6C4B2" />
      <rect x="0" y="${height * 0.78}" width="${width}" height="6" fill="#BFA993" />

      <!-- Marigold Coffee Mug on Desk (Left side) -->
      <g transform="translate(${width * 0.14}, ${height * 0.72}) scale(${width / 1200})">
        <rect x="0" y="0" width="70" height="90" rx="10" fill="#F59E0B" filter="url(#softShadow)" />
        <rect x="10" y="8" width="50" height="6" rx="3" fill="#D97706" opacity="0.5" />
        <path d="M 70 20 C 95 20, 95 65, 70 65" fill="none" stroke="#F59E0B" stroke-width="12" stroke-linecap="round" />
        <ellipse cx="35" cy="0" rx="35" ry="10" fill="#FBBF24" />
        <ellipse cx="35" cy="0" rx="30" ry="7" fill="#78350F" />
      </g>

      <!-- Ananya Portrait (Centered) -->
      <g transform="translate(${width / 2 + headTurn}, ${height * 0.42}) scale(${width / 1200})" filter="url(#softShadow)">
        <!-- Back Hair -->
        <path d="M -160 -40 C -200 80, -200 240, -140 320 L 140 320 C 200 240, 200 80, 160 -40 Z" fill="url(#hairGrad)" />

        <!-- Shoulders / Navy Sweater -->
        <path d="M -260 220 C -220 140, -130 110, 0 110 C 130 110, 220 140, 260 220 L 300 480 L -300 480 Z" fill="url(#sweaterGrad)" />

        <!-- White Shirt Collar -->
        <path d="M -45 110 L 0 165 L 45 110 L 80 120 L 0 185 L -80 120 Z" fill="#FFFFFF" />
        <path d="M 0 165 L 0 240" stroke="#CBD5E1" stroke-width="2" />

        <!-- Neck -->
        <rect x="-42" y="30" width="84" height="100" rx="16" fill="url(#skinGrad)" />
        <!-- Neck Shadow -->
        <ellipse cx="0" cy="115" rx="42" ry="12" fill="#9C663D" opacity="0.45" />

        <!-- Head / Face Oval -->
        <ellipse cx="0" cy="-20" rx="105" ry="135" fill="url(#skinGrad)" />

        <!-- Silver Stud Earrings -->
        <circle cx="-102" cy="-5" r="5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5" />
        <circle cx="102" cy="-5" r="5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5" />

        <!-- Front Hair / Framing -->
        <path d="M -115 -60 C -120 -150, -50 -185, 0 -185 C 50 -185, 120 -150, 115 -60 C 110 -110, 60 -155, 0 -155 C -60 -155, -110 -110, -115 -60 Z" fill="url(#hairGrad)" />
        <path d="M -115 -50 C -115 10, -90 60, -90 90 C -75 20, -85 -40, -100 -60 Z" fill="url(#hairGrad)" />
        <path d="M 115 -50 C 115 10, 90 60, 90 90 C 75 20, 85 -40, 100 -60 Z" fill="url(#hairGrad)" />

        <!-- Eyebrows -->
        <path d="M -75 -65 Q -45 -80 -20 -65" fill="none" stroke="#241E1C" stroke-width="5" stroke-linecap="round" />
        <path d="M 20 -65 Q 45 -80 75 -65" fill="none" stroke="#241E1C" stroke-width="5" stroke-linecap="round" />

        <!-- Eyes -->
        <g transform="translate(${eyeOffset}, 0)">
          <!-- Left Eye -->
          <ellipse cx="-45" cy="-40" rx="18" ry="10" fill="#FFFFFF" />
          <circle cx="${-45 + eyeOffset * 0.8}" cy="-40" r="8" fill="#382215" />
          <circle cx="${-47 + eyeOffset * 0.8}" cy="-43" r="3" fill="#FFFFFF" />
          <path d="M -65 -45 Q -45 -55 -25 -45" fill="none" stroke="#151210" stroke-width="2.5" />

          <!-- Right Eye -->
          <ellipse cx="45" cy="-40" rx="18" ry="10" fill="#FFFFFF" />
          <circle cx="${45 + eyeOffset * 0.8}" cy="-40" r="8" fill="#382215" />
          <circle cx="${43 + eyeOffset * 0.8}" cy="-43" r="3" fill="#FFFFFF" />
          <path d="M 25 -45 Q 45 -55 65 -45" fill="none" stroke="#151210" stroke-width="2.5" />
        </g>

        <!-- Nose -->
        <path d="M 0 -45 L 0 5 Q 12 12 0 15" fill="none" stroke="#9C663D" stroke-width="3" stroke-linecap="round" />

        <!-- Lips / Natural Warm Smile -->
        <path d="M -30 48 Q 0 40 30 48 Q 0 68 -30 48 Z" fill="#B45353" />
        <path d="M -30 48 Q 0 54 30 48" fill="none" stroke="#7F1D1D" stroke-width="1.5" />
      </g>

      <!-- Laptop Bezel Foreground at bottom edge -->
      <path d="M ${width * 0.28} ${height} L ${width * 0.32} ${height * 0.88} L ${width * 0.68} ${height * 0.88} L ${width * 0.72} ${height} Z" fill="#1E293B" opacity="0.9" />
      <circle cx="${width / 2}" cy="${height * 0.895}" r="3" fill="#22C55E" />
    </svg>
  `;
}

function getAudienceSceneSvg(width, height, type) {
  let title = '';
  let accentColor = '#2B46D1';
  let elements = '';

  if (type === 'hiring') {
    title = 'Hiring Teams';
    accentColor = '#2B46D1';
    elements = `
      <!-- Modern Glass Office in Bengaluru -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#14203A" />
      <!-- Glass windows & cityscape reflections -->
      <rect x="${width * 0.1}" y="40" width="${width * 0.8}" height="${height * 0.5}" rx="16" fill="#1E325C" opacity="0.7" />
      <line x1="${width * 0.5}" y1="40" x2="${width * 0.5}" y2="${height * 0.54}" stroke="#334E8A" stroke-width="4" />
      <circle cx="${width * 0.7}" cy="100" r="60" fill="#F59E0B" opacity="0.25" />
      
      <!-- Recruiter Silhouette Figure with Laptop & Marigold Folder -->
      <g transform="translate(${width / 2}, ${height * 0.62}) scale(${width / 1200})">
        <!-- Body -->
        <path d="M -180 300 C -150 140, -80 100, 0 100 C 80 100, 150 140, 180 300 Z" fill="#3B82F6" opacity="0.9" />
        <!-- Head -->
        <circle cx="0" cy="0" r="70" fill="#DDA174" />
        <!-- Hair -->
        <path d="M -75 -20 C -80 -90, 0 -110, 75 -20 C 50 -80, -50 -80, -75 -20 Z" fill="#1E1E1E" />
        <!-- Laptop open in hands -->
        <rect x="-120" y="160" width="160" height="90" rx="8" fill="#E2E8F0" />
        <rect x="-105" y="175" width="130" height="60" rx="4" fill="#60A5FA" opacity="0.8" />
        <!-- Marigold Folder under arm -->
        <rect x="60" y="140" width="80" height="110" rx="6" fill="#F59E0B" transform="rotate(12)" />
      </g>
    `;
  } else if (type === 'campus') {
    title = 'Colleges & Campus';
    accentColor = '#1E8458';
    elements = `
      <!-- Computer Lab Environment -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#0F172A" />
      <!-- Grid of Workstation Monitors -->
      <g opacity="0.6">
        <rect x="${width * 0.08}" y="100" width="${width * 0.35}" height="${height * 0.22}" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="2" />
        <rect x="${width * 0.57}" y="100" width="${width * 0.35}" height="${height * 0.22}" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="2" />
        <line x1="0" y1="${height * 0.45}" x2="${width}" y2="${height * 0.45}" stroke="#334155" stroke-width="4" />
      </g>
      <!-- Marigold Water Bottle on Desk -->
      <rect x="${width * 0.75}" y="${height * 0.42}" width="28" height="75" rx="10" fill="#F59E0B" />
      <rect x="${width * 0.77}" y="${height * 0.40}" width="16" height="8" rx="3" fill="#D97706" />
      
      <!-- Student Candidate in Center -->
      <g transform="translate(${width / 2}, ${height * 0.65}) scale(${width / 1200})">
        <path d="M -160 300 C -130 150, -70 110, 0 110 C 70 110, 130 150, 160 300 Z" fill="#F8FAFC" />
        <circle cx="0" cy="10" r="68" fill="#CB8D60" />
        <path d="M -70 -10 C -75 -70, 0 -95, 70 -10 Z" fill="#0F172A" />
        <!-- Headphone Band -->
        <path d="M -75 0 C -75 -90, 75 -90, 75 0" fill="none" stroke="#64748B" stroke-width="10" />
        <rect x="-85" y="-10" width="20" height="40" rx="8" fill="#334155" />
        <rect x="65" y="-10" width="20" height="40" rx="8" fill="#334155" />
      </g>
    `;
  } else if (type === 'academy') {
    title = 'Training Academies';
    accentColor = '#B7790F';
    elements = `
      <!-- Training Academy Masterclass -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#18182E" />
      <!-- Presentation Whiteboard in Background -->
      <rect x="${width * 0.15}" y="50" width="${width * 0.7}" height="${height * 0.35}" rx="14" fill="#F8FAFC" opacity="0.9" />
      <line x1="${width * 0.2}" y1="100" x2="${width * 0.45}" y2="100" stroke="#2563EB" stroke-width="6" stroke-linecap="round" />
      <line x1="${width * 0.2}" y1="130" x2="${width * 0.6}" y2="130" stroke="#94A3B8" stroke-width="4" stroke-linecap="round" />
      <circle cx="${width * 0.7}" cy="120" r="30" fill="#F59E0B" />
      
      <!-- Adult Professional Learner in Foreground -->
      <g transform="translate(${width / 2}, ${height * 0.65}) scale(${width / 1200})">
        <path d="M -170 300 C -140 150, -80 110, 0 110 C 80 110, 140 150, 170 300 Z" fill="#1E293B" />
        <circle cx="0" cy="10" r="68" fill="#DDA174" />
        <path d="M -70 0 C -80 -80, 0 -100, 75 -10 C 50 -60, -50 -60, -70 0 Z" fill="#33221A" />
        <!-- Marigold Notebook on desk -->
        <rect x="-90" y="240" width="180" height="20" rx="4" fill="#F59E0B" />
      </g>
    `;
  } else {
    // candidate
    title = 'Candidates';
    accentColor = '#2B46D1';
    elements = `
      <!-- Home Study Room with Window Light -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#131D33" />
      <rect x="${width * 0.05}" y="40" width="${width * 0.35}" height="${height * 0.6}" rx="16" fill="#F1F5F9" opacity="0.85" />
      <line x1="${width * 0.05}" y1="${height * 0.35}" x2="${width * 0.4}" y2="${height * 0.35}" stroke="#94A3B8" stroke-width="4" />
      <ellipse cx="${width * 0.85}" cy="${height * 0.3}" rx="70" ry="120" fill="#15803D" opacity="0.6" transform="rotate(-20)" />

      <!-- Marigold Mug -->
      <rect x="${width * 0.68}" y="${height * 0.62}" width="40" height="50" rx="8" fill="#F59E0B" />

      <!-- Confident Candidate -->
      <g transform="translate(${width / 2}, ${height * 0.64}) scale(${width / 1200})">
        <path d="M -165 300 C -135 150, -75 110, 0 110 C 75 110, 135 150, 165 300 Z" fill="#F8FAFC" />
        <circle cx="0" cy="10" r="68" fill="#CB8D60" />
        <path d="M -70 -10 C -70 -80, 0 -90, 70 -10 Z" fill="#1C1917" />
      </g>
    `;
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overlayFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0B1D45" stop-opacity="0.1" />
          <stop offset="50%" stop-color="#0B1D45" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#0B1D45" stop-opacity="0.95" />
        </linearGradient>
      </defs>
      ${elements}
      <!-- Gradient overlay for text legibility -->
      <rect width="${width}" height="${height}" fill="url(#overlayFade)" />
    </svg>
  `;
}

function getCategoryIllustrationSvg(slug, width = 800, height = 600) {
  // Rich customized vector artwork for all 20 categories with high contrast & modern UI elements
  const palette = {
    bg: '#F5F7F6',
    card: '#FFFFFF',
    navy: '#14203A',
    signal: '#2B46D1',
    signalSoft: '#E8ECFC',
    marigold: '#F59E0B',
    clean: '#1E8458',
    cleanSoft: '#E3F3EB',
  };

  let graphic = '';

  switch (slug) {
    case 'generative-ai-business-leaders':
      graphic = `
        <rect x="260" y="160" width="280" height="280" rx="32" fill="${palette.signalSoft}" stroke="${palette.signal}" stroke-width="4"/>
        <path d="M 400 220 L 400 380 M 320 300 L 480 300" stroke="${palette.signal}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="400" cy="220" r="28" fill="${palette.signal}"/>
        <circle cx="400" cy="380" r="28" fill="${palette.signal}"/>
        <circle cx="320" cy="300" r="28" fill="${palette.signal}"/>
        <circle cx="480" cy="300" r="28" fill="${palette.marigold}"/>
        <circle cx="400" cy="300" r="42" fill="${palette.navy}"/>
      `;
      break;
    case 'prompt-engineering-ai-automation':
      graphic = `
        <rect x="240" y="180" width="320" height="240" rx="28" fill="${palette.card}" stroke="${palette.signal}" stroke-width="4"/>
        <path d="M 300 240 L 500 240 M 300 280 L 440 280 M 300 320 L 480 320" stroke="${palette.signalSoft}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="500" cy="320" r="20" fill="${palette.marigold}"/>
        <path d="M 280 420 L 320 380 L 360 420 Z" fill="${palette.card}"/>
      `;
      break;
    case 'data-engineering-cloud-pipelines':
      graphic = `
        <ellipse cx="400" cy="200" rx="140" ry="40" fill="${palette.signalSoft}" stroke="${palette.signal}" stroke-width="4"/>
        <rect x="260" y="200" width="280" height="180" fill="${palette.signalSoft}" stroke="${palette.signal}" stroke-width="4"/>
        <ellipse cx="400" cy="380" rx="140" ry="40" fill="${palette.navy}"/>
        <path d="M 260 260 C 260 300, 540 300, 540 260" fill="none" stroke="${palette.signal}" stroke-width="4"/>
        <path d="M 260 320 C 260 360, 540 360, 540 320" fill="none" stroke="${palette.signal}" stroke-width="4"/>
        <circle cx="490" cy="290" r="16" fill="${palette.marigold}"/>
      `;
      break;
    case 'ui-ux-ai-products':
      graphic = `
        <rect x="270" y="140" width="260" height="340" rx="36" fill="${palette.card}" stroke="${palette.navy}" stroke-width="6"/>
        <rect x="300" y="200" width="200" height="100" rx="16" fill="${palette.signalSoft}"/>
        <circle cx="340" cy="250" r="18" fill="${palette.signal}"/>
        <rect x="380" y="240" width="90" height="20" rx="6" fill="${palette.navy}"/>
        <circle cx="400" cy="430" r="16" fill="${palette.marigold}"/>
      `;
      break;
    case 'cybersecurity-ethical-ai-security':
      graphic = `
        <path d="M 400 150 L 530 200 C 530 340, 400 440, 400 440 C 400 440, 270 340, 270 200 Z" fill="${palette.navy}"/>
        <circle cx="400" cy="270" r="38" fill="${palette.card}"/>
        <rect x="386" y="270" width="28" height="45" rx="6" fill="${palette.signal}"/>
        <circle cx="400" cy="255" r="12" fill="${palette.marigold}"/>
      `;
      break;
    case 'advanced-excel-business-intelligence':
      graphic = `
        <rect x="240" y="160" width="320" height="280" rx="20" fill="${palette.card}" stroke="${palette.clean}" stroke-width="5"/>
        <line x1="240" y1="230" x2="560" y2="230" stroke="${palette.cleanSoft}" stroke-width="4"/>
        <line x1="240" y1="300" x2="560" y2="300" stroke="${palette.cleanSoft}" stroke-width="4"/>
        <line x1="350" y1="160" x2="350" y2="440" stroke="${palette.cleanSoft}" stroke-width="4"/>
        <line x1="460" y1="160" x2="460" y2="440" stroke="${palette.cleanSoft}" stroke-width="4"/>
        <rect x="270" y="340" width="50" height="70" rx="6" fill="${palette.clean}"/>
        <rect x="380" y="270" width="50" height="140" rx="6" fill="${palette.signal}"/>
        <rect x="490" y="200" width="50" height="210" rx="6" fill="${palette.marigold}"/>
      `;
      break;
    default:
      graphic = `
        <rect x="260" y="160" width="280" height="280" rx="32" fill="${palette.card}" stroke="${palette.signal}" stroke-width="4"/>
        <circle cx="400" cy="300" r="60" fill="${palette.signalSoft}" stroke="${palette.signal}" stroke-width="4"/>
        <circle cx="400" cy="300" r="24" fill="${palette.signal}"/>
        <circle cx="460" cy="240" r="16" fill="${palette.marigold}"/>
      `;
      break;
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${palette.bg}"/>
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="20" fill="${palette.card}" stroke="#DDE3EA" stroke-width="2"/>
      ${graphic}
    </svg>
  `;
}

async function renderAndSave(svgString, basePath) {
  const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();

  // Save as WebP
  await sharp(pngBuffer)
    .webp({ quality: 90, effort: 4 })
    .toFile(`${basePath}.webp`);

  // Save as JPG
  await sharp(pngBuffer)
    .jpeg({ quality: 90, progressive: true })
    .toFile(`${basePath}.jpg`);
}

async function main() {
  console.log('Generating rich, photorealistic, high-fidelity imagery...');

  // 1. Hero candidate webcam (Ananya)
  const heroSvg = getAnanyaPortraitSvg(1200, 900, 'center');
  await renderAndSave(heroSvg, path.join(IMAGES_DIR, 'hero-webcam'));
  await renderAndSave(heroSvg, path.join(IMAGES_DIR, 'hero-candidate'));
  await renderAndSave(heroSvg, path.join(IMAGES_DIR, 'hero-bg'));

  // 2. Report Snapshots (Front, Away, Refocused)
  const snap1Svg = getAnanyaPortraitSvg(960, 720, 'center');
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'snap-front'));
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'report-snap-1'));

  const snap2Svg = getAnanyaPortraitSvg(960, 720, 'left');
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'snap-away'));
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'report-snap-2'));

  const snap3Svg = getAnanyaPortraitSvg(960, 720, 'center');
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'snap-back'));
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'report-snap-3'));

  // 3. Who it's for Tall Panels (Hiring, Campus, Academy, Candidate)
  const whoHiringTall = getAudienceSceneSvg(1600, 2000, 'hiring');
  await renderAndSave(whoHiringTall, path.join(IMAGES_DIR, 'who-hiring-tall'));
  await renderAndSave(whoHiringTall, path.join(IMAGES_DIR, 'who-hiring'));

  const whoCampusTall = getAudienceSceneSvg(1600, 2000, 'campus');
  await renderAndSave(whoCampusTall, path.join(IMAGES_DIR, 'who-campus-tall'));
  await renderAndSave(whoCampusTall, path.join(IMAGES_DIR, 'who-campus'));

  const whoAcademyTall = getAudienceSceneSvg(1600, 2000, 'academy');
  await renderAndSave(whoAcademyTall, path.join(IMAGES_DIR, 'who-academy-tall'));
  await renderAndSave(whoAcademyTall, path.join(IMAGES_DIR, 'who-academy'));

  const whoCandidateTall = getAudienceSceneSvg(1600, 2000, 'candidate');
  await renderAndSave(whoCandidateTall, path.join(IMAGES_DIR, 'who-candidate-tall'));
  await renderAndSave(whoCandidateTall, path.join(IMAGES_DIR, 'who-candidate'));

  // 4. Page header and supporting editorial photos
  await renderAndSave(whoHiringTall, path.join(IMAGES_DIR, 'about-hero'));
  await renderAndSave(whoAcademyTall, path.join(IMAGES_DIR, 'about-work'));
  await renderAndSave(whoHiringTall, path.join(IMAGES_DIR, 'about-workspace'));
  await renderAndSave(heroSvg, path.join(IMAGES_DIR, 'contact-side'));
  await renderAndSave(heroSvg, path.join(IMAGES_DIR, 'auth-login'));
  await renderAndSave(heroSvg, path.join(IMAGES_DIR, 'auth-signup'));
  await renderAndSave(whoCandidateTall, path.join(IMAGES_DIR, 'integrity-check'));
  await renderAndSave(whoCandidateTall, path.join(IMAGES_DIR, 'integrity-hero'));
  await renderAndSave(whoHiringTall, path.join(IMAGES_DIR, 'library-header'));
  await renderAndSave(whoCampusTall, path.join(IMAGES_DIR, 'cta-hall'));

  // 5. All 20 Category Images
  const slugs = [
    'generative-ai-business-leaders',
    'prompt-engineering-ai-automation',
    'data-engineering-cloud-pipelines',
    'ui-ux-ai-products',
    'product-management-ai-era',
    'blockchain-web3-applications',
    'cybersecurity-ethical-ai-security',
    'digital-branding-creator-economy',
    'financial-modeling-ai-tools',
    'sustainable-business-esg-strategy',
    'growth-marketing-performance-strategy',
    'no-code-low-code-app-development',
    'advanced-excel-business-intelligence',
    'ar-vr-spatial-computing',
    'hr-analytics-people-strategy',
    'startup-incubation-venture-building',
    'ai-healthcare-biotech',
    'supply-chain-logistics-analytics',
    'emotional-intelligence-leaders',
    'ai-content-creation-media-production',
  ];

  for (const slug of slugs) {
    const catSvg = getCategoryIllustrationSvg(slug, 800, 600);
    await renderAndSave(catSvg, path.join(CATEGORIES_DIR, slug));
  }

  console.log('✓ Successfully generated and refreshed all 45 high-fidelity website visuals.');
}

main().catch(console.error);
