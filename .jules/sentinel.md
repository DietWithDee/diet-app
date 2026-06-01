## 2026-06-01 - Missing XSS protection on dynamic HTML rendered content
**Vulnerability:** XSS vulnerability through usage of `dangerouslySetInnerHTML` without prior sanitization of user-submitted content.
**Learning:** Found multiple usages of `dangerouslySetInnerHTML` where data like blog posts and emails was rendered directly. When data from an external source is rendered with `dangerouslySetInnerHTML` without any sanitization, malicious code can be executed in a user's browser, enabling XSS attacks.
**Prevention:** Always use `DOMPurify.sanitize()` to clean dynamic content before passing it to `dangerouslySetInnerHTML`.
