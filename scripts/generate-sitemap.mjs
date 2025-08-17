import { writeFileSync } from "node:fs";

const BASE = "https://dietwithdee.org";

const routes = [
  "/", 
  "/about",
  "/services",
  "/blog",
  "/contactUs",
  "/knowYourBody",
  "/plans"
  // add any other public pages you want indexed
];

const urls = routes.map(
  (p) => `<url><loc>${BASE}${p}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
).join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

writeFileSync("public/sitemap.xml", xml);
console.log("✅ sitemap.xml generated");
