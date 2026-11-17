import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'diet-with-dee.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function run() {
  console.log('🚀 Uploading promo image to Firebase Storage...');
  const imageSource = path.join(__dirname, '../src/assets/ontrack_promo.jpg');
  const token = crypto.randomUUID();
  const destFile = `coverImages/${Date.now()}_ontrack_promo.jpg`;

  await bucket.upload(imageSource, {
    destination: destFile,
    metadata: {
      contentType: 'image/jpeg',
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });

  const coverImageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destFile)}?alt=media&token=${token}`;
  console.log('✅ Cover image uploaded:', coverImageUrl);

  const title = "Blood Sugar On Track: DietWithDee Partners With On Track for World Diabetes Day";
  const slug = "blood-sugar-on-track-dietwithdee-partners-with-ontrack";

  const contentHtml = `
<p>Hi everyone,</p>

<p>Today is <strong>World Diabetes Day</strong>, and if you or someone you love is managing Type 2 diabetes or pre-diabetes, I want to start by addressing something I hear almost daily in my clinical practice:</p>

<blockquote style="border-left: 4px solid #F6841F; padding-left: 16px; margin: 20px 0; font-style: italic; color: #92400e; background: #fffbeb; padding: 12px 16px; border-radius: 4px;">
  "Nana Ama, since my diagnosis, I've been terrified of food. I was told I can never eat plantain, yam, or rice again—and I feel like I'm starving."
</blockquote>

<p>I want to reassure you: <strong>Managing diabetes is not about starving yourself or abandoning the local Ghanaian dishes you love.</strong> It is about science-backed carbohydrate pairing, portion mapping, and understanding how your body responds to your daily meals.</p>

<p>That is why I am thrilled to officially announce our partnership with <strong>On Track</strong>—an innovative digital diabetes management platform designed to help you monitor glucose levels, track low-glycemic meals, and stay accountable in real time.</p>

<hr style="margin: 28px 0; border: none; border-top: 1px solid #e7e5e4;" />

<h3>Why DietWithDee × On Track?</h3>

<p>True blood sugar control requires two puzzle pieces working seamlessly together:</p>

<ul>
  <li><strong>1. Clinical Nutrition Therapy (DietWithDee):</strong> Translating nutritional science directly into your Ghanaian kitchen—learning the 1/2 plate method, smart carb mapping with plantain, yam, brown rice, or banku, and pairing with fiber-dense local greens to stop rapid glucose spikes.</li>
  <li><strong>2. Real-Time Tracking (On Track App):</strong> Seamlessly logging your blood glucose readings, meals, and medications on your phone so you and your dietitian have real-time visibility into your glycemic trends.</li>
</ul>

<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #166534; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
  <p style="margin: 0; font-weight: 600; color: #166534;">
    📸 <strong>Connect with Us on Instagram:</strong><br />
    We just shared our World Diabetes Day partnership launch on Instagram! <a href="https://www.instagram.com/diet.withdee" target="_blank" rel="noopener noreferrer" style="color: #F6841F; text-decoration: underline; font-weight: 700;">Visit @diet.withdee on Instagram</a> to join the conversation, leave your questions, and see our top tips for balancing blood sugar with local foods.
  </p>
</div>

<hr style="margin: 28px 0; border: none; border-top: 1px solid #e7e5e4;" />

<h3>Explore Our New Dedicated On Track Portal</h3>

<p>To celebrate this launch, we have created a dedicated diabetes resource hub right here on our website: <a href="https://dietwithdee.org/ontrack">https://dietwithdee.org/ontrack</a>.</p>

<p>Inside the portal, you can:</p>
<ul>
  <li>Download the <strong>On Track App</strong> directly for Android (Google Play) or iPhone (Apple App Store).</li>
  <li>Discover the <strong>4 Clinical Pillars</strong> we use to help 94% of our clients lower their fasting glucose within 4 weeks.</li>
  <li>Book your private <strong>1-on-1 Clinical Dietitian Consultations</strong>.</li>
</ul>

<hr style="margin: 28px 0; border: none; border-top: 1px solid #e7e5e4;" />

<h3>Book Your 1-on-1 Clinical Consultation</h3>

<p>Ready to take the guesswork out of your health? Work directly with me to build a sustainable plan tailored specifically to your body and your lifestyle:</p>

<ul>
  <li><strong>Initial Deep-Dive Assessment (45 Mins — GH₵ 600):</strong> Comprehensive review of your A1c, medical history, and medications, plus a fully customized Ghanaian meal blueprint calibrated to your On Track targets.</li>
  <li><strong>Follow-Up Accountability Session (25 Mins — GH₵ 300):</strong> Review your fasting sugar trends, manage cravings, fine-tune portion sizes, and receive continuous WhatsApp check-ins.</li>
  <li><strong>Self-Guided Blood Sugar Balance Plan (GH₵ 299):</strong> Prefer an immediate, self-guided plan? Get our dietitian-formulated Type 2 diabetes meal planning guide with visual portion guides and low-glycemic local food lists.</li>
</ul>

<p style="text-align: center; margin: 32px 0;">
  <a href="https://dietwithdee.org/ontrack" style="display: inline-block; background-color: #F6841F; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(246, 132, 31, 0.3);">
    Visit the On Track Portal & Book a Session &rarr;
  </a>
</p>

<p>You do not have to walk this journey alone or in fear. Let’s work together to keep your blood sugar on track without compromising your joy of eating.</p>

<p>With warm regards,<br />
<strong>Nana Ama Dwamena, RD</strong><br />
<em>Licensed Clinical Dietitian & Founder, DietWithDee</em></p>
  `.trim();

  const articleDoc = {
    title,
    slug,
    content: contentHtml,
    coverImage: coverImageUrl,
    status: 'draft', // Saved as DRAFT per user instruction
    tags: ['Diabetes', 'Blood Sugar', 'OnTrack', 'Nutrition', 'Consultation', 'World Diabetes Day'],
    scheduledPublishDate: null,
    likesCount: 68,
    helpfulCount: 0,
    notHelpfulCount: 0,
    newsletterSent: false,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };

  const docRef = await db.collection('articles').add(articleDoc);
  console.log('🎉 Article draft successfully created with ID:', docRef.id);
  console.log('📌 Title:', title);
  console.log('📌 Status:', articleDoc.status);
}

run().catch(err => {
  console.error('❌ Error creating article draft:', err);
  process.exit(1);
});
