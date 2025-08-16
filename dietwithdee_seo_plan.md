
# DietWithDee SEO Execution Plan

## 1. Global Codebase Setup
**Files Affected:** `index.html`, `src/components/Layout.jsx`, `src/components/SEO.jsx`, `package.json`

**Tasks:**
- Install SEO helper libraries: react-helmet-async, sitemap-generator-cli
- Create reusable `<SEO>` component for dynamic meta titles, descriptions, OpenGraph tags
- Implement Google Analytics + Google Search Console verification code in `<head>`
- Add global favicon, manifest.json for PWA compliance
- Ensure site uses HTTPS and canonical URLs

---

## 2. Keyword Targeting Map
**Files Affected:** `src/pages/*.jsx`

**Tasks:**
For each page:
- Insert primary keyword in `<title>`, H1, and first 100 words of body text
- Use secondary keywords in subheadings (H2-H3)
- Example:
  - Home page → "Best Dietitian in Ghana | Nana Ama Dwamena"
  - Blog page → "Nutrition Tips from Ghana’s Leading Dietitian"

---

## 3. Meta Tag & OpenGraph Optimization
**Files Affected:** `src/components/SEO.jsx`, page components in `src/pages`

**Tasks:**
- Add meta tags for description, OpenGraph, and Twitter card
- Dynamically generate titles and descriptions based on props

---

## 4. Schema Markup
**Files Affected:** `public/index.html` (or via `<Helmet>` in Layout.jsx)

**Tasks:**
Insert JSON-LD schema:
- Person schema for "Nana Ama Dwamena"
- Organization schema for "Diet With Dee"
- FAQ schema on services page
- BlogPosting schema for each article

---

## 5. Image Optimization
**Files Affected:** `/public/images`, `src/components/*`

**Tasks:**
- Compress all images to WebP format
- Add descriptive alt text with keywords
- Implement lazy loading via `loading="lazy"`

---

## 6. Blog Content Structure
**Files Affected:** `src/pages/blog/[slug].jsx`

**Tasks:**
- Support markdown with frontmatter for SEO
- Auto-generate `<title>`, meta description, and OpenGraph image from frontmatter
- Include Table of Contents for long posts
- Inject internal links to related posts and main services page

---

## 7. Local SEO
**Files Affected:** `src/pages/contact.jsx`

**Tasks:**
- Embed Google Maps location
- Add business opening hours
- Include NAP (Name, Address, Phone) in footer site-wide

---

## 8. Performance Optimization
**Files Affected:** Whole codebase

**Tasks:**
- Enable code splitting in Vite config
- Implement image lazy loading and minification
- Preload hero section images
- Use Cloudflare or Vercel for CDN delivery

---

## 9. Backlink Integration
**Files Affected:** `README.md`

**Tasks:**
- Add "Press & Media" page with links to guest posts and mentions
- Create downloadable press kit for bloggers/journalists

---

## 10. Continuous Tracking
**Files Affected:** Global project

**Tasks:**
- Connect Google Search Console
- Connect Google Analytics 4
- Track clicks on "Book Consultation" buttons

---

## Expected Deliverables
- Fully optimized DietWithDee.com for Ghanaian SEO dominance
- Structured schema for rich results
- High Google Lighthouse score (>90 in all metrics)
- Nana Ama Dwamena ranking top 3 for “best dietitian in Ghana” within 6-12 months
