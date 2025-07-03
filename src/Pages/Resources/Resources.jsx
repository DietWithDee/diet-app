import React, { useState } from 'react';
import { ChevronRight, Calculator, Target, BookOpen, User, Activity, Moon, Heart, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router';

// Progress Bar
const ProgressBar = ({ step }) => {
  const progress = (step / 3) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
      <div
        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Welcome</span>
        <span>BMI</span>
        <span>Calories</span>
        <span>Results</span>
      </div>
    </div>
  );
};

// Welcome Step
const WelcomeStep = ({ onNext }) => (
  <div className="text-center space-y-8">
    <div className="space-y-4">
      <div className="text-6xl">🧭</div>
      <h1 className="text-4xl font-bold text-green-800 mb-4 pt-15">
        Let's personalize your nutrition journey
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
        We'll calculate your BMI, estimate your daily calorie needs, and guide you to book a session with our expert Dietitians.
      </p>
    </div>
    <div className="flex justify-center space-x-4">
      <div className="flex items-center space-x-2 text-green-600">
        <Calculator size={20} />
        <span>BMI Calculator</span>
      </div>
      <div className="flex items-center space-x-2 text-emerald-600">
        <Target size={20} />
        <span>Calorie Assessment</span>
      </div>
      <div className="flex items-center space-x-2 text-green-700">
        <BookOpen size={20} />
        <span>Expert Consultation</span>
      </div>
    </div>
    <button
      onClick={onNext}
      className="px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2 mx-auto"
    >
      <span>Start Now</span>
      <ChevronRight size={20} />
    </button>
  </div>
);

// BMI Step
const BMIStep = ({ formData, setFormData, units, setUnits, onNext }) => (
  <div className="max-w-2xl mx-auto space-y-8">
    <div className="text-center space-y-4">
      <Calculator className="mx-auto text-green-600" size={48} />
      <h2 className="text-3xl font-bold text-green-800">BMI Calculator</h2>
      <p className="text-gray-600">Let's start with your basic measurements</p>
    </div>
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
      {/* Units Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-full p-1 flex items-center space-x-1">
          <button
            onClick={() => {
              setUnits('metric');
              setFormData(prev => ({ ...prev, height: '', weight: '' }));
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              units === 'metric'
                ? 'bg-white shadow-md text-green-700 font-semibold'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg">🇬🇧</span>
            <span>Metric</span>
          </button>
          <button
            onClick={() => {
              setUnits('imperial');
              setFormData(prev => ({ ...prev, height: '', weight: '' }));
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              units === 'imperial'
                ? 'bg-white shadow-md text-green-700 font-semibold'
                : 'text-gray-600'
            }`}
          >
            <span className="text-lg">🇺🇸</span>
            <span>Imperial</span>
          </button>
        </div>
      </div>
      {/* Gender */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-700">Gender</label>
        <div className="flex space-x-4 text-gray-600">
          {['male', 'female'].map(gender => (
            <button
              key={gender}
              onClick={() => setFormData(prev => ({ ...prev, gender }))}
              className={`flex-1 py-3 px-6 rounded-xl border-2 font-medium capitalize transition-all ${
                formData.gender === gender
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <User className="inline mr-2" size={18} />
              {gender}
            </button>
          ))}
        </div>
      </div>
      {/* Age */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-700">Age (years)</label>
        <input
          type="number"
          value={formData.age}
          onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
          className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg text-gray-900 placeholder-gray-500"
          placeholder="Enter your age"
        />
      </div>
      {/* Height */}
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-gray-700">
          Height ({units === 'metric' ? 'cm' : 'inches'})
        </label>
        <input
          type="number"
          value={formData.height}
          onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
          className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg text-gray-900 placeholder-gray-500"
          placeholder={units === 'metric' ? 'Enter height in cm' : 'Enter height in inches'}
        />
      </div>
      {/* Weight */}
      <div className="space-y-3">
        <label className="text-lg font-semibold text-gray-700">
          Weight ({units === 'metric' ? 'kg' : 'lbs'})
        </label>
        <input
          type="number"
          value={formData.weight}
          onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
          className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg text-gray-900 placeholder-gray-500"
          placeholder={units === 'metric' ? 'Enter weight in kg' : 'Enter weight in lbs'}
        />
      </div>
    </div>
    <button
      onClick={onNext}
      disabled={!formData.gender || !formData.age || !formData.height || !formData.weight}
      className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
    >
      <span>Next Step</span>
      <ChevronRight size={20} />
    </button>
  </div>
);

// Calorie Step
const CalorieStep = ({ formData, setFormData, onNext }) => (
  <div className="max-w-2xl mx-auto space-y-8">
    <div className="text-center space-y-4">
      <Target className="mx-auto text-emerald-600" size={48} />
      <h2 className="text-3xl font-bold text-green-800">Let's get to know your body a bit more…</h2>
      <p className="text-gray-600">This helps us calculate your daily calorie needs</p>
    </div>
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
      {/* Goal */}
      <div className="space-y-4">
        <label className="text-lg font-semibold text-gray-700 flex items-center">
          <Target className="mr-2" size={20} /> What's your goal?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-600">
          {[
            { key: 'lose', label: 'Lose Weight', icon: '📉' },
            { key: 'maintain', label: 'Maintain Weight', icon: '⚖️' },
            { key: 'gain', label: 'Gain Weight', icon: '📈' }
          ].map(goal => (
            <button
              key={goal.key}
              onClick={() => setFormData(prev => ({ ...prev, goal: goal.key }))}
              className={`py-4 px-4 rounded-xl border-2 font-medium transition-all text-center ${
                formData.goal === goal.key
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-2xl mb-2">{goal.icon}</div>
              {goal.label}
            </button>
          ))}
        </div>
      </div>
      {/* Activity */}
      <div className="space-y-4">
        <label className="text-lg font-semibold text-gray-700 flex items-center">
          <Activity className="mr-2" size={20} /> What's your daily activity level?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-green-600">
          {[
            { key: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
            { key: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
            { key: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
            { key: 'active', label: 'Very Active', desc: 'Heavy exercise 6-7 days/week' }
          ].map(activity => (
            <button
              key={activity.key}
              onClick={() => setFormData(prev => ({ ...prev, activityLevel: activity.key }))}
              className={`py-4 px-4 rounded-xl border-2 font-medium transition-all text-left ${
                formData.activityLevel === activity.key
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="font-semibold">{activity.label}</div>
              <div className="text-sm text-gray-600">{activity.desc}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Sleep */}
      <div className="space-y-4">
        <label className="text-lg font-semibold text-gray-700 flex items-center">
          <Moon className="mr-2" size={20} /> How many hours of sleep do you get?
        </label>
        <div className="grid grid-cols-3 gap-3 text-gray-400">
          {['4-5 hours', '6-7 hours', '8+ hours'].map(sleep => (
            <button
              key={sleep}
              onClick={() => setFormData(prev => ({ ...prev, sleepHours: sleep }))}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                formData.sleepHours === sleep
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              {sleep}
            </button>
          ))}
        </div>
      </div>
      {/* Health Conditions */}
      <div className="space-y-3">
        <label className="text-lg font-semibold text-gray-700 flex items-center">
          <Heart className="mr-2" size={20} /> Any health conditions? (Optional)
        </label>
        <input
          type="text"
          value={formData.healthConditions}
          onChange={e => setFormData(prev => ({ ...prev, healthConditions: e.target.value }))}
          className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-gray-900 placeholder-gray-500"
          placeholder="e.g., Diabetes, High blood pressure..."
        />
      </div>
      {/* Dietary Restrictions */}
      <div className="space-y-4">
        <label className="text-lg font-semibold text-gray-700 flex items-center">
          <Utensils className="mr-2" size={20} /> Dietary restrictions/preferences?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-gray-400">
          {['Vegan', 'Vegetarian', 'Gluten-free', 'None'].map(diet => (
            <button
              key={diet}
              onClick={() => setFormData(prev => ({ ...prev, dietaryRestrictions: diet }))}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                formData.dietaryRestrictions === diet
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>
    </div>
    <button
      onClick={onNext}
      disabled={!formData.goal || !formData.activityLevel || !formData.sleepHours || !formData.dietaryRestrictions}
      className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
    >
      <span>See Results</span>
      <ChevronRight size={20} />
    </button>
  </div>
);

// Results Step
const ResultsStep = ({ results, formData, navigate }) => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="text-center space-y-4">
      <div className="text-6xl">📊</div>
      <h2 className="text-3xl font-bold text-green-800">Your Personalized Results</h2>
      <p className="text-gray-600">Here's what we calculated based on your information</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* BMI Results */}
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🧍</div>
          <h3 className="text-2xl font-bold text-green-800">Your BMI</h3>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-green-600">{results.bmi}</div>
            <div className={`text-lg font-semibold px-4 py-2 rounded-full inline-block ${
              results.bmiCategory === 'Normal Weight' ? 'bg-green-100 text-green-700' :
              results.bmiCategory === 'Underweight' ? 'bg-blue-100 text-blue-700' :
              results.bmiCategory === 'Overweight' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {results.bmiCategory}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {results.bmiCategory === 'Normal Weight' && "Great! You're in the healthy weight range."}
            {results.bmiCategory === 'Underweight' && "Consider consulting with our Dietitian for healthy weight gain."}
            {results.bmiCategory === 'Overweight' && "A personalized plan can help you reach your ideal weight."}
            {results.bmiCategory === 'Obese' && "Let's work together on a safe, effective weight management plan."}
          </p>
        </div>
      </div>
      {/* Calorie Results */}
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔥</div>
          <h3 className="text-2xl font-bold text-emerald-800">Daily Calorie Needs</h3>
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{results.tdee}</div>
              <div className="text-sm text-gray-600">calories per day</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-gray-700">Recommended Macros:</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-bold text-green-600">{results.macros.protein}g</div>
                  <div className="text-xs text-gray-600">Protein</div>
                </div>
                <div>
                  <div className="font-bold text-emerald-600">{results.macros.carbs}g</div>
                  <div className="text-xs text-gray-600">Carbs</div>
                </div>
                <div>
                  <div className="font-bold text-green-700">{results.macros.fats}g</div>
                  <div className="text-xs text-gray-600">Fats</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* CTA */}
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center space-y-6">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-green-800">Ready for Your Personal Plan?</h3>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          📊 <em>This is a general guide based on standard calculations.</em> For a tailored nutrition plan that considers your unique needs, health conditions, and preferences, book a consultation with our expert Dietitians.
        </p>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => navigate('/contactUs', {
            state: {
              userResults: {
                bmi: results.bmi,
                bmiCategory: results.bmiCategory,
                dailyCalories: results.tdee,
                goal: formData.goal,
                dietaryRestrictions: formData.dietaryRestrictions,
                macros: results.macros,
                activityLevel: formData.activityLevel,
                sleepHours: formData.sleepHours,
                healthConditions: formData.healthConditions
              }
            }
          })}
          className="px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2 mx-auto text-lg"
        >
          <BookOpen size={24} />
          <span>Book a Consultation →</span>
        </button>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Expert Dietitians</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Personalized Plans</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span>Ongoing Support</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
function ResourcesFlow() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
    activityLevel: '',
    sleepHours: '',
    healthConditions: '',
    dietaryRestrictions: ''
  });
  const [units, setUnits] = useState('metric');
  const [results, setResults] = useState({
    bmi: 0,
    bmiCategory: '',
    bmr: 0,
    tdee: 0,
    macros: { protein: 0, carbs: 0, fats: 0 }
  });

  // Calculate BMI
  const calculateBMI = () => {
    let heightInM, weightKg;
    if (units === 'metric') {
      heightInM = parseFloat(formData.height) / 100;
      weightKg = parseFloat(formData.weight);
    } else {
      heightInM = parseFloat(formData.height) * 0.0254;
      weightKg = parseFloat(formData.weight) * 0.453592;
    }
    const bmi = weightKg / (heightInM * heightInM);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal Weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    return { bmi: Math.round(bmi * 10) / 10, bmiCategory: category };
  };

  // Calculate Calories
  const calculateCalories = () => {
    let weight, height;
    if (units === 'metric') {
      weight = parseFloat(formData.weight);
      height = parseFloat(formData.height);
    } else {
      weight = parseFloat(formData.weight) * 0.453592;
      height = parseFloat(formData.height) * 2.54;
    }
    const age = parseFloat(formData.age);
    const genderFactor = formData.gender === 'male' ? 5 : -161;
    const bmr = 10 * weight + 6.25 * height - 5 * age + genderFactor;
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };
    const tdee = bmr * (activityMultipliers[formData.activityLevel] || 1.2);
    let goalCalories = tdee;
    if (formData.goal === 'lose') goalCalories = tdee - 500;
    else if (formData.goal === 'gain') goalCalories = tdee + 500;
    const macros = {
      protein: Math.round((goalCalories * 0.3) / 4),
      carbs: Math.round((goalCalories * 0.4) / 4),
      fats: Math.round((goalCalories * 0.3) / 9)
    };
    return { bmr: Math.round(bmr), tdee: Math.round(goalCalories), macros };
  };

  // Next Step Logic
  const handleNext = () => {
    if (step === 1) {
      const bmiResults = calculateBMI();
      setResults(prev => ({ ...prev, ...bmiResults }));
    } else if (step === 2) {
      const calorieResults = calculateCalories();
      setResults(prev => ({ ...prev, ...calorieResults }));
    }
    setStep(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <ProgressBar step={step} />
        {step === 0 && <WelcomeStep onNext={handleNext} />}
        {step === 1 && (
          <BMIStep
            formData={formData}
            setFormData={setFormData}
            units={units}
            setUnits={setUnits}
            onNext={handleNext}
          />
        )}
        {step === 2 && (
          <CalorieStep
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
          />
        )}
        {step === 3 && (
          <ResultsStep
            results={results}
            formData={formData}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

export default ResourcesFlow;
