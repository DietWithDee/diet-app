import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlogImage from '../../assets/Salad.png'; // Replace with real blog image

function Blog() {
  const navigate = useNavigate();

  const blogPosts = [
    {
      title: '10 Superfoods to Boost Your Immunity',
      date: 'July 5, 2025',
      summary:
        'Discover the top 10 superfoods you should include in your diet to build a stronger immune system naturally.',
    },
    {
      title: 'How to Create a Balanced Meal Plan',
      date: 'June 28, 2025',
      summary:
        'Learn how to balance carbs, protein, and fats to create sustainable meal plans tailored to your body goals.',
    },
    {
      title: 'The Truth About Detox Diets',
      date: 'June 15, 2025',
      summary:
        'We debunk the myths around detox diets and explain what really works when it comes to cleansing your body.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600">
          Wellness Reads
        </h1>
        <p className="text-gray-700 text-lg">
          Practical tips, expert advice, and motivation for your healthy lifestyle.
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
      </div>

      {/* Vertically Stacked Blog Posts */}
      <div className="flex flex-col gap-10 max-w-5xl mx-auto">
        {blogPosts.map((post, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col md:flex-row gap-6 items-start"
          >
            {/* Blog Image */}
            <div className="w-full md:w-52 flex-shrink-0">
              <div className="h-60 md:h-32 w-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={BlogImage} alt={post.title} className="h-24 object-contain" />
              </div>
            </div>

            {/* Blog Content */}
            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-bold text-green-700">{post.title}</h3>
              <p className="text-sm text-gray-500">{post.date}</p>
              <p className="text-gray-700 text-sm">{post.summary}</p>
              <button
                onClick={() => navigate('/diet-app/blog')}
                className="mt-4 inline-block px-6 py-2 border-2 border-green-600 text-green-700 font-semibold rounded-full hover:bg-green-50 transition-all"
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Blog;
