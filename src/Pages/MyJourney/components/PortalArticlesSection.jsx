import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getArticlesPaged } from '../../../firebaseUtils';
import { rankArticlesForClient, stripHtmlSnippet } from '../../../utils/carePortal';
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
    return rankArticlesForClient(articles, context, 3);
  }, [articles, userProfile, bookings]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3 animate-pulse">
            <div className="w-full h-36 bg-stone-200 rounded-xl" />
            <div className="h-3 w-24 bg-stone-200 rounded" />
            <div className="h-4 w-4/5 bg-stone-200 rounded" />
          </div>
        ))}
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
            Evidence-based Ghanaian nutrition reads curated from your profile and care focus.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {curated.map((article) => {
          const snippet = stripHtmlSnippet(article.content || '', 110);
          return (
            <Link
              key={article.id}
              to={`/blog/${article.slug || article.id}`}
              className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-sm hover:border-emerald-200 transition-all flex flex-col"
            >
              {article.coverImage ? (
                <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <SafeImage
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    wrapperClassName="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] w-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <BookOpen size={24} />
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                    {article.relevanceReason}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-900 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  {snippet && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {snippet}
                    </p>
                  )}
                </div>

                <span className="text-xs font-bold text-[#e07312] inline-flex items-center gap-1">
                  <span>Read Guide</span>
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PortalArticlesSection;
