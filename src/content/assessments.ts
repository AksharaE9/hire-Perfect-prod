export interface CategoryGroup {
  id: string;
  name: string;
  categories: string[]; // slugs
}

export const assessmentGroups: CategoryGroup[] = [
  {
    id: 'ai-automation',
    name: 'AI & Automation',
    categories: [
      'generative-ai-business-leaders',
      'prompt-engineering-ai-automation',
      'ai-healthcare-biotech',
      'ai-content-creation-media-production',
    ],
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    categories: [
      'data-engineering-cloud-pipelines',
      'advanced-excel-business-intelligence',
      'financial-modeling-ai-tools',
      'supply-chain-logistics-analytics',
      'hr-analytics-people-strategy',
    ],
  },
  {
    id: 'business-strategy',
    name: 'Business & Strategy',
    categories: [
      'product-management-ai-era',
      'growth-marketing-performance-strategy',
      'sustainable-business-esg-strategy',
      'startup-incubation-venture-building',
      'digital-branding-creator-economy',
    ],
  },
  {
    id: 'design-product',
    name: 'Design & Product',
    categories: [
      'ui-ux-ai-products',
      'ar-vr-spatial-computing',
      'no-code-low-code-app-development',
    ],
  },
  {
    id: 'security-web3',
    name: 'Security & Web3',
    categories: [
      'cybersecurity-ethical-ai-security',
      'blockchain-web3-applications',
    ],
  },
  {
    id: 'people-leadership',
    name: 'People & Leadership',
    categories: [
      'emotional-intelligence-leaders',
    ],
  },
];

export const assessmentsContent = {
  heading: "Assessment library",
  subhead: "20 categories, 12 assessments each. Every assessment is proctored by GuardEye AI.",
  emptySearch: (query: string) => `No categories match "${query}". Try a broader word like data or AI.`,
};
