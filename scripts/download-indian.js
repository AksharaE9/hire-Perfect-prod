const https = require('https');
const fs = require('fs');
const path = require('path');

const candidates = [
  'photo-1622979135225-d2ba269bc1df',
  'photo-1600880292203-757bb62b4baf',
  'photo-1593642532400-2682810df593',
  'photo-1628258334105-2a0b3d6efee1',
  'photo-1607990281513-2c110aef5ba8', // Indian student studying
  'photo-1534528741775-53994a69daeb',
  'photo-1522071820081-009f0129c71c',
  'photo-1531482615713-2afd69097998',
  'photo-1517245386807-bb43f82c33c4',
  'photo-1590650153855-d9e808231d41',
  'photo-1573497019418-b400bb3ab074',
  'photo-1618005182384-a83a8bd57fbe'
];

const outDir = path.join(__dirname, 'indian_candidates');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('Status: ' + res.statusCode));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        fs.writeFileSync(dest, Buffer.concat(chunks));
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (let i = 0; i < candidates.length; i++) {
    const id = candidates[i];
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
    const dest = path.join(outDir, `ind_${i}_${id}.jpg`);
    try {
      await download(url, dest);
      console.log(`[${i}] Downloaded ${id}`);
    } catch(e) {
      console.log(`[${i}] Failed ${id}: ${e.message}`);
    }
  }
}

run();
