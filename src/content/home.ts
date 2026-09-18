export type ProofCardType = 'shortlist' | 'placement' | 'certificate' | 'result';

export interface Audience {
  id: 'hiring' | 'colleges' | 'academies' | 'candidates';
  shortLabel: string;
  title: string;
  description: string;
  outcomes: [string, string, string];
  cta: { label: string; href: string };
  icon: 'BriefcaseBusiness' | 'GraduationCap' | 'Award' | 'UserRound';
  image: { src: string; alt: string; objectPosition: string };
  proof: {
    type: ProofCardType;
    title: string;
    subtitle: string;
    srSummary: string;
  };
}

export const audiences: Audience[] = [
  {
    id: 'hiring',
    shortLabel: 'Hiring teams',
    title: 'Hiring teams',
    description: 'Test applicants on real skills before anyone books an interview, then share results with your panel.',
    outcomes: [
      'Scores for every applicant in one list',
      'An integrity report with each attempt',
      'One-time pricing with no seat licences',
    ],
    cta: { label: 'See pricing', href: '/pricing' },
    icon: 'BriefcaseBusiness',
    image: {
      src: '/images/who-hiring-tall.jpg',
      alt: 'Recruiters reviewing candidate results together',
      objectPosition: '50% 35%',
    },
    proof: {
      type: 'shortlist',
      title: 'Shortlist',
      subtitle: 'Advanced Excel and Business Intelligence',
      srSummary: 'Example: a candidate shortlist showing scores and integrity status chips for Ravi, Meera, and Arjun.',
    },
  },
  {
    id: 'colleges',
    shortLabel: 'Colleges',
    title: 'Colleges and placement cells',
    description: 'Run a remote test for a whole batch under the same rules, then review only the attempts that were flagged.',
    outcomes: [
      'The same controls for every student',
      'Flagged attempts gathered in one place',
      "Runs on students' own laptops",
    ],
    cta: { label: 'Talk to us', href: '/contact' },
    icon: 'GraduationCap',
    image: {
      src: '/images/who-campus-tall.jpg',
      alt: 'Students taking an online test in a college lab',
      objectPosition: '50% 40%',
    },
    proof: {
      type: 'placement',
      title: 'Placement drive',
      subtitle: 'Final-year students',
      srSummary: 'Example: a placement drive dashboard showing 412 of 450 tests submitted, with 9 flagged attempts.',
    },
  },
  {
    id: 'academies',
    shortLabel: 'Academies',
    title: 'Training academies',
    description: 'Close each programme with a proctored assessment and give learners a result employers can check.',
    outcomes: [
      '12 assessments per category, beginner to expert',
      'Score and integrity in one view',
      'Completion certificates',
    ],
    cta: { label: 'Browse categories', href: '/assessments' },
    icon: 'Award',
    image: {
      src: '/images/who-academy-tall.jpg',
      alt: 'Adult learners completing a certification test',
      objectPosition: '50% 35%',
    },
    proof: {
      type: 'certificate',
      title: 'Certificate of completion',
      subtitle: 'Advanced Excel and Business Intelligence',
      srSummary: 'Example: a completion certificate for Divya N. showing an 84% score and verified integrity seal.',
    },
  },
  {
    id: 'candidates',
    shortLabel: 'Candidates',
    title: 'Candidates',
    description: 'Show what you know. Your score comes with a record of how the test was taken.',
    outcomes: [
      'Assessments in 20 fields',
      'Results the moment you submit',
      'A certificate you can download',
    ],
    cta: { label: 'Create your account', href: '/signup' },
    icon: 'UserRound',
    image: {
      src: '/images/who-candidate-tall.jpg',
      alt: 'Candidate preparing for an online assessment at home',
      objectPosition: '50% 30%',
    },
    proof: {
      type: 'result',
      title: 'Your result',
      subtitle: 'Prompt Engineering and AI Automation',
      srSummary: 'Example: candidate score gauge showing 26 of 30, verified integrity record, and download options.',
    },
  },
];

export const homeContent = {
  hero: {
    title: "Scores you can stand behind.",
    audience: {
      hiring: {
        label: "I'm hiring",
        subhead: "Run proctored MCQ assessments with identity checks, browser lockdown and AI monitoring. Every attempt ends with an integrity report your team can review in minutes.",
        primaryCta: { text: "Browse assessments", href: "/assessments" },
        secondaryCta: { text: "See how proctoring works", href: "/integrity" },
      },
      candidate: {
        label: "I'm taking a test",
        subhead: "Take proctored assessments across 20 fields, from AI strategy to supply chain analytics. Your result comes with a verified integrity record employers can trust.",
        primaryCta: { text: "Create your account", href: "/signup" },
        secondaryCta: { text: "Browse assessments", href: "/assessments" },
      },
    },
  },
  protectionSteps: {
    heading: "How every attempt is protected",
    intro: "Integrity checks run before, during and after the exam, so a score means what it says.",
    steps: [
      {
        number: 1,
        title: "Before the exam",
        description: "Candidates sign in, confirm their identity and pass a quick camera and browser check.",
      },
      {
        number: 2,
        title: "During the exam",
        description: "The test runs full-screen. GuardEye AI watches for face absence, extra people and tab switches, and logs each event with a timestamp.",
      },
      {
        number: 3,
        title: "After the exam",
        description: "Scores are calculated instantly. Flagged moments are collected into an integrity report for a person to review.",
      },
    ],
  },
  integrityReportShowcase: {
    heading: "An integrity report, not a guess",
    body: "Every attempt produces a timeline of what happened and when. Flags are sorted into three levels so reviewers know where to look first.",
    tiers: [
      { name: "No issues", description: "All checks passed cleanly without anomalies." },
      { name: "Needs review", description: "Minor anomalies flagged for human verification." },
      { name: "Major issues", description: "Multiple high-severity events recorded during the attempt." },
    ],
  },
  guardEyeMonitored: {
    heading: "What GuardEye AI monitors",
    signals: [
      { id: "face-absence", title: "Face not visible", description: "Flags when the candidate moves out of camera frame.", image: "/images/signals/face-absence.webp" },
      { id: "multiple-faces", title: "More than one person", description: "Detects additional people appearing in the frame.", image: "/images/signals/multiple-faces.webp" },
      { id: "fullscreen-exit", title: "Leaving full-screen", description: "Logs attempts to exit the locked examination window.", image: "/images/signals/fullscreen-exit.webp" },
      { id: "tab-switch", title: "Switching tabs or windows", description: "Detects focus shifts away from the assessment screen.", image: "/images/signals/tab-switch.webp" },
      { id: "copy-paste", title: "Copy and paste attempts", description: "Blocks and logs clipboard interaction during the test.", image: "/images/signals/copy-paste.webp" },
      { id: "dev-tools", title: "Developer tools opened", description: "Monitors attempts to inspect elements or run scripts.", image: "/images/signals/dev-tools.webp" },
      { id: "unusual-timing", title: "Unusual answer timing", description: "Flags abnormally rapid or irregular response patterns.", image: "/images/signals/unusual-timing.webp" },
    ],
    roadmapSignals: [
      { id: "second-device", title: "Second-device detection", description: "Secondary camera detection of auxiliary screens and phones.", image: "/images/signals/second-device.webp" },
      { id: "ai-overlay", title: "AI overlay tool detection", description: "Defences against background AI assistant extensions.", image: "/images/signals/ai-overlay.webp" },
      { id: "audio-voices", title: "Talking or background voices", description: "Voice and ambient conversation acoustic analysis.", image: "/images/signals/audio-voices.webp" },
    ],
  },
  whoItIsFor: {
    heading: "Made for anyone who decides on a score",
    intro: "Scroll through or pick your role to see how HirePerfect fits.",
  },
  fairness: {
    heading: "Fair to candidates, useful to reviewers",
    principles: [
      {
        title: "A flag is a signal, not a verdict.",
        description: "Integrity events point reviewers to moments worth checking. A person makes the final call.",
      },
      {
        title: "Candidates know what's monitored.",
        description: "Before starting, every candidate sees what the camera and browser checks look for.",
      },
      {
        title: "Same rules for everyone.",
        description: "Every attempt runs under the same controls, so results are comparable.",
      },
    ],
  },
  faq: [
    {
      question: "What do candidates need to take a test?",
      answer: "A laptop or desktop with a working webcam, a modern browser (Chrome or Edge recommended) and a stable internet connection.",
    },
    {
      question: "Is my webcam recorded?",
      answer: "GuardEye AI analyses camera frames in real time directly on your device to flag potential anomalies for human review. See How proctoring works for full details.",
    },
    {
      question: "Can I retake an assessment?",
      answer: "Each purchase covers a single dedicated proctored attempt with instant scoring and a permanent integrity record.",
    },
    {
      question: "How long does each assessment take?",
      answer: "Assessments are typically 50 minutes long with 30 multiple-choice questions designed to test practical domain knowledge.",
    },
  ],
  finalCta: {
    heading: "Start with one assessment.",
    body: "Pick a category, take a proctored test and see the integrity report for yourself.",
    primaryCta: { text: "Browse assessments", href: "/assessments" },
    secondaryCta: { text: "Talk to us", href: "/contact" },
  },
};
