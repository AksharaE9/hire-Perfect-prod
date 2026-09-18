const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const CATEGORIES_DIR = path.join(IMAGES_DIR, 'categories');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
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

async function processImage(url, outBasePath, width, height, options = {}) {
  try {
    console.log(`Downloading: ${outBasePath}...`);
    const buffer = await downloadBuffer(url);
    
    let pipeline = sharp(buffer).resize(width, height, {
      fit: options.fit || 'cover',
      position: options.position || 'center',
    });

    if (options.brightness || options.contrast) {
      pipeline = pipeline.modulate({
        brightness: options.brightness || 1,
        saturation: options.saturation || 1,
      });
    }

    const webpPath = `${outBasePath}.webp`;
    const jpgPath = `${outBasePath}.jpg`;

    await pipeline.clone().webp({ quality: 88, effort: 4 }).toFile(webpPath);
    await pipeline.clone().jpeg({ quality: 90, mozjpeg: true }).toFile(jpgPath);

    console.log(`✓ Generated: ${path.basename(webpPath)} and ${path.basename(jpgPath)}`);
  } catch (err) {
    console.error(`✗ Error processing ${outBasePath}:`, err.message);
  }
}

const photoCatalog = [
  // 1. Hero candidate (Ananya R. - South Asian young professional taking assessment at desk/computer)
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483578295-6469cfc40912?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'hero-candidate'),
    w: 800,
    h: 600,
    options: { position: 'center' },
  },
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483578295-6469cfc40912?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'hero-webcam'),
    w: 800,
    h: 600,
    options: { position: 'center' },
  },
  {
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
    out: path.join(IMAGES_DIR, 'hero-bg'),
    w: 1600,
    h: 900,
  },

  // 2. Report Snapshots (Ananya facing forward at computer, looking away, refocused)
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483578295-6469cfc40912?fm=jpg&q=80&w=800&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'report-snap-1'),
    w: 600,
    h: 600,
    options: { position: 'center' },
  },
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483578295-6469cfc40912?fm=jpg&q=80&w=800&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'snap-front'),
    w: 600,
    h: 600,
    options: { position: 'center' },
  },
  // Look away (Ananya turned gaze)
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483561994-e91bc8ce5a23?fm=jpg&q=80&w=800&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'report-snap-2'),
    w: 600,
    h: 600,
    options: { position: 'center' },
  },
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483561994-e91bc8ce5a23?fm=jpg&q=80&w=800&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'snap-away'),
    w: 600,
    h: 600,
    options: { position: 'center' },
  },
  // Refocused
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483578295-6469cfc40912?fm=jpg&q=80&w=800&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'report-snap-3'),
    w: 600,
    h: 600,
    options: { position: 'center' },
  },
  {
    url: 'https://plus.unsplash.com/premium_photo-1681483578295-6469cfc40912?fm=jpg&q=80&w=800&auto=format&fit=crop',
    out: path.join(IMAGES_DIR, 'snap-back'),
    w: 600,
    h: 600,
    options: { position: 'center' },
  },

  // 3. Audiences (Hiring, Campus, Academy, Candidate)
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-hiring-tall'),
    w: 900,
    h: 1200,
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-hiring'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-campus-tall'),
    w: 900,
    h: 1200,
  },
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-campus'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-academy-tall'),
    w: 900,
    h: 1200,
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-academy'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-candidate-tall'),
    w: 900,
    h: 1200,
  },
  {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'who-candidate'),
    w: 800,
    h: 600,
  },

  // 4. Other key pages & sections
  {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'about-hero'),
    w: 1200,
    h: 800,
  },
  {
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'about-workspace'),
    w: 1200,
    h: 800,
  },
  {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'about-work'),
    w: 1200,
    h: 800,
  },
  {
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80',
    out: path.join(IMAGES_DIR, 'cta-hall'),
    w: 1600,
    h: 900,
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'integrity-hero'),
    w: 1200,
    h: 800,
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'integrity-check'),
    w: 1200,
    h: 800,
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'contact-side'),
    w: 1200,
    h: 900,
  },
  {
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'auth-login'),
    w: 1200,
    h: 900,
  },
  {
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'auth-signup'),
    w: 1200,
    h: 900,
  },
  {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    out: path.join(IMAGES_DIR, 'library-header'),
    w: 1200,
    h: 600,
  },

  // 5. All 20 Categories
  {
    url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'generative-ai-business-leaders'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'prompt-engineering-ai-automation'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'data-engineering-cloud-pipelines'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'advanced-excel-business-intelligence'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'product-management-ai-era'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'ui-ux-ai-products'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'cybersecurity-ethical-ai-security'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'growth-marketing-performance-strategy'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'financial-modeling-ai-tools'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'hr-analytics-people-strategy'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'supply-chain-logistics-analytics'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'ar-vr-spatial-computing'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'blockchain-web3-applications'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'ai-healthcare-biotech'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'sustainable-business-esg-strategy'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'no-code-low-code-app-development'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'digital-branding-creator-economy'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'ai-content-creation-media-production'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'startup-incubation-venture-building'),
    w: 800,
    h: 600,
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    out: path.join(CATEGORIES_DIR, 'emotional-intelligence-leaders'),
    w: 800,
    h: 600,
  },
];

async function main() {
  console.log(`Starting download and processing of ${photoCatalog.length} assets...`);
  for (const item of photoCatalog) {
    await processImage(item.url, item.out, item.w, item.h, item.options);
  }
  console.log('Finished updating all images!');
}

main();
