const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const CATEGORIES_DIR = path.join(__dirname, '..', 'public', 'images', 'categories');
if (!fs.existsSync(CATEGORIES_DIR)) fs.mkdirSync(CATEGORIES_DIR, { recursive: true });

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status code: ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function processCategory(slug, url) {
  try {
    console.log(`Processing category: ${slug}...`);
    const buffer = await downloadBuffer(url);

    const webpPath = path.join(CATEGORIES_DIR, `${slug}.webp`);
    const jpgPath = path.join(CATEGORIES_DIR, `${slug}.jpg`);

    await sharp(buffer)
      .resize(800, 600, { fit: 'cover', position: 'center' })
      .webp({ quality: 88, effort: 4 })
      .toFile(webpPath);

    await sharp(buffer)
      .resize(800, 600, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(jpgPath);

    console.log(`✓ Updated: ${slug}`);
  } catch (err) {
    console.error(`✗ Error processing ${slug}:`, err.message);
  }
}

const categories = [
  {
    slug: 'generative-ai-business-leaders',
    url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'prompt-engineering-ai-automation',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'data-engineering-cloud-pipelines',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'advanced-excel-business-intelligence',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'product-management-ai-era',
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'ui-ux-ai-products',
    url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'cybersecurity-ethical-ai-security',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'growth-marketing-performance-strategy',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'financial-modeling-ai-tools',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'hr-analytics-people-strategy',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'supply-chain-logistics-analytics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'ar-vr-spatial-computing',
    url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'blockchain-web3-applications',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'ai-healthcare-biotech',
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'sustainable-business-esg-strategy',
    url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'no-code-low-code-app-development',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'digital-branding-creator-economy',
    url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'ai-content-creation-media-production',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'startup-incubation-venture-building',
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'emotional-intelligence-leaders',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  },
];

async function main() {
  console.log(`Starting real photography update for ${categories.length} assessment categories...`);
  for (const item of categories) {
    await processCategory(item.slug, item.url);
  }
  console.log('All assessment category photos updated successfully!');
}

main();
