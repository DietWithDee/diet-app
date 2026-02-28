# My Journey — Full Refactoring Plan

> Master document for one-shotting the remaining My Journey build-out, admin dashboard refactoring, and admin analytics integration.

---

## Part 1: What's Been Done ✅

### Authentication & Onboarding
- [x] Firebase Auth with Google Provider (`firebaseConfig.js` → exports `auth`)
- [x] `AuthContext.jsx` — global auth state, Google sign-in/out, Firestore profile CRUD
- [x] `MainLayout.jsx` wrapped in `<AuthProvider>`
- [x] `OnboardingModal.jsx` — 3-step flow (Welcome → Form → Confirm), supports edit mode via `initialData` prop
- [x] Firestore data structure: `users/{uid}` (profile) + `users/{uid}/logs/{id}` (timestamped entries for charting)

### My Journey Page
- [x] Hero section with background image
- [x] "Get Started with Google" button (orange) — triggers sign-in + onboarding
- [x] "Continue as Guest" button (blue) — navigates to `/knowyourbody`
- [x] Profile card (photo, name, email, all health data grid)
- [x] "Book a Consultation" button — computes BMI/calories → navigates to `/contactUs` with `userResults`
- [x] "Update My Info" button — reopens onboarding modal pre-filled, logs update for charting
- [x] Coming Soon badge, Under Development notice, feature teasers, bottom CTAs

### Booking Integration
- [x] `ContactUs.jsx` falls back to Firestore profile if no router state passed
- [x] Auto-fills name/email from Google account
- [x] `Home.jsx` "Start Your Journey" → `/my-journey`

### Firestore Rules
- [x] Generated rules with admin whitelist (`nanaamadwamena4@gmail.com`, `princetetteh963@gmail.com`, `godwinokro2020@gmail.com`)
- [x] Covers `users`, `users/{uid}/logs`, `articles`, `newsletterEmails`, `config`

---

## Part 2: What's Left for My Journey 🚧

> Future page layout order (for logged-in users):
> 1. **BMI / Weight Progress Chart** (first thing the user sees)
> 2. **Plan Recommendations**
> 3. **Recommended Reads** (curated blog articles)
> 4. **Achievements & Badges**
> 5. **Account Settings**

### 2.1 BMI / Weight Progress Chart
- [ ] Read all docs from `users/{uid}/logs` ordered by `loggedAt`
- [ ] Use a charting library (e.g., Recharts or Chart.js) to render a line chart: **weight over time**, **BMI over time**
- [ ] Display latest BMI, BMI category, and daily calorie estimate as headline stats
- [ ] "Log New Data" button → opens `OnboardingModal` in edit mode (already supported) → appends a new log entry
- [ ] Filter controls: last 7 days, 30 days, 3 months, all time

### 2.2 Plan Recommendations
- [ ] Based on the user's goal (`lose`/`maintain`/`gain`), dietary restrictions, and activity level
- [ ] Link to existing `/plans` page with a personalized callout
- [ ] Optional: surface a "Your recommended plan" card based on profile data

### 2.3 Recommended Reads
- [ ] Query `articles` collection from Firestore
- [ ] Filter or tag articles by relevance to user's goal / dietary restrictions
- [ ] Show 3-4 article cards with thumbnails, linking to `/blog/{id}`
- [ ] "See all articles" link to `/blog`

### 2.4 Achievements & Badges
- [ ] Define milestone criteria: 7-day streak, first log, 10 logs, goal reached, etc.
- [ ] Store achievements in `users/{uid}/achievements` subcollection or as a field on the profile doc
- [ ] Display earned badges as a horizontal scrollable row
- [ ] Animated unlock effect when a new badge is earned

### 2.5 Account Settings
- [ ] Edit display name, profile photo (or use Google photo)
- [ ] Manage notification preferences (future: push notifications)
- [ ] Delete account / data (GDPR-friendly)
- [ ] Sign-out button (already exists on profile card, move to settings section too)

---

## Part 3: Admin Dashboard Refactoring 🏗️

### Current Problem
`admin.jsx` is **1,195 lines** with 5 components + utilities all in one file:

| Component | Lines | Description |
|---|---|---|
| `RichTextEditor` | ~500 | contentEditable editor with sanitization, toolbar, paste handling |
| `Notification` | ~25 | Toast notification UI |
| `ProgressBar` | ~10 | Upload progress bar |
| `AdminLogin` | ~100 | Hardcoded email/password login form |
| `ArticlesManager` | ~320 | CRUD for blog articles with image upload |
| `AdminDashboard` | ~200 | Main dashboard shell (tabs, booking toggle, subscriber count) |
| `AdminApp` | ~30 | Root component, auth gate |

### Proposed File Structure

```
src/Pages/Admin/
├── AdminApp.jsx              (root: auth gate, ~30 lines)
├── AdminLogin.jsx            (login form, ~100 lines)
├── AdminDashboard.jsx        (dashboard shell + tabs, ~200 lines)
├── components/
│   ├── RichTextEditor.jsx    (extract as-is, ~500 lines)
│   ├── ArticlesManager.jsx   (article CRUD, ~320 lines)
│   ├── Notification.jsx      (toast component, ~25 lines)
│   ├── ProgressBar.jsx       (progress bar, ~10 lines)
│   └── UserJourneyPanel.jsx  (NEW: My Journey analytics, see Part 4)
└── utils/
    └── adminConstants.js     (admin email, password, shared config)
```

### Refactoring Steps
1. **Extract `RichTextEditor`** → `components/RichTextEditor.jsx` (pure, no admin dependencies)
2. **Extract `Notification` + `ProgressBar`** → `components/Notification.jsx`, `components/ProgressBar.jsx`
3. **Extract `ArticlesManager`** → `components/ArticlesManager.jsx` (imports RichTextEditor)
4. **Extract `AdminLogin`** → `AdminLogin.jsx`
5. **Keep `AdminDashboard`** in `AdminDashboard.jsx` — imports all sub-components
6. **Keep `AdminApp`** in `AdminApp.jsx` — auth gate wrapper
7. **Move constants** (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) to `utils/adminConstants.js`
8. **Migrate admin auth to Firebase Auth** (use the same Google sign-in + admin whitelist from Firestore rules instead of hardcoded credentials)

> **IMPORTANT — Admin auth migration**: Replace hardcoded `admin@dietwithdee.org / admin123` with Firebase Google Auth. The admin whitelist is already defined in the Firestore security rules. The `AdminLogin` component should use `signInWithGoogle()` from `AuthContext` and check if the email is in the admin list. Add an `isAdmin` flag to `AuthContext`.

---

## Part 4: Admin Analytics for My Journey 📊

### New Component: `UserJourneyPanel.jsx`

A new tab in the admin dashboard that gives admins full visibility into My Journey user activity.

### 4.1 User Overview Table
- [ ] Fetch all docs from `users` collection
- [ ] Sortable table: Name, Email, Sign-up Date, Goal, Last Active, # of Log Entries
- [ ] Click a row → expand to view full profile + log history
- [ ] Search / filter by name, email, goal, date range

### 4.2 Aggregate Stats (Dashboard Cards)
- [ ] **Total registered users** (count of `users` docs)
- [ ] **Active users (last 7 days)** (users with a log entry in last 7 days)
- [ ] **Goal distribution** (pie/donut chart: Lose vs Maintain vs Gain)
- [ ] **Average BMI** across all users
- [ ] **New sign-ups this week/month** (based on `updatedAt` or a `createdAt` field)

### 4.3 User Detail View
- [ ] Full profile data (same fields as onboarding)
- [ ] Weight/BMI trend chart (same as user sees, but admin can view any user)
- [ ] Log history table: date, weight, height, goal at time of log
- [ ] Admin notes field (optional: admins can add private notes about a user)

### 4.4 Export & Actions
- [ ] Export user list as CSV
- [ ] Export individual user's log history as CSV
- [ ] Admin can reset a user's profile (delete their `users/{uid}` doc)

### 4.5 Firestore Queries Required
```javascript
// All users (paginated)
getDocs(query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(50)))

// Single user's logs
getDocs(query(collection(db, 'users', uid, 'logs'), orderBy('loggedAt', 'desc')))

// Goal distribution (client-side aggregate from users query)
// Active users (client-side filter: users with logs in last 7 days)
```

### 4.6 Firestore Rules Already Handle This
Admins (whitelisted emails) already have full read/write access to `users` and `users/{uid}/logs` collections per the rules we published.

---

## Part 5: Implementation Order 📋

> Recommended sequence for one-shotting the remaining work.

### Phase 1: Admin Refactoring (do first — reduces risk of merge conflicts)
1. Extract all components from `admin.jsx` into separate files
2. Migrate admin login from hardcoded credentials to Firebase Google Auth + admin whitelist
3. Verify admin panel still works identically

### Phase 2: Admin Analytics Panel
4. Create `UserJourneyPanel.jsx` with user table + aggregate stats
5. Add it as a new tab in `AdminDashboard`
6. Add user detail view with log history chart
7. Add CSV export functionality

### Phase 3: My Journey Full Build
8. Add BMI/Weight chart to My Journey (Recharts or Chart.js)
9. Add Recommended Reads section (filtered articles)
10. Add Plan Recommendations section
11. Add Achievements system
12. Add Account Settings section

### Phase 4: Polish
13. Add `createdAt` field to user profiles (for "new sign-ups" analytics)
14. Loading skeletons for all async content
15. Error boundaries and fallback UI
16. Mobile responsiveness audit
17. Performance: lazy-load chart library and admin panel
