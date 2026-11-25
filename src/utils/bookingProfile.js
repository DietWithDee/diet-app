/**
 * Computes BMI, daily calorie targets, and macro estimates from a stored Firestore user profile.
 * Returns null if height or weight is missing.
 */
export const computeResultsFromProfile = (profile) => {
  if (!profile?.height || !profile?.weight) return null;
  const h = parseFloat(profile.height) / 100;
  const w = parseFloat(profile.weight);
  if (!h || !w) return null;

  const age = parseFloat(profile.age) || 25;
  const bmi = Math.round((w / (h * h)) * 10) / 10;
  let bmiCategory = '';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal Weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  const genderFactor = profile.gender === 'male' ? 5 : -161;
  const bmr = 10 * w + 6.25 * parseFloat(profile.height) - 5 * age + genderFactor;
  const activityMultipliers = { sedentary: 1.15, light: 1.325, moderate: 1.475, active: 1.6 };
  const tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.15);
  let goalCalories = tdee;
  if (profile.goal === 'lose') goalCalories = tdee - 300;
  else if (profile.goal === 'gain') goalCalories = tdee + 300;
  const goalLabels = { lose: 'Weight Loss', maintain: 'Weight Maintenance', gain: 'Muscle Gain' };

  return {
    bmi,
    bmiCategory,
    weight: w,
    height: parseFloat(profile.height),
    dailyCalories: Math.round(goalCalories),
    goal: goalLabels[profile.goal] || profile.goal || 'Not specified',
    dietaryRestrictions: profile.dietaryRestrictions || 'None',
    activityLevel: profile.activityLevel || null,
    healthConditions: profile.healthConditions || null,
    dislikes: profile.dislikes || null,
    macros: {
      protein: Math.round((goalCalories * 0.3) / 4),
      carbs: Math.round((goalCalories * 0.4) / 4),
      fats: Math.round((goalCalories * 0.3) / 9)
    }
  };
};

/**
 * Reads cached KnowYourBody assessment results from localStorage (valid for 30 days).
 */
export const getStoredTestResults = () => {
  try {
    const raw = localStorage.getItem('diet_test_results');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && (!data.savedAt || Date.now() - data.savedAt < 30 * 24 * 60 * 60 * 1000)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
};

export const DEFAULT_USER_RESULTS = {
  bmi: null,
  bmiCategory: 'Pending Assessment',
  dailyCalories: null,
  goal: 'General Consultation',
  dietaryRestrictions: 'None',
  macros: { protein: 0, carbs: 0, fats: 0 }
};
