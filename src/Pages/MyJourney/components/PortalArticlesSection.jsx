import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Heart } from 'lucide-react';
import { getArticlesPaged } from '../../../firebaseUtils';
import { rankArticlesForClient, stripHtmlSnippet, formatDisplayDate } from '../../../utils/carePortal';
import SafeImage from '../../../Components/SafeImage';

const PortalArticlesSection = ({ userProfile = null, bookings = [] }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadArticles = async () => {
      try {
        const res = await getArticlesPaged(12, null, false);
        if (active && res.success) {
          setArticles(res.data || []);
        }
      } catch (err) {
        console.warn('Could not load recommended articles:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadArticles();
    return () => {
      active = false;
    };
  }, []);

  const curated = useMemo(() => {
    const hasOntrackBooking = bookings.some((b) => b.isOntrack);
    const context = {
      isOntrack: hasOntrackBooking,
      goal: userProfile?.goal || '',
      healthConditions: userProfile?.healthConditions || '',
      dietaryRestrictions: userProfile?.dietaryRestrictions || ''
    };
    return rankArticlesForClient(articles, context, 4);
  }, [articles, userProfile, bookings]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-48 bg-stone-200 rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow-xs p-4 lg:p-5 border border-stone-200/70 flex gap-3 lg:gap-4 items-center animate-pulse"
            >
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-stone-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="h-3 bg-stone-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (curated.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-serif-cormorant font-semibold text-stone-900">
            Recommended Nutrition Guides
          </h2>
          <p className="text-xs text-stone-500">
            Tailored reads matched to your profile and care focus.
          </p>
        </div>

        <Link
          to="/blog"
          className="text-xs font-bold text-[#e07312] hover:text-[#b85a08] inline-flex items-center gap-1 transition-colors"
        >
          <span>Browse All Articles</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Matches exact proportions of Blog.jsx "More Articles" cards */}
      <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
        {curated.map((article) => {
          const snippet = stripHtmlSnippet(article.content || '', 80);
          return (
            <Link
              key={article.id}
              to={`/blog/${article.slug || article.id}`}
              className="bg-white rounded-xl shadow-xs hover:shadow-md transition-all p-4 lg:p-5 group border border-stone-200/80 block"
            >
              <div className="flex gap-3 lg:gap-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {article.coverImage ? (
                    <SafeImage
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      wrapperClassName="w-full h-full"
                    />
                  ) : (
                    <BookOpen size={20} className="text-emerald-700 opacity-80" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                      {article.relevanceReason}
                    </span>
                  </div>
                  <h3 className="font-semibold text-emerald-900 group-hover:text-emerald-700 transition-colors mb-1 text-sm lg:text-base line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  {snippet && (
                    <p className="text-xs lg:text-sm text-stone-600 mb-2 line-clamp-2 leading-snug">
                      {snippet}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{formatDisplayDate(article.createdAt?.toDate ? article.createdAt.toDate() : article.createdAt) || 'Guide'}</span>
                    <div className="flex items-center gap-3">
                      {typeof article.likesCount === 'number' && article.likesCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Heart size={12} className="text-rose-500" />
                          <span>{article.likesCount}</span>
                        </span>
                      )}
                      <span className="font-semibold text-[#e07312] inline-flex items-center gap-0.5">
                        Read <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PortalArticlesSection;
