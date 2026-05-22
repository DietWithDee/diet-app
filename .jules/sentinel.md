## 2024-05-22 - [XSS Protection]
**Vulnerability:** Found multiple usages of `dangerouslySetInnerHTML` directly rendering HTML content from articles and templates.
**Learning:** `dangerouslySetInnerHTML` renders raw HTML, which makes it highly susceptible to XSS vulnerabilities. Truncation before rendering can also break HTML layout if the content is not sanitized.
**Prevention:** Use DOMPurify and `DOMPurify.sanitize()` to ensure all HTML is safe to render and all tags are properly closed, especially before or after truncation.
