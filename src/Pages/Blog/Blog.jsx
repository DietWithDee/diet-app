import React, { useState, useEffect } from 'react';
import SEO from '../../Components/SEO';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader, Calendar, User, ArrowRight, ArrowLeft, Share2, Heart, MessageCircle } from 'lucide-react';
import { getArticlesPaged, getArticleById, likeNews, markArticleHelpful } from '../../firebaseUtils';
import BlogImage from '../../assets/Salad.png'; // Fallback image
import BlogArticleSEO from '../../Components/BlogArticleSEO';
import ScrollHideRefreshButton from '../../utils/ScrollHideRefreshButton';
import NewsletterPopup from '../../Components/NewsletterPopup';

function Blog() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'article'
  const [likingArticles, setLikingArticles] = useState(new Set());
  const [feedbackArticles, setFeedbackArticles] = useState(new Set());
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoadingArticle, setIsInitialLoadingArticle] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  // When articles load or route changes, open the right article if there's an :id
  useEffect(() => {
    if (!routeId) {
      if (viewMode === 'article') {
        setViewMode('list');
        setSelectedArticle(null);
      }
      return;
    }

    // If we're already viewing this article, do nothing
    if (selectedArticle && selectedArticle.id === routeId) {
      if (viewMode !== 'article') setViewMode('article');
      return;
    }

    // Try to find it in current blogPosts list
    const found = blogPosts.find(p => p.id === routeId);
    if (found) {
      setSelectedArticle(found);
      if (viewMode !== 'article') setViewMode('article');
      return;
    }

    // Otherwise fetch specifically this article
    const fetchSingleArticle = async () => {
      setIsInitialLoadingArticle(true);
      try {
        const res = await getArticleById(routeId);
        if (res?.success) {
          setSelectedArticle(res.data);
          setViewMode('article');
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching single article:', err);
        setError('Failed to load article');
      } finally {
        setIsInitialLoadingArticle(false);
      }
    };
    
    fetchSingleArticle();
  }, [routeId, blogPosts]);

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);

    // ✅ Scroll to top on load
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    try {
      const result = await getArticlesPaged(6);

      if (result.success) {
        setBlogPosts(result.data || []);
        setLastVisibleDoc(result.lastVisible);
        setHasMore(result.hasMore);
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

  const loadMoreArticles = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const result = await getArticlesPaged(6, lastVisibleDoc);
      
      if (result.success) {
        const newPosts = result.data || [];
        setBlogPosts(prev => [...prev, ...newPosts]);
        setLastVisibleDoc(result.lastVisible);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLike = async (articleId) => {
    // Prevent multiple simultaneous likes
    if (likingArticles.has(articleId)) return;

    setLikingArticles(prev => new Set([...prev, articleId]));

    try {
      const result = await likeNews(articleId);

      if (result.success) {
        // Update the likes count in the local state
        setBlogPosts(prev => prev.map(post =>
          post.id === articleId
            ? { ...post, likesCount: (post.likesCount || 0) + 1 }
            : post
        ));

        // Update selected article if it's the one being liked
        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle(prev => ({
            ...prev,
            likesCount: (prev.likesCount || 0) + 1
          }));
        }
      } else {
        // Show error message
        console.log(result.message);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error liking article:', error);
    } finally {
      setLikingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  const handleHelpfulFeedback = async (articleId, isHelpful) => {
    // Prevent multiple simultaneous feedback submissions
    if (feedbackArticles.has(articleId)) return;

    setFeedbackArticles(prev => new Set([...prev, articleId]));

    try {
      const result = await markArticleHelpful(articleId, isHelpful);

      if (result.success) {
        // Update the feedback counts in local state
        setBlogPosts(prev => prev.map(post =>
          post.id === articleId
            ? {
              ...post,
              helpfulCount: isHelpful
                ? (post.helpfulCount || 0) + 1
                : (post.helpfulCount || 0),
              notHelpfulCount: !isHelpful
                ? (post.notHelpfulCount || 0) + 1
                : (post.notHelpfulCount || 0)
            }
            : post
        ));

        // Update selected article if it's the one being rated
        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle(prev => ({
            ...prev,
            helpfulCount: isHelpful
              ? (prev.helpfulCount || 0) + 1
              : (prev.helpfulCount || 0),
            notHelpfulCount: !isHelpful
              ? (prev.notHelpfulCount || 0) + 1
              : (prev.notHelpfulCount || 0)
          }));
        }
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      // Keep the article in feedbackArticles to prevent multiple submissions
      // Don't remove it from the set
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
    navigate(`/blog/${article.id}`);
    // Scroll to top when opening article
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    setViewMode('list');
    navigate('/blog');
    // Scroll to top when going back to list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async (article) => {
    const articleUrl = `https://dietwithdee.org/blog/${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: articleUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(articleUrl);
      // You could show a toast notification here
    }
  };

  // Loading state
  if (isLoading || isInitialLoadingArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader className="animate-spin text-green-600 mx-auto" size={48} />
          <p className="text-gray-600 text-lg">
            {isInitialLoadingArticle ? 'Loading article...' : 'Loading articles...'}
          </p>
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
    const isLiking = likingArticles.has(selectedArticle.id);
    const hasFeedback = feedbackArticles.has(selectedArticle.id);

    // SEO values from article
    const articleTitle = selectedArticle.title;
    const articleDescription = createSummary(selectedArticle.content, 160);
    const articleImage = selectedArticle.coverImage || 'https://dietwithdee.org/LOGO.png';
    const articleUrl = `https://dietwithdee.org/blog/${selectedArticle.id}`;
    const articleAuthor = selectedArticle.author || 'Nana Ama Dwamena';
    const articleDate = selectedArticle.createdAt && selectedArticle.createdAt.toDate ? selectedArticle.createdAt.toDate().toISOString() : new Date(selectedArticle.createdAt).toISOString();

    return (
      <>
        <BlogArticleSEO
          title={articleTitle}
          description={articleDescription}
          keywords="DietWithDee Blog, Nutrition Tips, Healthy Recipes, Ghana Dietitian, Nana Ama Dwamena, Wellness"
          image={articleImage}
          url={articleUrl}
          author={articleAuthor}
          datePublished={articleDate}
        />
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
                    {/* Likes count */}
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-red-500" />
                      <span className="text-sm lg:text-base">{selectedArticle.likesCount || 0} likes</span>
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 pb-6 border-b border-gray-200">
                    <button
                      onClick={() => handleShare(selectedArticle)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all text-sm"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                    <button
                      onClick={() => handleLike(selectedArticle.id)}
                      disabled={isLiking}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${isLiking
                          ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                          : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                        }`}
                    >
                      <Heart size={16} />
                      {isLiking ? 'Liking...' : 'Like'}
                    </button>
                  </div>
                </div>

                {/* Article Content */}
                <div
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed"
                  style={{
                    fontSize: '18px',
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />

                {/* Article Footer */}
                <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Was this article helpful?
                      {(selectedArticle.helpfulCount || 0) > 0 && (
                        <span className="ml-2 text-green-600 font-medium">
                          {selectedArticle.helpfulCount} people found this helpful
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleHelpfulFeedback(selectedArticle.id, true)}
                        disabled={hasFeedback}
                        className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${hasFeedback
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                      >
                        Yes, helpful! 👍
                      </button>
                      <button
                        onClick={() => handleHelpfulFeedback(selectedArticle.id, false)}
                        disabled={hasFeedback}
                        className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${hasFeedback
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        Could be better 👎
                      </button>
                    </div>
                  </div>

                  {/* Feedback Summary */}
                  {((selectedArticle.helpfulCount || 0) > 0 || (selectedArticle.notHelpfulCount || 0) > 0) && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <span className="text-green-600">
                            👍 {selectedArticle.helpfulCount || 0} helpful
                          </span>
                          <span className="text-gray-500">
                            👎 {selectedArticle.notHelpfulCount || 0} not helpful
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasFeedback && (
                    <div className="mt-3 text-sm text-green-600 text-center">
                      Thank you for your feedback! 🙏
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Articles Section */}
            <div className="mt-8 lg:mt-12">
              <h3 className="text-xl lg:text-2xl font-bold text-green-700 mb-4 lg:mb-6">More Articles</h3>
              <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                {[...blogPosts]
                  .filter(post => post.id !== selectedArticle.id)
                  .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
                  .slice(0, 4)
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
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatDate(post.createdAt)}</span>
                            <div className="flex items-center gap-1">
                              <Heart size={12} className="text-red-500" />
                              <span>{post.likesCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </article>
        </div>
      </>
    );
  }

  // Blog List View (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-18 lg:py-20 px-4 sm:px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-8 lg:mb-12 space-y-8 max-w-3xl mx-auto">
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
                      <Calendar size={12} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{post.author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Heart size={12} className="text-red-500" />
                      <span>{post.likesCount || 0} likes</span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm lg:text-base leading-relaxed line-clamp-3">
                    {createSummary(post.content)}
                  </p>

                  <button
                    onClick={() => handleReadMore(post)}
                    className="mt-3 lg:mt-4 inline-flex items-center gap-2 px-4 lg:px-6 py-2 border-2 border-green-600 text-green-700 font-semibold rounded-full hover:bg-green-50 hover:border-green-700 transition-all duration-300 group-hover:translate-x-1 text-sm lg:text-base"
                  >
                    Read More
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {viewMode === 'list' && hasMore && blogPosts.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMoreArticles}
              disabled={isLoadingMore}
              className={`px-8 py-3 bg-white border-2 border-green-600 text-green-700 font-bold rounded-full transition-all hover:bg-green-50 flex items-center gap-2 mx-auto ${
                isLoadingMore ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingMore ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Loading...
                </>
              ) : (
                <>
                  Load More Articles
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Refresh button for development */}
      {process.env.NODE_ENV === 'development' && (
        <ScrollHideRefreshButton
          loadArticles={loadArticles}
          isLoading={isLoadingArticles}
        />
      )}
      {/* Newsletter Popup */}
      <NewsletterPopup />
    </div>
  );
}

export default Blog;
