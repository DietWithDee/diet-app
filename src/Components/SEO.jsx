// src/Components/SEO.jsx
import { Helmet } from "react-helmet-async";

// Edit these for your site
const BASE_URL = "https://dietwithdee.org";
const SITE_NAME = "DietWithDee";
const DEFAULT_TITLE = "DietWithDee – Registered Dietitian in Ghana";
const DEFAULT_DESC =
  "Expert nutrition advice, weight loss plans, and wellness coaching from registered dietitian Nana Ama Dwamena.";

function absUrl(url) {
  if (!url) return undefined;
  try {
    return new URL(url, BASE_URL).toString();
  } catch {
    return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
  }
}

/**
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.keywords]
 * @param {string} [props.image] - absolute or relative; we coerce to absolute
 * @param {string} [props.url]   - absolute or relative; we coerce to absolute
 * @param {object|object[]} [props.jsonLd] - JSON-LD object or array of objects
 * @param {"website"|"article"|"product"} [props.ogType]
 * @param {string} [props.lang] - e.g. "en"
 * @param {boolean} [props.noindex]
 */
export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  jsonLd,
  ogType = "website",
  lang = "en",
  noindex = false,
}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonical = absUrl(url);
  const ogImage = absUrl(image);

  return (
    <Helmet>
      {/* document language */}
      {lang && <html lang={lang} />}

      {/* indexing control */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* core meta */}
      <title>{pageTitle}</title>
      <meta name="description" content={description || DEFAULT_DESC} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || DEFAULT_DESC} />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description || DEFAULT_DESC} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}
