import fs from 'fs';

let content = fs.readFileSync('src/Pages/Blog/Blog.jsx', 'utf8');

// 1. Add import
if (!content.includes('renderArticleLinkCardHTML')) {
  const targetImport = "import 'react-lazy-load-image-component/src/effects/blur.css';";
  const replacementImport = "import { renderArticleLinkCardHTML } from '../../Components/ArticleLinkCard';\nimport 'react-lazy-load-image-component/src/effects/blur.css';";
  content = content.replace(targetImport, replacementImport);
}

// 2. Replace transformArticleContent
const startMark = '  const transformArticleContent = (html) => {';
const endMark = '  // Derive top 5 tags for the filter pills';

const startIndex = content.indexOf(startMark);
const endIndex = content.indexOf(endMark);

if (startIndex !== -1 && endIndex !== -1) {
  const newFunction = `  const transformArticleContent = (html, article = null) => {
    if (!html) return '';
    try {
      // 1. Convert Markdown links [Text](URL) in article body to standard <a> tags
      // Handles cases like [your-website-url](https://your-website-url/plans) or [DietWithDee Plans](https://dietwithdee.org/plans)
      let processed = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, (match, linkText, url) => {
        return \`<a href="\${url}">\${linkText}</a>\`;
      });

      const parser = new DOMParser();
      const doc = parser.parseFromString(processed, 'text/html');

      const createCardNode = (url, linkText) => {
        const cardHtml = renderArticleLinkCardHTML({ url, linkText, article });
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = cardHtml;
        return wrapper.firstElementChild || wrapper;
      };

      // 2. Process all explicit <a> tags
      const links = Array.from(doc.querySelectorAll('a'));
      links.forEach((a) => {
        const href = a.getAttribute('href') || '';
        const lowerHref = href.toLowerCase();
        const isPaystack =
          lowerHref.includes('paystack.shop') || lowerHref.includes('paystack.com');
        const isPlans =
          lowerHref.includes('/plans') ||
          lowerHref.includes('plans') ||
          lowerHref.includes('your-website-url') ||
          lowerHref.includes('ytd.org');
        const isSurvey = lowerHref.includes('/survey') || lowerHref.includes('survey');
        const isConsult = lowerHref.includes('/contact') || lowerHref.includes('consult');

        if (isPaystack || isPlans || isSurvey || isConsult) {
          const cardNode = createCardNode(href, a.textContent);
          if (a.parentNode) {
            const parent = a.parentNode;
            if (
              parent.tagName === 'P' &&
              parent.textContent.trim() === a.textContent.trim()
            ) {
              if (parent.parentNode) parent.parentNode.replaceChild(cardNode, parent);
            } else {
              parent.replaceChild(cardNode, a);
            }
          }
        }
      });

      // 3. Process raw text nodes for unlinked plain-text URLs
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      const planUrlRegex =
        /(https?:\\/\\/(?:www\\.)?(?:paystack\\.shop|paystack\\.com)\\/(?:pay|product|buy)\\/[a-zA-Z0-9_-]+|https?:\\/\\/(?:www\\.)?(?:your-website-url|ytd\\.org|dietwithdee\\.org|dietwithdee\\.com)\\/(?:plans|survey)(?:#[a-zA-Z0-9_-]+)?|\\/(?:plans|survey)(?:#[a-zA-Z0-9_-]+)?)/gi;

      textNodes.forEach((textNode) => {
        if (
          textNode.parentNode &&
          textNode.parentNode.closest('a, .not-prose, .shimmer-card')
        ) {
          return;
        }

        const text = textNode.nodeValue;
        if (planUrlRegex.test(text)) {
          const fragment = doc.createDocumentFragment();
          let lastIndex = 0;
          planUrlRegex.lastIndex = 0;
          let match;

          while ((match = planUrlRegex.exec(text)) !== null) {
            const matchedUrl = match[1];
            const beforeText = text.substring(lastIndex, match.index);
            if (beforeText) {
              fragment.appendChild(doc.createTextNode(beforeText));
            }

            const cardNode = createCardNode(matchedUrl, matchedUrl);
            fragment.appendChild(cardNode);
            lastIndex = planUrlRegex.lastIndex;
          }

          const afterText = text.substring(lastIndex);
          if (afterText) {
            fragment.appendChild(doc.createTextNode(afterText));
          }

          if (textNode.parentNode) {
            textNode.parentNode.replaceChild(fragment, textNode);
          }
        }
      });

      return doc.body.innerHTML;
    } catch (e) {
      console.error('HTML formatting error:', e);
      return html;
    }
  };\n\n`;

  content = content.substring(0, startIndex) + newFunction + content.substring(endIndex);
  console.log('transformArticleContent replaced successfully');
} else {
  console.error('Could not find markers for transformArticleContent');
}

// 3. Update dangerouslySetInnerHTML and add smooth SPA navigation onClick
const oldRender = `<div
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-stone-800 leading-relaxed article-body"
                  dangerouslySetInnerHTML={{ __html: transformArticleContent(selectedArticle.content) }}
                />`;

const newRender = `<div
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-stone-800 leading-relaxed article-body"
                  onClick={(e) => {
                    const a = e.target.closest('a');
                    if (!a) return;
                    const href = a.getAttribute('href');
                    if (href && (href.startsWith('/') || href.startsWith('#'))) {
                      e.preventDefault();
                      if (href.startsWith('#')) {
                        const el = document.getElementById(href.slice(1));
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate(href);
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: transformArticleContent(selectedArticle.content, selectedArticle) }}
                />`;

if (content.includes(oldRender)) {
  content = content.replace(oldRender, newRender);
  console.log('Article content render & navigation updated');
} else {
  console.log('oldRender target not found directly, checking alternate whitespace...');
  // regex replace for the render div
  content = content.replace(
    /dangerouslySetInnerHTML=\{\{\s*__html:\s*transformArticleContent\(selectedArticle\.content\)\s*\}\}/,
    `onClick={(e) => {
                    const a = e.target.closest('a');
                    if (!a) return;
                    const href = a.getAttribute('href');
                    if (href && (href.startsWith('/') || href.startsWith('#'))) {
                      e.preventDefault();
                      if (href.startsWith('#')) {
                        const el = document.getElementById(href.slice(1));
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate(href);
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: transformArticleContent(selectedArticle.content, selectedArticle) }}`
  );
}

fs.writeFileSync('src/Pages/Blog/Blog.jsx', content, 'utf8');
console.log('Blog.jsx saved successfully');

