# HirePerfect — Website Rework Notes & Phase 0 Reconnaissance

This document tracks findings from the Phase 0 audit, the feature truth table, architectural decisions, and items needing owner approval.

---

## Phase 0 — Reconnaissance & Gate Findings

### Gate A — Feature Truth Table

| Feature | Claimed Where | Exists in Code? (File Path) | Status | Notes for Copy & UI |
|---|---|---|---|---|
| **Face Detection** | Home, Features, Proctoring | `app/exam/[attemptId]/page.tsx` | **Live** | MediaPipe FaceLandmarker tracks faces in real-time. |
| **Gaze & Head Tracking** | Home, Features | `app/exam/[attemptId]/page.tsx` | **Live** | Tracks `looking_away` and `gaze_deviation`. |
| **Multiple-Face Detection** | Home, Features | `app/exam/[attemptId]/page.tsx` | **Live** | Flags when `aiLastFaceCount > 1`. |
| **No-Face Detection** | Home, Features | `app/exam/[attemptId]/page.tsx` | **Live** | Flags when `aiLastFaceCount === 0`. |
| **Full-Screen Enforcement** | Home, Features | `app/exam/[attemptId]/page.tsx` | **Live** | Enforces fullscreen; flags on exit. |
| **Tab-Switch & Window Blur Detection** | Home, Features | `app/exam/[attemptId]/page.tsx` | **Live** | Listens to `visibilitychange` and `window.blur`. |
| **Copy / Paste / Cut Prevention & Logging** | Features | `app/exam/[attemptId]/page.tsx` | **Live** | Event listeners log copy/paste attempts. |
| **Developer Tools Detection** | Features | `app/exam/[attemptId]/page.tsx` | **Live** | Detects window resize/debugger heuristics. |
| **Audio / Talking Detection** | Features, Privacy | `app/privacy/page.tsx`, `Backend/lib/constants.ts` | **Roadmap / Inactive** | Constants define `AUDIO_LEVEL_THRESHOLD`, but exam stream has `audio: false`. Placed under Roadmap. |
| **Webcam Snapshots Stored at Intervals** | Pricing, Features | `app/results/[attemptId]/page.tsx` | **Roadmap** | Vision runs purely client-side; no image uploads are stored in MongoDB. |
| **Screen Recording** | Marketing | None | **Not Built** | Omitted from copy. |
| **Pre-Exam System Check** | Pre-exam | `app/exam/pre/[id]/page.tsx` | **Live (Camera & Browser)** | Live camera preview and agreement check before starting. |
| **ID / Photo Verification** | Marketing | None | **Roadmap** | Pre-exam tests camera stream, but does not perform photo ID scan. |
| **Violation Limit & Auto-Submit** | Exam | `Backend/lib/constants.ts` (`MAX_VIOLATIONS = 5`), `app/exam/[attemptId]/page.tsx` | **Live** | Reaching violation threshold auto-terminates attempt. |
| **Downloadable Certificate** | Pricing, Results | `components/ui/CertificateModal.tsx` | **Live** | Clean printable PDF / browser print certificate for passing scores (>=60%). |
| **Lifetime Result Access** | Pricing | `app/dashboard/page.tsx`, `app/results/[attemptId]/page.tsx` | **Live** | Results and attempts stored in user profile. |
| **Team-Shareable Result Dashboard** | Pricing | None | **Roadmap** | Removed from individual/bundle plan feature lists. |
| **Category Analytics** | Pricing | `app/dashboard/page.tsx` | **Partial** | Displays test score, percentage, and completion status. |
| **Admin Dashboard** | Admin | `app/admin/dashboard/page.tsx`, `app/admin/candidates/page.tsx`, `app/admin/assessments/page.tsx` | **Live** | Role-based admin portal for managing assessments and candidates. |
| **Bulk Candidate Evaluation / Invites** | Pricing | None | **Roadmap** | Omitted from pricing plans. |
| **API Access for Integrations** | Pricing | None | **Roadmap** | Omitted from pricing plans. |
| **Dedicated Support Channel** | Pricing | None | **Partial** | Support contact form exists; no dedicated SLA/channel. |
| **Annual Analytics Reports** | Pricing | None | **Not Built** | Omitted from pricing plans. |
| **Free / Sample Assessment Track** | Pricing ("Start for free") | None | **Not Built** | All assessments require individual (₹500), category (₹2,000), or bundle (₹8,000) purchase. Replaced with "Talk to us" contact link. |
| **Forgot Password Flow** | Login | `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts` | **Partial** | API endpoints exist; dedicated UI pages will be created at `/forgot-password` and `/reset-password`. |

---

### Gate B — "Stock" Text Leaking into Assessment Cards
- **Root Cause**: In `app/page.tsx` (lines 407–414), category cards rendered `<CategoryIcon />` (which defaulted to the first letter of the category name, e.g. "G", "P") immediately adjacent to a `<span ...>Stock</span>` element and `{(category.subjects || []).length} SUBJECTS`. This rendered as "GStock12 SUBJECTS".
- **Planned Fix**: Replace with the clean "Exam paper" category card component displaying the category illustration, category name, clean "12 assessments" badge, description, topic list, and pricing hint.

---

### Gate C — `/assessments` is Client-Only
- **Root Cause**: `app/assessments/page.tsx` was marked `'use client'`, rendered a generic `<Suspense fallback={<Loading text="Preparing Assessments..." />}>`, and loaded data on client mount via `useEffect`.
- **Planned Fix**:
  - Render categories and assessment structure on the server.
  - Implement dynamic category detail pages at `/assessments/[category]` using `generateStaticParams` for all 20 categories.
  - Add 308 permanent redirect from `/assessments?category=<slug>` to `/assessments/<slug>`.

---

### Gate D — Identical Metadata on Every Route
- **Root Cause**: Only root `app/layout.tsx` contained static metadata (`"Hireperfect - AI-Enabled Proctored Assessments"`), with incorrect brand casing and no per-route definitions.
- **Planned Fix**: Configure Next.js Metadata API on every public route (`/`, `/assessments`, `/assessments/[category]`, `/integrity`, `/pricing`, `/about`, `/contact`, `/privacy`, `/terms`), with robots `noindex` on auth/admin routes, JSON-LD structured data, dynamic OpenGraph image, `sitemap.ts`, and `robots.ts`.

---

### Gate E — Contradictory Numbers & Unverifiable Claims
- **Root Cause**: Unverified marketing stats scattered across pages ("12k+ monitored attempts", "500k+ validations", "36+ active units", "99.9% fraud prevention accuracy", "Zero-fraud guarantee").
- **Planned Fix**:
  - Centralize in `src/config/site-stats.ts`:
    ```ts
    export const siteStats = {
      categories: 20,
      assessments: 240,
      assessmentsPerCategory: 12,
      monitoredAttempts: null,
      activeRecruiters: null,
    };
    ```
  - Only render non-null stats. Remove all unverified fraud and uptime percentage claims.

---

### Gate F — Broken / Dead Links
- **Findings**:
  - `/login`: "Forgot Password?" was linked to `href="#"`.
  - Homepage / Footer: Support was linked to `href="#faq-submission-form"`.
  - Hero: "Begin Journey" button linked to `href="#features"`.
- **Planned Fix**:
  - Route "Forgot Password?" to `/forgot-password`.
  - Route support/contact to `/contact`.
  - Replace anchor links with direct navigation links.

---

### Gate G — Theme Architecture & Migration Plan
- **Findings**: Hardcoded dark background colors (`#020205`, `#050510`, `#0a0a0f`) and neon cyan/purple classes throughout JSX files.
- **Planned Fix**:
  - Configure CSS custom properties in `globals.css`:
    - `--paper: #F5F7F6`
    - `--sheet: #FFFFFF`
    - `--ink: #14203A`
    - `--graphite: #566074`
    - `--rule: #DDE3EA`
    - `--rule-strong: #C5CEDA`
    - `--signal: #2B46D1`
    - `--signal-soft: #E8ECFC`
    - `--omr: #D9476B`
    - `--clean: #1E8458` / `--clean-soft: #E3F3EB`
    - `--review: #B7790F` / `--review-soft: #FBF1DC`
    - `--flagged: #C3343B` / `--flagged-soft: #FBE6E7`
  - Map variables into `tailwind.config.ts`.
  - Refactor all UI components and pages to use tokens with zero hardcoded hex values.

---

### Gate H — Audience Model
- **Findings**: The platform supports candidates purchasing and taking assessments, as well as recruiters/organisations managing tests and reviewing integrity reports. Signup defaults to candidate role.
- **Planned Fix**: Implement dual-audience hero with segmented control (`I'm hiring` | `I'm taking a test`) that swaps subheads and CTAs, persisting the selection in `sessionStorage`.

---

## Needs Owner Input

The following items are marked with `[CONFIRM]` or `[LEGAL REVIEW REQUIRED]` for product owner confirmation:

- [ ] **[CONFIRM] GST statement**: Whether prices are inclusive or exclusive of GST on the pricing page (default set to "Prices are inclusive of GST").
- [ ] **[CONFIRM] Attempts per assessment**: Whether the ₹8,000 Full Library and ₹500 Single Assessment plans include 1 attempt or multiple retakes per assessment (default set to "1 proctored attempt per assessment").
- [ ] **[CONFIRM] Real platform stats**: Monitored attempts count and active recruiters count for `siteStats` (currently set to `null` to avoid unverified claims).
- [ ] **[CONFIRM] Real team imagery**: Whether to display illustrative team photos or provide actual founder/team photography for `/about`.
- [ ] **[LEGAL REVIEW REQUIRED] Privacy Policy & DPDP Act 2023**: Restyled the privacy page without altering legal substance. Owner should have legal counsel review retention periods and consent disclosures for webcam processing under India's Digital Personal Data Protection Act, 2023.

---

## Who it's for — Diagnosis (Section Rebuild)

| # | Symptom | Root Cause (file:line) | Fix |
|---|---|---|---|
| **W1** | Every image box shows placeholder styling with serif text | Legacy placeholder / flat layout (`app/page.tsx:309`) | Replaced with high-definition tall editorial photos (`who-*-tall.jpg/webp`) in 4:5 vertical framing. |
| **W2** | Eyebrow "01 · HIRING TEAMS" repeats heading | Tracked uppercase template (`app/page.tsx:322`) | Removed eyebrow labels completely. Headings in sentence case. |
| **W3** | Frame inside frame | Nested border wrappers (`app/page.tsx:309`) | Unified into single 20px radius panel surface with overlay gradients. |
| **W4** | Sparse 50/50 rows wasting 2000px vertical space | Static stacked rows (`app/page.tsx:298-332`) | Built compact, dense expanding panel sequence (~620px) with rich proof cards. |
| **W5** | No motion on scroll | Static markup without scroll binding | Implemented scroll-driven panel expansion via Framer Motion `useScroll` with hysteresis. |
| **W6** | Copy discrepancy between components | Ad-hoc descriptions in page template | Single source of truth in `src/content/home.ts -> audiences`. |

**Files Replaced/Cleaned**:
- `app/page.tsx` (lines 286–334 replaced with `<AudienceSection />`)
- `src/content/home.ts` (expanded with `audiences` data & proof card structures)

