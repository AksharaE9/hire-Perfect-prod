import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attempt from '../Backend/models/Attempt';
import { generateAndSaveReport } from '../src/server/reporting/reportService';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireperfect';

async function backfill() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for report backfill');

  const attempts = await Attempt.find({ status: { $in: ['completed', 'terminated'] } });
  console.log(`Found ${attempts.length} historical attempts to backfill.`);

  let succeeded = 0;
  let failed = 0;

  for (const att of attempts) {
    try {
      await generateAndSaveReport(att._id.toString(), {
        generatedBy: 'backfill',
      });
      succeeded++;
      console.log(`✓ Backfilled report for attempt ${att._id}`);
    } catch (err: any) {
      failed++;
      console.error(`✗ Failed for attempt ${att._id}:`, err.message);
    }
  }

  console.log(`\nBackfill complete: ${succeeded} succeeded, ${failed} failed.`);
  await mongoose.disconnect();
}

backfill().catch(console.error);
