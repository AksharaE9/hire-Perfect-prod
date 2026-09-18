const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireperfect';

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  const questionsCount = await db.collection('questions').countDocuments();
  const attemptsCount = await db.collection('attempts').countDocuments();
  const assessmentsCount = await db.collection('assessments').countDocuments();
  const violationsCount = await db.collection('violations').countDocuments();
  const usersCount = await db.collection('users').countDocuments();

  console.log({ questionsCount, attemptsCount, assessmentsCount, violationsCount, usersCount });

  const sampleQuestion = await db.collection('questions').findOne();
  console.log('Sample question:', JSON.stringify(sampleQuestion, null, 2));

  const sampleAttempt = await db.collection('attempts').findOne();
  console.log('Sample attempt:', JSON.stringify(sampleAttempt, null, 2));

  const sampleViolation = await db.collection('violations').findOne();
  console.log('Sample violation:', JSON.stringify(sampleViolation, null, 2));

  // Check tags / difficulty distribution
  const taggedCount = await db.collection('questions').countDocuments({ tags: { $exists: true, $ne: [] } });
  const difficultySample = await db.collection('questions').aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]).toArray();
  console.log({ taggedCount, totalQuestions: questionsCount, difficultySample });

  // Completed attempts per assessment
  const attemptsByAssessment = await db.collection('attempts').aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$assessment', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Completed attempts by assessment:', attemptsByAssessment);

  // Check questions count per assessment
  const questionsByAssessment = await db.collection('questions').aggregate([
    { $group: { _id: '$assessment', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Questions by assessment sample (first 5):', questionsByAssessment.slice(0, 5));

  await mongoose.disconnect();
}

check().catch(console.error);
