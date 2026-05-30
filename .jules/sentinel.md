## 2024-05-30 - [DOMPurify for dynamically injected HTML content]
**Vulnerability:** User-provided or dynamic HTML content was passed to React's dangerouslySetInnerHTML without sanitization, leading to Cross-Site Scripting (XSS) risks.
**Learning:** Even though the content might have been generated on the server or sanitized via another method, relying on unsanitized input at the frontend level is a significant risk. The application's architecture lacked a unified frontend sanitization step before injecting raw HTML.
**Prevention:** Always use a robust sanitization library like DOMPurify before passing content to dangerouslySetInnerHTML, regardless of the source. Ensure this is a standard practice across the entire frontend codebase.
