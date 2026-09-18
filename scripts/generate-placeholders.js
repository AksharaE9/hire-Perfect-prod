const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'images');
const catDir = path.join(outDir, 'categories');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function createSvgToWebp(svgContent, filePath, width, height) {
  const buffer = Buffer.from(svgContent);
  await sharp(buffer)
    .resize(width, height)
    .webp({ quality: 85 })
    .toFile(filePath);
}

// 1. Photographic assets
const photos = [
  {
    name: 'hero-candidate.webp',
    width: 1200,
    height: 900,
    title: 'Candidate Verification',
    sub: 'GuardEye AI Active',
    accentColor: '#2B46D1',
  },
  {
    name: 'report-snap-1.webp',
    width: 320,
    height: 320,
    title: 'Candidate Front',
    sub: '00:05 · In position',
    accentColor: '#1E8458',
  },
  {
    name: 'report-snap-2.webp',
    width: 320,
    height: 320,
    title: 'Gaze Deviation',
    sub: '11:48 · Flagged',
    accentColor: '#B7790F',
  },
  {
    name: 'report-snap-3.webp',
    width: 320,
    height: 320,
    title: 'Candidate Refocused',
    sub: '11:53 · Normal',
    accentColor: '#1E8458',
  },
  {
    name: 'who-hiring.webp',
    width: 1200,
    height: 800,
    title: 'Hiring Teams & Recruiters',
    sub: 'Evaluate verified skills before interview rounds',
    accentColor: '#2B46D1',
  },
  {
    name: 'who-campus.webp',
    width: 1200,
    height: 800,
    title: 'Colleges & Campus Drives',
    sub: 'Administer proctored remote tests for large batches',
    accentColor: '#2B46D1',
  },
  {
    name: 'who-academy.webp',
    width: 1200,
    height: 800,
    title: 'Training Academies',
    sub: 'Certify learners with tamper-evident completion reports',
    accentColor: '#2B46D1',
  },
  {
    name: 'who-candidate.webp',
    width: 1200,
    height: 800,
    title: 'Independent Candidates',
    sub: 'Prove domain expertise with verifiable credentials',
    accentColor: '#2B46D1',
  },
  {
    name: 'integrity-check.webp',
    width: 1400,
    height: 875,
    title: 'Pre-Exam System Verification',
    sub: 'Webcam calibration & browser diagnostics',
    accentColor: '#2B46D1',
  },
  {
    name: 'about-workspace.webp',
    width: 1600,
    height: 900,
    title: 'Trustworthy Assessment Delivery',
    sub: 'HirePerfect Infrastructure',
    accentColor: '#2B46D1',
  },
  {
    name: 'auth-login.webp',
    width: 1000,
    height: 1250,
    title: 'Assessment Portal Access',
    sub: 'Proctored & Reviewable Attempts',
    accentColor: '#2B46D1',
  },
  {
    name: 'auth-signup.webp',
    width: 1000,
    height: 1250,
    title: 'Create Your Profile',
    sub: 'Verified Credentials Authority',
    accentColor: '#2B46D1',
  },
  {
    name: 'empty-state.webp',
    width: 600,
    height: 600,
    title: 'No Records Found',
    sub: 'Try refining your search',
    accentColor: '#566074',
  },
];

// 2. Categories
const categories = [
  { slug: 'generative-ai-business-leaders', title: 'Generative AI for Leaders', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { slug: 'prompt-engineering-ai-automation', title: 'Prompt Engineering & Automation', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { slug: 'data-engineering-cloud-pipelines', title: 'Data Engineering & Cloud Pipelines', icon: 'M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4' },
  { slug: 'ui-ux-ai-products', title: 'UI & UX for AI Products', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { slug: 'product-management-ai-era', title: 'Product Management in AI Era', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { slug: 'blockchain-web3-applications', title: 'Blockchain & Web3 Applications', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { slug: 'cybersecurity-ethical-ai-security', title: 'Cybersecurity & Ethical AI', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { slug: 'digital-branding-creator-economy', title: 'Digital Branding & Creator Economy', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' },
  { slug: 'financial-modeling-ai-tools', title: 'Financial Modeling & AI Tools', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { slug: 'sustainable-business-esg-strategy', title: 'Sustainable Business & ESG', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { slug: 'growth-marketing-performance-strategy', title: 'Growth Marketing & Strategy', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { slug: 'no-code-low-code-app-development', title: 'No-Code & Low-Code Dev', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { slug: 'advanced-excel-business-intelligence', title: 'Advanced Excel & Business BI', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
  { slug: 'ar-vr-spatial-computing', title: 'AR/VR & Spatial Computing', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { slug: 'hr-analytics-people-strategy', title: 'HR Analytics & People Strategy', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { slug: 'startup-incubation-venture-building', title: 'Startup Incubation & Ventures', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { slug: 'ai-healthcare-biotech', title: 'AI in Healthcare & Biotech', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { slug: 'supply-chain-logistics-analytics', title: 'Supply Chain & Logistics', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { slug: 'emotional-intelligence-leaders', title: 'Emotional Intelligence Leaders', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { slug: 'ai-content-creation-media-production', title: 'AI Content & Media Production', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

async function generateAll() {
  console.log('Generating photographic webp assets...');
  for (const p of photos) {
    const filePath = path.join(outDir, p.name);
    const svg = `
      <svg width="${p.width}" height="${p.height}" viewBox="0 0 ${p.width} ${p.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${p.width}" height="${p.height}" fill="#F5F7F6"/>
        <rect x="20" y="20" width="${p.width - 40}" height="${p.height - 40}" rx="24" fill="#FFFFFF" stroke="#DDE3EA" stroke-width="2"/>
        <circle cx="${p.width / 2}" cy="${p.height / 2 - 30}" r="48" fill="#E8ECFC"/>
        <circle cx="${p.width / 2}" cy="${p.height / 2 - 30}" r="24" fill="${p.accentColor}"/>
        <text x="${p.width / 2}" y="${p.height / 2 + 50}" font-family="sans-serif" font-size="24" font-weight="bold" fill="#14203A" text-anchor="middle">${escapeXml(p.title)}</text>
        <text x="${p.width / 2}" y="${p.height / 2 + 85}" font-family="sans-serif" font-size="14" fill="#566074" text-anchor="middle">${escapeXml(p.sub)}</text>
      </svg>
    `;
    await createSvgToWebp(svg, filePath, p.width, p.height);
  }

  console.log('Generating 20 category webp vector illustrations...');
  for (const c of categories) {
    const filePath = path.join(catDir, `${c.slug}.webp`);
    const svg = `
      <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#F5F7F6"/>
        <rect x="24" y="24" width="752" height="552" rx="20" fill="#FFFFFF" stroke="#DDE3EA" stroke-width="2"/>
        <circle cx="400" cy="250" r="80" fill="#E8ECFC"/>
        <circle cx="460" cy="220" r="16" fill="#D9476B"/>
        <g transform="translate(364, 214) scale(3)" fill="none" stroke="#2B46D1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="${c.icon}"/>
        </g>
        <text x="400" y="390" font-family="sans-serif" font-size="22" font-weight="bold" fill="#14203A" text-anchor="middle">${escapeXml(c.title)}</text>
        <text x="400" y="425" font-family="sans-serif" font-size="14" fill="#566074" text-anchor="middle">12 Proctored Assessments · GuardEye AI</text>
      </svg>
    `;
    await createSvgToWebp(svg, filePath, 800, 600);
  }

  console.log('All image assets generated successfully.');
}

generateAll().catch(console.error);
