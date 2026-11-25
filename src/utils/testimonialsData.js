import B2B from '../assets/images/B2B.webp';
import Gain from '../assets/images/Gain.webp';
import Weightloss from '../assets/images/Weightloss.webp';
import Diabetes from '../assets/images/Diabetes.webp';
import Pressure from '../assets/images/Pressure.webp';

export const DEFAULT_TESTIMONIALS = [
  {
    id: 'default-1',
    name: 'Michael Asare',
    img: Gain,
    content:
      "Nana Ama's Weight Gain guide helped me go from 56kg to 78kg in just 5 months. Before that her 5 week follow up period psyched my mind for the task ahead. Her encouragement, step-by-step approach, and constant motivation made all the difference. I feel healthier, more confident, and energized than ever before. I couldn't have done it without her support.",
    rating: 5,
    stars: 5,
    profession: 'Structural Engineer',
    planId: 'weight-gain',
    plan: 'The Weight Gain',
    location: 'Accra, Ghana'
  },
  {
    id: 'default-2',
    name: 'Grace Blankson',
    img: Pressure,
    content:
      "I've struggled with hypertension for well over 2 years. Thanks to Dee's Pressure No Dey Catch Me Plan, I now have a trusted source of meals that actually work for me. Her warm demeanor and constant willingness to listen made all the difference. I definitely recommend her to anyone managing hypertension.",
    rating: 5,
    stars: 5,
    profession: 'Retail Trader',
    planId: 'pressure-no-dey-catch-me',
    plan: 'Pressure No Dey Catch Me',
    location: 'Takoradi, Ghana'
  },
  {
    id: 'default-3',
    name: 'Kobby Breeze',
    img: Diabetes,
    content:
      'When I was diagnosed with diabetes in October 2024, it felt like a death sentence. I was scared and overwhelmed. But with the guidance of my Doctor and my Dietician, Nana Ama Dwamena, I learned that with the right lifestyle changes, exercise and a proper diet, I could live a normal life. For six weeks, I committed to the plan, not just for myself, but for my daughter Nicole. Through the Blood Sugar Balancing plan, today, I feel healthier, stronger, and more hopeful than ever. Glory be to God!',
    rating: 5,
    stars: 5,
    profession: 'Software Developer',
    planId: 'blood-sugar-balance',
    plan: 'Blood Sugar Balance',
    location: 'Accra, Ghana'
  },
  {
    id: 'default-4',
    name: 'Lawrencia Kwakye',
    img: B2B,
    content:
      "Before I started Diet with Dee's 5-Day Reset, my body felt totally out of sync and sluggish. Seriously, I was dragging myself through the day! But after just five days, it's like my body hit the reset button – pun totally intended. My system feels cleaner, and I'm pretty sure my skin is glowing. Dee, you've worked some kind of magic! This isn't just a diet; it's a total life upgrade.",
    rating: 5,
    stars: 5,
    profession: 'High School Teacher',
    planId: 'back-to-basics',
    plan: 'Back to Basics',
    location: 'Accra, Ghana'
  },
  {
    id: 'default-5',
    name: 'Richard Oti',
    img: Weightloss,
    content:
      "This was my very first encounter with a dietitian, and the objective of my visit was to lose weight. I must say, the results over the past few weeks have been amazing! She gave me a personalized meal plan with familiar foods that are protein-rich, low in carbs, and full of healthy fats. Since following it, my digestion has improved, my bloating has reduced, I wake up more energized, and I've been able to cut out late-night snacking and junk food. I feel healthier and more active than ever!",
    rating: 5,
    stars: 5,
    profession: 'Senior Accountant',
    planId: 'snatched-nourished',
    plan: 'Snatched & Nourished',
    location: 'Tema, Ghana'
  }
];
