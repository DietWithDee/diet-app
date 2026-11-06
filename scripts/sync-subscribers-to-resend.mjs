#!/usr/bin/env node

/**
 * Sync Subscribers from Firestore to Resend Audience
 * 
 * Usage:
 *   node scripts/sync-subscribers-to-resend.mjs --audience-id <YOUR_AUDIENCE_ID>
 *   node scripts/sync-subscribers-to-resend.mjs --audience-id <YOUR_AUDIENCE_ID> --dry-run
 * 
 * Options:
 *   --audience-id <id>   Resend Audience ID (required or set RESEND_AUDIENCE_ID env)
 *   --api-key <key>      Resend API Key (optional, defaults to functions/.secret.local or env)
 *   --dry-run            Preview contacts without sending requests to Resend
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Firebase Admin & Resend SDK from functions
const admin = require("../functions/node_modules/firebase-admin");
const { Resend } = require("../functions/node_modules/resend");

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(flag) {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}
const isDryRun = args.includes("--dry-run");

// Locate API key
let resendApiKey = getArg("--api-key") || process.env.RESEND_API_KEY;
if (!resendApiKey) {
  const secretPath = path.join(__dirname, "../functions/.secret.local");
  if (fs.existsSync(secretPath)) {
    const content = fs.readFileSync(secretPath, "utf8");
    const match = content.match(/RESEND_API_KEY=(.*)/);
    if (match) {
      resendApiKey = match[1].trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

// Locate Audience ID
let audienceId = getArg("--audience-id") || process.env.RESEND_AUDIENCE_ID;

// Parse Names helper
function parseName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return { firstName: undefined, lastName: undefined };
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: undefined };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Firestore to Resend Audience Sync Tool");
  console.log("==================================================");

  if (isDryRun) {
    console.log("🔍 Running in DRY RUN mode. No data will be written to Resend.\n");
  }

  if (!resendApiKey && !isDryRun) {
    console.error("❌ Error: RESEND_API_KEY is not set.");
    console.error("   Provide it via --api-key <key>, in functions/.secret.local, or export RESEND_API_KEY.\n");
    process.exit(1);
  }

  // 1. Initialize Firebase Admin
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Error: Service account key not found at ${serviceAccountPath}`);
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore();

  const resend = new Resend(resendApiKey);

  // 2. Validate Resend credentials and Audience
  if (!isDryRun) {
    console.log("🔑 Checking Resend API credentials...");
    try {
      const audiencesList = await resend.audiences.list();
      if (audiencesList.error) {
        console.error("❌ Resend API Error:", audiencesList.error.message);
        if (audiencesList.error.name === "restricted_api_key") {
          console.error("\n⚠️  NOTE: Your Resend API key is currently restricted to 'Sending access only'.");
          console.error("   To manage Audiences and send Broadcasts, create or update your API key in");
          console.error("   https://resend.com/api-keys with 'Full access' permissions.\n");
        }
        process.exit(1);
      }

      const audiences = audiencesList.data?.data || [];
      console.log(`✅ Connected to Resend. Found ${audiences.length} audience(s):`);
      audiences.forEach(a => console.log(`   - ${a.name} (ID: ${a.id})`));

      if (!audienceId) {
        if (audiences.length === 1) {
          audienceId = audiences[0].id;
          console.log(`\n👉 Auto-selected only existing audience: "${audiences[0].name}" (${audienceId})`);
        } else if (audiences.length === 0) {
          console.log("\n✨ No existing audience found. Creating 'Diet With Dee Subscribers' automatically via API...");
          const newAudience = await resend.audiences.create({ name: "Diet With Dee Subscribers" });
          if (newAudience.error) {
            console.error("❌ Failed to create audience:", newAudience.error.message);
            process.exit(1);
          }
          audienceId = newAudience.data.id;
          console.log(`✅ Successfully created audience "${newAudience.data.name}" with ID: ${audienceId}`);
        } else {
          console.error("\n❌ Multiple audiences found. Please specify which one to sync using:");
          console.error("   node scripts/sync-subscribers-to-resend.mjs --audience-id <id>\n");
          process.exit(1);
        }
      } else {
        const found = audiences.find(a => a.id === audienceId);
        if (found) {
          console.log(`\n🎯 Targeting audience: "${found.name}" (${audienceId})`);
        } else {
          console.log(`\n🎯 Targeting specified audience ID: ${audienceId}`);
        }
      }
    } catch (err) {
      console.error("❌ Failed to communicate with Resend:", err.message);
      process.exit(1);
    }
  }

  // 3. Fetch Subscribers from Firestore
  console.log("\n📥 Fetching subscribers from Firestore 'emails' collection...");
  const snapshot = await db.collection("emails").get();
  console.log(`📊 Found ${snapshot.size} total documents in Firestore.`);

  const contactsToSync = new Map();

  snapshot.forEach(doc => {
    const data = doc.data() || {};
    const email = (data.email || doc.id).trim().toLowerCase();
    
    // Simple email validation regex
    if (email && /^\S+@\S+\.\S+$/.test(email)) {
      const { firstName, lastName } = parseName(data.name);
      contactsToSync.set(email, {
        email,
        firstName,
        lastName,
        source: data.source || "newsletter"
      });
    }
  });

  const uniqueContacts = Array.from(contactsToSync.values());
  console.log(`✨ Parsed ${uniqueContacts.length} valid unique email address(es).\n`);

  if (isDryRun) {
    console.log("Sample contacts that will be synced:");
    uniqueContacts.slice(0, 10).forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.email} (${c.firstName || "No firstName"} ${c.lastName || ""})`);
    });
    if (uniqueContacts.length > 10) {
      console.log(`  ... and ${uniqueContacts.length - 10} more.`);
    }
    console.log("\n🏁 Dry run finished successfully. Run without --dry-run to sync contacts to Resend.");
    process.exit(0);
  }

  // 4. Push Contacts to Resend with Rate Limiting (5 requests per second)
  console.log(`🚀 Starting sync of ${uniqueContacts.length} contacts to Resend Audience (${audienceId})...`);

  let addedCount = 0;
  let alreadyExistsCount = 0;
  let errorCount = 0;

  for (let i = 0; i < uniqueContacts.length; i++) {
    const contact = uniqueContacts[i];
    const progress = `[${i + 1}/${uniqueContacts.length}]`;

    try {
      const payload = {
        audienceId: audienceId,
        email: contact.email,
        unsubscribed: false
      };
      if (contact.firstName) payload.firstName = contact.firstName;
      if (contact.lastName) payload.lastName = contact.lastName;

      const { data, error } = await resend.contacts.create(payload);

      if (error) {
        // If contact already exists in audience, Resend returns error/warning
        if (error.statusCode === 409 || error.message?.toLowerCase().includes("already exists")) {
          alreadyExistsCount++;
          console.log(`${progress} ℹ️ Already in audience: ${contact.email}`);
        } else {
          errorCount++;
          console.error(`${progress} ❌ Failed to add ${contact.email}:`, error.message);
        }
      } else {
        addedCount++;
        console.log(`${progress} ✅ Synced: ${contact.email} (${data.id})`);
      }
    } catch (err) {
      errorCount++;
      console.error(`${progress} ❌ Unexpected error for ${contact.email}:`, err.message);
    }

    // Rate-limiting delay: 200ms pause (5 req/sec) to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log("\n==================================================");
  console.log("🎉 Sync Complete!");
  console.log(`   - Newly added:    ${addedCount}`);
  console.log(`   - Already exists:  ${alreadyExistsCount}`);
  console.log(`   - Errors:          ${errorCount}`);
  console.log(`   - Total processed: ${uniqueContacts.length}`);
  console.log("==================================================");

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});

