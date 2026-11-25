# My Journey — Client Care Portal Architecture (v2)

> Updated to reflect the v2 redesign: My Journey transitioned from a standalone weight-logging/gamification tracker to a focused **Client Care & Assessment Portal** (`/my-journey`).

---

## Core Design Principles

1. **Zero Gamification or Daily Weigh-In Friction**: Removed badges/achievements, daily log caps, manual weight-log charts, and blocking onboarding modals.
2. **Session Tracking with Nana Ama Dwamena (Dee)**: Authenticated clients can see their consultation lifecycle (**Payment Confirmed → Session Time Assigned → Completed**), WhatsApp Dee directly with booking reference context, review post-session care notes/resource links added in Admin, and re-book Follow-Up sessions in one tap.
3. **Auto-Saved KnowYourBody Assessments**: Every completed `KnowYourBody` check (`metric` or `imperial`, normalized to `kg` / `cm`) automatically saves to `users/{uid}/assessments` when signed in—and recent guest assessments carry over once automatically upon Google sign-in.
4. **Curated Nutrition Guides**: Surfaces top published blog articles ranked by the client's saved goal, health conditions, and consultation track (e.g., OnTrack Diabetes care vs. Weight Loss).
5. **Unchanged Navigation Entry**: Accessed via the person icon in `NavBar.jsx` and post-booking CTAs (`PaymentSuccess.jsx`, `KnowYourBody.jsx`, `Footer.jsx`, `About.jsx`, `FullyBooked.jsx`).

---

## Architecture & File Map

### 1. Client Auth & Assessment Storage ([`src/AuthContext.jsx`](../src/AuthContext.jsx))
- Wraps `MainLayout.jsx` with `user`, `userProfile`, `loading`, `isAdmin`, `signInWithGoogle`, `signOut`, `saveUserProfile`, and `saveAssessment`.
- `saveAssessment(snapshot)` writes an immutable metric record to `users/{uid}/assessments/{id}` and merges the latest health profile onto `users/{uid}`.
- Automatic guest carry-over checks `localStorage.getItem('diet_test_results')` (via `shouldSyncGuestSnapshot` in `src/utils/bookingProfile.js`) to sync fresh un-synced guest results idempotently on login (`diet_test_results_synced_for`).

### 2. KnowYourBody Auto-Save, Haptic Sliders & Email Lead Funnel ([`src/Pages/KnowYourBody/KnowYourBody.jsx`](../src/Pages/KnowYourBody/KnowYourBody.jsx))
- **Step 0 (`WelcomeStep`)**: Prompts first-time guests to enter their email to start (skipping cleanly when already signed in with Google) and immediately subscribes `emails/{cleanEmail}` (`source: 'knowyourbody'`) so drop-offs still join the Resend newsletter Audience. Pre-fills `ConsultationLedger` email automatically for checkout.
- **Tactile Haptic Sliders (`src/Components/HapticRulerSlider.jsx` + `src/utils/knowYourBodyFlow.js`)**: Replaces manual number typing for Age, Height, Weight, and Target Weight with scrollable horizontal ruler scrubbers firing `web-haptics` tick feedback (`"selection"` per step, `"light"` on major marks) plus tap-to-type numeric override and live Metric (`cm`/`kg`) ↔ Imperial (`ft/in`/`lbs`) conversion.
- **Auto-Save + Summary Email**: Completing Step 2 → Results calculates normalized metric metrics (`calculateBodyMetrics`, `buildKnowYourBodySnapshot`), saves to `users/{uid}/assessments` when authenticated, invokes `recordKnowYourBodyCheck` to log `knowYourBodyLogs/{logId}`, enriches `emails/{cleanEmail}` with goal/BMI CRM tags, and emails the user a personalized BMI/Calorie/Macro breakdown via `createKnowYourBodyResultsEmail` (`functions/emailTemplate.js`).
- **Portal Continuity**: `getMyCarePortal` merges verified email-matched `knowYourBodyLogs` into `AssessmentsSection.jsx` when a former guest later signs in with Google.

### 3. Client Care Portal UI ([`src/Pages/MyJourney/`](../src/Pages/MyJourney/))
- **`MyJourney.jsx`**:
  - **Guest View**: Google Sign-In CTA (`"Use the Google email you used when booking"`), plus links to `/knowyourbody` and `/contactUs`.
  - **Your Sessions with Dee**: Loads matched paid consultations (`bookings`) and Tier 03 Custom & Specialist Care inquiries (`inquiries`) via `getMyCarePortal`, plus inline `"Booked with another email?"` Paystack reference + phone last-4 linking (`linkBookingByReference`).
  - **Saved Health Assessments** (`components/AssessmentsSection.jsx`): Real-time `users/{uid}/assessments` snapshot + expandable history table (falling back gracefully to `users/{uid}` profile metrics for legacy accounts).
  - **Recommended Nutrition Guides** (`components/PortalArticlesSection.jsx`): Compact 2-column horizontal cards matching `Blog.jsx`'s *More Articles* layout, ranking up to 4 published guides via `rankArticlesForClient` (`src/utils/carePortal.js`).
  - **Client Testimonial Section**: Direct CTA to `/submit-testimonial` (pre-filling name, email, and consultation track) plus link to `/success-stories`, paired with a one-click `Copy Review Link` button in `TestimonialAdmin.jsx`.
  - **Account & Privacy**: Sign out and full account deletion (`deleteOwnAccount`).
- **`components/SessionCard.jsx`**: Expandable session ledger with 3-step stepper, care summary/resource links, clinical snapshot badges, pre-filled WhatsApp outreach, and one-tap Follow-Up routing (`?tier=followup` on `/contactUs` or `/ontrack`).

### 4. Backend Functions & Rules ([`functions/index.js`](../functions/index.js), [`functions/portalUtils.js`](../functions/portalUtils.js), [`firestore.rules`](../firestore.rules))
- **`firestore.rules`**: Owners and admins can read/write/delete `users/{uid}/assessments/{assessmentId}`. Raw `bookings` and `inquiries` collections remain `isAdmin()`-only.
- **`processBooking` & `submitBespokeInquiry`**: Persist normalized `emailLower` and `userId` (`request.auth?.uid` or `pendingBookings/{ref}.uid`), and enrich bookings from `users/{uid}/assessments` (falling back to legacy `users/{uid}/logs`).
- **`getMyCarePortal` (`onCall`)**: Queries bookings and inquiries matching the verified user's UID, normalized email, or `users/{uid}.linkedBookingRefs`, returning sanitized client-safe fields.
- **`linkBookingByReference` (`onCall`)**: Lets signed-in clients who checked out under a different email link a booking by matching Paystack reference + last 4 digits of booking phone (`phone` or `buyerPhone`).
- **`deleteOwnAccount` & `adminDeleteUser`**: Clean up both `assessments` and legacy `logs` subcollections via `purgeUserFirestoreData`.

### 5. Admin Tools Integration ([`BookingsPanel.jsx`](../src/Pages/Admin/components/BookingsPanel.jsx), [`UserJourneyPanel.jsx`](../src/Pages/Admin/components/UserJourneyPanel.jsx), [`SubscribersPanel.jsx`](../src/Pages/Admin/components/SubscribersPanel.jsx), [`firebaseUtils.js`](../src/firebaseUtils.js))
- **`BookingsPanel.jsx`**: Adds **Client Portal Care Summary** (`clientCareNote` + validated `carePlanUrl`) in booking detail view, immediately visible on the client's `SessionCard`.
- **`UserJourneyPanel.jsx` / `firebaseUtils.js`**: Features both **Registered Clients** (with `users/{uid}/assessments` + legacy `logs` history) and a **KnowYourBody Leads** tab backed by `knowYourBodyLogs` (CSV export, goal filter, search, and account/emailed status).
- **`SubscribersPanel.jsx`**: Surfaces **KnowYourBody Leads** count, source filter tabs, and inline BMI/goal/calorie/condition badges enriched on `emails/{email}`.
