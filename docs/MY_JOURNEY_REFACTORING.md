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

### 2. KnowYourBody Auto-Save ([`src/Pages/KnowYourBody/KnowYourBody.jsx`](../src/Pages/KnowYourBody/KnowYourBody.jsx))
- Uses shared `calculateBodyMetrics` and `buildKnowYourBodySnapshot` from `src/utils/bookingProfile.js` (normalizing `imperial` inputs into metric `kg` / `cm`).
- Automatically persists snapshots for signed-in users on Step 2 → Results and provides a `"Save Results with Google"` CTA for guests.

### 3. Client Care Portal UI ([`src/Pages/MyJourney/`](../src/Pages/MyJourney/))
- **`MyJourney.jsx`**:
  - **Guest View**: Google Sign-In CTA (`"Use the Google email you used when booking"`), plus links to `/knowyourbody` and `/contactUs`.
  - **Your Sessions with Dee**: Loads matched paid consultations (`bookings`) and Tier 03 Custom & Specialist Care inquiries (`inquiries`) via `getMyCarePortal`, plus inline `"Booked with another email?"` Paystack reference + phone last-4 linking (`linkBookingByReference`).
  - **Saved Health Assessments** (`components/AssessmentsSection.jsx`): Real-time `users/{uid}/assessments` snapshot + expandable history table (falling back gracefully to `users/{uid}` profile metrics for legacy accounts).
  - **Recommended Nutrition Guides** (`components/PortalArticlesSection.jsx`): Ranks up to 3 published guides via `rankArticlesForClient` (`src/utils/carePortal.js`).
  - **Account & Privacy**: Sign out and full account deletion (`deleteOwnAccount`).
- **`components/SessionCard.jsx`**: Expandable session ledger with 3-step stepper, care summary/resource links, clinical snapshot badges, pre-filled WhatsApp outreach, and one-tap Follow-Up routing (`?tier=followup` on `/contactUs` or `/ontrack`).

### 4. Backend Functions & Rules ([`functions/index.js`](../functions/index.js), [`functions/portalUtils.js`](../functions/portalUtils.js), [`firestore.rules`](../firestore.rules))
- **`firestore.rules`**: Owners and admins can read/write/delete `users/{uid}/assessments/{assessmentId}`. Raw `bookings` and `inquiries` collections remain `isAdmin()`-only.
- **`processBooking` & `submitBespokeInquiry`**: Persist normalized `emailLower` and `userId` (`request.auth?.uid` or `pendingBookings/{ref}.uid`), and enrich bookings from `users/{uid}/assessments` (falling back to legacy `users/{uid}/logs`).
- **`getMyCarePortal` (`onCall`)**: Queries bookings and inquiries matching the verified user's UID, normalized email, or `users/{uid}.linkedBookingRefs`, returning sanitized client-safe fields.
- **`linkBookingByReference` (`onCall`)**: Lets signed-in clients who checked out under a different email link a booking by matching Paystack reference + last 4 digits of booking phone (`phone` or `buyerPhone`).
- **`deleteOwnAccount` & `adminDeleteUser`**: Clean up both `assessments` and legacy `logs` subcollections via `purgeUserFirestoreData`.

### 5. Admin Tools Integration ([`BookingsPanel.jsx`](../src/Pages/Admin/components/BookingsPanel.jsx), [`UserJourneyPanel.jsx`](../src/Pages/Admin/components/UserJourneyPanel.jsx), [`firebaseUtils.js`](../src/firebaseUtils.js))
- **`BookingsPanel.jsx`**: Adds **Client Portal Care Summary** (`clientCareNote` + validated `carePlanUrl`) in booking detail view, immediately visible on the client's `SessionCard`.
- **`UserJourneyPanel.jsx` / `firebaseUtils.js`**: Reads `users/{uid}/assessments` merged with legacy `users/{uid}/logs` in **KnowYourBody Assessment History**.
