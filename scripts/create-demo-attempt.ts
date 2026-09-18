import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attempt from '../Backend/models/Attempt';
import AttemptReport from '../Backend/models/AttemptReport';
import AttemptAnswer from '../Backend/models/AttemptAnswer';
import Assessment from '../Backend/models/Assessment';
import User from '../Backend/models/User';
import Question from '../Backend/models/Question';
import Topic from '../Backend/models/Topic';
import { generateAndSaveReport } from '../src/server/reporting/reportService';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireperfect';

async function createDemoAttempt() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const assessment = await Assessment.findOne({ title: { $regex: /react/i } }) || await Assessment.findOne();
  if (!assessment) {
    console.error('No assessment found');
    process.exit(1);
  }

  const user = await User.findOne({ role: 'candidate' }) || await User.findOne();
  const questions = await Question.find({ assessment: assessment._id }).limit(30);

  // Create a realistic demo attempt
  const attempt = await Attempt.create({
    user: user?._id || new mongoose.Types.ObjectId(),
    assessment: assessment._id,
    selectedLevel: 'intermediate',
    status: 'completed',
    score: 24,
    percentage: 80,
    totalQuestions: questions.length || 30,
    correctAnswers: Math.min(24, questions.length),
    duration: 1800,
    startedAt: new Date(Date.now() - 25 * 60 * 1000),
    completedAt: new Date(Date.now() - 5 * 60 * 1000),
    timeSpent: 1200,
    violationCount: 1,
    questions: questions.map((q) => q._id),
  });

  console.log(`Demo attempt created with ID: ${attempt._id}`);

  // Create topic entries for this category if needed
  const topics = await Topic.find({ categoryId: assessment.category }).limit(4);

  // Generate detailed report
  const report = await generateAndSaveReport(attempt._id.toString(), {
    generatedBy: 'system',
    reviewerNotes: 'Strong frontend competency demonstrated. Candidate answered React Hooks and State Management questions accurately with fast pacing.',
  });

  console.log('Report successfully generated for demo attempt!');
  console.log(`URL: http://localhost:3000/results/${attempt._id}`);
  console.log(`Admin URL: http://localhost:3000/admin/attempts/${attempt._id}`);

  await mongoose.disconnect();
}

createDemoAttempt().catch(console.error);
