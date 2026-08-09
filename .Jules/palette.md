## 2025-02-27 - Added ARIA labels to icon-only navigation elements in NavBar
**Learning:** Icon-only navigation links (like those for "My Journey" and "Plans") and toggle buttons (like the hamburger menu) in the top-level NavBar component were lacking `aria-label`s. This creates significant accessibility gaps for screen reader users who rely on these labels to understand the purpose of these key interface elements.
**Action:** Always verify that icon-only interactive elements, especially those crucial to global navigation, have clear and descriptive `aria-label` attributes. Additionally, use `aria-expanded` on toggle buttons to communicate their state to assistive technologies.

## 2025-02-27 - Added ARIA labels to footer social links & chat
**Learning:** The footer contained icon-only social media links and a floating WhatsApp chat button without accessible names. This made it difficult for screen readers to identify the destination of these important interactive elements.
**Action:** When implementing icon-only links or buttons, always ensure they are paired with a descriptive `aria-label` to provide context for assistive technologies. Also add `focus-visible` styling to confirmation popups buttons to enhance keyboard accessibility.
