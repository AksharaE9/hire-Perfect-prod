const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const CATEGORIES_DIR = path.join(IMAGES_DIR, 'categories');

// Target definitions: [filename, width, height, background, marigoldAccent, title]
const REQUIRED_HERO_AND_PAGE_IMAGES = [
  ['hero-bg.jpg', 2400, 1350, '#F5F7F6', true, 'Hero Background'],
  ['hero-webcam.jpg', 1200, 900, '#F5F7F6', true, 'Hero Webcam · Ananya'],
  ['snap-front.jpg', 960, 720, '#F5F7F6', false, 'Report Snap 1 · Frontal'],
  ['snap-away.jpg', 960, 720, '#F5F7F6', false, 'Report Snap 2 · Look Away'],
  ['snap-back.jpg', 960, 720, '#F5F7F6', false, 'Report Snap 3 · Refocus'],
  ['step-before.jpg', 1200, 1500, '#F5F7F6', true, 'Before Exam · ID Check'],
  ['step-during.jpg', 1200, 1500, '#F5F7F6', true, 'During Exam · Fullscreen'],
  ['step-after.jpg', 1200, 1500, '#F5F7F6', true, 'After Exam · Reviewer'],
  ['monitor-anatomy.jpg', 2000, 1250, '#F5F7F6', true, 'Proctoring Anatomy'],
  ['who-hiring.jpg', 1500, 1000, '#F5F7F6', true, 'Hiring Teams'],
  ['who-campus.jpg', 1500, 1000, '#F5F7F6', true, 'Colleges & Campus'],
  ['who-academy.jpg', 1500, 1000, '#F5F7F6', true, 'Training Academies'],
  ['who-candidate.jpg', 1500, 1000, '#F5F7F6', true, 'Candidates'],
  ['fair-signal.jpg', 1500, 1000, '#F5F7F6', true, 'Signals Not Verdicts'],
  ['fair-transparent.jpg', 1500, 1000, '#F5F7F6', true, 'Transparent Rules'],
  ['fair-same-rules.jpg', 1500, 1000, '#F5F7F6', true, 'Equal Standard'],
  ['cta-hall.jpg', 2520, 1080, '#F5F7F6', true, 'Examination Hall'],
  ['library-header.jpg', 2400, 1350, '#F5F7F6', true, 'Assessment Library'],
  ['integrity-hero.jpg', 2400, 1350, '#F5F7F6', true, 'Integrity Architecture'],
  ['about-hero.jpg', 2400, 1350, '#F5F7F6', true, 'About HirePerfect'],
  ['about-work.jpg', 1500, 1000, '#F5F7F6', true, 'Collaborative Review'],
  ['contact-side.jpg', 1200, 1500, '#F5F7F6', true, 'Contact Support'],
  ['auth-login.jpg', 1200, 1500, '#F5F7F6', true, 'Secure Authentication'],
  ['auth-signup.jpg', 1200, 1500, '#F5F7F6', true, 'Account Registration'],
  ['empty-state.jpg', 1000, 1000, '#F5F7F6', true, 'Empty Answer Sheet'],
  ['who-hiring-tall.jpg', 1600, 2000, '#F5F7F6', true, 'Hiring Teams · Recruiter'],
  ['who-campus-tall.jpg', 1600, 2000, '#F5F7F6', true, 'Colleges · Computer Lab'],
  ['who-academy-tall.jpg', 1600, 2000, '#F5F7F6', true, 'Academies · Training Room'],
  ['who-candidate-tall.jpg', 1600, 2000, '#F5F7F6', true, 'Candidate · Preparation'],
  // Legacy WebP aliases
  ['hero-candidate.webp', 1200, 900, '#F5F7F6', true, 'Hero Webcam · Ananya'],
  ['report-snap-1.webp', 960, 720, '#F5F7F6', false, 'Report Snap 1'],
  ['report-snap-2.webp', 960, 720, '#F5F7F6', false, 'Report Snap 2'],
  ['report-snap-3.webp', 960, 720, '#F5F7F6', false, 'Report Snap 3'],
  ['who-hiring.webp', 1500, 1000, '#F5F7F6', true, 'Hiring Teams'],
  ['who-campus.webp', 1500, 1000, '#F5F7F6', true, 'Colleges & Campus'],
  ['who-academy.webp', 1500, 1000, '#F5F7F6', true, 'Training Academies'],
  ['who-candidate.webp', 1500, 1000, '#F5F7F6', true, 'Candidates'],
  ['integrity-check.webp', 2000, 1250, '#F5F7F6', true, 'Pre-exam Check'],
  ['about-workspace.webp', 2400, 1350, '#F5F7F6', true, 'Workspace'],
  ['auth-login.webp', 1200, 1500, '#F5F7F6', true, 'Login Frame'],
  ['auth-signup.webp', 1200, 1500, '#F5F7F6', true, 'Signup Frame'],
];

const CATEGORY_SLUGS = [
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

async function generateSvgPlaceholder(width, height, title, hasMarigold) {
  const safeTitle = String(title).replace(/&/g, '&amp;');
  const marigoldDot = hasMarigold
    ? `<circle cx="${width - 60}" cy="60" r="14" fill="#F59E0B" />`
    : '';

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#F5F7F6"/>
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="#FFFFFF" stroke="#DDE3EA" stroke-width="2"/>
      ${marigoldDot}
      <g transform="translate(${width / 2}, ${height / 2})">
        <rect x="-80" y="-80" width="160" height="160" rx="32" fill="#E8ECFC" stroke="#2B46D1" stroke-width="2"/>
        <circle cx="0" cy="-10" r="30" fill="#2B46D1"/>
        <path d="M -40 50 C -40 20, 40 20, 40 50 Z" fill="#2B46D1"/>
        <text x="0" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#14203A" text-anchor="middle">
          ${safeTitle}
        </text>
        <text x="0" y="135" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#566074" text-anchor="middle">
          HirePerfect Editorial
        </text>
      </g>
    </svg>
  `);
}

async function optimizeDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const files = fs.readdirSync(dir);
  let processed = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const basename = path.basename(file, ext);
    const fullPath = path.join(dir, file);

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const webpPath = path.join(dir, `${basename}.webp`);
      const fileStat = fs.statSync(fullPath);

      // If webp does not exist or jpg is newer, generate optimized webp
      if (!fs.existsSync(webpPath) || fileStat.mtime > fs.statSync(webpPath).mtime) {
        console.log(`Optimizing: ${file} -> ${basename}.webp`);
        await sharp(fullPath)
          .webp({ quality: 85, effort: 4 })
          .toFile(webpPath);
        processed++;
      }
    } else if (ext === '.webp') {
      const jpgPath = path.join(dir, `${basename}.jpg`);
      if (!fs.existsSync(jpgPath)) {
        await sharp(fullPath)
          .jpeg({ quality: 85, progressive: true })
          .toFile(jpgPath);
      }
    }
  }

  return processed;
}

async function main() {
  console.log('--- HirePerfect Image Optimizer ---');

  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  if (!fs.existsSync(CATEGORIES_DIR)) fs.mkdirSync(CATEGORIES_DIR, { recursive: true });

  // 1. Ensure all 45 required images exist (create placeholders if missing)
  for (const [filename, w, h, bg, hasMarigold, title] of REQUIRED_HERO_AND_PAGE_IMAGES) {
    const targetPath = path.join(IMAGES_DIR, filename);
    if (!fs.existsSync(targetPath)) {
      const svg = await generateSvgPlaceholder(w, h, title, hasMarigold);
      if (filename.endsWith('.webp')) {
        await sharp(svg).webp({ quality: 85 }).toFile(targetPath);
      } else {
        await sharp(svg).jpeg({ quality: 85 }).toFile(targetPath);
      }
      console.log(`Created placeholder: ${filename}`);
    }
  }

  for (const slug of CATEGORY_SLUGS) {
    const jpgTarget = path.join(CATEGORIES_DIR, `${slug}.jpg`);
    const webpTarget = path.join(CATEGORIES_DIR, `${slug}.webp`);

    if (!fs.existsSync(jpgTarget) && !fs.existsSync(webpTarget)) {
      const title = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const svg = await generateSvgPlaceholder(1200, 900, title, true);
      await sharp(svg).jpeg({ quality: 85 }).toFile(jpgTarget);
      await sharp(svg).webp({ quality: 85 }).toFile(webpTarget);
      console.log(`Created category placeholder: ${slug}`);
    }
  }

  // 2. Run auto-optimization and conversion
  const p1 = await optimizeDirectory(IMAGES_DIR);
  const p2 = await optimizeDirectory(CATEGORIES_DIR);

  console.log(`✓ Image optimization complete. ${p1 + p2} files refreshed/converted.`);
}

main().catch((err) => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
