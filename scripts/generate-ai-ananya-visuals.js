const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Ultra-crisp AI digital illustration of candidate Ananya R.
 * High clarity, balanced proportions, white proctoring headphones, stylish glasses, and HUD proctoring overlay.
 */
function createAiCandidateSvg(width, height, mode = 'in_position') {
  const isFlagged = mode === 'flagged_away';
  const isRefocused = mode === 'refocused';

  // Head kinematics
  const headAngle = isFlagged ? 20 : (isRefocused ? -2 : 0);
  const headShiftX = isFlagged ? 36 : 0;
  const gazeX = isFlagged ? 22 : (isRefocused ? -2 : 0);
  const gazeY = isFlagged ? -4 : (isRefocused ? 4 : 0);

  // HUD telemetry
  const hudColor = isFlagged ? '#EA580C' : '#16A34A';
  const hudBg = isFlagged ? 'rgba(234, 88, 12, 0.12)' : 'rgba(22, 163, 74, 0.12)';
  const hudBorder = isFlagged ? '#EA580C' : '#16A34A';
  const hudTitle = isFlagged ? 'Flagged moment' : (isRefocused ? 'Refocused' : 'In position');
  const timestamp = isFlagged ? '11:48' : (isRefocused ? '11:53' : '00:05');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Clean Studio Ambient Background -->
        <linearGradient id="wallBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC" />
          <stop offset="50%" stop-color="#EDF2F7" />
          <stop offset="100%" stop-color="#E2E8F0" />
        </linearGradient>

        <radialGradient id="sunGlow" cx="45%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>

        <!-- Upward Screen Ambient Glow -->
        <linearGradient id="screenReflection" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.30" />
          <stop offset="35%" stop-color="#818CF8" stop-opacity="0.10" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </linearGradient>

        <!-- Soft Realistic Skin Gradients -->
        <radialGradient id="faceSkin" cx="48%" cy="40%" r="58%">
          <stop offset="0%" stop-color="#FCD5B5" />
          <stop offset="45%" stop-color="#EAA374" />
          <stop offset="80%" stop-color="#D48652" />
          <stop offset="100%" stop-color="#B06533" />
        </radialGradient>

        <linearGradient id="neckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#9E4D1E" />
          <stop offset="35%" stop-color="#C57642" />
          <stop offset="100%" stop-color="#EAA374" />
        </linearGradient>

        <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#E86C6C" stop-opacity="0.38" />
          <stop offset="100%" stop-color="#E86C6C" stop-opacity="0" />
        </radialGradient>

        <!-- Volumetric Dark Hair -->
        <linearGradient id="hairDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#261E1A" />
          <stop offset="45%" stop-color="#150E0B" />
          <stop offset="100%" stop-color="#050302" />
        </linearGradient>

        <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="60%">
          <stop offset="0%" stop-color="#6B4D3F" />
          <stop offset="40%" stop-color="#422C21" />
          <stop offset="100%" stop-color="#150E0B" />
        </linearGradient>

        <!-- White & Silver Headphones -->
        <linearGradient id="headphoneWhite" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="50%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>

        <linearGradient id="headphoneSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0" />
          <stop offset="50%" stop-color="#94A3B8" />
          <stop offset="100%" stop-color="#64748B" />
        </linearGradient>

        <!-- Traditional Saree Attire -->
        <linearGradient id="sareeYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCD34D" />
          <stop offset="40%" stop-color="#F59E0B" />
          <stop offset="85%" stop-color="#D97706" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>

        <linearGradient id="sareePallu" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#FFFBEB" />
          <stop offset="100%" stop-color="#FEF3C7" />
        </linearGradient>

        <!-- Laptop Chassis -->
        <linearGradient id="laptopDeck" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="30%" stop-color="#334155" />
          <stop offset="100%" stop-color="#0F172A" />
        </linearGradient>

        <!-- Filter Shadows -->
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.18" />
        </filter>

        <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.12" />
        </filter>

        <filter id="blurBokeh" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <!-- 1. BACKGROUND -->
      <rect width="${width}" height="${height}" fill="url(#wallBg)" />
      <rect width="${width}" height="${height}" fill="url(#sunGlow)" />

      <!-- Defocused Ambient Studio Background -->
      <g filter="url(#blurBokeh)" opacity="0.38">
        <rect x="80" y="60" width="160" height="380" rx="16" fill="#FFFFFF" />
        <rect x="760" y="80" width="180" height="340" rx="16" fill="#CBD5E1" />
        <circle cx="840" cy="180" r="55" fill="#3B82F6" opacity="0.35" />
        <circle cx="880" cy="270" r="45" fill="#F59E0B" opacity="0.45" />
      </g>

      <!-- 2. CANDIDATE ANANYA R. -->
      <g transform="translate(${headShiftX}, 0)" filter="url(#softShadow)">
        
        <!-- BACK HAIR (Strictly behind shoulders & head) -->
        <g transform="translate(${width / 2}, ${height * 0.36}) rotate(${headAngle})">
          <!-- Left flowing hair mass -->
          <path d="M -80 -60 C -180 20, -190 180, -130 260 C -90 280, -50 240, -60 160 C -65 100, -70 20, -80 -60 Z" fill="url(#hairDark)" />
          <!-- Right flowing hair mass -->
          <path d="M 80 -60 C 180 20, 190 180, 130 260 C 90 280, 50 240, 60 160 C 65 100, 70 20, 80 -60 Z" fill="url(#hairDark)" />
          <!-- Crown Hair Base -->
          <ellipse cx="0" cy="-40" rx="100" ry="110" fill="url(#hairDark)" />
          <path d="M -130 50 C -160 110, -150 190, -110 240" fill="none" stroke="url(#hairHighlight)" stroke-width="18" stroke-linecap="round" opacity="0.4" />
          <path d="M 130 50 C 160 110, 150 190, 110 240" fill="none" stroke="url(#hairHighlight)" stroke-width="18" stroke-linecap="round" opacity="0.4" />
        </g>

        <!-- TORSO & TRADITIONAL SAREE ATTIRE -->
        <g transform="translate(${width / 2}, ${height * 0.48})">
          <!-- Saree Blouse / Shoulders -->
          <path d="M -260 100 C -220 15, -120 -10, 0 -10 C 120 -10, 220 15, 260 100 L 320 380 L -320 380 Z" fill="url(#sareeYellow)" />

          <!-- White & Gold Traditional Pallu Drape -->
          <path d="M -150 -10 C -95 55, -30 170, -15 380 L 160 380 C 125 240, 70 90, 35 -10 Z" fill="url(#sareePallu)" filter="url(#subtleGlow)" />
          <path d="M -150 -10 C -95 55, -30 170, -15 380" fill="none" stroke="#D97706" stroke-width="5" />
          <path d="M 35 -10 C 70 90, 125 240, 160 380" fill="none" stroke="#D97706" stroke-width="5" />

          <!-- Modest Neckline & Skin Reveal -->
          <path d="M -60 -10 C -40 45, 40 45, 60 -10 Z" fill="url(#faceSkin)" />

          <!-- Gold Chain & Pendant -->
          <path d="M -32 6 Q 0 38 32 6" fill="none" stroke="#F59E0B" stroke-width="2.5" />
          <circle cx="0" cy="26" r="4" fill="#FBBF24" />

          <!-- Gold Bangles -->
          <ellipse cx="-180" cy="290" rx="20" ry="10" fill="none" stroke="#F59E0B" stroke-width="4" transform="rotate(-15 -180 290)" />
          <ellipse cx="180" cy="290" rx="20" ry="10" fill="none" stroke="#F59E0B" stroke-width="4" transform="rotate(15 180 290)" />

          <!-- Arms in Typing Pose -->
          <path d="M -225 50 C -255 140, -245 235, -185 305 L -110 305 C -160 235, -170 135, -150 50 Z" fill="#B45309" />
          <path d="M 225 50 C 255 140, 245 235, 185 305 L 110 305 C 160 235, 170 135, 150 50 Z" fill="#B45309" />
        </g>

        <!-- HEAD, NECK, FACE & HEADPHONES -->
        <g transform="translate(${width / 2}, ${height * 0.36}) rotate(${headAngle})">
          
          <!-- Defined Neck with Smooth Seamless Connection to Chest -->
          <path d="M -36 30 L -36 170 L 36 170 L 36 30 Z" fill="url(#neckGrad)" />
          <ellipse cx="0" cy="50" rx="38" ry="12" fill="#7A3D16" opacity="0.3" />

          <!-- Soft Naturally Proportioned Face -->
          <path d="M 0 -120 C 72 -120, 92 -55, 90 10 C 88 65, 50 115, 0 122 C -50 115, -88 65, -90 10 C -92 -55, -72 -120, 0 -120 Z" fill="url(#faceSkin)" filter="url(#subtleGlow)" />
          
          <!-- Cheeks Blush & Glow -->
          <ellipse cx="-44" cy="18" rx="24" ry="15" fill="url(#cheekGlow)" />
          <ellipse cx="44" cy="18" rx="24" ry="15" fill="url(#cheekGlow)" />

          <!-- Small Traditional Indian Bindi -->
          <circle cx="0" cy="-44" r="2.8" fill="#881337" />
          <circle cx="-0.8" cy="-44.8" r="0.9" fill="#F43F5E" />

          <!-- Soft Front Hair Framing & Natural Waves (No neck blockage) -->
          <path d="M -94 -40 C -100 -125, -45 -155, 0 -155 C 45 -155, 100 -125, 94 -40 C 85 -95, 45 -125, 0 -125 C -45 -125, -85 -95, -94 -40 Z" fill="url(#hairDark)" />
          <path d="M -94 -35 C -98 15, -85 55, -80 80 C -70 35, -76 -10, -84 -35 Z" fill="url(#hairDark)" />
          <path d="M 94 -35 C 98 15, 85 55, 80 80 C 70 35, 76 -10, 84 -35 Z" fill="url(#hairDark)" />

          <!-- Eyebrows -->
          <path d="M -60 -50 Q -36 -62 -14 -50" fill="none" stroke="#18110D" stroke-width="4.2" stroke-linecap="round" />
          <path d="M 14 -50 Q 36 -62 60 -50" fill="none" stroke="#18110D" stroke-width="4.2" stroke-linecap="round" />

          <!-- Expressive Realistic Eyes -->
          <g transform="translate(${gazeX}, ${gazeY})">
            <!-- Left Eye -->
            <ellipse cx="-36" cy="-30" rx="14" ry="9" fill="#FFFFFF" />
            <circle cx="-36" cy="-30" r="7" fill="#3B2215" />
            <circle cx="-36" cy="-30" r="4" fill="#0A0604" />
            <circle cx="-38" cy="-33" r="2" fill="#FFFFFF" />
            <circle cx="-34" cy="-28" r="1" fill="#FFFFFF" opacity="0.85" />
            <path d="M -50 -33 Q -36 -41 -22 -33" fill="none" stroke="#0F0906" stroke-width="2.5" stroke-linecap="round" />

            <!-- Right Eye -->
            <ellipse cx="36" cy="-30" rx="14" ry="9" fill="#FFFFFF" />
            <circle cx="36" cy="-30" r="7" fill="#3B2215" />
            <circle cx="36" cy="-30" r="4" fill="#0A0604" />
            <circle cx="34" cy="-33" r="2" fill="#FFFFFF" />
            <circle cx="38" cy="-28" r="1" fill="#FFFFFF" opacity="0.85" />
            <path d="M 22 -33 Q 36 -41 50 -33" fill="none" stroke="#0F0906" stroke-width="2.5" stroke-linecap="round" />
          </g>

          <!-- 3D Nose Bridge & Soft Nostril Shading -->
          <path d="M 0 -34 L 0 8 Q 10 13 0 16" fill="none" stroke="#9E582C" stroke-width="2.8" stroke-linecap="round" />
          <ellipse cx="-7" cy="14" rx="3.2" ry="2.2" fill="#884218" opacity="0.4" />
          <ellipse cx="7" cy="14" rx="3.2" ry="2.2" fill="#884218" opacity="0.4" />
          <ellipse cx="0" cy="10" rx="4.5" ry="3.5" fill="#FFE2D0" opacity="0.4" />

          <!-- Expressive Lips -->
          <path d="M -20 40 Q 0 34 20 40 Q 0 55 -20 40 Z" fill="#BA4646" filter="url(#subtleGlow)" />
          <path d="M -18 40 Q 0 37 18 40" fill="none" stroke="#7F1D1D" stroke-width="1.4" />
          <ellipse cx="0" cy="44" rx="9" ry="2.8" fill="#FFA3A3" opacity="0.4" />

          <!-- STYLISH RECTANGULAR DARK-RIMMED GLASSES (Exactly Over Eyes) -->
          <g transform="translate(0, -32)" filter="url(#subtleGlow)">
            <!-- Left Frame -->
            <rect x="-58" y="-12" width="44" height="28" rx="6" fill="rgba(255, 255, 255, 0.2)" stroke="#1E293B" stroke-width="3" />
            <!-- Right Frame -->
            <rect x="14" y="-12" width="44" height="28" rx="6" fill="rgba(255, 255, 255, 0.2)" stroke="#1E293B" stroke-width="3" />
            <!-- Bridge -->
            <path d="M -14 -2 Q 0 -6 14 -2" fill="none" stroke="#1E293B" stroke-width="3.5" />
            <!-- Glint Highlights -->
            <line x1="-50" y1="-7" x2="-38" y2="8" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.6" />
            <line x1="22" y1="-7" x2="34" y2="8" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity="0.6" />
          </g>

          <!-- OVER-EAR WHITE PROCTORING HEADPHONES -->
          <!-- Headband -->
          <path d="M -96 -35 C -102 -155, 102 -155, 96 -35" fill="none" stroke="url(#headphoneWhite)" stroke-width="14" stroke-linecap="round" filter="url(#subtleGlow)" />
          <path d="M -96 -35 C -102 -155, 102 -155, 96 -35" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" />

          <!-- Left Ear Cushion -->
          <g transform="translate(-98, -10)">
            <ellipse cx="0" cy="0" rx="16" ry="34" fill="url(#headphoneWhite)" stroke="url(#headphoneSilver)" stroke-width="3" filter="url(#subtleGlow)" />
            <ellipse cx="0" cy="0" rx="9" ry="22" fill="#94A3B8" opacity="0.4" />
            <line x1="0" y1="34" x2="-20" y2="100" stroke="#CBD5E1" stroke-width="2.5" />
          </g>

          <!-- Right Ear Cushion -->
          <g transform="translate(98, -10)">
            <ellipse cx="0" cy="0" rx="16" ry="34" fill="url(#headphoneWhite)" stroke="url(#headphoneSilver)" stroke-width="3" filter="url(#subtleGlow)" />
            <ellipse cx="0" cy="0" rx="9" ry="22" fill="#94A3B8" opacity="0.4" />
          </g>
        </g>
      </g>

      <!-- 3. FOREGROUND DESK & 3D LAPTOP WITH TYPING HANDS -->
      <!-- Desk Base -->
      <rect x="0" y="${height * 0.72}" width="${width}" height="${height * 0.28}" fill="#E2E8F0" />
      <line x1="0" y1="${height * 0.72}" x2="${width}" y2="${height * 0.72}" stroke="#CBD5E1" stroke-width="3" />

      <!-- Open Laptop -->
      <g transform="translate(${width * 0.12}, ${height * 0.70})" filter="url(#softShadow)">
        <path d="M 0 ${height * 0.30} L 65 24 L ${width * 0.76 - 65} 24 L ${width * 0.76} ${height * 0.30} Z" fill="url(#laptopDeck)" stroke="#94A3B8" stroke-width="2" />
        
        <!-- Keyboard Grid -->
        <rect x="85" y="44" width="${width * 0.76 - 170}" height="80" rx="6" fill="#0F172A" />
        <line x1="100" y1="64" x2="${width * 0.76 - 100}" y2="64" stroke="#334155" stroke-width="4.5" stroke-dasharray="12 4" />
        <line x1="100" y1="84" x2="${width * 0.76 - 100}" y2="84" stroke="#334155" stroke-width="4.5" stroke-dasharray="12 4" />
        <line x1="100" y1="104" x2="${width * 0.76 - 100}" y2="104" stroke="#334155" stroke-width="4.5" stroke-dasharray="16 5" />

        <!-- Trackpad -->
        <rect x="${(width * 0.76 - 140) / 2}" y="134" width="140" height="66" rx="6" fill="#1E293B" stroke="#475569" stroke-width="1.5" />

        <!-- Typing Hands -->
        <g opacity="0.96" filter="url(#subtleGlow)">
          <!-- Left Hand -->
          <path d="M 65 64 C 95 46, 130 54, 146 78 C 130 102, 98 106, 60 96 Z" fill="url(#faceSkin)" />
          <!-- Right Hand -->
          <path d="M ${width * 0.76 - 65} 64 C ${width * 0.76 - 95} 46, ${width * 0.76 - 130} 54, ${width * 0.76 - 146} 78 C ${width * 0.76 - 130} 102, ${width * 0.76 - 98} 106, ${width * 0.76 - 60} 96 Z" fill="url(#faceSkin)" />
        </g>
      </g>

      <!-- Upward Ambient Screen Reflection Glow -->
      <rect x="0" y="${height * 0.44}" width="${width}" height="${height * 0.56}" fill="url(#screenReflection)" pointer-events="none" />

      <!-- 4. GUARDEYE AI PROCTORING HUD OVERLAY -->
      <!-- Top Left REC Pill -->
      <g transform="translate(24, 24)">
        <rect x="0" y="0" width="170" height="32" rx="8" fill="rgba(15, 23, 42, 0.88)" />
        <circle cx="16" cy="16" r="5" fill="${hudColor}" />
        <text x="30" y="20.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">REC · ${timestamp}</text>
      </g>

      <!-- Top Right Verification Status Pill -->
      <g transform="translate(${width - 24}, 24)">
        <rect x="-220" y="0" width="220" height="32" rx="8" fill="${hudBg}" stroke="${hudBorder}" stroke-width="1.5" />
        <circle cx="-204" cy="16" r="4.5" fill="${hudColor}" />
        <text x="-192" y="20.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="${hudColor}" letter-spacing="0.4">${hudTitle.toUpperCase()}</text>
      </g>

      ${isFlagged ? `
        <!-- Flagged Gaze Deviation Bounding Box -->
        <g transform="translate(${width / 2 + headShiftX - 78}, ${height * 0.36 - 95})">
          <rect x="0" y="0" width="156" height="185" rx="12" fill="none" stroke="#EA580C" stroke-width="2.5" stroke-dasharray="8 5" opacity="0.9" />
          <!-- Corner Brackets -->
          <path d="M 0 22 L 0 0 L 22 0" fill="none" stroke="#EA580C" stroke-width="4" />
          <path d="M 134 0 L 156 0 L 156 22" fill="none" stroke="#EA580C" stroke-width="4" />
          <path d="M 0 163 L 0 185 L 22 185" fill="none" stroke="#EA580C" stroke-width="4" />
          <path d="M 134 185 L 156 185 L 156 163" fill="none" stroke="#EA580C" stroke-width="4" />
          
          <rect x="14" y="-13" width="128" height="22" rx="5" fill="#EA580C" />
          <text x="78" y="2.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">⚠️ GAZE DEVIATION</text>
        </g>
      ` : `
        <!-- Face Detected Normal Bounding Box -->
        <g transform="translate(${width / 2 - 75}, ${height * 0.36 - 90})" opacity="0.85">
          <path d="M 0 20 L 0 0 L 20 0" fill="none" stroke="#16A34A" stroke-width="3" />
          <path d="M 130 0 L 150 0 L 150 20" fill="none" stroke="#16A34A" stroke-width="3" />
          <path d="M 0 155 L 0 175 L 20 175" fill="none" stroke="#16A34A" stroke-width="3" />
          <path d="M 130 175 L 150 175 L 150 155" fill="none" stroke="#16A34A" stroke-width="3" />
          <rect x="18" y="-11" width="114" height="20" rx="4" fill="rgba(22, 163, 74, 0.95)" />
          <text x="75" y="3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">FACE DETECTED</text>
        </g>
      `}
    </svg>
  `;
}

async function renderAndSave(svgString, basePath, width = 1200, height = 1200) {
  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize(width, height)
    .png()
    .toBuffer();

  const webpPath = `${basePath}.webp`;
  const jpgPath = `${basePath}.jpg`;

  await sharp(pngBuffer)
    .webp({ quality: 96, effort: 4 })
    .toFile(webpPath);

  await sharp(pngBuffer)
    .jpeg({ quality: 96, mozjpeg: true })
    .toFile(jpgPath);

  console.log(`✓ Generated: ${path.basename(webpPath)} & ${path.basename(jpgPath)}`);
}

async function main() {
  console.log('Generating perfected AI digital illustrations for Ananya R...');

  // 1. In position (00:05)
  const snap1Svg = createAiCandidateSvg(1200, 1200, 'in_position');
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'report-snap-1'));
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'snap-front'));

  // 2. Flagged moment (11:48)
  const snap2Svg = createAiCandidateSvg(1200, 1200, 'flagged_away');
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'report-snap-2'));
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'snap-away'));

  // 3. Refocused (11:53)
  const snap3Svg = createAiCandidateSvg(1200, 1200, 'refocused');
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'report-snap-3'));
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'snap-back'));

  // 4. Hero Candidate & Hero Webcam mocks
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'hero-candidate'));
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'hero-webcam'));

  console.log('✨ All AI generated proctoring visuals updated with crystal clarity!');
}

main().catch(console.error);
