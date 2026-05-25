import B2B from '../assets/images/B2B.webp';
import Gain from '../assets/images/Gain.webp';
import Weightloss from '../assets/images/Weightloss.webp';
import Diabetes from '../assets/images/Diabetes.webp';
import Pressure from '../assets/images/Pressure.webp';

export const plans = [
  {
    id: 'back-to-basics',
    title: 'Back to Basics',
    Subtitle: 'A 5-Day Healthy Eating Reset',
    price: '₵349',
    Url: "https://paystack.com/buy/back-to-basics",
    img: B2B,
    features: [
      '5-Day Custom Meal Plan',
      'Grocery List & Prep Guide',
      'Perfect for busy professionals, healthy eating beginners.'
    ],
    gradient: 'from-orange-400 to-orange-500',
    isPopular: true,
  },
  {
    id: 'snatched-nourished',
    title: 'Snatched & Nourished',
    Subtitle: 'Gentle Weight Loss Guide',
    price: '₵249',
    Url: "https://paystack.com/buy/snatched-and-nourished",
    img: Weightloss,
    features: [
      'Balanced Meal Plan',
      'Workout & Nutrition Sync',
      'Self-guided tools'
    ],
    gradient: 'from-orange-400 to-orange-500',
  },
  {
    id: 'blood-sugar-balance',
    title: 'Blood Sugar Balance',
    Subtitle: 'A Type 2 Diabetes-Friendly Guide',
    price: '₵299',
    Url: "https://paystack.com/buy/blood-sugar-balance-plan",
    img: Diabetes,
    features: [
      'Easy to follow meal plan',
      'Healthy Lifestyle Tips',
      'Blood Sugar Tracker',
    ],
    gradient: 'from-orange-400 to-orange-500',
  },
  {
    id: 'pressure-no-dey-catch-me',
    title: 'Pressure No Dey Catch Me',
    Subtitle: 'A Hypertension-Friendly Plan',
    price: '₵299',
    Url: "https://paystack.com/buy/pressure-no-dey",
    img: Pressure,
    features: [
      'Heart-Smart Meal Plan',
      'Blood Pressure-Friendly Habits',
      'Track & Tweak Toolkit',
    ],
    gradient: 'from-orange-400 to-orange-500',
  },
  {
    id: 'weight-gain',
    title: 'The Weight Gain',
    Subtitle: 'Wahala-Free Plan',
    price: '₵249',
    Url: "https://paystack.com/buy/the-weight-gain",
    img: Gain,
    features: [
      'High-calorie meal plan',
      'Snack list',
      'Progress-monitoring tools',
    ],
    gradient: 'from-orange-400 to-orange-500',
  }
];
