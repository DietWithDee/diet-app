export const TESTIMONIAL_PLANS = [
  { id: 'consultation', label: '1-on-1 Clinical Consultation' },
  { id: 'ontrack-care', label: 'OnTrack Diabetes Consultation' },
  { id: 'back-to-basics', label: 'Back to Basics' },
  { id: 'snatched-nourished', label: 'Snatched & Nourished' },
  { id: 'blood-sugar-balance', label: 'Blood Sugar Balance' },
  { id: 'pressure-no-dey-catch-me', label: 'Pressure No Dey Catch Me' },
  { id: 'weight-gain', label: 'The Weight Gain' },
  { id: 'custom-plan', label: 'Custom Plan' }
];

const PLAN_LABEL_MAP = TESTIMONIAL_PLANS.reduce((acc, item) => {
  acc[item.id] = item.label;
  return acc;
}, {});

/**
 * Normalizes a testimonial plan slug or display name into a readable label.
 */
export const formatPlanLabel = (plan) => {
  if (!plan) return 'Client Consultation';
  const trimmed = String(plan).trim();
  if (PLAN_LABEL_MAP[trimmed]) return PLAN_LABEL_MAP[trimmed];
  if (trimmed.includes('-') && !trimmed.includes(' ')) {
    return trimmed
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return trimmed;
};

/**
 * Checks whether a testimonial belongs to a selected plan filter ID.
 */
export const matchesPlanFilter = (testimonial, selectedPlan) => {
  if (!selectedPlan || selectedPlan === 'all') return true;
  if (!testimonial) return false;
  if (testimonial.planId === selectedPlan || testimonial.plan === selectedPlan) {
    return true;
  }
  const targetLabel = (PLAN_LABEL_MAP[selectedPlan] || '').toLowerCase();
  const actualLabel = formatPlanLabel(testimonial.planId || testimonial.plan).toLowerCase();
  return Boolean(targetLabel && actualLabel === targetLabel);
};
