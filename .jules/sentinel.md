## 2025-05-29 - Cross-Site Scripting (XSS) via dangerouslySetInnerHTML
**Vulnerability:** The application was using React's `dangerouslySetInnerHTML` to render user-generated content (blog articles and email templates) directly into the DOM without sanitization, creating a high-severity XSS risk.
**Learning:** Even internal or admin-generated content must be treated as untrusted and sanitized before rendering to prevent malicious script injection, especially if an admin account is compromised.
**Prevention:** Always use a robust HTML sanitizer like `dompurify` (`DOMPurify.sanitize(content)`) before passing any dynamic HTML string to `dangerouslySetInnerHTML`.
