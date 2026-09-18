const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

function getUltraPolishedAiCandidateSvg(width, height, mode = 'in_position') {
  const isAway = mode === 'flagged_away';
  const isRefocused = mode === 'refocused';

  // Head and gaze kinematics
  const headAngle = isAway ? 20 : (isRefocused ? -1 : 0);
  const headShiftX = isAway ? 35 : 0;
  const eyeGazeX = isAway ? 24 : (isRefocused ? -2 : 0);
  const eyeGazeY = isAway ? -4 : (isRefocused ? 6 : 1);

  // Status HUD telemetry
  const hudColor = isAway ? '#EF4444' : '#10B981';
  const hudBg = isAway ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
  const hudBorder = isAway ? '#EF4444' : '#10B981';
  const hudText = isAway ? 'AI FLAG: GAZE DEVIATION' : (isRefocused ? 'STATUS: REFOCUSED' : 'FACE DETECTED · ID MATCH');
  const timeCode = isAway ? '11:48.04' : (isRefocused ? '11:53.22' : '00:05.18');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Studio Environment Gradients -->
        <linearGradient id="bgStudio" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC" />
          <stop offset="45%" stop-color="#EDF2F7" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>

        <radialGradient id="softStudioLight" cx="45%" cy="20%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </radialGradient>

        <!-- Upward Screen Reflection Glow -->
        <linearGradient id="screenReflection" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.35" />
          <stop offset="40%" stop-color="#818CF8" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </linearGradient>

        <!-- Contoured 3D Indian Skin Tone Gradients -->
        <radialGradient id="faceSkin" cx="48%" cy="40%" r="58%">
          <stop offset="0%" stop-color="#FBD4B4" />
          <stop offset="35%" stop-color="#E9A87E" />
          <stop offset="70%" stop-color="#D48E60" />
          <stop offset="92%" stop-color="#B87243" />
          <stop offset="100%" stop-color="#9C5A2D" />
        </radialGradient>

        <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#E26D6D" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#E26D6D" stop-opacity="0" />
        </radialGradient>

        <linearGradient id="foreheadLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFF2E5" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#E9A87E" stop-opacity="0" />
        </linearGradient>

        <linearGradient id="neckShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#864117" />
          <stop offset="40%" stop-color="#B46E40" />
          <stop offset="100%" stop-color="#DB9E72" />
        </linearGradient>

        <!-- Volumetric Silky Dark Hair Gradients -->
        <linearGradient id="hairBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#241B17" />
          <stop offset="45%" stop-color="#140E0C" />
          <stop offset="100%" stop-color="#060403" />
        </linearGradient>

        <linearGradient id="hairGloss" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="#5A4035" />
          <stop offset="40%" stop-color="#3A2820" />
          <stop offset="100%" stop-color="#140E0C" />
        </linearGradient>

        <!-- Navy Blazer & Professional Attire -->
        <linearGradient id="navySuit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E293B" />
          <stop offset="45%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>

        <linearGradient id="suitLapel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>

        <!-- 3D Laptop Chassis Gradients -->
        <linearGradient id="laptopChassis" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#64748B" />
          <stop offset="15%" stop-color="#475569" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>

        <linearGradient id="laptopScreenRim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="50%" stop-color="#818CF8" />
          <stop offset="100%" stop-color="#38BDF8" />
        </linearGradient>

        <!-- Filters for depth & ambient occlusion -->
        <filter id="castShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.20" />
        </filter>

        <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.10" />
        </filter>

        <filter id="blurRoom" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <!-- 1. BACKGROUND STUDIO ENVIRONMENT -->
      <rect width="${width}" height="${height}" fill="url(#bgStudio)" />
      <rect width="${width}" height="${height}" fill="url(#softStudioLight)" />

      <!-- Defocused Ambient Study Elements -->
      <g filter="url(#blurRoom)" opacity="0.35">
        <rect x="60" y="40" width="160" height="420" rx="16" fill="#FFFFFF" />
        <rect x="750" y="60" width="180" height="380" rx="20" fill="#E2E8F0" />
        <circle cx="820" cy="180" r="60" fill="#3B82F6" opacity="0.3" />
        <circle cx="860" cy="280" r="50" fill="#F59E0B" opacity="0.35" />
      </g>

      <!-- 2. ANANYA R. - REFINED 3D DIGITAL SCULPT -->
      <g transform="translate(${headShiftX}, 0)" filter="url(#castShadow)">
        
        <!-- Back Flowing Volumetric Hair -->
        <g transform="translate(${width / 2}, ${height * 0.40}) rotate(${headAngle})">
          <path d="M -130 -40 C -180 30, -180 180, -120 270 C -80 300, 80 300, 120 270 C 180 180, 180 30, 130 -40 C 115 -155, -115 -155, -130 -40 Z" fill="url(#hairBase)" />
          <path d="M -120 -20 C -155 50, -155 160, -105 240" fill="none" stroke="url(#hairGloss)" stroke-width="20" stroke-linecap="round" opacity="0.4" />
          <path d="M 120 -20 C 155 50, 155 160, 105 240" fill="none" stroke="url(#hairGloss)" stroke-width="20" stroke-linecap="round" opacity="0.4" />
        </g>

        <!-- Torso, Navy Tailored Blazer & White Blouse -->
        <g transform="translate(${width / 2}, ${height * 0.58})">
          <!-- Blazer Shoulder & Chest Silhouette -->
          <path d="M -235 160 C -195 40, -115 5, 0 5 C 115 5, 195 40, 235 160 L 290 390 L -290 390 Z" fill="url(#navySuit)" />

          <!-- Crisp White Inner Shirt -->
          <path d="M -60 5 L 0 95 L 60 5 Z" fill="#FFFFFF" />
          <path d="M -60 5 L 0 105 L -10 165 L -75 35 Z" fill="#F1F5F9" />
          <path d="M 60 5 L 0 105 L 10 165 L 75 35 Z" fill="#E2E8F0" />

          <!-- Blazer Lapels with 3D Bevel -->
          <path d="M -115 5 L 0 145 L -36 160 L -145 35 Z" fill="url(#suitLapel)" filter="url(#softGlow)" />
          <path d="M 115 5 L 0 145 L 38 160 L 145 35 Z" fill="url(#suitLapel)" filter="url(#softGlow)" />

          <!-- Delicate Gold Chain with Round Solitaire Pendant -->
          <path d="M -30 18 Q 0 50 30 18" fill="none" stroke="#F59E0B" stroke-width="2.5" />
          <circle cx="0" cy="38" r="4.5" fill="#FBBF24" filter="url(#softGlow)" />
          <circle cx="-1.2" cy="36.8" r="1.5" fill="#FFFFFF" />

          <!-- Upper Arms in Typing / Test Taking Position -->
          <path d="M -205 90 C -230 180, -220 270, -165 340 L -90 340 C -145 270, -155 165, -135 90 Z" fill="#1E293B" />
          <path d="M 205 90 C 230 180, 220 270, 165 340 L 90 340 C 145 270, 155 165, 135 90 Z" fill="#1E293B" />
        </g>

        <!-- Head, Neck, and Detailed Facial Features -->
        <g transform="translate(${width / 2}, ${height * 0.39}) rotate(${headAngle})">
          
          <!-- Neck & Trapezius Shadows -->
          <path d="M -34 35 L -34 105 L 34 105 L 34 35 Z" fill="url(#neckShadow)" />
          <ellipse cx="0" cy="45" rx="38" ry="14" fill="#7A3D16" opacity="0.35" />

          <!-- Soft Naturally Contoured Oval Face (Smooth Bezier) -->
          <path d="M 0 -125 C 65 -125, 82 -60, 80 5 C 78 58, 45 110, 0 118 C -45 110, -78 58, -80 5 C -82 -60, -65 -125, 0 -125 Z" fill="url(#faceSkin)" filter="url(#softGlow)" />
          
          <!-- Forehead & T-Zone Highlights -->
          <ellipse cx="0" cy="-50" rx="48" ry="26" fill="url(#foreheadLight)" />
          
          <!-- Soft Rosy Cheekbone Contours -->
          <ellipse cx="-42" cy="10" rx="24" ry="16" fill="url(#cheekBlush)" />
          <ellipse cx="42" cy="10" rx="24" ry="16" fill="url(#cheekBlush)" />

          <!-- Pearl & Gold Stud Earrings -->
          <circle cx="-78" cy="-5" r="4.5" fill="#F8FAFC" stroke="#D97706" stroke-width="1.5" />
          <circle cx="78" cy="-5" r="4.5" fill="#F8FAFC" stroke="#D97706" stroke-width="1.5" />

          <!-- Front Hair Framing & Natural Bangs -->
          <path d="M -88 -45 C -95 -130, -45 -165, 0 -165 C 45 -165, 95 -130, 88 -45 C 80 -100, 45 -135, 0 -135 C -45 -135, -80 -100, -88 -45 Z" fill="url(#hairBase)" />
          
          <!-- Left side flowing hair framing face -->
          <path d="M -88 -40 C -92 20, -78 65, -72 100 C -60 40, -68 -15, -76 -40 Z" fill="url(#hairBase)" />
          <!-- Right side flowing hair framing face -->
          <path d="M 88 -40 C 92 20, 78 65, 72 100 C 60 40, 68 -15, 76 -40 Z" fill="url(#hairBase)" />

          <!-- Volumetric Hair Gloss Highlights -->
          <path d="M -65 -95 Q 0 -140 65 -95" fill="none" stroke="url(#hairGloss)" stroke-width="6" stroke-linecap="round" opacity="0.6" />

          <!-- Traditional Small Red Bindi -->
          <circle cx="0" cy="-48" r="2.4" fill="#991B1B" />
          <circle cx="-0.6" cy="-48.6" r="0.8" fill="#EF4444" />

          <!-- Defined Natural Arched Eyebrows -->
          <path d="M -58 -52 Q -34 -65 -14 -52" fill="none" stroke="#18110D" stroke-width="4.2" stroke-linecap="round" />
          <path d="M 14 -52 Q 34 -65 58 -52" fill="none" stroke="#18110D" stroke-width="4.2" stroke-linecap="round" />

          <!-- Expressive Realistic Eyes with 3D Depth & Glints -->
          <g transform="translate(${eyeGazeX}, ${eyeGazeY})">
            <!-- Left Eye -->
            <ellipse cx="-34" cy="-30" rx="14" ry="8.5" fill="#FFFFFF" />
            <circle cx="-34" cy="-30" r="7" fill="#3B2215" />
            <circle cx="-34" cy="-30" r="4.2" fill="#0A0604" />
            <!-- Specular reflections -->
            <circle cx="-36" cy="-33" r="2.2" fill="#FFFFFF" />
            <circle cx="-32" cy="-28" r="1.1" fill="#FFFFFF" opacity="0.85" />
            <!-- Eyelids & Lashes -->
            <path d="M -50 -33 Q -34 -41 -18 -33" fill="none" stroke="#0F0906" stroke-width="2.6" stroke-linecap="round" />
            <path d="M -47 -27 Q -34 -22 -21 -27" fill="none" stroke="#A05A2C" stroke-width="1.2" opacity="0.5" />

            <!-- Right Eye -->
            <ellipse cx="34" cy="-30" rx="14" ry="8.5" fill="#FFFFFF" />
            <circle cx="34" cy="-30" r="7" fill="#3B2215" />
            <circle cx="34" cy="-30" r="4.2" fill="#0A0604" />
            <!-- Specular reflections -->
            <circle cx="32" cy="-33" r="2.2" fill="#FFFFFF" />
            <circle cx="36" cy="-28" r="1.1" fill="#FFFFFF" opacity="0.85" />
            <!-- Eyelids & Lashes -->
            <path d="M 18 -33 Q 34 -41 50 -33" fill="none" stroke="#0F0906" stroke-width="2.6" stroke-linecap="round" />
            <path d="M 21 -27 Q 34 -22 47 -27" fill="none" stroke="#A05A2C" stroke-width="1.2" opacity="0.5" />
          </g>

          <!-- 3D Nose Bridge & Tip with Soft Shading -->
          <path d="M 0 -38 L 0 8 Q 9 12 0 15" fill="none" stroke="#9E582C" stroke-width="2.8" stroke-linecap="round" />
          <ellipse cx="-7" cy="13" rx="3.2" ry="2.2" fill="#884218" opacity="0.4" />
          <ellipse cx="7" cy="13" rx="3.2" ry="2.2" fill="#884218" opacity="0.4" />
          <ellipse cx="0" cy="10" rx="5" ry="3.8" fill="#FFE2D0" opacity="0.4" />

          <!-- Refined Natural Warm Lips with Soft Smile -->
          <path d="M -20 40 Q 0 34 20 40 Q 0 56 -20 40 Z" fill="#C24E4E" filter="url(#softGlow)" />
          <path d="M -18 40 Q 0 36 18 40" fill="none" stroke="#8D2020" stroke-width="1.4" />
          <ellipse cx="0" cy="44" rx="9" ry="2.8" fill="#FFA3A3" opacity="0.35" />
        </g>
      </g>

      <!-- 3. FOREGROUND 3D LAPTOP & BACKLIT KEYBOARD (TEST-TAKING CONTEXT) -->
      <!-- Desk Surface -->
      <rect x="0" y="${height * 0.72}" width="${width}" height="${height * 0.28}" fill="#E2E8F0" />
      <line x1="0" y1="${height * 0.72}" x2="${width}" y2="${height * 0.72}" stroke="#CBD5E1" stroke-width="3" />

      <!-- Open Laptop Display & Keyboard Base in 3D Angle -->
      <g transform="translate(${width * 0.15}, ${height * 0.69})" filter="url(#castShadow)">
        <!-- Top Metallic Screen Bezel Hinge -->
        <path d="M 0 ${height * 0.31} L 60 26 L ${width * 0.70 - 60} 26 L ${width * 0.70} ${height * 0.31} Z" fill="url(#laptopChassis)" stroke="#94A3B8" stroke-width="2" />
        <rect x="70" y="24" width="${width * 0.70 - 140}" height="4" rx="2" fill="url(#laptopScreenRim)" />

        <!-- Illuminated Keyboard Deck -->
        <rect x="80" y="46" width="${width * 0.70 - 160}" height="76" rx="6" fill="#0F172A" />
        <line x1="94" y1="64" x2="${width * 0.70 - 94}" y2="64" stroke="#334155" stroke-width="4" stroke-dasharray="11 4" />
        <line x1="94" y1="82" x2="${width * 0.70 - 94}" y2="82" stroke="#334155" stroke-width="4" stroke-dasharray="11 4" />
        <line x1="94" y1="100" x2="${width * 0.70 - 94}" y2="100" stroke="#334155" stroke-width="4" stroke-dasharray="15 5" />

        <!-- Large Precision Glass Trackpad -->
        <rect x="${(width * 0.70 - 130) / 2}" y="132" width="130" height="66" rx="6" fill="#1E293B" stroke="#475569" stroke-width="1.5" />

        <!-- Active Test-Taking Typing Hands with Natural Fingers -->
        <g opacity="0.96" filter="url(#softGlow)">
          <!-- Left Hand on Keyboard -->
          <path d="M 60 66 C 88 50, 120 58, 136 80 C 120 102, 92 106, 55 96 Z" fill="url(#faceSkin)" />
          <!-- Right Hand on Trackpad/Keys -->
          <path d="M ${width * 0.70 - 60} 66 C ${width * 0.70 - 88} 50, ${width * 0.70 - 120} 58, ${width * 0.70 - 136} 80 C ${width * 0.70 - 120} 102, ${width * 0.70 - 92} 106, ${width * 0.70 - 55} 96 Z" fill="url(#faceSkin)" />
        </g>
      </g>

      <!-- Upward Screen Ambient Light Glow -->
      <rect x="0" y="${height * 0.44}" width="${width}" height="${height * 0.56}" fill="url(#screenReflection)" pointer-events="none" />

      <!-- 4. GUARDEYE AI PROCTORING HUD TELEMETRY OVERLAY -->
      <!-- Top Left Recording Pill -->
      <g transform="translate(24, 24)">
        <rect x="0" y="0" width="180" height="30" rx="8" fill="rgba(15, 23, 42, 0.85)" />
        <circle cx="15" cy="15" r="5" fill="${hudColor}" />
        <text x="28" y="19.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">REC · ${timeCode}</text>
      </g>

      <!-- Top Right Status Pill -->
      <g transform="translate(${width - 24}, 24)">
        <rect x="-240" y="0" width="240" height="30" rx="8" fill="${hudBg}" stroke="${hudBorder}" stroke-width="1.5" />
        <circle cx="-224" cy="15" r="4.5" fill="${hudColor}" />
        <text x="-212" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="700" fill="${hudColor}" letter-spacing="0.4">${hudText}</text>
      </g>

      ${isAway ? `
        <!-- Flagged Gaze Warning HUD Frame -->
        <g transform="translate(${width / 2 + headShiftX - 70}, ${height * 0.38 - 95})">
          <rect x="0" y="0" width="140" height="175" rx="10" fill="none" stroke="#EF4444" stroke-width="2" stroke-dasharray="8 5" opacity="0.9" />
          <!-- Corner Brackets -->
          <path d="M 0 20 L 0 0 L 20 0" fill="none" stroke="#EF4444" stroke-width="3.5" />
          <path d="M 120 0 L 140 0 L 140 20" fill="none" stroke="#EF4444" stroke-width="3.5" />
          <path d="M 0 155 L 0 175 L 20 175" fill="none" stroke="#EF4444" stroke-width="3.5" />
          <path d="M 120 175 L 140 175 L 140 155" fill="none" stroke="#EF4444" stroke-width="3.5" />
          
          <rect x="5" y="-12" width="130" height="20" rx="5" fill="#EF4444" />
          <text x="70" y="2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">⚠️ GAZE DEVIATION</text>
        </g>
      ` : `
        <!-- Verified Facial Bounding Box -->
        <g transform="translate(${width / 2 - 68}, ${height * 0.38 - 90})" opacity="0.85">
          <path d="M 0 18 L 0 0 L 18 0" fill="none" stroke="#10B981" stroke-width="3" />
          <path d="M 118 0 L 136 0 L 136 18" fill="none" stroke="#10B981" stroke-width="3" />
          <path d="M 0 148 L 0 166 L 18 166" fill="none" stroke="#10B981" stroke-width="3" />
          <path d="M 118 166 L 136 166 L 136 148" fill="none" stroke="#10B981" stroke-width="3" />
          <rect x="14" y="-11" width="108" height="18" rx="4" fill="rgba(16, 185, 129, 0.95)" />
          <text x="68" y="2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">FACE DETECTED</text>
        </g>
      `}
    </svg>
  `;
}

async function renderAndSave(svgString, basePath, width = 1000, height = 1000) {
  const pngBuffer = await sharp(Buffer.from(svgString))
    .resize(width, height)
    .png()
    .toBuffer();

  const webpPath = `${basePath}.webp`;
  const jpgPath = `${basePath}.jpg`;

  await sharp(pngBuffer)
    .webp({ quality: 95, effort: 4 })
    .toFile(webpPath);

  await sharp(pngBuffer)
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(jpgPath);

  console.log(`✓ Generated: ${path.basename(webpPath)} & ${path.basename(jpgPath)}`);
}

async function main() {
  console.log('Generating ultra-polished AI candidate visuals for Ananya R...');

  // 1. In position (00:05)
  const snap1Svg = getUltraPolishedAiCandidateSvg(1000, 1000, 'in_position');
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'report-snap-1'));
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'snap-front'));

  // 2. Flagged moment (11:48)
  const snap2Svg = getUltraPolishedAiCandidateSvg(1000, 1000, 'flagged_away');
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'report-snap-2'));
  await renderAndSave(snap2Svg, path.join(IMAGES_DIR, 'snap-away'));

  // 3. Refocused (11:53)
  const snap3Svg = getUltraPolishedAiCandidateSvg(1000, 1000, 'refocused');
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'report-snap-3'));
  await renderAndSave(snap3Svg, path.join(IMAGES_DIR, 'snap-back'));

  // 4. Hero candidate and webcam visual
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'hero-candidate'));
  await renderAndSave(snap1Svg, path.join(IMAGES_DIR, 'hero-webcam'));

  console.log('✓ All candidate snapshot assets updated with crystal clarity!');
}

main().catch(console.error);
