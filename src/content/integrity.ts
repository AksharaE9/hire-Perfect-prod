export const integrityContent = {
  hero: {
    heading: "How proctoring works",
    subhead: "What HirePerfect checks during an assessment, why it checks it, and what happens to the data.",
  },
  candidateTab: {
    title: "For candidates",
    checklist: {
      heading: "Before you start",
      intro: "Take two minutes to get your setup ready so your test runs smoothly without interruptions.",
      items: [
        { label: "Quiet, well-lit room", detail: "Avoid backlighting so your face is clearly visible." },
        { label: "Face clearly visible", detail: "Position your camera straight at eye level." },
        { label: "Webcam and microphone allowed", detail: "Grant browser camera permissions when prompted." },
        { label: "Other tabs and apps closed", detail: "Close messaging, secondary screens and extra browsers." },
        { label: "Stable internet connection", detail: "Ensure at least 1 Mbps steady bandwidth." },
      ],
    },
    monitored: {
      heading: "What we monitor and why",
      signals: [
        { name: "Face presence", reason: "Confirms that the registered candidate remains at the screen." },
        { name: "Multiple people", reason: "Ensures assessments are completed independently." },
        { name: "Full-screen mode", reason: "Keeps focus strictly on the examination environment." },
        { name: "Tab switching", reason: "Prevents navigating away to external search engines or reference notes." },
        { name: "Clipboard access", reason: "Restricts copying question text or pasting unauthorized code." },
      ],
    },
    troubleshooting: {
      heading: "If something goes wrong",
      body: "A dropped connection or unexpected background interruption happens. Integrity events are recorded as objective signals for a human reviewer to inspect, not automated disqualifications. If your connection drops momentarily, reconnect immediately to resume your attempt within the allotted window.",
    },
    dataPrivacy: {
      heading: "Your data & privacy",
      body: "GuardEye AI processes visual signals locally in your browser during the assessment to detect anomalies. We never sell your personal data or biometric information.",
      linkText: "Read our full Privacy Policy",
      linkHref: "/privacy",
    },
  },
  organisationTab: {
    title: "For organisations",
    model: {
      heading: "The three-stage protection model",
      stages: [
        { stage: "1. Pre-exam verification", description: "Hardware diagnostics verify camera access and modern browser support before questions unlock." },
        { stage: "2. Real-time signal capture", description: "Full-screen lock and client-side AI analysis log anomalous events with precise timestamps." },
        { stage: "3. Reviewable integrity report", description: "Attempts produce an indexed timeline and tier chip, highlighting moments for human evaluation." },
      ],
    },
    integrityReportGuidance: {
      heading: "Reviewing integrity reports",
      body: "Flags are intended as directional signals, not automated verdicts. We always recommend contacting a candidate or reviewing specific flagged timestamps before making hiring or certification decisions.",
      tiers: [
        { name: "No issues", detail: "Clean attempt with zero high-weight anomalies." },
        { name: "Needs review", detail: "Isolated events (e.g. brief gaze deviation or short window blur) worth inspecting." },
        { name: "Major issues", detail: "Repeated full-screen exits or multiple face alerts requiring comprehensive review." },
      ],
    },
  },
};
