import { Helmet } from "react-helmet";

/**
 * BlogArticleSEO component for dynamic meta tags and schema for blog articles
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} [props.keywords]
 * @param {string} [props.image]
 * @param {string} [props.url]
 * @param {string} [props.author]
 * @param {string} [props.datePublished]
 */
export default function BlogArticleSEO({ title, description, keywords, image, url, author, datePublished }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image,
    "url": url,
    "author": {
      "@type": "Person",
      "name": author || "Nana Ama Dwamena"
    },
    "datePublished": datePublished,
    "publisher": {
      "@type": "Organization",
      "name": "Diet With Dee",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dietwithdee.org/src/assets/LOGO.png"
      }
    }
  };
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {url && <link rel="canonical" href={url} />}
      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      {/* BlogPosting Schema */}
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
