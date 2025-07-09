import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlanImg from '../../assets/Salad.png'; // you can replace this with actual plan images

function Plans() {
  const navigate = useNavigate();

  const plans = [
    {
      title: 'Weight Loss Plan',
      price: '₵99/mo',
      features: [
        'Custom Meal Plans',
        'Weekly Progress Check-ins',
        'Healthy Recipes',
        'Email Support'
      ],
      gradient: 'from-orange-400 to-orange-500',
    },
    {
      title: 'Fitness & Muscle Gain',
      price: '₵120/mo',
      features: [
        'High Protein Meals',
        'Workout-Food Sync',
        'Progressive Nutrition Plan',
        '1-on-1 Support'
      ],
      gradient: 'from-[#206935] to-[#206935]',
    },
    {
      title: 'Medical Nutrition Therapy',
      price: '₵150/mo',
      features: [
        'Condition-Specific Diets',
        'Consultations with Dietitian',
        'Lifestyle Adjustments',
        'Progress Monitoring'
      ],
      gradient: 'from-[#ABB988] to-[#ABB988]',
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-6 lg:px-12'>
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
            className={`bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-1 p-6 relative border-l-4 `}
          >
            <div
              className={`w-full h-44 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mb-6`}
            >
              <img src={PlanImg} alt={plan.title} className='h-28 object-contain' />
            </div>

            <h3 className='text-2xl font-bold text-green-700 mb-2'>{plan.title}</h3>
            <p className='text-xl font-semibold text-gray-600 mb-4'>{plan.price}</p>

            <ul className='space-y-2 text-gray-700 text-sm mb-6'>
              {plan.features.map((feature, idx) => (
                <li key={idx} className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-300 rounded-full'></div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/diet-app/knowYourBody')}
              className={`w-full px-6 py-3 bg-gradient-to-r ${plan.gradient} text-white font-bold rounded-full transition-all hover:shadow-lg`}
            >
              Get Started
            </button>
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
            500+ Success Stories
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
