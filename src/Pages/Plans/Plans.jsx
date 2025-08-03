import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlanImg from '../../assets/Salad.png'; // you can replace this with actual plan images
import B2B from '../../assets/images/B2B.png'; // example image for Back to Basics plan
import Gain from '../../assets/images/Gain.png'; // example image for Weight Gain plan
import Weightloss from '../../assets/images/WeightLoss.png'; // example image for Weight Loss plan
import Diabetes from '../../assets/images/Diabetes.png'; // example image for Diabetes plan
import Pressure from '../../assets/images/Pressure.png'; // example image for Hypertension plan

function Plans() {
  const navigate = useNavigate();

  const plans = [
    {
      title: 'Back to Basics',
      Subtitle: 'A 5-Day Healthy Eating Reset',
      price: '₵349',
      Url: "https://paystack.com/buy/back-to-basics-cvcqbb",
      img: B2B,
      features: [
        '5-Day Custom Meal Plan',
        'Grocery List & Prep Guide',
        'Perfect for busy professionals, healthy eating beginners.'

      ],
      gradient: 'from-orange-400 to-orange-500',
    },
    {
      title: 'Snatched & Nourised',
      Subtitle: 'Gentle Weight Loss Guide',
      price: '₵249',
      Url:"https://paystack.com/buy/snatched-and-nourished-npenal",
      img: Weightloss, 
      features: [
        'Balanced Meal Plan',
        'Workout & Nutrition Sync',
        'Self-guided tools'
      ],
      gradient: 'from-orange-400 to-orange-500',
    },
    {
      title: 'Blood Sugar Balance',
      Subtitle: 'A Type 2 Diabetes-Friendly Guide',
      price: '₵299',
      Url: " https://paystack.com/buy/blood-sugar-balance-usamxw",
      img: Diabetes, 
      features: [
        'Easy to follow meal plan',
        'Healthy Lifestyle Tips',
        'Blood Sugar Tracker',
      ],
      gradient: 'from-orange-400 to-orange-500',
    },
    {
      title: 'Pressure No Dey Catch Me',
      Subtitle: 'A Hypertension-Friendly Plan',
      price: '₵299',
      Url: "https://paystack.com/buy/pressure-no-dey-catch-me-nbkexo",
      img: Pressure, 
      features: [
        'Heart-Smart Meal Plan',
        'Blood Pressure-Friendly Habits',
        'Track & Tweak Toolkit',
      ],
      gradient: 'from-orange-400 to-orange-500',
    },
    {
      title: 'The Weight Gain',
      Subtitle: 'Wahala-Free Plan',
      price: '₵249',
      Url: " https://paystack.com/buy/the-weight-gain-focost",
      img: Gain, 
      features: [
        'High-calorie meal plan',
        'Snack list',
        'Progress-monitoring tools',
      ],
      gradient: 'from-orange-400 to-orange-500',
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-6 lg:px-12'>
      <div className='text-center space-y-4 max-w-3xl mx-auto mb-12'>
        <h1 className='text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600'>
          Choose Your Plan
        </h1>
        <p className='text-gray-700 text-lg'>
          Tailored nutrition solutions for every lifestyle and goal. Pick a plan and begin your transformation.
        </p>
        <div className='w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full'></div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1 p-6 relative border-l-4 border-l-green-100`}
          >
            <div
              className={`w-full h-44 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mb-6`}
            >
              <img src={plan.img} alt={plan.title} className='h-auto object-contain rounded-2xl' />
            </div>

            <h3 className='text-2xl font-bold text-green-700 mb-2'>{plan.title}</h3>
            <h2 className='text-sm font-bold text-black mb-3'>{plan.Subtitle}</h2>
            <p className='text-xl font-semibold text-gray-600 mb-4'>{plan.price}</p>

            <ul className='space-y-2 text-gray-700 text-sm mb-6'>
              {plan.features.map((feature, idx) => (
                <li key={idx} className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-300 rounded-full'></div>
                  {feature}
                </li>
              ))}
            </ul>
            <a href={plan.Url}>
            <button
              className={`w-full px-6 py-3 bg-gradient-to-r ${plan.gradient} text-white font-bold rounded-full transition-all hover:shadow-lg`}
            >
              Buy Now
            </button>
            </a>
          </div>
        ))}
      </div>

      {/* Trust Indicator Section */}
      <div className='mt-20 text-center space-y-4'>
        <h2 className='text-3xl font-bold text-green-700'>Why Choose DietWithDee?</h2>
        <div className='flex justify-center flex-wrap gap-8 mt-6 text-gray-700 font-medium'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-green-500 rounded-full'></div>
            Certified Experts
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-emerald-500 rounded-full'></div>
            300+ Success Stories
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-green-400 rounded-full'></div>
            Custom Nutrition Plans
          </div>
        </div>
      </div>
    </div>
  );
}

export default Plans;
