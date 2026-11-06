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
 * Resolves complete metadata for an embedded link card.
 * NOTE: General /plans links strictly remain All Plans links and are NEVER hijacked by article context.
 */
export const resolveLinkCardData = (rawUrl, linkText = '', _article = null) => {
  const url = normalizeArticleUrl(rawUrl);
  const lowerUrl = url.toLowerCase();
  const lowerText = (linkText || '').toLowerCase();

  // 1. Check for specific plan by Path, ID, Hash, or Paystack link
  let matchedPlan = null;

  // Check by path: e.g. /plans/fasting-guide or /plans/preview/fasting-guide
  const pathMatch = url.match(/\/plans\/(?:preview\/)?([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1] && pathMatch[1] !== 'preview') {
    const slug = pathMatch[1].toLowerCase();
    matchedPlan = plans.find(
      (p) =>
        p.id.toLowerCase() === slug ||
        p.id.replace(/-/g, '') === slug.replace(/-/g, '')
    );
  }

  // Check by hash: e.g. /plans#blood-sugar-balance
  if (!matchedPlan) {
    const hashMatch = url.match(/#([a-zA-Z0-9_-]+)/);
    if (hashMatch) {
      const slug = hashMatch[1].toLowerCase();
      matchedPlan = plans.find(
        (p) =>
          p.id.toLowerCase() === slug ||
          p.id.replace(/-/g, '') === slug.replace(/-/g, '')
      );
    }
  }

  // Check by Paystack or direct path: /buy/fasting-guide, /buy/back-to-basics, etc.
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

  // Case A: Matched specific plan -> points strictly to that plan's preview page
  if (matchedPlan) {
    const isPaystackDirect = lowerUrl.includes('paystack.com') || lowerUrl.includes('paystack.shop');
    return {
      type: 'plan',
      badge: 'Diet Plan Guide',
      badgeColor: 'text-emerald-700 bg-emerald-100/80',
      title: matchedPlan.title,
      subtitle: matchedPlan.Subtitle || 'Tailored Ghanaian Nutrition Guide',
      price: matchedPlan.price || '',
      buttonText: isPaystackDirect ? 'Buy Now →' : 'Preview Plan →',
      targetUrl: isPaystackDirect ? rawUrl : `/plans/${matchedPlan.id}`,
      displayUrl: rawUrl || `/plans/${matchedPlan.id}`,
      img: matchedPlan.previewCover || matchedPlan.img,
      isExternal: isPaystackDirect,
    };
  }

  // Case B: General plans link (/plans or dietwithdee.org/plans) -> strictly All Plans
  if (lowerUrl.includes('/plans') || lowerText.includes('plan')) {
    return {
      type: 'all-plans',
      badge: 'Nutrition Plans & Guides',
      badgeColor: 'text-emerald-700 bg-emerald-100/80',
      title: 'DietWithDee Plans Catalog',
      subtitle: 'Tailored Ghanaian meal plans for weight loss, fasting, blood sugar balance & healthy habits.',
      price: 'From ₵99',
      buttonText: 'View All Plans →',
      targetUrl: '/plans',
      displayUrl: rawUrl || '/plans',
      img: Logo,
      isExternal: false,
    };
  }

  // Case C: Survey link (/survey)
  if (lowerUrl.includes('/survey')) {
    return {
      type: 'survey',
      badge: 'Anniversary Gift',
      badgeColor: 'text-emerald-700 bg-emerald-100/80',
      title: 'Take Our 2-Minute Survey',
      subtitle: 'Share your health goals with us and get an instant 20% discount code for any meal plan!',
      price: '20% OFF',
      buttonText: 'Take Survey →',
      targetUrl: '/survey',
      displayUrl: rawUrl || '/survey',
      img: Logo,
      isExternal: false,
    };
  }

  // Case D: Consultation link (/contact-us)
  if (lowerUrl.includes('/contact') || lowerUrl.includes('consult')) {
    return {
      type: 'consultation',
      badge: '1-on-1 Guidance',
      badgeColor: 'text-emerald-700 bg-emerald-100/80',
      title: '1-on-1 Nutrition Consultation',
      subtitle: 'Personalized dietary assessment, meal strategy, and direct clinical guidance.',
      price: 'Book Session',
      buttonText: 'Book Consultation →',
      targetUrl: '/contact-us',
      displayUrl: rawUrl || '/contact-us',
      img: Logo,
      isExternal: false,
    };
  }

  // Case E: General link fallback
  const isPaystack = lowerUrl.includes('paystack.com') || lowerUrl.includes('paystack.shop');
  const cleanTitle = (linkText && linkText !== 'your-website-url' && !linkText.startsWith('http'))
    ? linkText
    : (isPaystack ? 'Direct Purchase Link' : 'DietWithDee Resource');

  return {
    type: 'general',
    badge: 'Featured Resource',
    badgeColor: 'text-emerald-700 bg-emerald-100/80',
    title: cleanTitle,
    subtitle: 'Learn more about healthy living and nutrition on DietWithDee.',
    price: '',
    buttonText: isPaystack ? 'Buy Now →' : 'View Resource →',
    targetUrl: url,
    displayUrl: rawUrl || url,
    img: Logo,
    isExternal: url.startsWith('http') || isPaystack,
  };
};

/**
 * Returns clean, lightweight HTML string of a sleek button bar with an attached link and thin title.
 */
export const renderArticleLinkCardHTML = ({ url, linkText, article }) => {
  const data = resolveLinkCardData(url, linkText, article);

  const priceBadge = data.price
    ? `<span style="font-size:11px; font-weight:600; color:#15803d; background:#ecfdf5; border:1px solid #a7f3d0; padding:1.5px 7px; border-radius:9999px; margin-left:8px; display:inline-block; vertical-align:middle; letter-spacing:0;">${data.price}</span>`
    : '';

  const targetAttr = data.isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
  const rawDisplay = (data.displayUrl || url || data.targetUrl).trim();
  const cleanDisplayUrl = rawDisplay.startsWith('http')
    ? rawDisplay
    : `https://dietwithdee.org${rawDisplay.startsWith('/') ? '' : '/'}${rawDisplay}`;

  return `
    <div class="my-3 p-3 sm:px-4 sm:py-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 not-prose shadow-2xs" style="text-decoration:none;">
      
      <div class="min-w-0 flex-1">
        <div style="font-size:15px; font-weight:500; color:#1f2937; line-height:1.3; margin:0; display:flex; align-items:center; flex-wrap:wrap;">
          <span style="font-weight:500;">${data.title}</span>
          ${priceBadge}
        </div>
        <a href="${data.targetUrl}" ${targetAttr} class="text-xs text-stone-500 hover:text-emerald-700 underline truncate block mt-0.5" style="text-decoration:underline; font-weight:400; font-size:12px; color:#6b7280;">
          ${cleanDisplayUrl}
        </a>
      </div>

      <a href="${data.targetUrl}" ${targetAttr} class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#F6841F] hover:bg-orange-600 active:scale-95 text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs hover:shadow transition-all shrink-0 cursor-pointer" style="text-decoration:none !important; color:#ffffff !important; white-space:nowrap;">
        <span>${data.buttonText}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>

    </div>
  `.trim();
};
