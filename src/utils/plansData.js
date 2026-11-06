import B2B from '../assets/images/B2B.webp';
import Gain from '../assets/images/Gain.webp';
import Weightloss from '../assets/images/Weightloss.webp';
import Diabetes from '../assets/images/Diabetes.webp';
import Pressure from '../assets/images/Pressure.webp';
import FastingFood from '../assets/images/FastingFood.webp';

// Preview page exclusive cover images (from downloads)
import B2BCover from '../assets/plan-previews/back-to-basics-cover.webp';
import SnatchedCover from '../assets/plan-previews/snatched-nourished-cover.webp';
import DiabetesCover from '../assets/plan-previews/blood-sugar-balance-cover.webp';
import PressureCover from '../assets/plan-previews/pressure-no-dey-catch-me-cover.webp';
import GainCover from '../assets/plan-previews/weight-gain-cover.webp';
import FastingCover from '../assets/plan-previews/fasting-and-food-cover.webp';

// Sample preview screenshots extracted from plan PDFs
import B2BPreview1 from '../assets/plan-previews/back-to-basics-preview-1.webp';
import B2BPreview2 from '../assets/plan-previews/back-to-basics-preview-2.webp';
import SnatchedPreview1 from '../assets/plan-previews/snatched-nourished-preview-1.webp';
import SnatchedPreview2 from '../assets/plan-previews/snatched-nourished-preview-2.webp';
import DiabetesPreview1 from '../assets/plan-previews/blood-sugar-balance-preview-1.webp';
import DiabetesPreview2 from '../assets/plan-previews/blood-sugar-balance-preview-2.webp';
import PressurePreview1 from '../assets/plan-previews/pressure-no-dey-catch-me-preview-1.webp';
import PressurePreview2 from '../assets/plan-previews/pressure-no-dey-catch-me-preview-2.webp';
import GainPreview1 from '../assets/plan-previews/weight-gain-preview-1.webp';
import GainPreview2 from '../assets/plan-previews/weight-gain-preview-2.webp';
import FastingPreview1 from '../assets/plan-previews/fasting-and-food-preview-1.webp';
import FastingPreview2 from '../assets/plan-previews/fasting-and-food-preview-2.webp';

export const plans = [
  {
    id: 'fasting-guide',
    title: 'Fasting Guide',
    Subtitle: 'How To Eat Before, During & After a Fast',
    price: '₵99',
    Url: "https://paystack.com/buy/fasting-guide",
    img: FastingFood,
    previewCover: FastingCover,
    coverAspect: 'aspect-[1/1.414]',
    features: [
      'Pre-fast fueling & hydration',
      'Safe break-fast meal protocols',
      'Special notes for diabetics & checklist'
    ],
    tags: ['Fasting', 'Intermittent Fasting', 'Ramadan', 'Daniel Fast', 'Prayer Fasting', 'Nutrition Guide', 'Ghanaian Food'],
    gradient: 'from-amber-500 to-orange-500',
    isNew: true,
    synopsis: "Fasting changes when you eat, but your body never stops needing essential protein, carbohydrates, and minerals. The Fasting Guide is an evidence-based, practical guide by Diet with Dee created to end the exhausting cycle of pre-fast overeating and post-fast digestive agony. Whether you practice intermittent fasting, observe Ramadan, or participate in Christian church prayer fasts, learn how to prepare your body, stay energized throughout the day, rehydrate safely, and enjoy nourishing Ghanaian meals without bloating or glucose crashes.",
    whoIsItFor: [
      "Anyone practicing intermittent fasting (16:8, OMAD, or flexible windows)",
      "Muslims observing Ramadan or voluntary weekly fasts",
      "Christians participating in daytime prayer fasts or Daniel fasts",
      "Anyone struggling with fatigue, severe cravings, or overeating when breaking a fast",
      "Individuals with diabetes who need practical medical precautions around fasting"
    ],
    whatYouGet: [
      "18-Page comprehensive Dietitian-formulated digital guidebook (PDF)",
      "Balanced Pre-Fast meal structures for steady, slow-burning energy",
      "The 3-Step Break-Fast Protocol to ease digestive transition smoothly",
      "Local Ghanaian meal ideas (Banku with fish, waakye, boiled yam with kontomire, fufu with light soup)",
      "Diabetic Fasting Safety Protocol with clinical caution guidelines",
      "The 9-point Pre-Fast and Post-Fast printable evaluation checklist"
    ],
    previewScreenshots: [
      {
        src: FastingPreview1,
        title: "What to Eat Before a Fast",
        caption: "Practical pre-fast meal planning with slow-digesting carbohydrates, lean proteins, and strategic hydration."
      },
      {
        src: FastingPreview2,
        title: "Breaking Your Fast & 3-Step Protocol",
        caption: "Clear guidelines on rehydrating, portion pacing, and balanced Ghanaian meal examples to prevent post-fast bloat."
      }
    ]
  },
  {
    id: 'back-to-basics',
    title: 'Back to Basics',
    Subtitle: 'A 5-Day Healthy Eating Reset',
    price: '₵349',
    Url: "https://paystack.com/buy/back-to-basics",
    img: B2B,
    previewCover: B2BCover,
    features: [
      '5-Day Custom Meal Plan',
      'Grocery List & Prep Guide',
      'Perfect for busy professionals, healthy eating beginners.'
    ],
    tags: ['Reset', 'Beginners', 'Healthy Eating', 'Detox', 'Meal Prep', 'Clean Eating', 'Nutrition Reset'],
    gradient: 'from-orange-400 to-orange-500',
    isPopular: true,
    synopsis: "Welcome to Back to Basics, your 5-day reset designed to help you reconnect with food in a way that feels calm, nourishing, and sustainable. No starvation, no complicated detoxes—just real, nutrient-dense local meals, structured portion guides, and simple habits that reset digestion, reduce cravings, and teach proper portion control.",
    whoIsItFor: [
      "Busy professionals looking for a simple, structured routine",
      "Anyone feeling bloated, sluggish, or stuck in unhealthy eating habits",
      "Healthy eating beginners who want guidance with local Ghanaian foods",
      "People wanting to reset without starving or doing extreme juice fasts"
    ],
    whatYouGet: [
      "5-Day structured daily breakfast, lunch, and supper menu",
      "Portion Reference Guide for carbs, proteins, and veggies",
      "Complete grocery shopping checklist and weekend prep guide",
      "Daily morning reset and hydration wellness guide"
    ],
    previewScreenshots: [
      {
        src: B2BPreview1,
        title: "Portion & Meal Structure Guide",
        caption: "Clear portion visualizer showing balanced ratios for carbs, lean proteins, and vegetables."
      },
      {
        src: B2BPreview2,
        title: "Day 1 Complete Meal Schedule",
        caption: "Full breakdown of morning reset drink, energizing breakfast, balanced lunch, and light supper."
      }
    ]
  },
  {
    id: 'snatched-nourished',
    title: 'Snatched & Nourished',
    Subtitle: 'Gentle Weight Loss Guide',
    price: '₵249',
    Url: "https://paystack.com/buy/snatched-and-nourished",
    img: Weightloss,
    previewCover: SnatchedCover,
    features: [
      'Balanced Meal Plan',
      'Workout & Nutrition Sync',
      'Self-guided tools'
    ],
    tags: ['Weight Loss', 'Fat Loss', 'Slimming', 'Nourished', 'Body Transformation', 'Toning', 'Calorie Deficit'],
    gradient: 'from-orange-400 to-orange-500',
    synopsis: "You don't lose weight by punishing your body; you lose weight by working with it. Snatched & Nourished is a gentle, realistic weight loss roadmap designed specifically for Ghanaian lifestyles. Featuring Dee's signature 3-menu system, it lets you choose between reduced-carb balanced eating, 16:8 intermittent fasting, or flexible meal rotation—all paired with coach-approved, no-equipment home workouts.",
    whoIsItFor: [
      "Anyone tired of restrictive crash diets that cause immediate weight rebound",
      "Individuals wanting fat loss while still enjoying local staple foods",
      "Those who prefer flexible meal systems rather than rigid, stressful rules",
      "Anyone looking for home-friendly workout routines that sync with nutrition"
    ],
    whatYouGet: [
      "The 3-Menu System (Reduced-Carb, 16:8 Intermittent Fasting, and Flexible)",
      "Swap guides for satisfying local Ghanaian lunches and suppers",
      "Coach-approved 30-minute home workout plans (no equipment needed)",
      "Organized shopping lists and progress tracking benchmarks"
    ],
    previewScreenshots: [
      {
        src: SnatchedPreview1,
        title: "The 3-Menu System Breakdown",
        caption: "Detailed meal options for lunch and supper tailored for sustainable calorie deficit."
      },
      {
        src: SnatchedPreview2,
        title: "Comprehensive Shopping Guide",
        caption: "Practical grocery lists featuring budget-friendly Ghanaian market ingredients."
      }
    ]
  },
  {
    id: 'blood-sugar-balance',
    title: 'Blood Sugar Balance',
    Subtitle: 'A Type 2 Diabetes-Friendly Guide',
    price: '₵299',
    Url: "https://paystack.com/buy/blood-sugar-balance-plan",
    img: Diabetes,
    previewCover: DiabetesCover,
    features: [
      'Easy to follow meal plan',
      'Healthy Lifestyle Tips',
      'Use with OnTrack App for best results',
    ],
    tags: ['Diabetes', 'Type 2 Diabetes', 'Blood Sugar', 'Insulin Resistance', 'Low Glycemic', 'Pre-diabetes', 'Glucose Balance'],
    gradient: 'from-orange-400 to-orange-500',
    synopsis: "Managing blood sugar is a daily practice, not about perfection. Created by a registered dietitian, Blood Sugar Balance provides clinical yet easy-to-follow meal planning for individuals managing Type 2 diabetes or pre-diabetes. Master the half-plate method, discover which local staples stabilize glucose, identify sneaky hidden sugars, and seamlessly track your readings with the OnTrack App.",
    whoIsItFor: [
      "Individuals diagnosed with Type 2 diabetes or pre-diabetes",
      "Anyone struggling with post-meal fatigue, sugar spikes, or extreme cravings",
      "Caregivers cooking for family members managing blood sugar",
      "Anyone wanting a science-backed plate method using familiar Ghanaian foods"
    ],
    whatYouGet: [
      "Dietitian-formulated blood sugar stabilization meal plan",
      "Visual 1/2 Plate Method for daily portion balancing",
      "Low Glycemic Index cheat sheet for local Ghanaian foods & fruits",
      "Label-reading warning guide to spot hidden sugars on store shelves",
      "Daily and weekly blood sugar tracking templates + OnTrack App integration"
    ],
    previewScreenshots: [
      {
        src: DiabetesPreview1,
        title: "Diabetes-Friendly Daily Meal Plan",
        caption: "Step-by-step plate method applied to local breakfast, lunch, and supper meals."
      },
      {
        src: DiabetesPreview2,
        title: "Low Glycemic Local Foods Guide",
        caption: "Practical guide to carbohydrates, tubers, and fruits that digest slowly without spikes."
      }
    ]
  },
  {
    id: 'pressure-no-dey-catch-me',
    title: 'Pressure No Dey Catch Me',
    Subtitle: 'A Hypertension-Friendly Plan',
    price: '₵299',
    Url: "https://paystack.com/buy/pressure-no-dey",
    img: Pressure,
    previewCover: PressureCover,
    features: [
      'Heart-Smart Meal Plan',
      'Blood Pressure-Friendly Habits',
      'Track & Tweak Toolkit',
    ],
    tags: ['Hypertension', 'Blood Pressure', 'Heart Health', 'Low Sodium', 'Cardio Health', 'DASH Diet'],
    gradient: 'from-orange-400 to-orange-500',
    synopsis: "High blood pressure can be controlled with the right daily choices. Pressure No Dey Catch Me is a practical, heart-smart lifestyle and meal guide designed to lower sodium, boost potassium, and protect your cardiovascular health without stripping Ghanaian food of its rich taste and warmth. Includes salt-smart seasoning tips, hidden sodium warnings, and a track & tweak toolkit.",
    whoIsItFor: [
      "Anyone managing elevated blood pressure or hypertension",
      "People wanting to reduce sodium intake without eating bland, tasteless meals",
      "Individuals with a family history of cardiovascular concerns",
      "Anyone who wants to learn heart-protective seasoning and cooking methods"
    ],
    whatYouGet: [
      "Heart-smart, low-sodium meal plans featuring local ingredients",
      "Flavor-first seasoning alternatives to bouillon cubes and heavy salts",
      "Hidden sodium warning checklist for processed and canned foods",
      "Weekly heart-boosting mineral additions and lifestyle habit tracker"
    ],
    previewScreenshots: [
      {
        src: PressurePreview1,
        title: "Heart-Smart Meal Plan",
        caption: "Carefully balanced meals high in potassium and fiber to naturally support healthy arterial pressure."
      },
      {
        src: PressurePreview2,
        title: "Salt-Smart Cooking & Flavor Guide",
        caption: "Natural Ghanaian herbs and spices to elevate flavor without relying on excess sodium."
      }
    ]
  },
  {
    id: 'weight-gain',
    title: 'The Weight Gain',
    Subtitle: 'Wahala-Free Plan',
    price: '₵249',
    Url: "https://paystack.com/buy/the-weight-gain",
    img: Gain,
    previewCover: GainCover,
    features: [
      'High-calorie meal plan',
      'Snack list',
      'Progress-monitoring tools',
    ],
    tags: ['Weight Gain', 'Muscle Gain', 'High Calorie', 'Bulking', 'Underweight', 'Healthy Mass'],
    gradient: 'from-orange-400 to-orange-500',
    synopsis: "Healthy weight gain takes strategy, consistency, and nutrient density—not just eating junk food that leaves you bloated. The Wahala-Free Weight Gain Plan shows you how to increase caloric intake without forcing massive plate volumes that make you feel sick. Learn smart calorie-density tricks, nutrient-packed smoothies, snack schedules, and weekly weight monitoring.",
    whoIsItFor: [
      "Individuals who struggle to gain weight or maintain a healthy BMI",
      "People with low appetite who get full quickly from large portions",
      "Those recovering from illness or wanting to build healthy mass and curves",
      "Anyone wanting nutrient-dense high-calorie meals without unhealthy fats"
    ],
    whatYouGet: [
      "Structured high-calorie daily meal plan and expanded options",
      "Nutrient-dense calorie booster strategies (maximum calories, minimal bloat)",
      "High-protein and nutrient-rich snack list for busy days",
      "Weekly progress monitoring chart and weight tracking guidelines"
    ],
    previewScreenshots: [
      {
        src: GainPreview1,
        title: "High-Calorie Structured Meal Plan",
        caption: "Nourishing, portion-friendly meals designed to steadily increase daily caloric intake."
      },
      {
        src: GainPreview2,
        title: "Nutrient-Dense Booster Guide",
        caption: "Smart calorie-stacking methods to add 500+ extra calories daily without overwhelming digestion."
      }
    ]
  }
];
