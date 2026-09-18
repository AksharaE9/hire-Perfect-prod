import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Attempt from '@/models/Attempt';
import AttemptAnswer from '@/models/AttemptAnswer';
import ScoringConfig, { DEFAULT_SCORING_CONFIG_VALUES } from '@/models/ScoringConfig';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attemptId } = await params;
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.authorized || !authResult.user) {
      return authResult.response!;
    }

    await connectDB();

    const body = await request.json();
    const { questionId, positionShown, selectedOption, wasFlaggedForReview } = body;

    if (!questionId || positionShown === undefined) {
      return NextResponse.json(
        { error: 'questionId and positionShown are required' },
        { status: 400 }
      );
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const userId = attempt.user._id ? attempt.user._id.toString() : attempt.user.toString();
    if (userId !== authResult.user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Cannot record answer for completed or terminated attempt' },
        { status: 400 }
      );
    }

    // Retrieve active scoring config for timeout clamp
    const activeConfig = await ScoringConfig.findOne().sort({ version: -1 }) || DEFAULT_SCORING_CONFIG_VALUES;
    const timeoutClamp = activeConfig.questionTimeoutSeconds || 600;

    const now = new Date();
    let existingAnswer = await AttemptAnswer.findOne({ attempt: attemptId, question: questionId });

    if (existingAnswer) {
      // Answer change
      const previousOption = existingAnswer.selectedOption;
      const lastAnswered = existingAnswer.answeredAt || existingAnswer.firstSeenAt;
      const elapsed = Math.floor((now.getTime() - lastAnswered.getTime()) / 1000);
      const isUnreliable = elapsed > timeoutClamp;
      const clampedElapsed = Math.min(elapsed, timeoutClamp);

      if (previousOption !== selectedOption) {
        existingAnswer.changeCount += 1;
        existingAnswer.previousOptions.push({
          option: previousOption,
          timestamp: lastAnswered,
        });
      }

      existingAnswer.selectedOption = selectedOption;
      existingAnswer.answeredAt = now;
      existingAnswer.secondsSpent += clampedElapsed;
      if (isUnreliable) {
        existingAnswer.timingUnreliable = true;
      }
      if (wasFlaggedForReview !== undefined) {
        existingAnswer.wasFlaggedForReview = Boolean(wasFlaggedForReview);
      }

      await existingAnswer.save();

      return NextResponse.json({
        success: true,
        answerId: existingAnswer._id,
        secondsSpent: existingAnswer.secondsSpent,
        changeCount: existingAnswer.changeCount,
      });
    }

    // First time answering this question
    const timeSinceStart = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);
    const initialElapsed = Math.min(timeSinceStart, timeoutClamp);
    const isUnreliable = timeSinceStart > timeoutClamp;

    const newAnswer = await AttemptAnswer.create({
      attempt: attemptId,
      question: questionId,
      positionShown: Number(positionShown),
      selectedOption,
      firstSeenAt: now,
      answeredAt: now,
      secondsSpent: initialElapsed,
      timingUnreliable: isUnreliable,
      changeCount: 0,
      previousOptions: [],
      wasReached: true,
      wasFlaggedForReview: Boolean(wasFlaggedForReview),
    });

    return NextResponse.json({
      success: true,
      answerId: newAnswer._id,
      secondsSpent: newAnswer.secondsSpent,
      changeCount: 0,
    });
  } catch (error: any) {
    console.error('Record answer error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
