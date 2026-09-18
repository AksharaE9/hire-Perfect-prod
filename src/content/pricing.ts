export const pricingContent = {
  hero: {
    heading: "Simple, one-time pricing",
    subhead: "Pay once for the assessments you need. No subscriptions.",
    gstNote: "Prices are inclusive of GST.",
  },
  plans: [
    {
      id: "individual",
      name: "Single assessment",
      price: 500,
      priceLabel: "₹500 per assessment",
      description: "Try one assessment in any category.",
      features: [
        "Any one assessment",
        "GuardEye AI proctoring",
        "Instant scoring & reviewable report",
        "Lifetime result access",
        "Downloadable certificate on passing",
      ],
      cta: { text: "Choose an assessment", href: "/assessments" },
      badge: null,
    },
    {
      id: "category",
      name: "Category pack",
      price: 2000,
      priceLabel: "₹2,000 per category",
      description: "All 12 assessments in one category, beginner to expert.",
      features: [
        "All 12 assessments in selected category",
        "All difficulty levels included",
        "Category performance view",
        "GuardEye AI proctoring on all attempts",
        "Individual certificates for each completed assessment",
      ],
      cta: { text: "Choose a category", href: "/assessments" },
      badge: "Most popular",
    },
    {
      id: "bundle",
      name: "Full library",
      price: 8000,
      priceLabel: "₹8,000 one-time",
      description: "All 240 assessments across all 20 categories.",
      features: [
        "All 240 assessments across all 20 categories",
        "Full access to beginner, intermediate & advanced tracks",
        "Admin dashboard overview",
        "GuardEye AI proctoring on every attempt",
        "Downloadable completion certificates",
      ],
      cta: { text: "Get the full library", href: "/signup" },
      badge: "Best value",
    },
  ],
  paymentAssurance: [
    {
      title: "Secure checkout",
      description: "Payments are handled by Razorpay. We never see or store your card details.",
    },
    {
      title: "Verified payments",
      description: "Every transaction is signature-checked before access is granted.",
    },
    {
      title: "UPI, cards and net banking",
      description: "Pay the way you prefer via cards, UPI, or net banking.",
    },
  ],
  faq: [
    {
      question: "Is this a subscription?",
      answer: "No. Every plan is a one-time payment with no recurring charges.",
    },
    {
      question: "Which payment methods can I use?",
      answer: "Credit and debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), net banking and popular wallets through Razorpay.",
    },
    {
      question: "Can I get a refund?",
      answer: "Yes, if you haven't started the assessment attempt and you contact us within 24 hours of purchase.",
    },
    {
      question: "Is my payment data safe?",
      answer: "Razorpay processes all payments. HirePerfect never receives or stores your credit/debit card numbers or bank credentials.",
    },
    {
      question: "Can I buy for a team?",
      answer: "The Full library plan is designed for individual professionals and small teams. For bulk custom arrangements, please reach out to us via our contact page.",
    },
  ],
  contactCta: {
    heading: "Not sure which plan fits?",
    subhead: "Send us a message and our team will help you find the right setup.",
    buttonText: "Talk to us",
    buttonHref: "/contact",
  },
};
