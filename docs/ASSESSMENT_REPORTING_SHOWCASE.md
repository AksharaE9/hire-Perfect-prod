# HirePerfect — Assessment Reporting System Showcase & Verification

## Executive Overview

The **HirePerfect Detailed Assessment Reporting Architecture** delivers a defensible, multi-dimensional diagnostic report following every completed assessment. The platform strictly decouples subject-matter competency from AI proctoring signals, enforces statistical suppression rules to eliminate noisy data, and maintains immutable, versioned report records.

---

## 1. Candidate View (`/results/[attemptId]`)

Below is the candidate report rendered for desktop (1440px) and mobile (390px) viewports:

### Desktop Experience (1440px)
![Candidate Report Desktop](file:///C:/Users/ASUS/.gemini/antigravity-ide/brain/e6a11e9a-b4d6-4a44-9fd2-6bb3fb8b0779/candidate_full_report.png)

### Mobile Responsive Experience (390px)
![Candidate Report Mobile](file:///C:/Users/ASUS/.gemini/antigravity-ide/brain/e6a11e9a-b4d6-4a44-9fd2-6bb3fb8b0779/candidate_report_mobile.png)

---

### What the Candidate Sees & What It Is Based On

| Section | Displayed Content | Underlying Data & Calculation |
|---|---|---|
| **1. Header & Outcome** | Assessment title, category, candidate name, date, time spent, large raw score (`50 / 50`), percentage (`100%`), and **Proficiency Band** (`Expert`). | $\text{Raw Score} = \sum \text{marksAwarded}$<br>$\text{Percentage} = \text{round}\left(\frac{\text{Raw Score}}{\text{Max Score}} \times 100, 1\right)$<br>Bands: **Expert** (85–100%), **Proficient** (70–84%), **Developing** (55–69%), **Foundational** (0–54%). |
| **2. Methodology Panel** | Open-by-default transparent breakdown showing **Marks per Correct (+1 pt)**, **Negative Marking (None / 0 pt)**, **Passing Threshold (60%)**, and **Difficulty Weighting (Flat marks)**. | Stored in versioned `ScoringConfig`. Explains that unanswered questions score 0 marks, and proctoring signals never alter the skill percentage. |
| **3. Topic Mastery Breakdown** | Sub-skill progress bars with raw ratios (e.g., *"1 of 1 correct"*) and low-confidence suppression tags. | **Minimum-Sample Rule:** Sub-skills with $<4$ questions have their percentage suppressed (`null`) and render a muted badge with: *"Too few questions (1 of 4 required) to provide a reliable percentage score."* |
| **4. Question Pace & Accuracy Strip** | Visual interactive bar strip representing every question (Q1–Q50) colored by result (Green = Correct, Red = Incorrect, Slate = Skipped), plus median duration. | Derived strictly from server timestamps: measures `medianSecondsPerQuestion`, detects rushed answers ($<8$s), and identifies answer revision patterns. |
| **5. Cohort Benchmark** | Percentile rank benchmark relative to historical verified attempts on the same assessment. | **Minimum-Cohort Gate:** Suppressed when completed attempts $<30$. Displays actual count: *"Not enough completed attempts yet to compare this score (6 attempts recorded; 30 required)."* |
| **6. GuardEye AI Integrity Record** | Objective verification status (**Clean**, **Needs Review**, or **Major Issues**) with proctoring coverage duration. | Independent monitoring heuristcs: monitors webcam, tab switches, and secondary devices without ever deducting marks from the test score. |
| **7. Evidentiary Limits & Caveats** | Honest statement on assessment limits, question count, and why statistical gates were applied. | Dynamically generated from attempt completeness and sample size parameters. |
| **8. Actions** | **Print Report** and **View Certificate** buttons. | Generates printable PDF summary or authenticated verification badge. |

---

## 2. Admin / Recruiter View (`/admin/attempts/[attemptId]`)

Below is the administrator diagnostic review screen featuring the sortable, filterable question audit table and recruiter verification tools:

![Admin Diagnostic Audit](file:///C:/Users/ASUS/.gemini/antigravity-ide/brain/e6a11e9a-b4d6-4a44-9fd2-6bb3fb8b0779/admin_full_table.png)

---

### What the Admin Sees & Additional Recruiter Features

| Feature | Admin Functionality | Difference from Candidate View |
|---|---|---|
| **Item-Level Question Table** | Displays every question with prompt, topic name, difficulty level, candidate's selected choice, **unmasked verified correct answer**, result badge, seconds spent, and revision count. | **Candidate:** Correct answers are hidden (`revealCorrectAnswersToCandidate: false`) to protect question bank security.<br>**Admin:** Full answers, timestamps, and revision counts are fully visible. |
| **Interactive Filters & Sorting** | Filter questions by **Topic**, by **Incorrect Only**, by **Rushed (<8s)**, by **Unanswered**, or sort by position / duration. | Allows recruiters to quickly audit specific weaknesses, test speed, and guessing patterns. |
| **Recruiter Assessment Notes** | Textarea for internal hiring notes with a persistent **"Save Notes"** action. | Stored directly in MongoDB `attempt_reports.reviewerNotes` and accessible across the hiring team. |
| **"Mark as Reviewed" Action** | One-click review verification. | Records reviewer user ID and timestamp in `attempt_reports.reviewedAt` and writes an entry to `audit_logs`. |
| **Immutable Version Controls** | **Recompute (v2)** button to regenerate reports against updated scoring engine configs. | Old report is marked `isCurrent: false` and referenced in `supersededBy`. History is never silently overwritten. |
| **Multi-Candidate Compare** | Navigation to side-by-side diagnostic comparison across 2–5 candidates. | Allows recruiters to compare topic mastery, pacing, and integrity side-by-side for hiring decisions. |

---

## 3. Core Architectural Principles Enforced

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HIREPERFECT SCORING ENGINE                      │
├───────────────────────────────────┬────────────────────────────────────┤
│         SKILL SCORE TRACK         │        INTEGRITY RECORD TRACK      │
│  • Pure Multiple-Choice Accuracy  │  • GuardEye AI Proctoring Signals  │
│  • Sub-Skill Topic Mastery        │  • Webcam & Browser Monitoring     │
│  • Response Timing & Revisions    │  • Anomaly Duration & Severity     │
│  • Proficiency Band (0–100%)      │  • Objective Classification Tier   │
└───────────────────────────────────┴────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │  PRINCIPLE 1: ZERO SCORE MERGING                       │
        │  Integrity flags NEVER lower or adjust skill score.    │
        │  Recruiters evaluate competency and signals separately.│
        └────────────────────────────────────────────────────────┘
```

1. **The Skill Score and Integrity Signal are Never Merged:** GuardEye proctoring flags are objective observational signals for human reviewers. A flag never lowers a candidate's score.
2. **Strict Statistical Suppression:** No score is reported without adequate sample size:
   - Sub-topic score requires $\ge 4$ questions (otherwise percentage is suppressed).
   - Cohort percentile comparison requires $\ge 30$ completed attempts.
3. **Deterministic & Pure Engine:** Identical inputs and scoring configs produce byte-identical JSON outputs.
4. **Immutable Published Reports:** Generated reports are versioned documents. Recomputations create version `v2` without modifying historical evidence.

---

## 4. Verification & Performance Summary

- **Pure Calculator Unit Tests:** **12 / 12 Passed** (`scripts/test-reporting-engine.ts`).
- **CPU Generation Latency:** **$p50 = 0.021\text{ ms}$**, **$p95 = 0.062\text{ ms}$** (target $<500\text{ ms}$).
- **TypeScript Type Check:** `npx tsc --noEmit` passed with **0 errors**.
