import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlanImg from '../../assets/Salad.png'; // you can replace this with actual plan images
import B2B from '../../assets/images/B2B.png'; // example image for Back to Basics plan
import Gain from '../../assets/images/Gain.png'; // example image for Weight Gain plan
import Weightloss from '../../assets/images/WeightLoss.png'; // example image for Weight Loss plan
import Diabetes from '../../assets/images/Diabetes.png'; // example image for Diabetes plan
import Pressure from '../../assets/images/Pressure.png'; // example image for Hypertension plan
import ScrollToTop from "../../utils/ScrollToTop";

function Plans() {
  const navigate = useNavigate();
  const scrollUp = ()=>{
    setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100); // Delay slightly to ensure DOM has updated
  }

  const plans = [
    {
      title: 'Back to Basics',
      Subtitle: 'A 5-Day Healthy Eating Reset',
      price: '₵349',
      Url: " https://paystack.shop/pay/backtobasics",
      img: B2B,
      features: [
        '5-Day Custom Meal Plan',
        'Grocery List & Prep Guide',
        'Perfect for busy professionals, healthy eating beginners.'
      ],
      gradient: 'from-orange-400 to-orange-500',
    },
    {
      title: 'Snatched & Nourished',
      Subtitle: 'Gentle Weight Loss Guide',
      price: '₵249',
      Url: "https://paystack.shop/pay/gentleweightloss",
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
      Url: "https://paystack.shop/pay/bloodsugar",
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
      Url: "https://paystack.shop/pay/pressurenodey",
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
      Url: "https://paystack.shop/pay/weightgain",
      img: Gain, 
      features: [
        'High-calorie meal plan',
        'Snack list',
        'Progress-monitoring tools',
      ],
      gradient: 'from-orange-400 to-orange-500',
    }
  ];

  const testimonials = [
    {
      name: 'Michael Asare',
      img: Weightloss,
      content: 'Nana Ama’s Weight Gain guide helped me go from 56kg to 78kg in just 5 months. Before that her 5 week follow up period psyched my mind for the task ahead. Her encouragement, step-by-step approach, and constant motivation made all the difference. I feel healthier, more confident, and energized than ever before. I couldn’t have done it without her support.',
      stars: 5,
      profession: 'Professional Engineer ',
      plan: 'Snatched & Nourished',
      location: 'Accra, Ghana'
    },
    {
      name: 'Grace Blankson',
      img: Diabetes,
      content: 'I’ve struggled with hypertension for well over 2 years. Thanks to Dee’s Pressure No Dey Catch Me Plan, I now have a trusted source of meals that actually work for me. Her warm demeanor and constant willingness to listen made all the difference. I definitely recommend her to anyone managing hypertension.',
      stars: 5,
      profession: 'Trader ',
      plan: 'Pressure No Dey Catch Me',
      location: 'Takoradi, Ghana'
    },
    {
      name: 'Kobby Breeze',
      img: B2B,
      content: 'When I was diagnosed with diabetes in October 2024, it felt like a death sentence. I was scared and overwhelmed. But with the guidance of my Doctor and my Dietician, Nana Ama Dwamena, I learned that with the right lifestyle changes, exercise and a proper diet, I could live a normal life. For six weeks, I committed to the plan, not just for myself, but for my daughter Nicole. Through the Blood Sugar Balancing plan, today, I feel healthier, stronger, and more hopeful than ever. Glory be to God!',
      stars: 5,
      profession: 'Professional Engineer ',
      plan: 'Blood Sugar Balance',
      location: 'Accra, Ghana'
    },
    {
      name: 'Lawrencia Kwakye',
      img: Pressure,
      content: "Before I started Diet with Dee's 5-Day Reset, my body felt totally out of sync and sluggish. Seriously, I was dragging myself through the day! But after just five days, it's like my body hit the reset button – pun totally intended. My system feels cleaner, and I'm pretty sure my skin is glowing. Dee, you've worked some kind of magic! This isn't just a diet; it's a total life upgrade.",
      stars: 5,
      profession: 'Teacher ',
      plan: 'Back to Basics',
      location: 'Accra, Ghana'
    },
    {
      name: 'Richard Oti',
      img: Pressure,
      content: "This was my very first encounter with a dietitian, and the objective of my visit was to lose weight.I must say, the results over the past few weeks have been amazing! She gave me a personalized meal plan with familiar foods that are protein-rich, low in carbs, and full of healthy fats. Since following it, my digestion has improved, my bloating has reduced, I wake up more energized, and I’ve been able to cut out late-night snacking and junk food.I feel healthier and more active than ever!",
      stars: 5,
      profession: 'Teacher ',
      plan: 'Weight loss',
      location: 'Tema, Ghana'
    }
  ];

  // Star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* If you use SEO component, make sure it's imported */}
      {/* <SEO ... /> */}
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-6 lg:px-12'>
        <div className='text-center space-y-4 max-w-3xl mx-auto mb-12'>
          <h1 className='text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600'>
            Diet Plans
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
              
              <a href={plan.Url} target="_blank" rel="noopener noreferrer">
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

        {/* Improved Testimonials Section */}
        <div className='mt-20 mb-12'>
          <div className='text-center space-y-4 max-w-3xl mx-auto mb-12'>
            <h2 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600'>
              Success Stories
            </h2>
            <p className='text-gray-600 text-lg'>
              Real people, real results. See what our clients have to say about their transformation journey.
            </p>
            <div className='w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full'></div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className='bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 p-8 relative border border-green-50 group'
              >
                {/* Quote Icon */}
                <div className='absolute top-6 right-6 text-green-200 group-hover:text-green-300 transition-colors'>
                  <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z'/>
                  </svg>
                </div>

                {/* Profile Section */}
                <div className='flex items-center gap-4 mb-6'>
                  <div className='relative'>
                    <img 
                      src={testimonial.img} 
                      alt={testimonial.name} 
                      className='h-16 w-16 object-cover rounded-full border-4 border-gradient-to-r from-green-400 to-emerald-400 shadow-lg' 
                    />
                    <div className='absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1'>
                      <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className='font-bold text-gray-800 text-lg'>{testimonial.name}</h4>
                    <p className='text-green-600 text-sm font-semibold'>{testimonial.plan}</p>
                    <p className='text-gray-500 text-xs'>{testimonial.location}</p>
                  </div>
                </div>

                {/* Star Rating */}
                <StarRating rating={testimonial.stars} />

                {/* Testimonial Content */}
                <p className='text-gray-700 text-sm leading-relaxed mb-4 italic'>
                  "{testimonial.content}"
                </p>

                {/* Bottom Accent */}
                <div className='w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full'></div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className='text-center mt-12'>
            <p className='text-gray-600 text-lg mb-6'>Ready to start your transformation?</p>
            <button onClick={() => {scrollUp()}}
            className='px-8 py-3 bg-gradient-to-r from-[#F6841F] to-[#F6841F] text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105'>
              Choose Your Plan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Plans;