export const DEE_WHATSAPP_NUMBER = '233599394750';

export const getSessionMeta = (booking = {}) => {
  if (booking.isFathersDayBooking || booking.consultationType === 'fathersday') {
    return {
      title: "Father's Day Gift Consultation",
      subtitle: booking.fatherName ? `For ${booking.fatherName}` : 'Special Gift Session',
      followUpPath: '/contactUs?tier=followup',
      followUpLabel: 'Book Follow-Up (GH₵ 400)'
    };
  }

  if (booking.isOntrack) {
    const isFollowUp = booking.consultationType === 'followup';
    return {
      title: isFollowUp ? 'OnTrack Diabetes Follow-Up' : 'OnTrack Diabetes Consultation',
      subtitle: isFollowUp ? 'Glucose & portion check-in' : '1-on-1 Diabetes Nutrition Care',
      followUpPath: '/ontrack?tier=followup',
      followUpLabel: 'Book Diabetes Follow-Up (GH₵ 300)'
    };
  }

  const isFollowUp = booking.consultationType === 'followup';
  return {
    title: isFollowUp ? 'Follow-Up Consultation' : 'Initial Consultation',
    subtitle: isFollowUp ? '25-min Progress & Plan Check-In' : '45-min Comprehensive Clinical Session',
    followUpPath: '/contactUs?tier=followup',
    followUpLabel: 'Book Follow-Up (GH₵ 400)'
  };
};

export const formatDisplayDate = (isoOrDateStr) => {
  if (!isoOrDateStr) return null;
  const date = new Date(isoOrDateStr);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatScheduledDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim());
  const parsed = isoDateOnly ? new Date(`${dateStr.trim()}T00:00:00`) : new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const getStatusBadge = (status, scheduledDate) => {
  if (status === 'completed') {
    return {
      label: 'Completed',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  }
  if (status === 'cancelled') {
    return {
      label: 'Cancelled',
      classes: 'bg-stone-100 text-stone-600 border-stone-200'
    };
  }
  if (scheduledDate) {
    return {
      label: 'Scheduled',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  }
  if (status === 'contacted') {
    return {
      label: 'Scheduling Active',
      classes: 'bg-amber-50 text-amber-800 border-amber-200'
    };
  }
  return {
    label: 'Confirmed · Pending Time',
    classes: 'bg-orange-50 text-[#c96209] border-orange-200'
  };
};

export const buildWhatsAppLink = (booking = {}, meta = getSessionMeta(booking)) => {
  const firstName = (booking.name || 'there').split(' ')[0];
  const ref = booking.paystackReference || booking.id || '';
  const scheduledFormatted = formatScheduledDate(booking.scheduledDate);
  const text = scheduledFormatted
    ? `Hi Dee, this is ${firstName}. Checking in regarding my ${meta.title} (${ref}) scheduled for ${scheduledFormatted} at ${booking.scheduledTime || 'our agreed time'}.`
    : `Hi Dee, this is ${firstName}. I confirmed my ${meta.title} (Ref: ${ref}) and would like to finalize our session time.`;
  return `https://wa.me/${DEE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

export const safePortalUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
};

export const stripHtmlSnippet = (html, maxLength = 120) => {
  if (!html || typeof html !== 'string') return '';
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
};

const ARTICLE_TOPIC_RULES = [
  {
    matchesContext: ({ isOntrack, healthConditions }) =>
      Boolean(isOntrack) || /diabet|sugar|a1c|glucose|insulin/i.test(healthConditions || ''),
    keywords: ['diabet', 'blood sugar', 'sugar', 'a1c', 'glucose', 'insulin', 'glycemic', 'ontrack'],
    reason: 'For Blood Sugar Care',
    weight: 4
  },
  {
    matchesContext: ({ healthConditions }) => /pressure|hypertens|bp|heart/i.test(healthConditions || ''),
    keywords: ['pressure', 'hypertens', 'sodium', 'salt', 'bp', 'heart', 'dash'],
    reason: 'For Blood Pressure Care',
    weight: 4
  },
  {
    matchesContext: ({ goal }) => /lose|weight loss/i.test(goal || ''),
    keywords: ['weight loss', 'lose weight', 'portion', 'calorie', 'fat', 'fasting', 'deficit', 'waist'],
    reason: 'For Weight Loss',
    weight: 3
  },
  {
    matchesContext: ({ goal }) => /gain|muscle/i.test(goal || ''),
    keywords: ['weight gain', 'gain weight', 'protein', 'muscle', 'calorie', 'mass', 'bulk'],
    reason: 'For Healthy Gain',
    weight: 3
  },
  {
    matchesContext: ({ dietaryRestrictions }) =>
      Boolean(dietaryRestrictions) && dietaryRestrictions !== 'None',
    keywords: ['plant', 'vegan', 'vegetarian', 'gluten', 'substitute', 'alternative'],
    reason: 'Matches Your Diet',
    weight: 2
  }
];

export const rankArticlesForClient = (articles = [], context = {}, limitCount = 3) => {
  if (!Array.isArray(articles) || articles.length === 0) return [];

  const now = Date.now();
  const visibleArticles = articles.filter((article) => {
    if (!article) return false;
    if (article.status && article.status !== 'published') return false;
    if (article.scheduledPublishDate) {
      const schedMs = typeof article.scheduledPublishDate.toDate === 'function'
        ? article.scheduledPublishDate.toDate().getTime()
        : new Date(article.scheduledPublishDate).getTime();
      if (Number.isFinite(schedMs) && schedMs > now) return false;
    }
    return true;
  });

  const activeRules = ARTICLE_TOPIC_RULES.filter((rule) => rule.matchesContext(context));

  const scored = visibleArticles.map((article, index) => {
    const haystack = [
      article.title || '',
      Array.isArray(article.tags) ? article.tags.join(' ') : '',
      stripHtmlSnippet(article.content || '', 240)
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    let bestReason = 'Nutrition Guide';
    let highestRuleScore = 0;

    activeRules.forEach((rule) => {
      const hits = rule.keywords.filter((kw) => haystack.includes(kw)).length;
      if (hits > 0) {
        const ruleScore = hits * rule.weight;
        score += ruleScore;
        if (ruleScore > highestRuleScore) {
          highestRuleScore = ruleScore;
          bestReason = rule.reason;
        }
      }
    });

    return {
      ...article,
      relevanceScore: score,
      relevanceReason: bestReason,
      originalOrder: index
    };
  });

  scored.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return a.originalOrder - b.originalOrder;
  });

  return scored.slice(0, limitCount);
};

