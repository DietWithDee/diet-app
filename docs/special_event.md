# Campaign Playbook: Reverting & Reconfiguring Special Holiday Campaigns

This document provides a technical roadmap for developers and AI agents to **revert** the Father's Day campaign or **reconfigure** it for future holidays (e.g. Mother's Day, Christmas, New Year's, Easter).

---

## Part 1: How to Revert the Campaign
When a holiday event ends, follow these steps to restore the website to its standard layout:

### 1. Restore the Homepage Hero Video Loop
- **File**: `src/Pages/Home/Home.jsx`
- **Actions**:
  1. Locate the block `{/* Right: Video replaced with Father's Day Campaign Ad (Video commented out) */}`.
  2. Delete or comment out the `<motion.div>` containing the Father's Day Campaign Ad container.
  3. Uncomment the original `<motion.div>` containing the autoplaying `<video ref={videoRef} src="/Hero_animation.mp4" ... />` tag.

### 2. Disable the Homepage Pop-up Modal
- **File**: `src/Pages/Home/Home.jsx`
- **Actions**:
  1. Navigate to the start of the `Home` component and set the initial state: `const [showFathersDayPopup, setShowFathersDayPopup] = useState(false);`.
  2. Comment out or delete the PWA overlay popup inside `<AnimatePresence>` rendering at the bottom of the JSX block.

### 3. Restore the Contact Us Packages Layout
- **File**: `src/Pages/ContactUs/ContactUs.jsx`
- **Actions**:
  1. Search for `{/* Three Consultation Cards */}`.
  2. Reset the grid container columns back to two: `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">`.
  3. Delete the entire `Father's Day Campaign Promo Card` container.
  4. Locate and remove the `{/* Father's Day Promotion Banner */}` div container.
  5. Locate and remove the inline `{/* Consultation Type Selector */}` upsell alert block `{selectedType === 'initial' && (...)`.
  6. Clean up unused `fathersDayPromo` and `motion` imports.

### 4. Disable the Plans Page Promo Banner
- **File**: `src/Pages/Plans/Plans.jsx`
- **Actions**:
  1. Locate and delete the `{/* Father's Day Promo Banner */}` div container.
  2. Delete the `PlayfulBannerIcon` component definition.
  3. Clean up unused `Gift` and `ShoppingCart` imports.

### 5. Disable the NavBar Playful Bouncing Icon
- **File**: `src/Components/NavBar/NavBar.jsx`
- **Actions**:
  1. Locate and delete the `PlayfulNavBarIcon` component definition.
  2. In the navbar desktop icons section, replace `<PlayfulNavBarIcon />` inside the `/plans` NavLink back with `<FiShoppingCart size={23} className="transition-transform duration-300" />`.

### 6. Remove Route Registration
- **File**: `src/MainLayout/MainLayout.jsx`
- **Actions**:
  1. Remove or comment out `<Route path="/fathersday" element={<FathersDay />} />`.

---

## Part 2: How to Configure a New Campaign for Future Holidays
To launch a new campaign (e.g. "Mother's Day Promo"), follow this checklist:

### 1. Prepare Assets
1. Upload your new illustration (e.g. `mothers_day_promo.png`) to `src/assets/`.
2. Import it in `Home.jsx`, `FathersDay.jsx`, and `ContactUs.jsx`.

### 2. Update Copy, Promo Codes and Pricing in UI Components
1. Update price constants, descriptions, and coupon codes on the landing pages, modals, and banners:
   - On the `FathersDay.jsx` booking form and `ContactUs.jsx` banners: Update pricing and info copy.
   - On the `Plans.jsx` top promo banner: Update the text and code (e.g. change `FATHERSDAY` to `MOTHERSDAY` or `XMAS10`).
2. Adjust the CSS class in `src/index.css` to fit the holiday mood:
   - *Mother's Day*: Soft pink/gold shimmer.
   - *Christmas*: Warm red/emerald-green shimmer.
   - Example:
     ```css
     .gold-shimmer-card {
       background: linear-gradient(120deg, #09090b 35%, #3f0f22 45%, #f472b6 50%, #3f0f22 55%, #09090b 65%); /* Pink tone */
     }
     ```

### 3. Adjust the Booking Payload Metadata
- Locate the booking state object submitted to local storage:
  ```javascript
  const campaignData = {
    name: formData.buyerName,
    email: formData.buyerEmail,
    phone: formData.buyerPhone,
    message: formData.message,
    consultationType: 'initial', 
    isFathersDayBooking: true, // Rename to fitsCampaign: true or keep this key if using generic triggers
    buyerName: formData.buyerName,
    buyerEmail: formData.buyerEmail,
    buyerPhone: formData.buyerPhone,
    fatherName: formData.fatherName, // Repurpose as recipientName
    fatherPhone: formData.fatherPhone, // Repurpose as recipientPhone
    fatherMessage: formData.message,
    isSurprise: formData.isSurprise
  };
  ```

### 4. Update Backend Email Notification Variables
- **File**: `functions/bookingEmailTemplates.js`
- **Actions**:
  1. Modify the template in `createAdminBookingEmail` and `createClientConfirmationEmail` to check for the current campaign flags.
  2. Rewrite titles, visual colors, and subject lines to match the new campaign holiday name (e.g., replace *"Father's Day Gift"* with *"Mother's Day Voucher"*).
