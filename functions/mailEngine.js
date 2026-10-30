const admin = require("firebase-admin");

const VIP_EMAILS = [
  "nanaamadwamena4@gmail.com",
  "godwinokro2020@gmail.com"
];

const DAILY_MARKETING_CAP = 60;

/**
 * Returns current UTC date string YYYY-MM-DD
 */
function getUtcDateKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Gets remaining marketing quota for today (UTC)
 */
async function getDailyMarketingRemaining(db) {
  const dateKey = getUtcDateKey();
  const quotaRef = db.collection("mail_quotas").doc(dateKey);
  const snap = await quotaRef.get();
  
  const currentSent = snap.exists ? (snap.data().marketingSent || 0) : 0;
  return {
    dateKey,
    sentToday: currentSent,
    remaining: Math.max(0, DAILY_MARKETING_CAP - currentSent)
  };
}

/**
 * Increments marketing sent count in Firestore
 */
async function recordMarketingSent(db, count) {
  if (count <= 0) return;
  const dateKey = getUtcDateKey();
  const quotaRef = db.collection("mail_quotas").doc(dateKey);
  
  await quotaRef.set({
    marketingSent: admin.firestore.FieldValue.increment(count),
    date: dateKey,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

/**
 * Increments transactional sent count for audit/monitoring
 */
async function recordTransactionalSent(db, count = 1) {
  if (count <= 0) return;
  const dateKey = getUtcDateKey();
  const quotaRef = db.collection("mail_quotas").doc(dateKey);
  
  await quotaRef.set({
    transactionalSent: admin.firestore.FieldValue.increment(count),
    date: dateKey,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

/**
 * Enqueues emails into mail_queue in batches of 400 (Firestore limit is 500 per batch).
 * Guarantees VIPs are present and flagged priority: 0.
 */
async function enqueueCampaign(db, campaignId, recipientsList, emailBuilder) {
  const batchSize = 400;
  const now = admin.firestore.FieldValue.serverTimestamp();

  // Create a map of normalized recipients
  const emailMap = new Map();
  for (const item of recipientsList) {
    const email = (typeof item === 'string' ? item : item.email)?.trim().toLowerCase();
    if (email && /^\S+@\S+\.\S+$/.test(email)) {
      emailMap.set(email, typeof item === 'object' ? item.name || '' : '');
    }
  }

  // Ensure all VIPs are included
  for (const vip of VIP_EMAILS) {
    const vipEmail = vip.trim().toLowerCase();
    if (!emailMap.has(vipEmail)) {
      emailMap.set(vipEmail, "Admin");
    }
  }

  const entries = Array.from(emailMap.entries());
  console.log(`[MailEngine] Enqueueing ${entries.length} recipients for campaign ${campaignId}...`);

  for (let i = 0; i < entries.length; i += batchSize) {
    const chunk = entries.slice(i, i + batchSize);
    const writeBatch = db.batch();

    for (const [email, name] of chunk) {
      const isVip = VIP_EMAILS.includes(email);
      const safeId = `${campaignId}_${encodeURIComponent(email)}`;
      const docRef = db.collection("mail_queue").doc(safeId);

      const payload = emailBuilder({ email, name, isVip });

      writeBatch.set(docRef, {
        campaignId,
        recipientEmail: email,
        recipientName: name,
        priority: isVip ? 0 : 1,
        status: "pending",
        payload,
        createdAt: now,
        attempts: 0,
        sentAt: null
      }, { merge: true });
    }

    await writeBatch.commit();
  }

  console.log(`[MailEngine] Successfully enqueued ${entries.length} emails for ${campaignId}`);
  return entries.length;
}

/**
 * Processes pending items in mail_queue respecting the daily marketing cap.
 */
async function processMailQueue(db, resend) {
  const { dateKey, sentToday, remaining } = await getDailyMarketingRemaining(db);

  if (remaining <= 0) {
    console.log(`[MailEngine] Daily marketing cap reached for ${dateKey} (${sentToday}/${DAILY_MARKETING_CAP} sent). Skipping run.`);
    return { processed: 0, remainingQuota: 0 };
  }

  console.log(`[MailEngine] Processing queue for ${dateKey}. Sent today: ${sentToday}/${DAILY_MARKETING_CAP}. Remaining quota: ${remaining}.`);

  // Query up to 500 pending items
  const pendingSnap = await db.collection("mail_queue")
    .where("status", "==", "pending")
    .limit(500)
    .get();

  if (pendingSnap.empty) {
    console.log("[MailEngine] No pending emails in mail_queue.");
    return { processed: 0, remainingQuota: remaining };
  }

  // Sort in memory: Priority 0 (VIPs) first, then older createdAt first
  const pendingDocs = pendingSnap.docs;
  pendingDocs.sort((a, b) => {
    const pA = a.data().priority ?? 1;
    const pB = b.data().priority ?? 1;
    if (pA !== pB) return pA - pB;
    const tA = a.data().createdAt?.toMillis() || 0;
    const tB = b.data().createdAt?.toMillis() || 0;
    return tA - tB;
  });

  // Pick up to `remaining` items
  const itemsToSend = pendingDocs.slice(0, remaining);
  console.log(`[MailEngine] Selected ${itemsToSend.length} emails to send in this cycle.`);

  let totalSent = 0;
  let totalFailed = 0;
  const CHUNK_SIZE = 50; // Resend batch max is 100, 50 is reliable

  for (let i = 0; i < itemsToSend.length; i += CHUNK_SIZE) {
    const chunkDocs = itemsToSend.slice(i, i + CHUNK_SIZE);
    const payloads = chunkDocs.map(doc => doc.data().payload);

    try {
      const { data, error } = await resend.batch.send(payloads);
      if (error) {
        console.error("[MailEngine] Batch send error:", error);
        totalFailed += chunkDocs.length;
        continue;
      }

      // Mark docs as sent
      const updateBatch = db.batch();
      const nowTs = admin.firestore.Timestamp.now();
      for (const doc of chunkDocs) {
        updateBatch.update(doc.ref, {
          status: "sent",
          sentAt: nowTs,
          resendBatchId: data?.data?.[0]?.id || null
        });
      }
      await updateBatch.commit();
      totalSent += chunkDocs.length;

    } catch (err) {
      console.error("[MailEngine] Failed to dispatch batch:", err);
      totalFailed += chunkDocs.length;
    }

    // Small delay between chunks
    if (i + CHUNK_SIZE < itemsToSend.length) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  if (totalSent > 0) {
    await recordMarketingSent(db, totalSent);
    console.log(`[MailEngine] Sent ${totalSent} emails. Recorded in daily quota.`);
  }

  const updatedRemaining = remaining - totalSent;
  return {
    processed: totalSent,
    failed: totalFailed,
    remainingQuota: updatedRemaining
  };
}

module.exports = {
  VIP_EMAILS,
  DAILY_MARKETING_CAP,
  getUtcDateKey,
  getDailyMarketingRemaining,
  recordMarketingSent,
  recordTransactionalSent,
  enqueueCampaign,
  processMailQueue
};

