import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Calendar, User, ArrowRight, ArrowLeft, Share2, Heart, MessageCircle } from 'lucide-react';
import { getArticles } from '../../firebaseUtils';
import BlogImage from '../../assets/Salad.png'; // Fallback image

function Blog() {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'article'

  // Load articles from Firebase on component mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getArticles();
      
      if (result.success) {
        setBlogPosts(result.data || []);
      } else {
        setError('Failed to load articles');
        console.error('Error loading articles:', result.error);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      setError('Something went wrong while loading articles');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Handle regular Date or string
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const createSummary = (content, maxLength = 150) => {
    const plainText = stripHtml(content);
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  const handleReadMore = (article) => {
    setSelectedArticle(article);
    setViewMode('article');
    // Scroll to top when opening article
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    setViewMode('list');
    // Scroll to top when going back to list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async (article) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: createSummary(article.content, 100),
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader className="animate-spin text-green-600 mx-auto" size={48} />
          <p className="text-gray-600 text-lg">Loading articles...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadArticles}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Individual Article View
  if (viewMode === 'article' && selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Article Header */}
        <div className="bg-white shadow-sm border-b border-green-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Back to Articles
            </button>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg overflow-hidden">
            {/* Featured Image */}
            {selectedArticle.coverImage && (
              <div className="h-48 sm:h-64 lg:h-96 overflow-hidden">
                <img 
                  src={selectedArticle.coverImage} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = BlogImage;
                  }}
                />
              </div>
            )}

            {/* Article Header */}
            <div className="p-4 sm:p-6 lg:p-12">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-700 mb-4 leading-tight">
                  {selectedArticle.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span className="text-sm lg:text-base">{formatDate(selectedArticle.createdAt)}</span>
                  </div>
                  {selectedArticle.author && (
                    <div className="flex items-center gap-2">
                      <User size={18} />
                      <span className="text-sm lg:text-base">{selectedArticle.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs lg:text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      Wellness
                    </span>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 pb-6 border-b border-gray-200">
                  <button
                    onClick={() => handleShare(selectedArticle)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all text-sm"
                  >
                    <Share2 size={16} sm:size={18} />
                    Share
                  </button>
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-sm">
                    <Heart size={16} sm:size={18} />
                    Like
                  </button>
                  <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm">
                    <MessageCircle size={16} sm:size={18} />
                    Comment
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              {/* Article Footer */}
              <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Was this article helpful?
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs sm:text-sm">
                      Yes, helpful! 👍
                    </button>
                    <button className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm">
                      Could be better 👎
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles Section */}
          <div className="mt-8 lg:mt-12">
            <h3 className="text-xl lg:text-2xl font-bold text-green-700 mb-4 lg:mb-6">More Articles</h3>
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
              {blogPosts
                .filter(post => post.id !== selectedArticle.id)
                .slice(0, 2)
                .map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 lg:p-6 cursor-pointer group"
                    onClick={() => handleReadMore(post)}
                  >
                    <div className="flex gap-3 lg:gap-4">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {post.coverImage ? (
                          <img 
                            src={post.coverImage} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = BlogImage;
                            }}
                          />
                        ) : (
                          <img 
                            src={BlogImage} 
                            alt={post.title}
                            className="w-8 h-8 lg:w-12 lg:h-12 object-contain opacity-70"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-green-700 group-hover:text-green-800 transition-colors mb-1 text-sm lg:text-base line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">
                          {createSummary(post.content, 80)}
                        </p>
                        <div className="text-xs text-gray-500">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Blog List View (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 lg:py-20 px-4 sm:px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-8 lg:mb-12 space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600">
          Wellness Reads
        </h1>
        <p className="text-gray-700 text-base lg:text-lg px-4">
          Practical tips, expert advice, and motivation for your healthy lifestyle.
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-5xl mx-auto">
        {blogPosts.length === 0 ? (
          // Empty state
          <div className="text-center py-12 lg:py-16 space-y-4">
            <div className="text-gray-400 text-4xl lg:text-6xl">📝</div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-600">No Articles Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto px-4 text-sm lg:text-base">
              We're working on bringing you amazing content. Check back soon for the latest wellness tips and insights!
            </p>
          </div>
        ) : (
          // Articles list
          <div className="flex flex-col gap-6 lg:gap-10">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl lg:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 items-start group"
              >
                {/* Blog Image */}
                <div className="w-full lg:w-52 flex-shrink-0 order-first lg:order-none">
                  <div className="h-48 sm:h-56 lg:h-32 w-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = BlogImage; // Fallback to default image
                        }}
                      />
                    ) : (
                      <img 
                        src={BlogImage} 
                        alt={post.title} 
                        className="h-16 sm:h-20 lg:h-24 object-contain opacity-70"
                      />
                    )}
                  </div>
                </div>

                {/* Blog Content */}
                <div className="flex-1 space-y-2 lg:space-y-3 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-green-700 group-hover:text-green-800 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} lg:size={14} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1">
                        <User size={12} lg:size={14} />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm lg:text-base leading-relaxed line-clamp-3">
                    {createSummary(post.content)}
                  </p>
                  
                  <button
                    onClick={() => handleReadMore(post)}
                    className="mt-3 lg:mt-4 inline-flex items-center gap-2 px-4 lg:px-6 py-2 border-2 border-green-600 text-green-700 font-semibold rounded-full hover:bg-green-50 hover:border-green-700 transition-all duration-300 group-hover:translate-x-1 text-sm lg:text-base"
                  >
                    Read More
                    <ArrowRight size={14} lg:size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Refresh button for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={loadArticles}
            className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
            title="Refresh Articles"
          >
            <Loader size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Blog;