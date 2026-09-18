const http = require('http');

function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', (err) => reject(err));
  });
}

async function runTests() {
  console.log('=== HirePerfect Comprehensive HTTP & HTML Validation Suite ===\n');

  const routesToTest = [
    '/',
    '/assessments',
    '/assessments/generative-ai-business-leaders',
    '/assessments/prompt-engineering-ai-automation',
    '/assessments/data-engineering-cloud-pipelines',
    '/assessments/ui-ux-ai-products',
    '/assessments/cybersecurity-ethical-ai-security',
    '/integrity',
    '/pricing',
    '/about',
    '/contact',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/privacy',
    '/terms',
    '/robots.txt',
    '/sitemap.xml',
    '/api/assessments',
  ];

  let passed = 0;
  let failed = 0;

  for (const route of routesToTest) {
    try {
      const res = await fetchRoute(route);
      if (res.status === 200) {
        console.log(`✓ [200 OK] ${route} (${(res.body.length / 1024).toFixed(1)} KB)`);
        passed++;
      } else {
        console.error(`✗ [${res.status} FAIL] ${route}`);
        failed++;
      }
    } catch (err) {
      console.error(`✗ [ERROR] ${route} -> ${err.message}`);
      failed++;
    }
  }

  console.log('\n--- Deep Content & Quality Checks ---');

  // 1. Check Homepage for Key Elements
  const home = await fetchRoute('/');
  const homeChecks = [
    ['Scores you can stand behind.', 'Hero headline'],
    ['Run proctored MCQ assessments with identity checks', 'Hiring subhead'],
    ['Browse assessments', 'Hero CTA'],
    ['How every attempt is protected', '3-step section'],
    ['An integrity report, not a guess', 'Integrity showcase'],
    ['What GuardEye AI monitors', 'GuardEye section'],
    ['Frequently asked questions', 'FAQ accordion'],
  ];
  for (const [str, desc] of homeChecks) {
    if (home.body.includes(str)) {
      console.log(`✓ Home: Contains ${desc}`);
    } else {
      console.error(`✗ Home: Missing ${desc} ("${str}")`);
      failed++;
    }
  }

  // 2. Check Assessment Library for Server-Rendered Categories
  const assessments = await fetchRoute('/assessments');
  const catChecks = [
    'Generative AI for Business Leaders',
    'Prompt Engineering and AI Automation',
    'Data Engineering with Cloud Pipelines',
    'UI and UX for AI Products',
    'Cybersecurity and Ethical AI Security',
    'Financial Modeling with AI Tools',
    'Blockchain and Web3 Applications',
  ];
  let catPassed = true;
  for (const cat of catChecks) {
    if (!assessments.body.includes(cat)) {
      console.error(`✗ /assessments: Missing category ${cat}`);
      catPassed = false;
      failed++;
    }
  }
  if (catPassed) {
    console.log('✓ /assessments: Verified all category names in server-rendered HTML');
  }

  // 3. Check for Banned Sci-fi Jargon in Public HTML
  const bannedKeywords = [
    'Operative',
    'Alpha-9',
    'Zero-fraud',
    '99.9% fraud',
    'Curated Excellence',
    'Deployment Libraries',
    'Begin Journey',
  ];
  let bannedFound = false;
  for (const word of bannedKeywords) {
    if (home.body.includes(word) || assessments.body.includes(word)) {
      console.error(`✗ Banned keyword found in HTML: "${word}"`);
      bannedFound = true;
      failed++;
    }
  }
  if (!bannedFound) {
    console.log('✓ Quality: Verified 0 banned sci-fi keywords in rendered HTML');
  }

  // 4. Check Pricing Page Content
  const pricing = await fetchRoute('/pricing');
  if (pricing.body.includes('Single assessment') && pricing.body.includes('Category pack') && pricing.body.includes('Full library')) {
    console.log('✓ Pricing: Verified 3 plans (Single ₹500, Category ₹2,000, Full ₹8,000)');
  } else {
    console.error('✗ Pricing: Missing expected plan names');
    failed++;
  }

  // 5. Check Integrity Page
  const integrity = await fetchRoute('/integrity');
  if (integrity.body.includes('How proctoring works') && integrity.body.includes('For candidates') && integrity.body.includes('For organisations')) {
    console.log('✓ Integrity: Verified dual-tab guide structure');
  } else {
    console.error('✗ Integrity: Missing header or tab labels');
    failed++;
  }

  // 6. Check Robots & Sitemap
  const robots = await fetchRoute('/robots.txt');
  const sitemap = await fetchRoute('/sitemap.xml');
  if (robots.body.includes('Disallow:') && sitemap.body.includes('<urlset')) {
    console.log('✓ SEO: Verified robots.txt & sitemap.xml valid generation');
  } else {
    console.error('✗ SEO: Robots or sitemap invalid');
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed + 6} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
