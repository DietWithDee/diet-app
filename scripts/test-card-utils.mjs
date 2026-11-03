import { normalizeArticleUrl, resolveLinkCardData, renderArticleLinkCardHTML } from '../src/utils/articleLinkCardUtils.js';

console.log('--- Testing normalizeArticleUrl ---');
console.log('1. https://your-website-url/plans ->', normalizeArticleUrl('https://your-website-url/plans'));
console.log('2. https://dietwithdee.org/plans ->', normalizeArticleUrl('https://dietwithdee.org/plans'));
console.log('3. https://dietwithdee.org/plans#blood-sugar-balance ->', normalizeArticleUrl('https://dietwithdee.org/plans#blood-sugar-balance'));

console.log('\n--- Testing resolveLinkCardData ---');
const card1 = resolveLinkCardData('https://your-website-url/plans', 'your-website-url');
console.log('Card 1 (Placeholder link):', { title: card1.title, targetUrl: card1.targetUrl, badge: card1.badge, buttonText: card1.buttonText });

const card2 = resolveLinkCardData('/plans#blood-sugar-balance');
console.log('Card 2 (Specific Plan):', { title: card2.title, price: card2.price, targetUrl: card2.targetUrl, buttonText: card2.buttonText });

const card3 = resolveLinkCardData('https://paystack.com/buy/back-to-basics');
console.log('Card 3 (Paystack buy):', { title: card3.title, price: card3.price, targetUrl: card3.targetUrl });

const card4 = resolveLinkCardData('/survey');
console.log('Card 4 (Survey):', { title: card4.title, targetUrl: card4.targetUrl });

console.log('\n--- Testing HTML Card Rendering ---');
const htmlOutput = renderArticleLinkCardHTML({ url: 'https://your-website-url/plans', linkText: 'your-website-url' });
console.log('Generated HTML length:', htmlOutput.length);
console.log('Includes shimmer-card:', htmlOutput.includes('shimmer-card'));
console.log('Includes href="/plans":', htmlOutput.includes('href="/plans"'));
console.log('Does NOT include "your-website-url":', !htmlOutput.includes('your-website-url'));
