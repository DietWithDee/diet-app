// scripts/prerender.mjs
import path from "node:path";
import fs from "node:fs/promises";
import express from "express";
import puppeteer from "puppeteer";

const DIST = path.resolve("dist");
const PORT = 5050;

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/blog",
  "/contactUs",
  "/knowYourBody",
  "/plans",
];

function outPathFor(route) {
  return route === "/"
    ? path.join(DIST, "index.html")
    : path.join(DIST, route.replace(/^\//, ""), "index.html");
}

async function startStaticServer() {
  const app = express();
  app.use(express.static(DIST, { extensions: ["html"] }));
 app.use((req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => resolve(server));
  });
}

// helper delay
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

(async () => {
  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "media", "font"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  page.setDefaultNavigationTimeout(90_000);

  for (const route of ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });

      // wait until Helmet has injected <title> or description
      await page
        .waitForFunction(
          () =>
            document.title.length > 0 ||
            !!document.querySelector('meta[name="description"]'),
          { timeout: 10_000 }
        )
        .catch(() => {});

      await delay(300);

      const html = await page.content();

      const outFile = outPathFor(route);
      await fs.mkdir(path.dirname(outFile), { recursive: true });
      await fs.writeFile(outFile, html, "utf8");

      console.log("✔ prerendered", route, "→", path.relative(process.cwd(), outFile));
    } catch (err) {
      console.error("✖ prerender failed for", route, "\n  ", err?.message || err);
    }
  }

  await browser.close();
  server.close();
})();
