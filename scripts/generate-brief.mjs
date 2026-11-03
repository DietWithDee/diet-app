import fs from 'fs';
import path from 'path';

const img1Path = 'C:\\Users\\gokro\\Downloads\\Telegram Desktop\\photo_3_2026-11-02_20-53-05.jpg'; // Review Card
const img2Path = 'C:\\Users\\gokro\\Downloads\\Telegram Desktop\\photo_1_2026-11-02_20-53-05.jpg'; // WhatsApp Chat
const img3Path = 'C:\\Users\\gokro\\Downloads\\Telegram Desktop\\photo_2_2026-11-02_20-53-05.jpg'; // Lab Report

const b64_1 = fs.existsSync(img1Path) ? 'data:image/jpeg;base64,' + fs.readFileSync(img1Path).toString('base64') : '';
const b64_2 = fs.existsSync(img2Path) ? 'data:image/jpeg;base64,' + fs.readFileSync(img2Path).toString('base64') : '';
const b64_3 = fs.existsSync(img3Path) ? 'data:image/jpeg;base64,' + fs.readFileSync(img3Path).toString('base64') : '';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Design Brief: Testimonial Tuesday IG Carousel - DietWithDee</title>
<style>
  :root {
    --brand-green-dark: #0f3e26;
    --brand-green: #15803d;
    --brand-green-light: #ecfdf5;
    --brand-orange: #F6841F;
    --brand-stone-900: #1c1917;
    --brand-stone-600: #57534e;
    --brand-stone-100: #f5f5f4;
    --brand-stone-50: #fafaf9;
    --border-color: #e7e5e4;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: var(--brand-stone-900);
    background: #f4f4f5;
    line-height: 1.6;
    padding: 30px 20px;
  }
  .container {
    max-width: 920px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 25px rgba(0,0,0,0.06);
    overflow: hidden;
    border: 1px solid var(--border-color);
  }
  .header {
    background: linear-gradient(135deg, var(--brand-green-dark) 0%, #166534 100%);
    color: white;
    padding: 40px;
  }
  .badge {
    display: inline-block;
    background: var(--brand-orange);
    color: white;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 6px 14px;
    border-radius: 50px;
    margin-bottom: 16px;
  }
  .header h1 {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  .header p {
    font-size: 15px;
    color: #d1fae5;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    background: var(--brand-stone-50);
    padding: 20px 40px;
    border-bottom: 1px solid var(--border-color);
  }
  .meta-item strong {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    color: var(--brand-stone-600);
    letter-spacing: 0.5px;
  }
  .meta-item span {
    font-size: 15px;
    font-weight: 600;
    color: var(--brand-stone-900);
  }
  .content {
    padding: 40px;
  }
  h2 {
    font-size: 22px;
    font-weight: 700;
    color: var(--brand-green-dark);
    margin: 35px 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--brand-green-light);
  }
  h2:first-of-type { margin-top: 0; }
  h3 {
    font-size: 17px;
    font-weight: 700;
    color: var(--brand-stone-900);
    margin: 20px 0 10px 0;
  }
  p { margin-bottom: 12px; font-size: 15px; color: #374151; }
  ul { margin: 10px 0 18px 25px; font-size: 15px; color: #374151; }
  li { margin-bottom: 6px; }
  
  .slide-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-left: 5px solid var(--brand-green);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .slide-tag {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--brand-green);
    background: var(--brand-green-light);
    padding: 4px 10px;
    border-radius: 6px;
  }
  .slide-purpose {
    font-size: 13px;
    color: var(--brand-stone-600);
    font-weight: 600;
  }
  .copy-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0;
    font-size: 14px;
    line-height: 1.5;
  }
  .copy-box strong { color: var(--brand-stone-900); }
  .asset-badge {
    display: inline-block;
    background: #fef3c7;
    color: #92400e;
    font-weight: 700;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 6px;
    margin-top: 8px;
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 25px 0;
  }
  .image-card {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    background: #ffffff;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }
  .image-card img {
    width: 100%;
    height: 380px;
    object-fit: contain;
    background: #fdfbf7;
    border-bottom: 1px solid var(--border-color);
  }
  .image-caption {
    padding: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--brand-stone-600);
  }

  .palette-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin: 15px 0 25px 0;
  }
  .color-swatch {
    flex: 1;
    min-width: 130px;
    height: 75px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 10px;
    color: white;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }
  .color-swatch span { font-weight: 400; opacity: 0.9; font-size: 11px; }

  .print-btn {
    float: right;
    background: #ffffff;
    color: var(--brand-green-dark);
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    font-size: 13px;
  }
  .print-btn:hover { background: #f0fdf4; }
  @media print {
    body { padding: 0; background: white; }
    .container { box-shadow: none; border: none; max-width: 100%; }
    .print-btn { display: none; }
    .slide-card { page-break-inside: avoid; }
    .image-card img { height: 260px; }
  }
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    <div class="badge">Campaign Creative Brief</div>
    <h1>#TestimonialTuesday — IG Carousel</h1>
    <p>Client Transformation Spotlight: Kobby Breeze (Type 2 Diabetes to Normal Blood Sugar)</p>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <strong>Format</strong>
      <span>Instagram Carousel (4:5 Portrait)</span>
    </div>
    <div class="meta-item">
      <strong>Resolution</strong>
      <span>1080 x 1350 px</span>
    </div>
    <div class="meta-item">
      <strong>Slide Count</strong>
      <span>7 Slides</span>
    </div>
    <div class="meta-item">
      <strong>Plan Featured</strong>
      <span>Blood Sugar Balancing Plan</span>
    </div>
  </div>

  <div class="content">

    <h2>1. Campaign Goal & Narrative Arc</h2>
    <p>This carousel is part of our weekly <strong>#TestimonialTuesday</strong> series for DietWithDee. Its purpose is to demonstrate real, verifiable medical & emotional results from our <strong>Blood Sugar Balancing Plan</strong>, proving that a diabetes diagnosis in Ghana is <em>not</em> a death sentence, and that clients do not have to starve or give up local staples like banku or yam.</p>
    
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px; margin:16px 0;">
      <h3 style="margin-top:0; color:#166534;">The 3-Act Structure:</h3>
      <ul>
        <li><strong>Hook (Slide 1):</strong> High emotion, shocking fear ("It felt like a death sentence") turned into rapid triumph.</li>
        <li><strong>The Process (Slides 2–3):</strong> The personal struggle (daughter Nicole as motivation) + guided nutritional intervention with Dietician Nana Ama.</li>
        <li><strong>The Outcome & Proof (Slides 4–6):</strong> Unshakeable evidence — WhatsApp celebratory chat, official laboratory biochemistry results (HbA1c 5.0%, Fasting glucose 4.8 mmol/L).</li>
        <li><strong>Call to Action (Slide 7):</strong> Direct audience into the 1-year anniversary 20% discount survey & DM.</li>
      </ul>
    </div>

    <h2>2. Visual Assets Provided</h2>
    <p>Use the following three provided screenshot assets directly on the slides as specified:</p>

    <div class="image-grid">
      <div class="image-card">
        <img src="${b64_1}" alt="Asset 1: Mobile Testimonial Review">
        <div class="image-caption">
          <strong>Asset 1: Review Card</strong><br>
          Kobby Breeze quote & 5-star rating on DietWithDee app.
        </div>
      </div>
      <div class="image-card">
        <img src="${b64_2}" alt="Asset 2: WhatsApp Chat Screenshot">
        <div class="image-caption">
          <strong>Asset 2: WhatsApp Chat</strong><br>
          Real celebration with Dietician Nana Ama (HbA1c 5.0%).
        </div>
      </div>
      <div class="image-card">
        <img src="${b64_3}" alt="Asset 3: Lab Biochemistry Report">
        <div class="image-caption">
          <strong>Asset 3: Clinical Lab Report</strong><br>
          Official fasting glucose result: 4.8 mmol/L (Normal).
        </div>
      </div>
    </div>

    <h2>3. Slide-by-Slide Design & Copy Specifications</h2>

    <!-- Slide 1 -->
    <div class="slide-card">
      <div class="slide-header">
        <span class="slide-tag">Slide 1</span>
        <span class="slide-purpose">The Hook (Scroll-Stopper)</span>
      </div>
      <p><strong>Design Vibe:</strong> Bold, editorial, emotional contrast. High visual hierarchy with prominent headline.</p>
      <div class="copy-box">
        <p style="color:var(--brand-orange); font-weight:800; font-size:12px; letter-spacing:1px; text-transform:uppercase;">TESTIMONIAL TUESDAY • CLIENT STORY</p>
        <p style="font-size:22px; font-weight:800; line-height:1.2; margin:10px 0; color:#111;">"When I was diagnosed with diabetes, it felt like a death sentence."</p>
        <p style="font-size:15px; color:#4b5563;">How Kobby reversed the fear and brought his HbA1c to <strong>5.0%</strong> in just 6 weeks without starving.</p>
      </div>
      <p><strong>Designer Notes:</strong> Include a subtle swipe indicator ("Swipe to read story ->"). Add a badge: "Blood Sugar Balancing Plan".</p>
    </div>

    <!-- Slide 2 -->
    <div class="slide-card">
      <div class="slide-header">
        <span class="slide-tag">Slide 2</span>
        <span class="slide-purpose">The Diagnosis & The Motivation</span>
      </div>
      <p><strong>Design Vibe:</strong> Storytelling slide. Feature Asset 1 (or a stylized quote bubble from Asset 1) highlighting his daughter Nicole.</p>
      <div class="copy-box">
        <p style="font-size:18px; font-weight:700; color:#166534;">October 2024: Overwhelmed & Terrified</p>
        <p>"I was scared and overwhelmed. But I committed to the plan, not just for myself, but for my daughter Nicole."</p>
        <p style="color:#57534e; font-size:13px;">— Kobby Breeze, Accra • 5-Star Client Review</p>
      </div>
      <span class="asset-badge">Asset to Feature: Asset 1 (DietWithDee Review Card / Mobile Mockup)</span>
    </div>

    <!-- Slide 3 -->
    <div class="slide-card">
      <div class="slide-header">
        <span class="slide-tag">Slide 3</span>
        <span class="slide-purpose">The Process (What Made the Difference?)</span>
      </div>
      <p><strong>Design Vibe:</strong> Clean 3-step value breakdown showing our method.</p>
      <div class="copy-box">
        <p style="font-size:18px; font-weight:700; color:#166534;">The 6-Week Turnaround Plan:</p>
        <ul>
          <li><strong>1. Clinical & Dietetic Guidance:</strong> Working directly with his Doctor and Dietician Nana Ama Dwamena.</li>
          <li><strong>2. Real Ghanaian Food, Smart Pairings:</strong> No eliminating cultural favorites like banku, yam, or brown rice. Learning portion balance and vegetable pairings to prevent glucose spikes.</li>
          <li><strong>3. Habit-First Consistency:</strong> Sustainable lifestyle adjustments and gentle movement routines tailored to his daily schedule.</li>
        </ul>
      </div>
    </div>

    <!-- Slide 4 -->
    <div class="slide-card">
      <div class="slide-header">
        <span class="slide-tag">Slide 4</span>
        <span class="slide-purpose">The Proof — Part 1 (Emotional Lab Breakthrough)</span>
      </div>
      <p><strong>Design Vibe:</strong> Social proof. Put the real WhatsApp chat inside a clean phone frame or glowing card.</p>
      <div class="copy-box">
        <p style="font-size:18px; font-weight:700; color:#166534;">"Glory be to God!" — The Test Results Arrive</p>
        <p>Look at what the lab test showed after 6 weeks:</p>
        <ul>
          <li><strong>HbA1c (Glycated):</strong> <span style="color:#15803d; font-weight:800; font-size:16px;">5.0%</span> <em>(Non-diabetic reference range: 4.0% – 6.0%)</em></li>
          <li><strong>Estimated Average Glucose:</strong> 5.4 mmol/L</li>
        </ul>
      </div>
      <span class="asset-badge">Asset to Feature: Asset 2 (WhatsApp Chat Screenshot with Nana Ama)</span>
    </div>

    <!-- Slide 5 -->
    <div class="slide-card">
      <div class="slide-header">
        <span class="slide-tag">Slide 5</span>
        <span class="slide-purpose">The Proof — Part 2 (Clinical Biochemistry Verification)</span>
      </div>
      <p><strong>Design Vibe:</strong> Clinical credibility. Clean cutout/zoom of the fasting blood sugar reading.</p>
      <div class="copy-box">
        <p style="font-size:18px; font-weight:700; color:#166534;">Fasting Blood Sugar: 4.8 mmol/L</p>
        <p>Verified laboratory biochemistry report. Normal clinical reference range is 4.11 – 5.89 mmol/L.</p>
        <p style="font-weight:600; color:#15803d;">Kobby's fasting reading sits comfortably inside the optimal non-diabetic range!</p>
      </div>
      <span class="asset-badge">Asset to Feature: Asset 3 (Clinical Biochemistry Lab Report)</span>
    </div>

    <!-- Slide 6 -->
    <div class="slide-card">
      <div class="slide-header">
        <span class="slide-tag">Slide 6</span>
        <span class="slide-purpose">The Core Takeaway (Message of Hope)</span>
      </div>
      <p><strong>Design Vibe:</strong> Inspiring, warm, authoritative.</p>
      <div class="copy-box">
        <p style="font-size:20px; font-weight:800; color:#166534; font-family:Georgia, serif;">"Today, I feel healthier, stronger, and more hopeful than ever."</p>
        <p style="margin-top:10px;"><strong>Key Takeaway for our community:</strong><br>
        A high blood sugar or pre-diabetes reading doesn't mean your life has to stop. With the right guidance and local food balance, normal numbers are completely within reach.</p>
      </div>
    </div>

    <!-- Slide 7 -->
    <div class="slide-card" style="border-left-color: var(--brand-orange);">
      <div class="slide-header">
        <span class="slide-tag" style="background:#fff7ed; color:var(--brand-orange);">Slide 7</span>
        <span class="slide-purpose">The Call to Action (CTA)</span>
      </div>
      <p><strong>Design Vibe:</strong> High energy CTA slide with campaign urgency (1 week remaining for 20% discount).</p>
      <div class="copy-box" style="background:#fff7ed; border-color:#fed7aa;">
        <p style="font-size:20px; font-weight:800; color:#c2410c;">Ready to take control of your blood sugar?</p>
        <p><strong>Special 1-Year Anniversary Gift:</strong><br>
        Take our quick 2-minute survey to receive an exclusive <strong>20% discount code</strong> for our Blood Sugar Balancing Plan!</p>
        <p style="margin-top:12px; font-weight:700;">👉 Tap the link in our bio to take the 2-min survey</p>
        <p style="font-weight:700;">💬 Or send us a DM with the word "BALANCE" to chat with Dee</p>
      </div>
    </div>

    <h2>4. Brand Design Guidelines for Designer</h2>
    
    <h3>Color Palette</h3>
    <div class="palette-grid">
      <div class="color-swatch" style="background:#0f3e26;">Deep Forest Green<br><span>#0F3E26</span></div>
      <div class="color-swatch" style="background:#15803d;">Emerald Green<br><span>#15803D</span></div>
      <div class="color-swatch" style="background:#F6841F;">TerraVee Orange<br><span>#F6841F</span></div>
      <div class="color-swatch" style="background:#FDFBF7; color:#1c1917; border:1px solid #e7e5e4;">Warm Ivory Cream<br><span>#FDFBF7</span></div>
      <div class="color-swatch" style="background:#1c1917;">Charcoal Slate<br><span>#1C1917</span></div>
    </div>

    <h3>Typography Suggestions</h3>
    <ul>
      <li><strong>Headlines:</strong> Cormorant Garamond / Playfair Display / Serif Bold (feels premium, clinical yet personal).</li>
      <li><strong>Body & Stats:</strong> Montserrat / Inter / Plus Jakarta Sans (clean, highly legible on mobile screens).</li>
    </ul>

    <h2>5. Ready-to-Copy Instagram Caption</h2>
    <div class="copy-box" style="background:#f8fafc; font-size:14px; white-space:pre-line;">
"When I was diagnosed with diabetes in October 2024, it felt like a death sentence." 💔

Those were Kobby’s exact words when he first reached out to us. He was scared, overwhelmed, and thought he would have to abandon all his favorite foods forever.

Swipe through to see what happened when he committed to our Blood Sugar Balancing Plan for 6 weeks 👉

✨ The 6-Week Results:
✅ HbA1c dropped to 5.0% (optimal non-diabetic range is 4.0 – 6.0%)
✅ Fasting blood glucose stabilized at 4.8 mmol/L
✅ Zero extreme starvation or giving up Ghanaian staples
✅ Energy, hope, and peace of mind restored for himself and his daughter Nicole!

As Kobby said: "Glory be to God!" 🙌

🌿 A diagnosis is not the end of your story. With the right nutrition strategy and personalized guidance from our Dieticians, you can manage and thrive.

🎁 SPECIAL ANNIVERSARY PERK:
We have just 1 WEEK LEFT on our 1-Year Anniversary promo! Take our 2-minute community survey (link in bio) and get an instant 20% DISCOUNT on our Blood Sugar Balancing Plan or 1-on-1 Consultation.

💬 Or DM us "BALANCE" right now to speak directly with our team!

#DietWithDee #TestimonialTuesday #BloodSugarBalance #DiabetesGhana #HealthyLivingGhana #AccraHealth #NutritionCoach #HbA1c #GhanaianDiet
    </div>

  </div>
</div>

</body>
</html>
`;

const mdContent = `# Creative Brief: #TestimonialTuesday Instagram Carousel
**Brand:** DietWithDee  
**Campaign:** Testimonial Tuesday  
**Featured Client:** Kobby Breeze (Accra, Ghana)  
**Featured Plan:** Blood Sugar Balancing Plan  
**Target Format:** Instagram Carousel (4:5 Portrait — 1080 x 1350 px)  
**Slide Count:** 7 Slides  

---

## 1. Campaign Narrative & Structure
- **Act 1: The Hook (Slide 1):** High emotional stakes — from "death sentence" fear to reversal.
- **Act 2: The Struggle & The Process (Slides 2–3):** Fear of diabetes, motivation (his daughter Nicole), and the 6-week turnaround with Dietician Nana Ama Dwamena without starving.
- **Act 3: The Hard Evidence & Outcome (Slides 4–5):** WhatsApp celebratory message + clinical laboratory biochemistry report (HbA1c 5.0%, Fasting glucose 4.8 mmol/L).
- **Act 4: Emotional Win & CTA (Slides 6–7):** Inspiring quote + 1 week left 20% survey discount promotion.

---

## 2. Slide-by-Slide Breakdown

### Slide 1: The Hook (Scroll-Stopper)
- **Top Badge:** TESTIMONIAL TUESDAY • CLIENT STORY
- **Headline:** "When I was diagnosed with diabetes, it felt like a death sentence."
- **Subtitle:** How Kobby reversed the fear and brought his HbA1c to 5.0% in 6 weeks without starving.
- **Visual:** Clean bold typography, dark green background (#0f3e26), subtle swipe arrow indicator.

### Slide 2: The Diagnosis & Motivation
- **Headline:** October 2024: Fear & Overwhelm
- **Quote:** "I was scared and overwhelmed. But I committed to the plan, not just for myself, but for my daughter Nicole."
- **Asset to Feature:** Asset 1 (DietWithDee app review card snippet).

### Slide 3: The 6-Week Turnaround Process
- **Headline:** The 6-Week Turnaround Plan
- **Key Points:**
  1. **Doctor & Dietetic Partnership:** Working with his Doctor and Dietician Nana Ama Dwamena.
  2. **Ghanaian Food Smart Pairings:** No quitting banku or yam. Learning portion ratios and vegetable pairing to stop blood sugar spikes.
  3. **Habit Consistency:** Sustainable daily routines designed for busy work schedules.

### Slide 4: The Proof — Part 1 (The Emotional Win)
- **Headline:** "Glory be to God!" — The Test Results Arrive
- **Key Metric Highlight:** HbA1c (Glycated) = 5.0% (Non-diabetic reference range: 4.0 - 6.0%)
- **Asset to Feature:** Asset 2 (WhatsApp chat screenshot with Nana Ama).

### Slide 5: The Proof — Part 2 (Clinical Biochemistry Verification)
- **Headline:** Fasting Blood Glucose: 4.8 mmol/L
- **Context:** Verified clinical laboratory report. Optimal normal range is 4.11 - 5.89 mmol/L.
- **Asset to Feature:** Asset 3 (Clinical Biochemistry test result screenshot).

### Slide 6: The Takeaway & Message of Hope
- **Quote:** "Today, I feel healthier, stronger, and more hopeful than ever." — Kobby Breeze, Accra.
- **Message:** A blood sugar diagnosis does not mean your life is over. Structured nutrition makes normal numbers completely achievable.

### Slide 7: The Call to Action (CTA)
- **Headline:** Ready to take control of your blood sugar?
- **Offer:** 1 WEEK LEFT! Take our quick 2-minute survey to receive an exclusive 20% discount code for our Blood Sugar Balancing Plan.
- **Primary CTA:** Tap link in bio to take the 2-min survey.
- **Secondary CTA:** DM "BALANCE" to chat with Dee directly.

---

## 3. Image Assets Provided
- **Asset 1 (Review Card):** \`${img1Path}\`
- **Asset 2 (WhatsApp Chat):** \`${img2Path}\`
- **Asset 3 (Lab Report):** \`${img3Path}\`

---

## 4. Brand Design Specs
- **Colors:**
  - Deep Forest Green: \`#0F3E26\`
  - Emerald Green: \`#15803D\`
  - TerraVee Orange: \`#F6841F\`
  - Warm Ivory Cream: \`#FDFBF7\`
  - Slate Charcoal: \`#1C1917\`
- **Fonts:** Cormorant Garamond / Playfair (Headlines) + Montserrat / Inter (Body).
`;

const htmlPath = 'C:\\Users\\gokro\\Downloads\\Testimonial_Tuesday_Designer_Brief.html';
const mdPath = 'C:\\Users\\gokro\\Downloads\\Testimonial_Tuesday_Designer_Brief.md';

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
fs.writeFileSync(mdPath, mdContent, 'utf8');

console.log('SUCCESS: Generated documents in Downloads');
console.log('1. HTML:', htmlPath);
console.log('2. Markdown:', mdPath);

