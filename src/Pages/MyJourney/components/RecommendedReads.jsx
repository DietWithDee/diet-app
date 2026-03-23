import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { getArticlesPaged } from '../../../firebaseUtils';

const RecommendedReads = React.memo(() => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const result = await getArticlesPaged(2);
                if (result.success) {
                    setArticles(result.data);
                }
            } catch (err) {
                console.error('Failed to fetch articles:', err);
            }
            setLoading(false);
        };
        fetchArticles();
    }, []);

    const stripHtml = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const createSummary = (content, maxLength = 100) => {
        const text = stripHtml(content);
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Skeleton card
    const SkeletonCard = () => (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 animate-pulse">
            <div className="w-full h-28 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-4 bg-gray-200 rounded-lg mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded-lg w-full"></div>
        </div>
    );

    if (!loading && articles.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-12"
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    <FiBookOpen size={14} className="inline mr-1.5 -mt-0.5" />
                    Recommended Reads
                </h3>
                <button
                    onClick={() => navigate('/blog')}
                    className="text-green-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                >
                    See all <FiArrowRight size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading
                    ? [1, 2].map((i) => <SkeletonCard key={i} />)
                    : articles.map((article) => (
                        <motion.div
                            key={article.id}
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => navigate(`/blog/${article.slug || article.id}`)}
                            className="bg-white rounded-2xl shadow-md border border-green-50 overflow-hidden cursor-pointer group transition-all"
                        >
                            {(article.coverImage || article.imageUrl) && (
                                <div className="w-full h-32 overflow-hidden">
                                    <img
                                        src={article.coverImage || article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <h4 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-green-700 transition-colors">
                                    {article.title}
                                </h4>
                                <p className="text-xs text-gray-400 mb-2">{formatDate(article.createdAt)}</p>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                    {createSummary(article.content)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
            </div>
        </motion.div>
    );
});

export default RecommendedReads;
