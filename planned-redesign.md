# Planned Redesign — Context, Learnings & Roadmap

> **Status:** Unreleased / Stashed Feature (`feature/planned-redesign`)  
> **Target Release:** Next Year (2027)  
> **Design Inspiration:** [quills-and-ink-hub.pages.dev](https://quills-and-ink-hub.pages.dev)  
> **Brand Identity:** DietWithDee — Nana Ama Dwamena, RD  

---

## 1. Executive Summary & Purpose

This document provides complete architectural and design context for the **Planned Redesign** of the DietWithDee web platform. The user requested an overhaul inspired by the clean, architectural, and editorial design of Quills & Ink, while strictly preserving DietWithDee's authentic brand voice, Ghanaian food culture, and multi-generational inclusivity.

Because this feature is slated for release next year, all working code has been captured in a dedicated git branch (`feature/planned-redesign`) and git stash (`planned redesign`) so development can resume smoothly without risking the current production release.

---

## 2. Core Design Tokens & Rules

### A. Typography Hierarchy
- **Calligraphic Script**: *Great Vibes* (`.font-script`) — used sparingly for decorative accents (e.g., *"Wellness"* hero script, *"Our Story"* kicker).
- **Headings & Editorial Titles**: *Cormorant Garamond* (`.font-serif-cormorant`) — clean, dignified serif font for section titles, modal headers, and service titles.
- **Body, Navigation & Buttons**: *Montserrat* (`.font-montserrat`) — crisp, modern sans-serif with high legibility across mobile and desktop.
- **Brand Wordmark**: *Transcity* (`.font-transcity`) — original DietWithDee brand logo font.

### B. Color Palette Decisions
- **Brand Primary**: **Signature Orange `#F6841F`** (hover: `#e07312`).
  > **CRITICAL RULE**: DietWithDee's primary color is **orange**, NOT peach or brown. All key CTAs, active indicators, and accent bars on Home, Nav, and Plans use `#F6841F`.
- **Earthy Culinary Browns (`#3B2215`, `#5A3825`, `#7A4B2D`, `#8C532B`, `#C68B59`)**:
  > **CRITICAL EXCEPTION**: Specifically used on the **OnTrack Diabetes page** under *"What I Should Cook"*. In diabetic nutrition, warm earthy brown symbolizes unrefined low-GI whole grains, wholesome tubers, cowpea stews, and comforting Ghanaian home cooking.
- **Botanical Greens (`text-green-800`, `text-green-600`)**: Preserved for brand nutrition identity, badges, and trust indicators.
- **Neutral Dark Tone**: Deep warm black / stone (`stone-950`, `stone-900`) instead of harsh pure black.

### C. Architectural Elements
- **Geometry**: Non-rounded cards (`rounded-none`) with razor-sharp borders (`border-stone-200`, `border-white/20`).
- **Glassmorphism**: Layered frosted glass panels (`backdrop-blur-xl bg-white/70` and `bg-stone-900/80`) with soft ambient radial glows.
- **Hero Imagery**: Natural, warm lighting with minimal darkening veils (never heavily blacked out or vignetted).

---

## 3. What Has Been Built & Completed

### 3.1. Navigation & Mobile Drawer (`src/Components/NavBar/NavBar.jsx`)
- **Dynamic Scroll Transparency**: Transparent on the hero with subtle frosted glass (`bg-stone-950/30 backdrop-blur-md`), transitioning smoothly to solid white (`bg-white/95`) upon scrolling past 40px.
- **Right-Pill CTA**: Removed the previous person icon so the signature brand orange `"Book"` button sits on the far right.
- **Mobile Sidebar Inversion**:
  - Now slides in from the **left towards the right** (`fixed left-0 ... -translate-x-full -> translate-x-0`).
  - Backdrop features a subtle blur (`bg-black/60 backdrop-blur-xs z-[60]`).
  - **Fixed Transparency Bug**: Drawer has an explicit 100% solid, opaque white background (`style={{ backgroundColor: '#ffffff', opacity: 1 }}`) and dark text classes (`text-stone-900`), preventing any inheritance from transparent headers.
  - Integrated a dedicated `"Book a Session"` CTA button inside the mobile drawer.
- **Transparent Logo**: Converted `LOGO.webp` to transparent background via Python Pillow (saved in `src/assets/` and `public/`).

### 3.2. Homepage Redesign (`src/Pages/Home/Home.jsx`)
1. **Hero Section**:
   - Uses high-res `homeimg1.jpg` with natural warm lighting.
   - Script title: *"Wellness"*.
   - Subtitle: *"Welcome to DietWithDee, your ultimate destination for personalized diet plans and consultations!"*.
   - CTAs: Primary brand orange button **"Know Your Body"** (`/knowYourBody`) + white ghost button **"Book a Session"** (`/contactus`).
   - Trust points: **500+ Success Stories** &bull; **Expert Dietitians** &bull; **Personalized Plans**.
2. **Welcome Video Modal Card**:
   - Non-rounded (`rounded-none`), architectural border (`border-stone-200`), minimal crisp padding.
   - Edge-to-edge sped-up loop video (`Hero_animation.mp4` playing at 1.75x speed with no speed indicator badge).
   - Exact DietWithDee copy maintained:
     > *"Welcome to DietWithDee, your ultimate destination for personalized diet plans and consultations! Whether you're aiming to lose weight, manage a health condition, or simply eat healthier, we're here to make it happen. Join us on a delicious journey to a better you!"*  
     > *"“We strive continually to help you take control of your health in all aspects.”"*
   - Buttons: *"View Our Plans"* and *"Book a Session"*.
3. **Services Carousel (Quills & Ink Style)**:
   - **Blurred Tulip Background**: Yellow tulips backdrop softly blurred (`blur-3xl`, `opacity-20`) behind dark stone-950 overlay.
   - **3 Core Cards**:
     1. **Plans**: Uses `homeimg1.jpg`, leads to `/plans`.
     2. **Consultations**: Uses corporate wellness event image `B2B.webp`, leads to `/contactus`.
     3. **Events**: Uses TV3 broadcast event image `tv3_event.jpg`, leads to `/about`.
   - Top category tags (`01 / PERSONALIZED PLANS`), centered Cormorant Garamond serif overlay titles, previous/next chevron buttons (`<`, `>`).
   - Active service preview pane below the track with direct brand orange CTA button.
4. **Our Story & Stats Counter**:
   - Restored exact original brand language, quote, and Dee's credentials (*Dee - Professional Nutritionist, Nana Ama Dwamena, RD., Founder, DietWithDee*).
   - Stats counters: **500+ Happy Clients**, **5+ Years of Experience**, **95% Client Approval**.

### 3.3. OnTrack Diabetic Care Page Redesign (`src/Pages/OnTrack/OnTrack.jsx`)
- **Multi-Generational Thoughtful Care**:
  - **Children & Teens (Type 1)**: Child-friendly portioning, school lunchbox carb-counting, non-restrictive growth support.
  - **Adults & Pre-Diabetes**: HbA1c reduction, workplace energy balance, insulin resistance reversal.
  - **Seniors & Older Adults**: Digestion-friendly meals, kidney/blood-pressure safe seasonings, traditional comfort staples without fear.
  - Patient category selector in form: *Child/Teenager*, *Adult Patient*, *Senior/Parent*.
- **"What I Should Cook" Culinary Glass Showcase**:
  - 4-tab interactive panel styled in rich warm earthy browns:
    1. *Wholesome Low-GI Ghanaian Carbs*: Boiled unripe plantain ampesi, whole grain brown rice waakye, heritage fonio & rolled oats, roasted sweet potato.
    2. *Blood-Sugar Stabilizing Proteins*: Steamed & grilled tilapia/salmon, Ghanaian smoked mackerel, cowpea & bambara groundnut stews, boiled eggs.
    3. *Antioxidant Greens & Stews*: Kontomire stew, garden eggs (*abrobe*) stew, okra draw soup (natural soluble fiber).
    4. *Nourishing Soups & Wholesome Fats*: Light fish & tomato pepper soup, fresh avocado, roasted pumpkin seeds, cinnamon herbal infusions.
- **Screen-Filling Expansive Glass Layout**:
  - Expands to `max-w-7xl` with floating frosted glass panels (`backdrop-blur-xl bg-white/70`).
  - Clear package selection: Initial (GH₵ 600 / 45 mins) vs Follow-Up (GH₵ 300 / 25 mins).
  - High-accessibility form with large inputs and optional notes.
  - Seamless Paystack payment integration.
  - OnTrack App download badges for Google Play and Apple App Store.
  - Family-centric FAQs.

---

## 4. Key Learnings & Gotchas for Future AI

1. **React Router v7 Package Split**:
   - **Never mix `from 'react-router'` and `from 'react-router-dom'`**.
   - Doing so causes Vite to bundle two separate instances of the React Router context, resulting in `TypeError: Cannot read properties of null (reading 'useContext')` in `useLocation()` / `usePageTracking()`.
   - **Rule**: ALWAYS import from `'react-router-dom'`.
2. **Brand Voice vs Design Inspiration**:
   - While Quills & Ink was used for layout geometry, typography contrast, and glassmorphism, **never overwrite DietWithDee's original voice** with literary/funeral text. DietWithDee is a clinical nutrition service in Ghana.
3. **Color Discipline**:
   - Brand orange is `#F6841F`. Do not replace it with brown or peach globally.
   - Brown elements are strictly reserved for the diabetic cooking section on `/ontrack`.
4. **New Image Assets Available in Repository**:
   - `src/assets/images/homeimg1.jpg` (Hero & Plans card)
   - `src/assets/images/tv3_event.jpg` (TV3 Media & Events card)
   - `src/assets/images/B2B.webp` (Consultation event card)
   - `src/assets/images/plancarousel.jpg`
   - `src/assets/LOGO.webp` & `public/LOGO.png` (Transparent logo)

---

## 5. What Remains for the Full Launch (Next Steps)

When resuming this work next year, the following areas should be extended with the same design system:

1. **Plans Page (`src/Pages/Plans/Plans.jsx`)**:
   - Modernize subscription cards and tier comparisons using the clean non-rounded glass aesthetic.
   - Refine the plan recommendation modal.
2. **About Us Page (`src/Pages/About/About.jsx`)**:
   - Present Nana Ama Dwamena's professional journey, clinical credentials, and media features with editorial serif typography.
3. **Services & Events Page (`src/Pages/Services/Services.jsx`)**:
   - Align the events calendar and corporate wellness outreaches with the new cards and clean grid layout.
4. **Blog (`src/Pages/Blog/Blog.jsx`)**:
   - Implement an editorial literary layout for nutrition articles and healthy recipes.
5. **Mobile Performance & Accessibility Pass**:
   - Run Lighthouse audit on mobile devices.
   - Ensure touch targets and font sizes remain comfortable for elderly patients.

---

## 6. How to Access and Restore This Code

- **Git Branch**: `feature/planned-redesign`
- **Git Stash**: Look for stash named `planned redesign`:
  ```bash
  git stash list
  # To apply without removing:
  git stash apply stash@{0}
  # Or switch to the feature branch:
  git checkout feature/planned-redesign
  ```
