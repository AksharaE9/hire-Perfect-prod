export const contactContent = {
  heading: "Contact us",
  subhead: "Questions about assessments, billing or setting up tests for a group? Send a message and we'll reply by email.",
  topics: [
    { value: "assessments", label: "Assessments & Categories" },
    { value: "billing", label: "Billing & Invoices" },
    { value: "organisations", label: "Organisations & Batches" },
    { value: "general", label: "Something else" },
  ],
  successToast: (email: string) => `Message sent. We'll reply to ${email}.`,
  errorToast: "Your message didn't send. Check your connection and try again.",
};
