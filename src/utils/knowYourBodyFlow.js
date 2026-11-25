export const RULER_RANGES = {
  age: { min: 14, max: 85, step: 1, defaultValue: 28, majorEvery: 5, unit: 'yrs' },
  heightMetric: { min: 130, max: 220, step: 1, defaultValue: 168, majorEvery: 10, unit: 'cm' },
  heightImperial: { min: 52, max: 86, step: 1, defaultValue: 66, majorEvery: 6, unit: 'in' },
  weightMetric: { min: 35, max: 180, step: 0.5, defaultValue: 70, majorEvery: 5, unit: 'kg' },
  weightImperial: { min: 77, max: 396, step: 1, defaultValue: 154, majorEvery: 10, unit: 'lbs' }
};

export const snapToStep = (rawValue, step, min, max) => {
  const num = Number(rawValue);
  if (!Number.isFinite(num)) return min;
  const clamped = Math.min(max, Math.max(min, num));
  const decimals = String(step).includes('.') ? String(step).split('.')[1].length : 0;
  const snapped = min + Math.round((clamped - min) / step) * step;
  const fixed = Number(Math.min(max, Math.max(min, snapped)).toFixed(decimals));
  return fixed;
};

export const formatInchesToFeetInches = (totalInches) => {
  const rounded = Math.round(Number(totalInches));
  if (!Number.isFinite(rounded) || rounded <= 0) return "—";
  const feet = Math.floor(rounded / 12);
  const inches = rounded % 12;
  return `${feet}' ${inches}"`;
};

export const convertHeight = (value, fromUnits, toUnits) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return toUnits === 'imperial' ? RULER_RANGES.heightImperial.defaultValue : RULER_RANGES.heightMetric.defaultValue;
  }
  if (fromUnits === toUnits) return num;
  if (fromUnits === 'metric' && toUnits === 'imperial') {
    return snapToStep(num / 2.54, 1, RULER_RANGES.heightImperial.min, RULER_RANGES.heightImperial.max);
  }
  return snapToStep(num * 2.54, 1, RULER_RANGES.heightMetric.min, RULER_RANGES.heightMetric.max);
};

export const convertWeight = (value, fromUnits, toUnits) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return toUnits === 'imperial' ? RULER_RANGES.weightImperial.defaultValue : RULER_RANGES.weightMetric.defaultValue;
  }
  if (fromUnits === toUnits) return num;
  if (fromUnits === 'metric' && toUnits === 'imperial') {
    return snapToStep(num / 0.453592, 1, RULER_RANGES.weightImperial.min, RULER_RANGES.weightImperial.max);
  }
  return snapToStep(num * 0.453592, 0.5, RULER_RANGES.weightMetric.min, RULER_RANGES.weightMetric.max);
};

export const suggestTargetWeight = (currentWeight, goal, units = 'metric') => {
  const range = units === 'imperial' ? RULER_RANGES.weightImperial : RULER_RANGES.weightMetric;
  const delta = units === 'imperial' ? 11 : 5;
  const cur = snapToStep(currentWeight || range.defaultValue, range.step, range.min, range.max);
  if (goal === 'lose') {
    return snapToStep(cur - delta, range.step, range.min, range.max);
  }
  if (goal === 'gain') {
    return snapToStep(cur + delta, range.step, range.min, range.max);
  }
  return cur;
};

export const toggleDietaryChoice = (currentValue, choice) => {
  if (choice === 'None') return 'None';
  const existing = String(currentValue || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'None');

  if (existing.includes(choice)) {
    const remaining = existing.filter((s) => s !== choice);
    return remaining.length > 0 ? remaining.join(', ') : 'None';
  }
  return [...existing, choice].join(', ');
};
