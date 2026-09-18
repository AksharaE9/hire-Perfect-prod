const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'public', 'images', 'signals');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function createSvg(name, title, subtitle, badge, accentColor) {
  const svg = `
    <svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111827" />
          <stop offset="100%" stop-color="#1F2937" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#grad-${name})" rx="16" />
      <rect x="30" y="30" width="740" height="390" rx="12" fill="#1F2937" stroke="#374151" stroke-width="2" />
      <circle cx="60" cy="60" r="6" fill="#EF4444" />
      <circle cx="80" cy="60" r="6" fill="#F59E0B" />
      <circle cx="100" cy="60" r="6" fill="#10B981" />
      <rect x="130" y="50" width="300" height="20" rx="4" fill="#111827" />
      
      <rect x="140" y="110" width="520" height="230" rx="16" fill="#111827" stroke="${accentColor}" stroke-width="2" />
      
      <rect x="170" y="140" width="140" height="28" rx="6" fill="${accentColor}33" />
      <text x="180" y="159" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold" fill="${accentColor}">${badge}</text>
      
      <text x="170" y="210" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF">${title}</text>
      <text x="170" y="245" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#9CA3AF">${subtitle}</text>
      
      <rect x="170" y="275" width="150" height="34" rx="6" fill="${accentColor}" />
      <text x="245" y="297" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Monitoring Active</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(path.join(dir, name + '.webp'));
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(path.join(dir, name + '.jpg'));
}

async function run() {
  await createSvg('ai-overlay', 'AI Assistant Detected', 'Background AI extension blocked by sandbox', 'SECURITY ALERT', '#EF4444');
  await createSvg('audio-voices', 'Acoustic Signal Analysis', 'Background speech &amp; multiple voice pattern logged', 'AUDIO MONITOR', '#3B82F6');
  console.log('Roadmap visual cards generated');
}

run();
