## 2026-05-25 - [XSS Mitigation using DOMPurify]
**Vulnerability:** Found multiple instances of `dangerouslySetInnerHTML` being used with un-sanitized content (from article content or email templates).
**Learning:** In React, setting raw HTML content directly is a security risk as it can lead to Cross-Site Scripting (XSS).
**Prevention:** Always use a sanitation library like `DOMPurify.sanitize()` before passing content into `dangerouslySetInnerHTML` to strip potentially malicious scripts.
