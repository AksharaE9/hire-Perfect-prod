import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Topic from '../Backend/models/Topic.ts';
import ScoringConfig, { DEFAULT_SCORING_CONFIG_VALUES } from '../Backend/models/ScoringConfig.ts';
import { CATEGORIES } from '../Backend/lib/constants.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireperfect';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function sync() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Ensure Default Scoring Config exists
  const existingConfig = await ScoringConfig.findOne({ version: 1 });
  if (!existingConfig) {
    await ScoringConfig.create(DEFAULT_SCORING_CONFIG_VALUES);
    console.log('✓ Initialized default ScoringConfig v1');
  } else {
    console.log('✓ ScoringConfig v1 already active');
  }

  // 2. Sync Topics for all 20 categories
  let totalTopics = 0;
  for (const cat of CATEGORIES) {
    const subjects = cat.subjects || [];
    for (let i = 0; i < subjects.length; i++) {
      const topicName = subjects[i];
      const topicSlug = slugify(topicName);
      
      const focusAreas = [
        `Core principles and operational workflows in ${topicName}`,
        `Practical application and evaluation techniques for ${topicName}`,
        `Risk mitigation and performance optimization within ${topicName}`,
      ];

      await Topic.findOneAndUpdate(
        { categorySlug: cat.slug, slug: topicSlug },
        {
          categorySlug: cat.slug,
          name: topicName,
          slug: topicSlug,
          displayOrder: i + 1,
          focusAreas,
        },
        { upsert: true, new: true }
      );
      totalTopics++;
    }
  }

  console.log(`✓ Synced ${totalTopics} topics across ${CATEGORIES.length} categories.`);
  await mongoose.disconnect();
}

sync().catch(console.error);
