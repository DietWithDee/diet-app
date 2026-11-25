const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.15,
  light: 1.325,
  moderate: 1.475,
  active: 1.6
};

const GOAL_LABELS = {
  lose: 'Weight Loss',
  maintain: 'Weight Maintenance',
  gain: 'Muscle Gain'
};

export const GUEST_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Computes BMI, BMR, daily goal calories, and macro targets from metric inputs.
 * Returns null if heightCm or weightKg are missing or non-positive.
 */
export const calculateBodyMetrics = ({ weightKg, heightCm, age = 25, gender = 'female', activityLevel = 'sedentary', goal = 'maintain' }) => {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return null;
  }

  const parsedAge = parseFloat(age);
  const safeAge = Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : 25;
  const hInM = h / 100;
  const rawBmi = w / (hInM * hInM);
  const bmi = Math.round(rawBmi * 10) / 10;

  let bmiCategory = 'Normal Weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal Weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  const genderFactor = gender === 'male' ? 5 : -161;
  const bmr = 10 * w + 6.25 * h - 5 * safeAge + genderFactor;
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.15);

  let goalCalories = tdee;
  if (goal === 'lose') goalCalories = tdee - 300;
  else if (goal === 'gain') goalCalories = tdee + 300;
  goalCalories = Math.max(800, goalCalories);

  return {
    bmi,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(goalCalories),
    macros: {
      protein: Math.round((goalCalories * 0.3) / 4),
      carbs: Math.round((goalCalories * 0.4) / 4),
      fats: Math.round((goalCalories * 0.3) / 9)
    }
  };
};

/**
 * Builds a normalized metric KnowYourBody assessment snapshot ready for localStorage & Firestore.
 */
export const buildKnowYourBodySnapshot = (formData, units = 'metric', savedAt = Date.now()) => {
  const rawWeight = parseFloat(formData?.weight);
  const rawHeight = parseFloat(formData?.height);
  const weightKg = Number.isFinite(rawWeight)
    ? (units === 'imperial' ? Math.round(rawWeight * 0.453592 * 10) / 10 : Math.round(rawWeight * 10) / 10)
    : null;
  const heightCm = Number.isFinite(rawHeight)
    ? (units === 'imperial' ? Math.round(rawHeight * 2.54 * 10) / 10 : Math.round(rawHeight * 10) / 10)
    : null;

  const metrics = calculateBodyMetrics({
    weightKg,
    heightCm,
    age: formData?.age,
    gender: formData?.gender,
    activityLevel: formData?.activityLevel,
    goal: formData?.goal
  });

  if (!metrics) return null;

  return {
    bmi: metrics.bmi,
    bmiCategory: metrics.bmiCategory,
    bmr: metrics.bmr,
    dailyCalories: metrics.tdee,
    goal: formData?.goal || '',
    targetWeight: formData?.targetWeight || null,
    dietaryRestrictions: formData?.dietaryRestrictions || 'None',
    macros: metrics.macros,
    gender: formData?.gender || '',
    age: formData?.age || '',
    height: heightCm,
    weight: weightKg,
    activityLevel: formData?.activityLevel || '',
    sleepHours: formData?.sleepHours || '',
    healthConditions: formData?.healthConditions || '',
    dislikes: formData?.dislikes || '',
    unitsUsed: units,
    source: 'knowyourbody',
    savedAt
  };
};

/**
 * Determines whether a cached guest KnowYourBody snapshot should be synced to Firestore on sign-in.
 */
export const shouldSyncGuestSnapshot = (snapshot, uid, syncedForKey, now = Date.now()) => {
  if (!uid || !snapshot || !snapshot.bmi || !snapshot.savedAt) return false;
  if (now - snapshot.savedAt >= GUEST_SNAPSHOT_MAX_AGE_MS || snapshot.savedAt > now + 60_000) {
    return false;
  }
  const expectedKey = `${uid}:${snapshot.savedAt}`;
  return syncedForKey !== expectedKey;
};

/**
 * Computes BMI, daily calorie targets, and macro estimates from a stored Firestore user profile.
 * Returns null if height or weight is missing.
 */
export const computeResultsFromProfile = (profile) => {
  if (!profile?.height || !profile?.weight) return null;
  const metrics = calculateBodyMetrics({
    weightKg: profile.weight,
    heightCm: profile.height,
    age: profile.age,
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    goal: profile.goal
  });
  if (!metrics) return null;

  return {
    bmi: metrics.bmi,
    bmiCategory: metrics.bmiCategory,
    weight: parseFloat(profile.weight),
    height: parseFloat(profile.height),
    dailyCalories: metrics.tdee,
    goal: GOAL_LABELS[profile.goal] || profile.goal || 'Not specified',
    dietaryRestrictions: profile.dietaryRestrictions || 'None',
    activityLevel: profile.activityLevel || null,
    healthConditions: profile.healthConditions || null,
    dislikes: profile.dislikes || null,
    macros: metrics.macros
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
