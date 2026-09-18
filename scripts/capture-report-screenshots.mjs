import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const ATTEMPT_ID = '6aaa5d7e3627ef63529b552c'; // Full 30-question historical attempt
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\e6a11e9a-b4d6-4a44-9fd2-6bb3fb8b0779';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-hireperfect-2024';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log('Generating auth token...');
  const token = jwt.sign(
    { userId: '6aaa5cd43627ef63529b510f', email: 'admin@hireperfect.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '3d' }
  );

  const userPayload = {
    userId: '6aaa5cd43627ef63529b510f',
    name: 'Alex Candidate',
    email: 'admin@hireperfect.com',
    role: 'admin',
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,1200'],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(
    ({ tok, usr }) => {
      localStorage.setItem('token', tok);
      localStorage.setItem('user', JSON.stringify(usr));
      localStorage.setItem('loginAt', Date.now().toString());
    },
    { tok: token, usr: userPayload }
  );

  // 1. Candidate Full Report (Desktop 1440px)
  console.log('Capturing Full 30-Q Candidate Report (Desktop 1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/results/${ATTEMPT_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(4000);

  const desktopPath = path.join(ARTIFACTS_DIR, 'candidate_full_report.png');
  await page.screenshot({ path: desktopPath, fullPage: true });
  console.log(`Saved: ${desktopPath}`);

  // 2. Admin Diagnostic Full Audit Table (Desktop 1440px)
  console.log('Capturing Admin Diagnostic Audit Table with 30 Questions...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/admin/attempts/${ATTEMPT_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3500);

  const adminPath = path.join(ARTIFACTS_DIR, 'admin_full_table.png');
  await page.screenshot({ path: adminPath, fullPage: true });
  console.log(`Saved: ${adminPath}`);

  await browser.close();
  console.log('Full reports captured successfully!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
