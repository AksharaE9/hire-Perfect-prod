# HirePerfect Scoring & Reporting Specification (v1.0)

> This document defines the exact mathematical, statistical, and operational rules used by the HirePerfect Scoring & Reporting Engine to produce immutable, verifiable assessment reports.

---

## Summary of Owner Decisions `[OWNER DECISION]`

| # | Decision Topic | Recommended Default | Alternatives Available | Config Key |
|---|---|---|---|---|
| **D1** | **Negative Marking** | **0 (No negative marking)** | -0.25, -0.33, -0.5 per incorrect MCQ | `negativeMarking` |
| **D2** | **Difficulty Weighting at Launch** | **Disabled (Flat 1 point/question)** | Enabled (Easy: 1.0, Medium: 1.25, Hard: 1.5) | `difficultyWeighting` |
| **D3** | **Default Passing Threshold** | **60%** | Configurable per assessment (e.g. 50%, 70%, 75%) | `passThresholdPercent` |
| **D4** | **Candidate Answer Disclosure** | **Show incorrect status & topic, conceal correct answer option** | Reveal full correct answer text / options | `revealCorrectAnswersToCandidate` |
| **D5** | **Topic Score Suppression Threshold** | **Minimum 4 questions per topic** | 3 or 5 questions | `minQuestionsPerTopic` |
| **D6** | **Cohort Percentile Minimum Sample** | **Minimum 30 completed attempts** | 20 or 50 completed attempts | `minCohortForPercentile` |
| **D7** | **Rushed Answer Speed Threshold** | **8 seconds per question** | 5s or 10s | `rushedAnswerSeconds` |

---

## 1.1 Scoring Configuration Object

Every assessment attempt is evaluated against a versioned, immutable configuration document. Configs are never modified in place; any update produces an incremented `version` and new `id`.

```ts
export interface ScoringConfig {
  id: string;
  version: number;                     // Increments on each change
  effectiveFrom: string;               // ISO 8601 timestamp
  marksPerCorrect: number;             // Default: 1.0
  negativeMarking: number;             // Default: 0.0 [OWNER DECISION D1]
  marksForUnanswered: number;          // Default: 0.0
  difficultyWeighting: boolean;        // Default: false [OWNER DECISION D2]
  difficultyWeights: {
    easy: number;                      // Default: 1.0
    medium: number;                    // Default: 1.25
    hard: number;                      // Default: 1.5
  };
  passThresholdPercent: number;        // Default: 60.0 [OWNER DECISION D3]
  revealCorrectAnswersToCandidate: boolean; // Default: false [OWNER DECISION D4]
  bands: ProficiencyBand[];            // See Section 1.4
  minQuestionsPerTopic: number;        // Default: 4 [OWNER DECISION D5]
  minCohortForPercentile: number;      // Default: 30 [OWNER DECISION D6]
  rushedAnswerSeconds: number;         // Default: 8 [OWNER DECISION D7]
  longDwellMultiplier: number;         // Default: 3.0 (3x median time)
  timePressureTailPercent: number;     // Default: 15 (last 15% of test)
  questionTimeoutSeconds: number;      // Default: 600 (10 minute clamp)
}

export interface ProficiencyBand {
  key: 'expert' | 'proficient' | 'developing' | 'foundational';
  label: string;
  minPercent: number;
  maxPercent: number;
  description: string;
}
```

---

## 1.2 Raw Score Calculation

For each question $i \in \{1, \dots, N\}$ assigned to the attempt:

$$\text{marks}_i = \begin{cases} 
\text{marksPerCorrect} \times \text{points}_i & \text{if candidate answer is correct} \\
-\text{negativeMarking} \times \text{points}_i & \text{if candidate answer is incorrect} \\
\text{marksForUnanswered} & \text{if question was reached but left unanswered} \\
0 & \text{if question was not reached (timeout / early exit)}
\end{cases}$$

$$\text{rawScore} = \sum_{i=1}^N \text{marks}_i$$
$$\text{maxScore} = \sum_{i=1}^N (\text{marksPerCorrect} \times \text{points}_i)$$
$$\text{percentage} = \operatorname{round}\left(\max\left(0, \frac{\text{rawScore}}{\text{maxScore}}\right) \times 100, 1\right)$$

- **Unanswered vs Not Reached:** Questions seen by the candidate but left blank are tallied as `unanswered`. Questions remaining after an unexpected disconnect, termination, or time expiry are tallied as `notReached`.

---

## 1.3 Difficulty-Weighted Scoring

When `difficultyWeighting = true` in the active config:
1. The engine checks whether **100% of questions** in the attempt contain valid `difficulty` tags (`easy`, `medium`, or `hard`).
2. If any question lacks a valid difficulty tag, difficulty weighting is safely skipped:
   $$\text{weightedPercentage} = \text{null}$$
   $$\text{weightingSkippedReason} = \text{"untagged\_questions"}$$
3. When valid:
   $$\text{weightedMarks}_i = \text{marks}_i \times \text{difficultyWeights}[\text{difficulty}_i]$$
   $$\text{weightedMax}_i = \text{points}_i \times \text{difficultyWeights}[\text{difficulty}_i]$$
   $$\text{weightedPercentage} = \operatorname{round}\left(\frac{\sum \text{weightedMarks}_i}{\sum \text{weightedMax}_i} \times 100, 1\right)$$

*Note: The flat `percentage` is always computed and presented as the primary benchmark. Weighted score is reported alongside as supplementary diagnostic depth.*

---

## 1.4 Proficiency Bands

Scores are mapped into four descriptive competency tiers. Bands are descriptive labels, not pass/fail verdicts:

| Band Key | Label | Score Range | Description Shown on Report |
|---|---|---|---|
| `expert` | Expert | 85.0% – 100.0% | Strong command across all assessment topics, consistently solving high-complexity problems. |
| `proficient` | Proficient | 70.0% – 84.9% | Solid working domain knowledge with minor gaps in specialized areas. |
| `developing` | Developing | 55.0% – 69.9% | Foundational grasp of core principles; several sub-skills require further study. |
| `foundational` | Foundational | 0.0% – 54.9% | Early-stage familiarity with introductory concepts in this discipline. |

---

## 1.5 Topic Breakdown & Statistical Suppression

Each question belongs to a topic. For each topic $T$:

$$\text{topicPercentage}_T = \operatorname{round}\left(\frac{\text{correct}_T}{\text{total}_T} \times 100, 1\right)$$

### Suppression Rules:
- **Low Confidence Suppression:** If $\text{total}_T < \text{minQuestionsPerTopic}$ (default 4), the percentage is suppressed (`percentage: null`), `lowConfidence: true` is set, and the card displays `"3 of 3 correct — Too few questions to provide a reliable percentage"`.
- **Derived Strengths:** A topic qualifies as a **Strength** if $\text{topicPercentage}_T \ge 80.0\%$ **and** $\text{total}_T \ge \text{minQuestionsPerTopic}$.
- **Derived Gaps:** A topic qualifies as a **Gap** if $\text{topicPercentage}_T \le 50.0\%$ **and** $\text{total}_T \ge \text{minQuestionsPerTopic}$.
- If no topics meet these thresholds, the report displays: *"No clear extreme strengths or gaps observed in this attempt."*

---

## 1.6 Timing & Behavioral Analysis

Calculated exclusively from server-derived question event timestamps:
- `medianSecondsPerQuestion`: $\operatorname{median}(\{t_1, t_2, \dots, t_N\})$
- `rushedCount`: Questions answered in $t_i < \text{rushedAnswerSeconds}$ (default 8s).
- `rushedIncorrectCount`: Questions that were both rushed and answered incorrectly.
- `longDwellCount`: Questions where $t_i \ge 3.0 \times \text{medianSecondsPerQuestion}$.
- `finalStretch`: For attempts with $\ge 20$ questions, compares accuracy on the first 85% versus the final 15% of questions. If accuracy drops by $>20\%$, a note is emitted: *"Accuracy declined in the final stretch, which often indicates time pressure."*
- `answerChanges`: Tracks total answer modifications, `changedToCorrect`, and `changedToIncorrect`.

---

## 1.7 Cohort Comparison & Percentile

Rolling cohort distributions are maintained per assessment (excluding test accounts and abandoned sessions).

- **Minimum Sample Rule:** Percentile is computed and rendered **only when** $\text{cohortCount} \ge \text{minCohortForPercentile}$ (default 30).
- **Suppression Display:** Below 30 attempts, the report renders: *"Not enough completed attempts yet to compare this score (6 attempts recorded)."*
- **Immutable Snapshot:** The cohort mean, median, standard deviation, and cut-points ($P_{25}, P_{50}, P_{75}, P_{90}$) are snapshotted into `attempt_reports` at generation time so historic reports never shift.

---

## 1.8 Integrity Signal (Strictly Separated from Skill Score)

Proctoring events are aggregated into three objective tiers:

| Tier | Condition | Reader-Facing Meaning |
|---|---|---|
| `clean` | 0 flags recorded | Verified attempt with zero proctoring flags logged. |
| `review` | 1–4 low/medium severity flags | Minor anomalies logged for human reviewer inspection. |
| `major` | $\ge 5$ flags or $\ge 1$ critical violation (e.g. repeated exit) | High-frequency anomalies requiring thorough recruiter review. |

### Non-Negotiable Principle:
> **The integrity tier never modifies the raw score, percentage, or proficiency band.** The skill score and proctoring record are presented side-by-side for human judgment.

---

## 1.9 Reliability & Limitations Statement

Every report concludes with an honest assessment of its evidentiary limits:
- Total questions evaluated and sample adequacy.
- Whether topic breakdowns were suppressed due to small question subsets.
- Whether cohort percentiles were available or withheld.
- Total active proctoring coverage percentage during the session.

---

## 1.10 Actionable Recommendations

Derived strictly from verified gap topics ($\text{topicPercentage}_T \le 50.0\%$ with $\ge 4$ questions). Focus areas are pulled from deterministic topic syllabus definitions in the question bank. **No LLM hallucinations or dynamic text generation are used at report generation time.**
