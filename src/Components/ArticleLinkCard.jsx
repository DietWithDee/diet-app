import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { resolveLinkCardData } from '../utils/articleLinkCardUtils';

/**
 * Reusable React Component for embedding in JSX on the fly.
 */
export default function ArticleLinkCard({ url, linkText, article, className = '' }) {
  const data = resolveLinkCardData(url, linkText, article);

  return (
    <div className={`my-8 p-4 sm:p-5 rounded-2xl border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-300 shimmer-card not-prose ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <img src={data.img} alt={data.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className={`text-[11px] font-extrabold uppercase tracking-wider mb-0.5 flex items-center gap-1.5 ${data.badgeColor}`}>
              <span>{data.badge}</span>
              {data.price && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {data.price}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-gray-900 m-0 leading-tight truncate">
              {data.title}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 m-0 mt-0.5 line-clamp-2 leading-snug">
              {data.subtitle}
            </p>
            {data.secondaryUrl && (
              <div className="mt-1">
                <Link to={data.secondaryUrl} className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-800">
                  {data.secondaryText}
                </Link>
              </div>
            )}
          </div>
        </div>

        {data.isExternal ? (
          <a
            href={data.targetUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-[#F6841F] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] gap-1.5 no-underline"
          >
            <span>{data.buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <Link
            to={data.targetUrl}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-[#F6841F] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] gap-1.5 no-underline"
          >
            <span>{data.buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

      </div>
    </div>
  );
}
