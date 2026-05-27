## 2024-05-20 - Cross-Site Scripting (XSS) via dangerouslySetInnerHTML
**Vulnerability:** Found unsanitized usage of `dangerouslySetInnerHTML` when rendering article content and email templates in React components. This allowed raw HTML (potentially including `<script>` tags) directly into the DOM, which could lead to Cross-Site Scripting (XSS).
**Learning:** React's built-in XSS protections do not apply when using `dangerouslySetInnerHTML`. Relying on internal data sanitization (like assuming admin-only input is safe) is not sufficient defense-in-depth, especially if content could be compromised or manually edited later.
**Prevention:** Always use `DOMPurify.sanitize()` (or a similar sanitization library) to wrap any string before passing it into `dangerouslySetInnerHTML`.
