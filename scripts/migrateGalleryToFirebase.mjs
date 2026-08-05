/**
 * One-time migration script: Upload 20 static gallery images to Firebase
 * and create Firestore event documents for each.
 *
 * PREREQUISITES:
 * 1. Download your Firebase service account key from:
 *    Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 * 2. Save it as `scripts/serviceAccountKey.json` (this file is gitignored)
 * 3. Run: node scripts/migrateGalleryToFirebase.mjs
 *
 * This script is idempotent-ish: it won't re-upload if the Firestore doc
 * already exists with the same title, but running it twice will create
 * duplicates. Only run once.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Configuration ──────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, 'serviceAccountKey.json');
const IMAGES_DIR = path.resolve(__dirname, '..', 'src', 'assets', 'images', 'Events');
const STORAGE_PATH = 'eventImages';
const FIRESTORE_COLLECTION = 'events';

// The 20 images in the order they appear in the current eventImages array,
// with descriptive placeholder titles (editable later via admin dashboard).
const IMAGE_ENTRIES = [
  { file: 'Event1.webp',   title: 'Community Health Outreach' },
  { file: 'Event2.webp',   title: 'Wellness Workshop Session' },
  { file: 'Event3.webp',   title: 'Nutrition Awareness Talk' },
  { file: 'Event4.webp',   title: 'Corporate Wellness Program' },
  { file: 'Event5.webp',   title: 'Healthy Living Seminar' },
  { file: 'Event5.6.webp', title: 'Community Engagement Drive' },
  { file: 'Event5.5.webp', title: 'Team Wellness Activity' },
  { file: 'Event6.webp',   title: 'Health Screening Event' },
  { file: 'Event7.webp',   title: 'Dietary Consultation Day' },
  { file: 'Event8.webp',   title: 'Wellness Campaign Launch' },
  { file: 'Event9.webp',   title: 'Nutrition Education Program' },
  { file: 'Event11.webp',  title: 'Corporate Health Talk' },
  { file: 'Event12.webp',  title: 'Community Wellness Fair' },
  { file: 'Event13.webp',  title: 'Healthy Eating Workshop' },
  { file: 'Event14.webp',  title: 'Fitness & Nutrition Event' },
  { file: 'Event15.webp',  title: 'Public Health Awareness' },
  { file: 'Event16.webp',  title: 'Wellness Collaboration Event' },
  { file: 'Event17.webp',  title: 'Health Empowerment Session' },
  { file: 'Event18.webp',  title: 'Nutrition Outreach Program' },
  { file: 'Event19.webp',  title: 'Community Wellness Recap' },
];

// Spread dates across 2025 (Jan through late October, ~every 2 weeks)
function generateDates(count) {
  const dates = [];
  const startMonth = 0; // January
  const dayGap = Math.floor(300 / count); // ~15 days apart over 10 months
  for (let i = 0; i < count; i++) {
    const d = new Date(2025, startMonth, 1 + i * dayGap);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // Validate service account key exists
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ Service account key not found at:', SERVICE_ACCOUNT_PATH);
    console.error('');
    console.error('To get your service account key:');
    console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
    console.error('2. Click "Generate New Private Key"');
    console.error('3. Save the JSON file as: scripts/serviceAccountKey.json');
    process.exit(1);
  }

  // Validate images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Images directory not found at:', IMAGES_DIR);
    process.exit(1);
  }

  // Initialize Firebase Admin
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
  });

  const db = getFirestore(app);
  const bucket = getStorage(app).bucket();
  const dates = generateDates(IMAGE_ENTRIES.length);

  console.log(`\n🚀 Migrating ${IMAGE_ENTRIES.length} gallery images to Firebase...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < IMAGE_ENTRIES.length; i++) {
    const entry = IMAGE_ENTRIES[i];
    const filePath = path.join(IMAGES_DIR, entry.file);

    if (!fs.existsSync(filePath)) {
      console.error(`  ❌ [${i + 1}/${IMAGE_ENTRIES.length}] File not found: ${entry.file}`);
      errorCount++;
      continue;
    }

    try {
      // 1. Upload image to Firebase Storage
      const storagePath = `${STORAGE_PATH}/gallery_${Date.now()}_${entry.file}`;
      const fileRef = bucket.file(storagePath);

      await fileRef.save(fs.readFileSync(filePath), {
        metadata: {
          contentType: 'image/webp',
        },
      });

      // Make the file publicly accessible and get the download URL
      await fileRef.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      // 2. Create Firestore document
      const docRef = await db.collection(FIRESTORE_COLLECTION).add({
        title: entry.title,
        date: dates[i],
        location: '',
        description: '',
        eventLink: '',
        imageUrl: imageUrl,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log(`  ✅ [${i + 1}/${IMAGE_ENTRIES.length}] ${entry.file} → ${entry.title} (${dates[i]}) → doc: ${docRef.id}`);
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`  ❌ [${i + 1}/${IMAGE_ENTRIES.length}] Failed: ${entry.file} — ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ✅ Migrated: ${successCount}/${IMAGE_ENTRIES.length}`);
  if (errorCount > 0) {
    console.log(`  ❌ Errors:   ${errorCount}`);
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (successCount === IMAGE_ENTRIES.length) {
    console.log('🎉 All images migrated successfully!');
    console.log('Next steps:');
    console.log('  1. Check Firebase Console to verify the documents and images');
    console.log('  2. Edit titles/dates via the Admin Dashboard if needed');
    console.log('  3. Once verified, you can safely delete src/assets/images/Events/');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
