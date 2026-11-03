import { plans } from './plansData.js';
import Logo from '../assets/LOGO.webp';

/**
 * Normalizes any link, stripping dummy placeholders (e.g. your-website-url, ytd.org)
 * and converting them to valid routes.
 */
export const normalizeArticleUrl = (rawUrl) => {
  if (!rawUrl) return '/plans';
  let url = rawUrl.trim();

  // Strip wrapping markdown characters if any slipped in
  url = url.replace(/^<|>$/g, '');

  // Strip known domains/placeholders to internal routes
  url = url.replace(
    /^https?:\/\/(?:www\.)?(?:your-website-url|ytd\.org|dietwithdee\.org|dietwithdee\.com|localhost(?::\d+)?)/i,
    ''
  );

  // If empty after stripping, default to /plans if it originally contained plans
  if (!url || url === '') {
    if (/plans/i.test(rawUrl)) return '/plans';
    return '/';
  }

  // Ensure relative URLs start with '/'
  if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('#')) {
    url = '/' + url;
  }

  return url;
};

/**
 * Checks article context (title, tags) to see if an article strongly corresponds to a plan.
 */
export const findMatchingPlanByContext = (article) => {
  if (!article) return null;
  const text = `${article.title || ''} ${(article.tags || []).join(' ')}`.toLowerCase();

  if (/diabetes|blood\s*sugar|sugar|glucose|insulin/i.test(text)) {
    return plans.find(p => p.id === 'blood-sugar-balance');
  }
  if (/hypertension|blood\s*pressure|pressure|heart|dash/i.test(text)) {
    return plans.find(p => p.id === 'pressure-no-dey-catch-me');
  }
  if (/weight\s*loss|fat\s*loss|slimming|snatched|drop\s*weight|lose\s*weight/i.test(text)) {
    return plans.find(p => p.id === 'snatched-nourished');
  }
  if (/weight\s*gain|muscle\s*gain|bulking|underweight/i.test(text)) {
    return plans.find(p => p.id === 'weight-gain');
  }
  if (/reset|basics|clean\s*eating|detox|beginner|healthy\s*eating/i.test(text)) {
    return plans.find(p => p.id === 'back-to-basics');
  }
  return null;
};

/**
 * Resolves complete metadata for an embedded link card.
 */
export const resolveLinkCardData = (rawUrl, linkText = '', article = null) => {
  const url = normalizeArticleUrl(rawUrl);
  const lowerUrl = url.toLowerCase();
  const lowerText = (linkText || '').toLowerCase();

  // 1. Check for specific plan by ID, hash, or Paystack link
  let matchedPlan = null;

  // Check by hash: e.g. /plans#blood-sugar-balance
  const hashMatch = url.match(/#([a-zA-Z0-9_-]+)/);
  if (hashMatch) {
    const slug = hashMatch[1].toLowerCase();
    matchedPlan = plans.find(p => p.id.toLowerCase() === slug || p.id.replace(/-/g, '') === slug.replace(/-/g, ''));
  }

  // Check by Paystack or direct path: /buy/back-to-basics or /pay/back-to-basics
  if (!matchedPlan) {
    for (const p of plans) {
      if (
        lowerUrl.includes(p.id) ||
        (p.Url && lowerUrl.includes(p.Url.toLowerCase())) ||
        lowerUrl.includes(p.id.replace(/-/g, ''))
      ) {
        matchedPlan = p;
        break;
      }
    }
  }

  // Check by linkText matching plan title
  if (!matchedPlan && linkText && linkText !== 'your-website-url' && !linkText.startsWith('http')) {
    for (const p of plans) {
      if (lowerText.includes(p.title.toLowerCase()) || lowerText.includes(p.id.replace(/-/g, ' '))) {
        matchedPlan = p;
        break;
      }
    }
  }

  // Case A: Matched specific plan
  if (matchedPlan) {
    return {
      type: 'plan',
      badge: '✨ Recommended Diet Plan',
      badgeColor: 'text-emerald-700 bg-emerald-100/80',
      title: matchedPlan.title,
      subtitle: matchedPlan.Subtitle || 'Tailored Ghanaian Nutrition Guide',
      price: matchedPlan.price || '',
      buttonText: `Get Plan ${matchedPlan.price ? '• ' + matchedPlan.price : ''} →`,
      targetUrl: `/plans#${matchedPlan.id}`,
      img: matchedPlan.img,
      isExternal: false,
    };
  }

  // Case B: General plans link (/plans or dietwithdee.org/plans)
  if (lowerUrl.includes('/plans') || lowerText.includes('plan')) {
    // If article specifically relates to a plan, highlight that plan!
    const contextPlan = findMatchingPlanByContext(article);
    if (contextPlan) {
      return {
        type: 'plan-context',
        badge: '✨ Recommended For This Article',
        badgeColor: 'text-emerald-700 bg-emerald-100/80',
        title: contextPlan.title,
        subtitle: contextPlan.Subtitle || 'Tailored Ghanaian Nutrition Guide',
        price: contextPlan.price || '',
        buttonText: `View ${contextPlan.title} →`,
        targetUrl: `/plans#${contextPlan.id}`,
        img: contextPlan.img,
        secondaryText: 'or explore all 5 diet plans',
        secondaryUrl: '/plans',
        isExternal: false,
      };
    }

    // Default: All Plans showcase card
    return {
      type: 'all-plans',
      badge: '✨ All Nutrition Plans',
      badgeColor: 'text-orange-700 bg-orange-100/80',
      title: 'DietWithDee Meal Plans & Guides',
      subtitle: '5 tailored Ghanaian meal plans for weight loss, diabetes, blood pressure & healthy eating.',
      price: 'From ₵249',
      buttonText: 'View All Plans (5 Guides) →',
      targetUrl: '/plans',
      img: Logo,
      isExternal: false,
    };
  }

  // Case C: Survey link (/survey)
  if (lowerUrl.includes('/survey')) {
    return {
      type: 'survey',
      badge: '🎉 1-Year Anniversary Gift',
      badgeColor: 'text-emerald-700 bg-emerald-100/80',
      title: 'Take Our 2-Minute Survey — Get 20% Off',
      subtitle: 'Share your health goals with us and get an instant 20% discount code for any meal plan!',
      price: '20% OFF',
      buttonText: 'Take 2-Min Survey →',
      targetUrl: '/survey',
      img: Logo,
      isExternal: false,
    };
  }

  // Case D: Consultation link (/contact-us)
  if (lowerUrl.includes('/contact') || lowerUrl.includes('consult')) {
    return {
      type: 'consultation',
      badge: '🩺 1-on-1 Nutrition Guidance',
      badgeColor: 'text-emerald-700 bg-emerald-100/80',
      title: 'Book a 1-on-1 Consultation with Dee',
      subtitle: 'Personalized dietary assessment, meal strategy, and direct clinical guidance.',
      price: 'Book Session',
      buttonText: 'Book Consultation →',
      targetUrl: '/contact-us',
      img: Logo,
      isExternal: false,
    };
  }

  // Case E: General link fallback
  const cleanTitle = (linkText && linkText !== 'your-website-url' && !linkText.startsWith('http'))
    ? linkText
    : 'DietWithDee Resource';

  return {
    type: 'general',
    badge: '🌿 Featured Resource',
    badgeColor: 'text-emerald-700 bg-emerald-100/80',
    title: cleanTitle,
    subtitle: 'Learn more about healthy living and nutrition on DietWithDee.',
    price: '',
    buttonText: 'View Resource →',
    targetUrl: url,
    img: Logo,
    isExternal: url.startsWith('http'),
  };
};

/**
 * Returns raw HTML string of the shimmering card for injection into dangerouslySetInnerHTML.
 */
export const renderArticleLinkCardHTML = ({ url, linkText, article }) => {
  const data = resolveLinkCardData(url, linkText, article);

  const priceBadge = data.price
    ? `<span style="display:inline-block; font-size:12px; font-weight:700; color:#15803d; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 8px; border-radius:9999px; margin-left:8px;">${data.price}</span>`
    : '';

  const secondaryHtml = data.secondaryUrl
    ? `<div style="margin-top:6px;"><a href="${data.secondaryUrl}" style="font-size:12px; color:#15803d; text-decoration:underline; font-weight:600;">${data.secondaryText}</a></div>`
    : '';

  const targetAttr = data.isExternal ? 'target="_blank" rel="noopener noreferrer nofollow"' : '';

  return `
    <div class="my-8 p-4 sm:p-5 rounded-2xl border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-300 shimmer-card not-prose" style="text-decoration:none;">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div style="width:56px; height:56px; border-radius:12px; overflow:hidden; flex-shrink:0; background:#f0fdf4; border:1px solid #d1fae5; display:flex; align-items:center; justify-content:center;">
            <img src="${data.img}" alt="${data.title}" style="width:100%; height:100%; object-fit:cover; display:block;" />
          </div>

          <div class="flex-1 min-w-0">
            <div style="font-size:11px; font-weight:800; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:2px; display:flex; align-items:center; gap:4px;" class="${data.badgeColor}">
              <span>${data.badge}</span>
              ${priceBadge}
            </div>
            <h4 style="font-size:16px; font-weight:800; color:#1f2937; margin:0; line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${data.title}
            </h4>
            <p style="font-size:13px; color:#4b5563; margin:2px 0 0 0; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
              ${data.subtitle}
            </p>
            ${secondaryHtml}
          </div>
        </div>

        <a href="${data.targetUrl}" ${targetAttr} class="w-full sm:w-auto shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-[#F6841F] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] gap-1.5 cursor-pointer" style="text-decoration:none !important; color:#ffffff !important;">
          <span>${data.buttonText}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>

      </div>
    </div>
  `.trim();
};
